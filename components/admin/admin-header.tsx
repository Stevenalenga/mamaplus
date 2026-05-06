'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { getRoleBadgeColor, getRoleDisplayName } from '@/lib/roles'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AdminHeaderProps = {
  active: 'home' | 'profile' | 'school-manager' | 'course-management'
}

export function AdminHeader({ active }: AdminHeaderProps) {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.href = '/login'
  }

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MamaPlus" width={120} height={40} className="object-contain sm:w-[180px] sm:h-[60px]" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard/admin"
              className={active === 'home' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
            >
              Home
            </Link>
            <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Browse Courses</Link>
            <Link
              href="/dashboard/admin/course-management"
              className={active === 'course-management' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
            >
              Course Management
            </Link>
            <Link
              href="/dashboard/admin/school-manager"
              className={active === 'school-manager' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
            >
              School Manager
            </Link>
            <Link
              href="/dashboard/admin/profile"
              className={active === 'profile' ? 'text-sm font-semibold text-primary border-b-2 border-primary' : 'text-sm text-muted-foreground hover:text-primary'}
            >
              My Profile
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {session?.user && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{session.user.name || session.user.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleDisplayName(role)}
              </span>
            </div>
          )}
          <button onClick={handleLogout} className="hidden md:block text-sm text-muted-foreground hover:text-primary">Logout</button>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/dashboard/admin"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Courses
            </Link>
            <Link
              href="/dashboard/admin/course-management"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Course Management
            </Link>
            <Link
              href="/dashboard/admin/school-manager"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              School Manager
            </Link>
            <Link
              href="/dashboard/admin/profile"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            <div className="pt-2 border-t">
              {session?.user && (
                <div className="px-3 py-2">
                  <div className="text-sm text-muted-foreground mb-1">{session.user.name || session.user.email}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                    {getRoleDisplayName(role)}
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
