'use client'

import AuthenticatedHeader from '@/components/authenticated-header'

type UserHeaderProps = {
  currentPage?: 'home' | 'profile' | 'courses' | null
}

export default function UserHeader({ currentPage = null }: UserHeaderProps) {
  return <AuthenticatedHeader activePage={currentPage} />
}
