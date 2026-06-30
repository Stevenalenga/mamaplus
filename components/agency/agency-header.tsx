'use client'

import AuthenticatedHeader from '@/components/authenticated-header'

type AgencyHeaderProps = {
  currentPage?: 'home' | 'profile' | 'courses' | null
}

export default function AgencyHeader({ currentPage = null }: AgencyHeaderProps) {
  return <AuthenticatedHeader activePage={currentPage} />
}
