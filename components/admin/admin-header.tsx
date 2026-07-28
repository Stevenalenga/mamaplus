'use client'

import AuthenticatedHeader from '@/components/authenticated-header'

type AdminHeaderProps = {
  active: 'home' | 'profile' | 'school-manager' | 'course-management' | 'blog'
}

export function AdminHeader({ active }: AdminHeaderProps) {
  return <AuthenticatedHeader activePage={active} />
}
