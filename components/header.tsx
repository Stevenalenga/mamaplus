'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navClass = (href: string) => {
    const base = 'hover:text-primary transition whitespace-nowrap font-bold'
    const active = pathname && (pathname === href || (href === '/blog' && pathname.startsWith('/blog')))
    return `${active ? 'text-primary' : 'text-foreground'} ${base}`
  }

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
        <div className="hidden lg:flex items-center gap-5 text-base">
          <Link href="/" className={navClass('/')}>Home</Link>
          <Link href="/services" className={navClass('/services')}>Services</Link>
          <Link href="/courses" className={navClass('/courses')}>Courses</Link>
          <Link href="/families" className={navClass('/families')}>Families</Link>
          <Link href="/caregivers" className={navClass('/caregivers')}>Caregivers</Link>
          <Link href="/agencies-partners" className={navClass('/agencies-partners')}>Agencies</Link>
          <Link href="/blog" className={navClass('/blog')}>Blog</Link>
          <Link href="/contact" className={navClass('/contact')}>Contact</Link>
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
              className={`${navClass('/')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`${navClass('/services')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Services
            </Link>
            <Link
              href="/courses"
              className={`${navClass('/courses')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/families"
              className={`${navClass('/families')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Families
            </Link>
            <Link
              href="/caregivers"
              className={`${navClass('/caregivers')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Caregivers
            </Link>
            <Link
              href="/agencies-partners"
              className={`${navClass('/agencies-partners')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Agencies & Partners
            </Link>
            <Link
              href="/blog"
              className={`${navClass('/blog')} block py-2 text-lg`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className={`${navClass('/contact')} block py-2 text-lg`}
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
              <Link href="/services/quicksignup" className="block" onClick={() => setMobileMenuOpen(false)}>
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
