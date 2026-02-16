'use client'

import React from "react"
import type { Metadata } from 'next'
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/header'
import Footer from '@/components/footer'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isDashboardPage = pathname?.startsWith('/dashboard')
  const isCoursesPage = pathname === '/courses'
  const isAppPage = isAuthPage || isDashboardPage || isCoursesPage

  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {!isAppPage && <Header />}
        {children}
        {!isAppPage && <Footer />}
        <Analytics />
      </body>
    </html>
  )
}
