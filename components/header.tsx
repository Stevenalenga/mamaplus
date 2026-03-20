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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/logo.png"
            alt="MamaPlus"
            width={320}
            height={106}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-lg">
          <Link href="/" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Home</Link>
          <Link href="/families" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Families</Link>
          <Link href="/caregivers" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Caregivers</Link>
          <Link href="/agencies-partners" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Agencies</Link>
          <Link href="/our-platform" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Platform</Link>
          <Link href="/contact" className="text-foreground hover:text-primary transition whitespace-nowrap font-bold">Contact</Link>
        </div>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent px-3 text-xs h-9">
              Sign In
            </Button>
          </Link>
          <Link href="/services/quicksignup">
            <Button className="bg-primary hover:bg-primary/90 text-white px-3 text-xs h-9">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-foreground hover:text-primary transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <Link 
              href="/" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/families" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Families
            </Link>
            <Link 
              href="/caregivers" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Caregivers
            </Link>
            <Link 
              href="/agencies-partners" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Agencies & Partners
            </Link>
            <Link 
              href="/our-platform" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Platform
            </Link>
            <Link 
              href="/contact" 
              className="block py-2 text-lg font-bold text-foreground hover:text-primary transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
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
