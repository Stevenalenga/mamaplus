'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SessionProvider, useSession } from 'next-auth/react'
import { markApiSessionReady, setApiAccessToken } from '@/lib/api'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { WhatsAppCta } from '@/components/whatsapp-cta'
import { CanonicalLink } from '@/components/canonical-link'

function shouldShowMarketingShell(pathname: string) {
  if (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding') {
    return false
  }
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return false
  }
  return true
}

function ApiSessionBridge() {
  const { data, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    setApiAccessToken(data?.accessToken ?? null)
    markApiSessionReady()
  }, [data, status])

  return null
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showMarketingShell = shouldShowMarketingShell(pathname)

  return (
    <SessionProvider>
      <ApiSessionBridge />
      <CanonicalLink />
      {showMarketingShell && <Header />}
      {children}
      {showMarketingShell && <Footer />}
      {showMarketingShell && <WhatsAppCta />}
      <Toaster />
      <Analytics />
    </SessionProvider>
  )
}
