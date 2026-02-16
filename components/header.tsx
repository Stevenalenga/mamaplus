'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/logo.png"
            alt="MamaPlus"
            width={320}
            height={106}
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground hover:text-primary transition">Home</Link>
          <Link href="/services" className="text-foreground hover:text-primary transition">Services</Link>
          <Link href="/courses" className="text-foreground hover:text-primary transition">Courses</Link>
          <Link href="/locations" className="text-foreground hover:text-primary transition">Locations</Link>
          <Link href="/partner" className="text-foreground hover:text-primary transition">Partner with us</Link>
          <Link href="/donate" className="text-foreground hover:text-primary transition">Donate</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
