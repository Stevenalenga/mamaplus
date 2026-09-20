'use client'

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
}

type Stats = {
  deviceTokens: number
  usersWithDevices: number
}

const ROLE_OPTIONS = [
  ROLES.USER,
  ROLES.AGENCY,
  ROLES.INSTRUCTOR,
  ROLES.ADMIN_ASSISTANT,
  ROLES.ADMIN,
  ROLES.PENDING,
]

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'ALL' | 'ROLE' | 'USER'>('ALL')
  const [targetRole, setTargetRole] = useState<string>(ROLES.USER)
  const [targetUserId, setTargetUserId] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [stats, setStats] = useState<Stats>({ deviceTokens: 0, usersWithDevices: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications')
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

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required')
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
      if (audience === 'USER') payload.targetUserId = targetUserId.trim()

      const res = await fetch('/api/admin/notifications', {
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
      setTargetUserId('')
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
                  <SelectItem value="ALL">All devices</SelectItem>
                  <SelectItem value="ROLE">By role</SelectItem>
                  <SelectItem value="USER">Single user ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {audience === 'ROLE' ? (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {audience === 'USER' ? (
              <div className="space-y-2">
                <Label htmlFor="target-user">User ID</Label>
                <Input
                  id="target-user"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="cuid from Users page"
                />
              </div>
            ) : null}
          </div>

          <Button onClick={handleSend} disabled={sending}>
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
                      <TableCell className="text-sm">
                        {log.audience}
                        {log.targetRole ? ` · ${getRoleDisplayName(log.targetRole as any)}` : ''}
                        {log.targetUserId ? ` · ${log.targetUserId.slice(0, 8)}…` : ''}
                      </TableCell>
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
