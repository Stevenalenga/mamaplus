'use client'

import { useEffect } from 'react'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonicalUrl?: string
  schema?: any
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  ogImage = 'https://mamaplus.co.ke/og-image.jpg',
  canonicalUrl,
  schema,
}: SEOHeadProps) {
  const fullTitle = `${title} | MamaPlus`
  const keywordsString = keywords.join(', ')

  useEffect(() => {
    // Update title
    document.title = fullTitle

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Primary Meta Tags
    updateMeta('title', fullTitle)
    updateMeta('description', description)
    if (keywords.length > 0) updateMeta('keywords', keywordsString)
    updateMeta('robots', 'index, follow')
    updateMeta('language', 'English')
    updateMeta('author', 'MamaPlus')

    // Open Graph / Facebook
    updateMeta('og:type', canonicalUrl || 'https://mamaplus.co.ke', true)
    updateMeta('og:url', canonicalUrl || 'https://mamaplus.co.ke', true)
    updateMeta('og:title', fullTitle, true)
    updateMeta('og:description', description, true)
    updateMeta('og:image', ogImage, true)
    updateMeta('og:locale', 'en_KE', true)
    updateMeta('og:site_name', 'MamaPlus', true)

    // Twitter
    updateMeta('twitter:card', 'summary_large_image', true)
    updateMeta('twitter:url', canonicalUrl || 'https://mamaplus.co.ke', true)
    updateMeta('twitter:title', fullTitle, true)
    updateMeta('twitter:description', description, true)
    updateMeta('twitter:image', ogImage, true)
    updateMeta('twitter:creator', '@mamaplus')

    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl
    }

    // Structured Data
    if (schema) {
      const schemaId = 'page-schema'
      let script = document.getElementById(schemaId)
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = schemaId
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(schema)
    }
  }, [fullTitle, description, keywordsString, canonicalUrl, ogImage, schema, keywords.length])

  return null
}
