'use client'

import { apiFetch } from '@/lib/api'
import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableToolbar } from '@/components/admin/data-table-toolbar'
import { UserDetailSheet } from '@/components/admin/user-detail-sheet'
import { ROLES, getRoleDisplayName } from '@/lib/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

type ManagedUser = {
  id: string
  email: string | null
  name: string | null
  role: string
  phoneNumber: string | null
  isVerified: boolean
  loginBlocked: boolean
  createdAt: string
  lastLoginAt: string | null
  liveSessionCount: number
  _count: { enrollments: number }
}

const ROLE_OPTIONS = Object.values(ROLES).map((r) => ({ value: r, label: getRoleDisplayName(r) }))

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [presenceFilter, setPresenceFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [liveUsers, setLiveUsers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<{ userId: string; role: string; name: string } | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<ManagedUser | null>(null)
  const [pendingBlock, setPendingBlock] = useState<ManagedUser | null>(null)
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (verifiedFilter !== 'all') params.set('isVerified', verifiedFilter)
      if (presenceFilter === 'live') params.set('live', 'true')
      if (presenceFilter === 'blocked') params.set('loginBlocked', 'true')

      const res = await apiFetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.totalPages)
        setLiveUsers(data.data.liveUsers || 0)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, verifiedFilter, presenceFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const confirmRoleChange = async () => {
    if (!pendingRole) return
    setUpdatingId(pendingRole.userId)
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingRole.userId, role: pendingRole.role }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to update role')
        return
      }
      toast.success('Role updated')
      loadUsers()
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
      setPendingRole(null)
    }
  }

  const runUserAction = async (
    user: ManagedUser,
    path: string,
    init: RequestInit,
    success: string
  ) => {
    setUpdatingId(user.id)
    try {
      const res = await apiFetch(path, init)
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Request failed')
        return
      }
      toast.success(data.message || success)
      loadUsers()
    } catch {
      toast.error('Request failed')
    } finally {
      setUpdatingId(null)
    }
  }

  const confirmRevoke = async () => {
    if (!pendingRevoke) return
    const user = pendingRevoke
    setPendingRevoke(null)
    await runUserAction(
      user,
      `/api/admin/users/${user.id}/sessions/revoke`,
      { method: 'POST' },
      'Session ended'
    )
  }

  const confirmBlock = async () => {
    if (!pendingBlock) return
    const user = pendingBlock
    setPendingBlock(null)
    await runUserAction(
      user,
      `/api/admin/users/${user.id}/access`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginBlocked: !user.loginBlocked }),
      },
      user.loginBlocked ? 'Login allowed' : 'Login blocked'
    )
  }

  const confirmPassword = async () => {
    if (!passwordUser) return
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const user = passwordUser
    setPasswordUser(null)
    setNewPassword('')
    await runUserAction(
      user,
      `/api/admin/users/${user.id}/password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      },
      'Password reset'
    )
  }

  const openUserDetail = (userId: string) => {
    setSelectedUserId(userId)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-sm text-muted-foreground">
          {liveUsers} {liveUsers === 1 ? 'person is' : 'people are'} signed in right now
        </p>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTableToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            searchPlaceholder="Search by name, email, or phone..."
            filterValue={roleFilter}
            onFilterChange={(v) => { setRoleFilter(v); setPage(1) }}
            filterOptions={ROLE_OPTIONS}
            filterPlaceholder="Role"
          >
            <Select value={presenceFilter} onValueChange={(v) => { setPresenceFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Presence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="live">Signed in</SelectItem>
                <SelectItem value="blocked">Login blocked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={(v) => { setVerifiedFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Verified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </DataTableToolbar>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => openUserDetail(user.id)}
                      >
                        <TableCell className="font-medium">{user.name || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email || user.phoneNumber || '—'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={user.role}
                            disabled={updatingId === user.id}
                            onValueChange={(role) =>
                              setPendingRole({
                                userId: user.id,
                                role,
                                name: user.name || user.email || 'User',
                              })
                            }
                          >
                            <SelectTrigger className="h-8 w-[160px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.loginBlocked ? (
                            <span className="text-destructive">Blocked</span>
                          ) : user.liveSessionCount > 0 ? (
                            <span className="text-emerald-600">Live</span>
                          ) : (
                            <span className="text-muted-foreground">Offline</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-KE') : 'Never'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === user.id || user.liveSessionCount === 0}
                              onClick={() => setPendingRevoke(user)}
                            >
                              End session
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === user.id}
                              onClick={() => {
                                setNewPassword('')
                                setPasswordUser(user)
                              }}
                            >
                              Reset password
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === user.id}
                              onClick={() => setPendingBlock(user)}
                            >
                              {user.loginBlocked ? 'Allow login' : 'Block login'}
                            </Button>
                          </div>
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
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDetailSheet userId={selectedUserId} open={sheetOpen} onOpenChange={setSheetOpen} />

      <AlertDialog open={!!pendingRole} onOpenChange={(open) => !open && setPendingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change user role?</AlertDialogTitle>
            <AlertDialogDescription>
              Update role for {pendingRole?.name} to {pendingRole?.role && getRoleDisplayName(pendingRole.role)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingRevoke} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevoke?.name || pendingRevoke?.email || 'This user'} will be signed out on every device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevoke}>End session</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingBlock} onOpenChange={(open) => !open && setPendingBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingBlock?.loginBlocked ? 'Allow login?' : 'Block login?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingBlock?.loginBlocked
                ? `${pendingBlock?.name || pendingBlock?.email || 'This user'} will be able to sign in again.`
                : `${pendingBlock?.name || pendingBlock?.email || 'This user'} will be signed out and cannot sign in until you allow it.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlock}>
              {pendingBlock?.loginBlocked ? 'Allow login' : 'Block login'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUser?.name || passwordUser?.email || 'this user'}. Their current sessions will end.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
            <Button onClick={confirmPassword}>Save password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
