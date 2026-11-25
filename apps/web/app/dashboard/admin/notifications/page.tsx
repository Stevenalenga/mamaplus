'use client'

import { apiFetch } from '@/lib/api'
import { useCallback, useEffect, useState } from 'react'
import { Bell, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ROLES, getRoleDisplayName } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type NotificationLog = {
  id: string
  title: string
  body: string
  audience: string
  targetRole: string | null
  targetUserId: string | null
  successCount: number
  failureCount: number
  createdAt: string
  sentBy?: { id: string; name: string | null; email: string | null } | null
  targetUser?: { id: string; name: string | null; email: string | null } | null
}

type Person = {
  id: string
  name: string | null
  email: string | null
  phoneNumber: string | null
  role: string
}

type RecipientPreview = {
  people: number
  devices: number
}

type Stats = {
  deviceTokens: number
  usersWithDevices: number
}

const SEGMENT_OPTIONS = [
  { role: ROLES.USER, label: 'Caregivers' },
  { role: ROLES.INSTRUCTOR, label: 'Educators' },
  { role: ROLES.AGENCY, label: 'Agencies' },
]

function audienceLabel(log: NotificationLog) {
  if (log.audience === 'ALL') return 'Everyone'
  if (log.audience === 'ROLE') {
    return SEGMENT_OPTIONS.find((option) => option.role === log.targetRole)?.label
      || getRoleDisplayName(log.targetRole || undefined)
  }
  const person = log.targetUser
  if (person?.name && person.email) return `${person.name} (${person.email})`
  return person?.name || person?.email || 'One person'
}

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'ALL' | 'ROLE' | 'USER'>('ALL')
  const [targetRole, setTargetRole] = useState<string>(ROLES.USER)
  const [personQuery, setPersonQuery] = useState('')
  const [personResults, setPersonResults] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [searchingPeople, setSearchingPeople] = useState(false)
  const [preview, setPreview] = useState<RecipientPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [stats, setStats] = useState<Stats>({ deviceTokens: 0, usersWithDevices: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/notifications')
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to load notifications')
        return
      }
      setLogs(data.data.logs || [])
      setStats(data.data.stats || { deviceTokens: 0, usersWithDevices: 0 })
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (audience !== 'USER' || selectedPerson) {
      setPersonResults([])
      return
    }

    const query = personQuery.trim()
    if (query.length < 2) {
      setPersonResults([])
      return
    }

    const timer = window.setTimeout(async () => {
      setSearchingPeople(true)
      try {
        const params = new URLSearchParams({ search: query, limit: '8' })
        const res = await apiFetch(`/api/admin/users?${params}`)
        const data = await res.json()
        if (res.ok && data.success) {
          setPersonResults(data.data.users || [])
        }
      } catch {
        setPersonResults([])
      } finally {
        setSearchingPeople(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [audience, personQuery, selectedPerson])

  useEffect(() => {
    if (audience === 'USER' && !selectedPerson) {
      setPreview(null)
      return
    }

    const params = new URLSearchParams({ audience })
    if (audience === 'ROLE') params.set('targetRole', targetRole)
    if (audience === 'USER' && selectedPerson) params.set('targetUserId', selectedPerson.id)

    let cancelled = false
    setPreviewLoading(true)
    apiFetch(`/api/admin/notifications/preview?${params}`)
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return
        if (res.ok && data.success) setPreview(data.data)
        else setPreview(null)
      })
      .catch(() => {
        if (!cancelled) setPreview(null)
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [audience, targetRole, selectedPerson])

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required')
      return
    }
    if (audience === 'USER' && !selectedPerson) {
      toast.error('Choose a person to notify')
      return
    }

    setSending(true)
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        audience,
      }
      if (audience === 'ROLE') payload.targetRole = targetRole
      if (audience === 'USER') payload.targetUserId = selectedPerson?.id

      const res = await apiFetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to send notification')
        return
      }

      toast.success(data.message || 'Notification sent')
      setTitle('')
      setBody('')
      setSelectedPerson(null)
      setPersonQuery('')
      await load()
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Push Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Send Expo push notifications to MamaPlus mobile app users
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registered devices</CardTitle>
            <CardDescription>Active Expo push tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.deviceTokens}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users with devices</CardTitle>
            <CardDescription>Accounts that can receive pushes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.usersWithDevices}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Compose notification
          </CardTitle>
          <CardDescription>
            Messages are delivered through Expo Push → FCM (Android) / APNs (iOS)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New course available"
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-body">Message</Label>
            <Textarea
              id="notif-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Maternal Nutrition enrollment is now open…"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                value={audience}
                onValueChange={(value: 'ALL' | 'ROLE' | 'USER') => setAudience(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone</SelectItem>
                  <SelectItem value="ROLE">Account type</SelectItem>
                  <SelectItem value="USER">One person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {audience === 'ROLE' ? (
              <div className="space-y-2">
                <Label>Account type</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.role} value={option.role}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {audience === 'USER' ? (
              <div className="space-y-2">
                <Label htmlFor="person-search">Person</Label>
                {selectedPerson ? (
                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {selectedPerson.name || selectedPerson.email || selectedPerson.phoneNumber}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[selectedPerson.email, selectedPerson.phoneNumber, getRoleDisplayName(selectedPerson.role)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPerson(null)
                        setPersonQuery('')
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      id="person-search"
                      value={personQuery}
                      onChange={(e) => setPersonQuery(e.target.value)}
                      placeholder="Search name, email, or phone"
                    />
                    {searchingPeople ? (
                      <p className="text-xs text-muted-foreground">Searching…</p>
                    ) : null}
                    {personResults.length > 0 ? (
                      <div className="overflow-hidden rounded-md border">
                        {personResults.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              setSelectedPerson(person)
                              setPersonResults([])
                              setPersonQuery('')
                            }}
                          >
                            <span className="font-medium">
                              {person.name || person.email || person.phoneNumber}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {[person.email, person.phoneNumber, getRoleDisplayName(person.role)]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground">
            {audience === 'USER' && !selectedPerson
              ? 'Choose a person to see how many devices will receive this.'
              : previewLoading
                ? 'Checking registered devices…'
                : preview && preview.devices === 0
                  ? 'No registered devices for this audience.'
                  : preview
                    ? `${preview.people} ${preview.people === 1 ? 'person' : 'people'} on ${preview.devices} ${preview.devices === 1 ? 'device' : 'devices'}.`
                    : 'Recipient count is unavailable.'}
          </p>

          <Button onClick={handleSend} disabled={sending || (audience === 'USER' && !selectedPerson)}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send notification
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent sends</CardTitle>
          <CardDescription>History of admin push notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications sent yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Sent by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {new Date(log.createdAt).toLocaleString('en-KE')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.title}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">{log.body}</div>
                      </TableCell>
                      <TableCell className="text-sm">{audienceLabel(log)}</TableCell>
                      <TableCell className="text-sm">
                        <span className="text-emerald-600">{log.successCount} ok</span>
                        {log.failureCount > 0 ? (
                          <span className="text-destructive"> · {log.failureCount} failed</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.sentBy?.name || log.sentBy?.email || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
