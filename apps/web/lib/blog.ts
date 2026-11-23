import { auth } from '@/auth'
import type { BlogPost } from './blog-types'

export type { BlogPost }

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')
}

function asSlug(value: string | string[] | undefined) {
  if (!value) return ''
  return decodeURIComponent(Array.isArray(value) ? value.join('/') : value).trim()
}

export async function getBlogPosts(options?: { includeUnpublished?: boolean }): Promise<BlogPost[]> {
  if (options?.includeUnpublished) {
    const session = await auth()
    const token = session?.accessToken
    const response = await fetch(`${apiBase()}/api/admin/blog`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data?.data) ? data.data : []
  }

  const response = await fetch(`${apiBase()}/api/blog`, { cache: 'no-store' })
  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data?.data?.posts) ? data.data.posts : []
}

export async function getBlogPost(slug: string | string[] | undefined): Promise<BlogPost | undefined> {
  const normalized = asSlug(slug)
  if (!normalized) return undefined
  const response = await fetch(`${apiBase()}/api/blog/${encodeURIComponent(normalized)}`, {
    cache: 'no-store',
  })
  if (!response.ok) return undefined
  const data = await response.json()
  return data?.data?.post
}

export async function getBlogPostsByCategory(category: string | string[] | undefined): Promise<BlogPost[]> {
  if (!category) return getBlogPosts()
  const value = asSlug(Array.isArray(category) ? category[0] : category)
  const response = await fetch(`${apiBase()}/api/blog?category=${encodeURIComponent(value)}`, {
    cache: 'no-store',
  })
  if (!response.ok) return []
  const data = await response.json()
  return Array.isArray(data?.data?.posts) ? data.data.posts : []
}
