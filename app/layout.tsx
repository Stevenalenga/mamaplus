'use client'

import React from "react"
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { organizationSchema } from '@/lib/seo'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showMarketingShell = shouldShowMarketingShell(pathname)

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href={`https://mamaplus.co.ke${pathname}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <SessionProvider>
          {showMarketingShell && <Header />}
          {children}
          {showMarketingShell && <Footer />}
          <Toaster />
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}
