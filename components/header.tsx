'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/logo.png"
            alt="MamaPlus"
            width={320}
            height={106}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-foreground hover:text-primary transition">Home</Link>
          <Link href="/services" className="text-foreground hover:text-primary transition">Services</Link>
          <Link href="/courses" className="text-foreground hover:text-primary transition">Courses</Link>
          <Link href="/blog" className="text-foreground hover:text-primary transition">Blog</Link>
          <Link href="/partner" className="text-foreground hover:text-primary transition">Partner with us</Link>
          <Link href="/donate" className="text-foreground hover:text-primary transition">Donate</Link>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <Link href="/login">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent px-3 sm:px-4 text-xs sm:text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-primary hover:bg-primary/90 text-white px-3 sm:px-4 text-xs sm:text-sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-foreground hover:text-primary transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/services" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/courses" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link 
              href="/blog" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/partner" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Partner with us
            </Link>
            <Link 
              href="/donate" 
              className="block py-2 text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Donate
            </Link>
            <div className="pt-3 border-t border-border space-y-2">
              <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
