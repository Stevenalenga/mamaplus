'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function CanonicalLink() {
  const pathname = usePathname()

  useEffect(() => {
    const href = `https://mamaplus.co.ke${pathname}`
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }

    link.href = href
  }, [pathname])

  return null
}
