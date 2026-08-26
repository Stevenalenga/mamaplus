'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getDashboardForRole } from '@/lib/roles'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const whoWeServeLinks = [
  { href: '/who-we-serve', label: 'Overview' },
  { href: '/families', label: 'Families' },
  { href: '/caregivers', label: 'Caregivers' },
  { href: '/agencies-partners', label: 'Agencies & partners' },
]

function isWhoWeServePath(pathname: string) {
  return (
    pathname === '/who-we-serve' ||
    pathname === '/families' ||
    pathname === '/caregivers' ||
    pathname === '/agencies-partners'
  )
}

function isLearnPath(pathname: string) {
  return pathname === '/learn' || pathname.startsWith('/blog')
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [whoOpen, setWhoOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const dashboardHref = getDashboardForRole((session?.user as { role?: string } | undefined)?.role)

  const navClass = (href: string, active = false) => {
    const base = 'hover:text-primary transition whitespace-nowrap font-bold'
    const isActive =
      active ||
      (pathname === href || (href !== '/' && pathname.startsWith(href)))
    return `${isActive ? 'text-primary' : 'text-foreground'} ${base}`
  }

  const closeMobile = () => {
    setMobileMenuOpen(false)
    setWhoOpen(false)
  }

  const authCtas = (
    <>
      {status === 'authenticated' && session?.user ? (
        <Link href={dashboardHref} onClick={closeMobile}>
          <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent px-3 text-xs h-9 w-full lg:w-auto">
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login" onClick={closeMobile}>
          <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent px-3 text-xs h-9 w-full lg:w-auto">
            Sign In
          </Button>
        </Link>
      )}
      <Link href="/courses" onClick={closeMobile}>
        <Button className="bg-primary hover:bg-primary/90 text-white px-3 text-xs h-9 w-full lg:w-auto">
          Explore Courses
        </Button>
      </Link>
    </>
  )

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

        <div className="hidden lg:flex items-center gap-5 text-base">
          <Link href="/" className={navClass('/', pathname === '/')}>Home</Link>
          <Link href="/about-us" className={navClass('/about-us')}>About</Link>
          <Link href="/courses" className={navClass('/courses')}>Courses</Link>
          <Link href="/learn" className={navClass('/learn', isLearnPath(pathname))}>Learn</Link>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${navClass('/who-we-serve', isWhoWeServePath(pathname))} inline-flex items-center gap-1 outline-none bg-transparent border-0 p-0 cursor-pointer`}
            >
              Who we serve
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[14rem]">
              {whoWeServeLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/contact" className={navClass('/contact')}>Contact</Link>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {authCtas}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-foreground hover:text-primary transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className={`${navClass('/', pathname === '/')} block py-2 text-lg`} onClick={closeMobile}>
              Home
            </Link>
            <Link href="/about-us" className={`${navClass('/about-us')} block py-2 text-lg`} onClick={closeMobile}>
              About
            </Link>
            <Link href="/courses" className={`${navClass('/courses')} block py-2 text-lg`} onClick={closeMobile}>
              Courses
            </Link>
            <Link href="/learn" className={`${navClass('/learn', isLearnPath(pathname))} block py-2 text-lg`} onClick={closeMobile}>
              Learn
            </Link>
            <div>
              <button
                type="button"
                className={`${navClass('/who-we-serve', isWhoWeServePath(pathname))} flex w-full items-center justify-between py-2 text-lg`}
                onClick={() => setWhoOpen(!whoOpen)}
                aria-expanded={whoOpen}
              >
                Who we serve
                <ChevronDown className={`w-5 h-5 transition-transform ${whoOpen ? 'rotate-180' : ''}`} />
              </button>
              {whoOpen && (
                <div className="pl-4 space-y-1 pb-2">
                  {whoWeServeLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${navClass(link.href)} block py-2`}
                      onClick={closeMobile}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/contact" className={`${navClass('/contact')} block py-2 text-lg`} onClick={closeMobile}>
              Contact
            </Link>
            <div className="pt-3 border-t border-border space-y-2">
              {authCtas}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
