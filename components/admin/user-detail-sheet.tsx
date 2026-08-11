'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getRoleBadgeColor, getRoleDisplayName } from '@/lib/roles'

type UserDetail = {
  id: string
  email: string | null
  name: string | null
  role: string
  phoneNumber: string | null
  isVerified: boolean
  createdAt: string
  _count: {
    enrollments: number
    payments: number
    certificates: number
    reviews: number
  }
  enrollments: Array<{
    id: string
    status: string
    progress: number
    createdAt: string
    course: { id: string; title: string }
  }>
  payments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    paymentMethod: string
    paidAt: string | null
    createdAt: string
  }>
}

type UserDetailSheetProps = {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({ userId, open, onOpenChange }: UserDetailSheetProps) {
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return
    setLoading(true)
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data)
      })
      .finally(() => setLoading(false))
  }, [open, userId])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{user?.name || user?.email || 'User details'}</SheetTitle>
          <SheetDescription>Profile, enrollments, and payment history</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
                {user.isVerified && <Badge variant="secondary">Verified</Badge>}
              </div>
              {user.email && <p className="text-sm">{user.email}</p>}
              {user.phoneNumber && <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>}
              <p className="text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-lg font-bold">{user._count.enrollments}</p>
                <p className="text-xs text-muted-foreground">Enrollments</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-lg font-bold">{user._count.payments}</p>
                <p className="text-xs text-muted-foreground">Payments</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Recent Enrollments</h3>
              {user.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments</p>
              ) : (
                <ul className="space-y-3">
                  {user.enrollments.map((e) => (
                    <li key={e.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{e.course.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={e.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{e.progress}%</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{e.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Recent Payments</h3>
              {user.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments</p>
              ) : (
                <ul className="space-y-2">
                  {user.payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">
                          {p.currency} {p.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.paymentMethod}</p>
                      </div>
                      <Badge variant={p.status === 'SUCCESS' ? 'default' : 'secondary'}>
                        {p.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">User not found</p>
        )}
      </SheetContent>
    </Sheet>
  )
}
