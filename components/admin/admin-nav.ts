import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  School,
  CreditCard,
  Building2,
  MessageSquare,
  Award,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
import { ROLES } from '@/lib/roles'

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  pageKey: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, pageKey: 'overview' },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, pageKey: 'users' },
  { href: '/dashboard/admin/enrollments', label: 'Enrollments', icon: GraduationCap, pageKey: 'enrollments' },
  { href: '/dashboard/admin/course-management', label: 'Courses', icon: BookOpen, pageKey: 'courses' },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: CreditCard, pageKey: 'payments' },
  { href: '/dashboard/admin/agencies', label: 'Agencies', icon: Building2, pageKey: 'agencies' },
  { href: '/dashboard/admin/reviews', label: 'Reviews', icon: MessageSquare, pageKey: 'reviews' },
  { href: '/dashboard/admin/certificates', label: 'Certificates', icon: Award, pageKey: 'certificates' },
  { href: '/dashboard/admin/blog', label: 'Blog', icon: FileText, pageKey: 'blog' },
  { href: '/dashboard/admin/school-manager', label: 'Schools', icon: School, pageKey: 'schools' },
  { href: '/dashboard/admin/profile', label: 'Profile', icon: UserCircle, pageKey: 'profile' },
]

export const ADMIN_ASSISTANT_NAV_ITEMS: AdminNavItem[] = [
  { href: '/dashboard/admin/blog', label: 'Blog', icon: FileText, pageKey: 'blog' },
  { href: '/dashboard/admin-assistant/profile', label: 'Profile', icon: UserCircle, pageKey: 'profile' },
]

export function getNavItemsForRole(role?: string): AdminNavItem[] {
  if (role === ROLES.ADMIN_ASSISTANT) return ADMIN_ASSISTANT_NAV_ITEMS
  return ADMIN_NAV_ITEMS
}

export function getAdminPageTitle(pathname: string): string {
  if (pathname === '/dashboard/admin') return 'Overview'
  const item = ADMIN_NAV_ITEMS.find(
    (nav) => nav.href !== '/dashboard/admin' && pathname.startsWith(nav.href),
  )
  return item?.label ?? 'Admin'
}
