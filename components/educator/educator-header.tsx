'use client'

import AuthenticatedHeader from '@/components/authenticated-header'

type EducatorHeaderProps = {
  currentPage?: 'home' | 'profile' | 'courses' | null
}

export default function EducatorHeader({ currentPage = null }: EducatorHeaderProps) {
  return <AuthenticatedHeader activePage={currentPage} />
}
