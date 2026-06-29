import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import { organizationSchema } from '@/lib/seo'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'MamaPlus - Quality Childcare Families Can Trust',
    template: '%s | MamaPlus',
  },
  description:
    'MamaPlus supports families with safe, nurturing, high-quality childcare through professional training, clear care standards, and ongoing support across Kenya.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
