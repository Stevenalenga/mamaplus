'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Enrollment = {
  id: string
  status: string
  progress: number
  createdAt: string
  user: { id: string; name: string | null; email: string | null; phoneNumber: string | null }
  course: { id: string; title: string }
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
]

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionTarget, setActionTarget] = useState<{ id: string; action: 'complete' | 'cancel' } | null>(null)

  const loadEnrollments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/enrollments?${params}`)
      const data = await res.json()
      if (data.success) {
        setEnrollments(data.data.enrollments)
        setTotalPages(data.data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const runAction = async () => {
    if (!actionTarget) return
    try {
      const res = await fetch('/api/admin/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: actionTarget.id,
          status: actionTarget.action === 'complete' ? 'COMPLETED' : 'CANCELLED',
          progress: actionTarget.action === 'complete' ? 100 : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Action failed')
        return
      }
      toast.success('Enrollment updated')
      loadEnrollments()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Enrollment Management</h2>
        <p className="text-sm text-muted-foreground">View and manage course enrollments platform-wide</p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTableToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search user or course..."
            filterValue={statusFilter}
            onFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
            filterOptions={STATUS_OPTIONS}
            filterPlaceholder="Status"
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <p className="font-medium text-sm">{e.user.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{e.user.email || e.user.phoneNumber}</p>
                        </TableCell>
                        <TableCell className="text-sm">{e.course.title}</TableCell>
                        <TableCell>
                          <Badge variant={e.status === 'COMPLETED' ? 'default' : 'secondary'}>{e.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={e.progress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{e.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {e.status !== 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionTarget({ id: e.id, action: 'complete' })}
                            >
                              Complete
                            </Button>
                          )}
                          {e.status !== 'CANCELLED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setActionTarget({ id: e.id, action: 'cancel' })}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === 'complete' ? 'Mark as completed?' : 'Cancel enrollment?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === 'complete'
                ? 'This will set progress to 100% and mark the enrollment as completed.'
                : 'This will cancel the enrollment. The user will lose access.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={runAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
