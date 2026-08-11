'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AdminShell } from '@/components/admin/admin-shell'
import { ROLES } from '@/lib/roles'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isBlogRoute = pathname?.startsWith('/dashboard/admin/blog')

  useEffect(() => {
    if (status === 'loading') return
    const role = session?.user?.role
    const allowed =
      role === ROLES.ADMIN || (isBlogRoute && role === ROLES.ADMIN_ASSISTANT)
    if (status === 'unauthenticated' || !allowed) {
      window.location.href = '/login'
    }
  }, [status, session, router, isBlogRoute])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const role = session?.user?.role
  const allowed =
    role === ROLES.ADMIN || (isBlogRoute && role === ROLES.ADMIN_ASSISTANT)
  if (!allowed) return null

  return <AdminShell userRole={role}>{children}</AdminShell>
}
