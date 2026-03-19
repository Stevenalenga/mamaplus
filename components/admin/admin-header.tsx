'use client'

import Link from 'next/link'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import { getRoleBadgeColor, getRoleDisplayName } from '@/lib/roles'

type AdminHeaderProps = {
  active: 'home' | 'profile'
}

export function AdminHeader({ active }: AdminHeaderProps) {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'ADMIN'

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MamaPlus" width={240} height={240} className="object-contain" />
          </Link>
          <Link
            href="/dashboard/admin"
            className={active === 'home' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
          >
            Home
          </Link>
          <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
          <Link
            href="/dashboard/admin/profile"
            className={active === 'profile' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
          >
            My Profile
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{session.user.name || session.user.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleDisplayName(role)}
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary">Logout</button>
        </div>
      </div>
    </nav>
  )
}
