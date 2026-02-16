'use client'

import React from "react"
import { usePathname } from 'next/navigation'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { organizationSchema } from '@/lib/seo'
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
        {!isAuthPage && <Header />}
        {children}
        {!isAuthPage && <Footer />}
        <Analytics />
      </body>
    </html>
  )
}
