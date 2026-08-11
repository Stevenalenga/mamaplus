'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Award } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Certificate = {
  id: string
  certificateNumber: string
  courseId: string
  issuedAt: string
  user: { id: string; name: string | null; email: string | null }
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [issueOpen, setIssueOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [issuing, setIssuing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await fetch(`/api/admin/certificates${params}`)
      const data = await res.json()
      if (data.success) setCertificates(data.data)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const issueCertificate = async () => {
    if (!userId || !courseId) {
      toast.error('User ID and Course ID are required')
      return
    }
    setIssuing(true)
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Certificate issued')
        setIssueOpen(false)
        setUserId('')
        setCourseId('')
        load()
      } else {
        toast.error(data.message || 'Failed to issue certificate')
      }
    } finally {
      setIssuing(false)
    }
  }

  const revoke = async (certificateId: string) => {
    const res = await fetch('/api/admin/certificates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateId }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Certificate revoked')
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certificates</h2>
          <p className="text-sm text-muted-foreground">Issue and manage completion certificates</p>
        </div>
        <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
          <DialogTrigger asChild>
            <Button><Award className="mr-2 h-4 w-4" /> Issue Certificate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Issue Certificate</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User cuid" />
              </div>
              <div>
                <Label htmlFor="courseId">Course ID</Label>
                <Input id="courseId" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Course cuid" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
              <Button onClick={issueCertificate} disabled={issuing}>
                {issuing ? 'Issuing...' : 'Issue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader><CardTitle className="text-base">Issued Certificates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DataTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search certificate or user..." />
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate #</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No certificates</TableCell>
                    </TableRow>
                  ) : (
                    certificates.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-sm">{c.certificateNumber}</TableCell>
                        <TableCell>{c.user.name || c.user.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(c.issuedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revoke(c.id)}>
                            Revoke
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
