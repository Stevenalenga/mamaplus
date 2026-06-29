'use client'

import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CanonicalLink } from '@/components/canonical-link'

function shouldShowMarketingShell(pathname: string) {
  if (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding') {
    return false
  }
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return false
  }
  if (pathname === '/courses') {
    return false
  }
  return true
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMarketingShell = shouldShowMarketingShell(pathname)

  return (
    <SessionProvider>
      <CanonicalLink />
      {showMarketingShell && <Header />}
      {children}
      {showMarketingShell && <Footer />}
      <Toaster />
      <Analytics />
    </SessionProvider>
  )
}
