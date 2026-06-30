'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Button } from '@/components/ui/button'
import {
  getDashboardForRole,
  getRoleBadgeColor,
  getRoleDisplayName,
  ROLES,
} from '@/lib/roles'

type NavItem = {
  href: string
  label: string
  pageKey: string
}

type AuthenticatedHeaderProps = {
  activePage?: string | null
}

function getNavItems(role: string | undefined): { homeHref: string; items: NavItem[] } {
  switch (role) {
    case ROLES.ADMIN:
      return {
        homeHref: '/dashboard/admin',
        items: [
          { href: '/dashboard/admin', label: 'Home', pageKey: 'home' },
          { href: '/courses', label: 'Browse Courses', pageKey: 'courses' },
          { href: '/dashboard/admin/course-management', label: 'Course Management', pageKey: 'course-management' },
          { href: '/dashboard/admin/school-manager', label: 'School Manager', pageKey: 'school-manager' },
          { href: '/dashboard/admin/profile', label: 'My Profile', pageKey: 'profile' },
        ],
      }
    case ROLES.ADMIN_ASSISTANT:
      return {
        homeHref: '/dashboard/admin-assistant',
        items: [
          { href: '/dashboard/admin-assistant', label: 'Home', pageKey: 'home' },
          { href: '/courses', label: 'Browse Courses', pageKey: 'courses' },
          { href: '/dashboard/admin-assistant/profile', label: 'My Profile', pageKey: 'profile' },
        ],
      }
    case ROLES.INSTRUCTOR:
      return {
        homeHref: '/dashboard/educator',
        items: [
          { href: '/dashboard/educator', label: 'Dashboard', pageKey: 'home' },
          { href: '/courses', label: 'Browse Courses', pageKey: 'courses' },
          { href: '/dashboard/educator/profile', label: 'My Profile', pageKey: 'profile' },
        ],
      }
    case ROLES.AGENCY:
      return {
        homeHref: '/dashboard/agency',
        items: [
          { href: '/dashboard/agency', label: 'Home', pageKey: 'home' },
          { href: '/courses', label: 'Browse Courses', pageKey: 'courses' },
          { href: '/dashboard/agency/profile', label: 'My Profile', pageKey: 'profile' },
        ],
      }
    default:
      return {
        homeHref: '/dashboard/user',
        items: [
          { href: '/dashboard/user', label: 'Home', pageKey: 'home' },
          { href: '/courses', label: 'Browse Courses', pageKey: 'courses' },
          { href: '/dashboard/user/profile', label: 'My Profile', pageKey: 'profile' },
        ],
      }
  }
}

export default function AuthenticatedHeader({ activePage = null }: AuthenticatedHeaderProps) {
  const { user } = useCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const role = user?.role
  const { homeHref, items } = getNavItems(role)

  const linkClass = (pageKey: string) =>
    activePage === pageKey
      ? 'text-sm font-semibold text-primary border-b-2 border-primary'
      : 'text-sm text-muted-foreground hover:text-primary'

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href={homeHref} className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MamaPlus"
              width={120}
              height={40}
              className="object-contain sm:w-[160px] sm:h-[54px]"
            />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <Link key={item.pageKey} href={item.href} className={linkClass(item.pageKey)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(role)}`}>
                {getRoleDisplayName(role)}
              </span>
            </div>
          )}
          <div className="hidden md:block">
            <LogoutButton variant="ghost" size="sm" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-2 space-y-1">
            {items.map((item) => (
              <Link
                key={item.pageKey}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t">
              {user && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user.name || user.email}
                </div>
              )}
              <div className="px-3">
                <LogoutButton variant="ghost" size="sm" className="w-full justify-start" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
