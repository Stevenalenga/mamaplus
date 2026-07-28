import { prisma } from '@/lib/db'
import type { BlogPost as DbBlogPost } from '@prisma/client'

export interface BlogPost {
  id?: string
  slug: string
  title: string
  description: string
  content: string
  author: string
  publishedAt: string
  updatedAt?: string
  category: string
  tags: string[]
  image?: string
  readTime: string
  isPublished?: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSlug(value: string) {
  return decodeURIComponent(value || '').trim().toLowerCase()
}

function toDateOnly(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }
  return date.toISOString().split('T')[0]
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
  } catch {
    // fall through
  }
  return raw.split(',').map((tag) => tag.trim()).filter(Boolean)
}

function encodeTags(tags: string[]): string {
  return JSON.stringify(tags.map((tag) => tag.trim()).filter(Boolean))
}

function mapDbPost(post: DbBlogPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    author: post.author,
    publishedAt: toDateOnly(post.publishedAt),
    updatedAt: toDateOnly(post.updatedAt),
    category: post.category,
    tags: parseTags(post.tags),
    image: post.image || undefined,
    readTime: post.readTime,
    isPublished: post.isPublished,
  }
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title) || `post-${Date.now()}`
  let slug = baseSlug
  let index = 1

  while (true) {
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }
    slug = `${baseSlug}-${index}`
    index += 1
  }
}

export async function getBlogPosts(options?: { includeUnpublished?: boolean }): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: options?.includeUnpublished ? undefined : { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
  return posts.map(mapDbPost)
}

export async function getBlogPost(
  slug: string | string[] | undefined,
  options?: { includeUnpublished?: boolean }
): Promise<BlogPost | undefined> {
  if (!slug) return undefined
  const normalizedSlug = normalizeSlug(Array.isArray(slug) ? slug.join('/') : slug)
  const post = await prisma.blogPost.findUnique({ where: { slug: normalizedSlug } })
  if (!post) return undefined
  if (!options?.includeUnpublished && !post.isPublished) return undefined
  return mapDbPost(post)
}

export async function getBlogPostsByCategory(
  category: string | string[] | undefined
): Promise<BlogPost[]> {
  if (!category) return getBlogPosts()
  const normalizedCategory = normalizeSlug(Array.isArray(category) ? category[0] : category)
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
  return posts
    .map(mapDbPost)
    .filter((post) => normalizeSlug(post.category) === normalizedCategory)
}

export async function getBlogPostsByTag(tag: string | string[] | undefined): Promise<BlogPost[]> {
  if (!tag) return getBlogPosts()
  const normalizedTag = normalizeSlug(Array.isArray(tag) ? tag[0] : tag)
  const posts = await getBlogPosts()
  return posts.filter((post) =>
    post.tags.some((currentTag) => normalizeSlug(currentTag) === normalizedTag)
  )
}

export async function addBlogPost(postData: {
  title: string
  description: string
  content: string
  author: string
  authorId?: string | null
  category: string
  tags: string[]
  image?: string
  readTime: string
  publishedAt?: string
  isPublished?: boolean
}): Promise<BlogPost> {
  const slug = await generateUniqueSlug(postData.title)
  const publishedAt = postData.publishedAt
    ? new Date(postData.publishedAt)
    : new Date()

  const created = await prisma.blogPost.create({
    data: {
      slug,
      title: postData.title,
      description: postData.description,
      content: postData.content,
      author: postData.author,
      authorId: postData.authorId || null,
      category: postData.category,
      tags: encodeTags(postData.tags),
      image: postData.image || null,
      readTime: postData.readTime,
      publishedAt,
      isPublished: postData.isPublished ?? true,
    },
  })

  return mapDbPost(created)
}

export async function updateBlogPost(
  slug: string,
  postData: {
    title?: string
    description?: string
    content?: string
    author?: string
    authorId?: string | null
    category?: string
    tags?: string[]
    image?: string
    readTime?: string
    isPublished?: boolean
  }
): Promise<BlogPost | undefined> {
  const normalizedSlug = normalizeSlug(slug)
  const existing = await prisma.blogPost.findUnique({ where: { slug: normalizedSlug } })
  if (!existing) return undefined

  const updated = await prisma.blogPost.update({
    where: { id: existing.id },
    data: {
      title: postData.title ?? existing.title,
      description: postData.description ?? existing.description,
      content: postData.content ?? existing.content,
      author: postData.author ?? existing.author,
      authorId: postData.authorId === undefined ? existing.authorId : postData.authorId,
      category: postData.category ?? existing.category,
      tags: postData.tags ? encodeTags(postData.tags) : existing.tags,
      image: postData.image === undefined ? existing.image : postData.image || null,
      readTime: postData.readTime ?? existing.readTime,
      isPublished:
        postData.isPublished === undefined ? existing.isPublished : postData.isPublished,
    },
  })

  return mapDbPost(updated)
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  const normalizedSlug = normalizeSlug(slug)
  const existing = await prisma.blogPost.findUnique({ where: { slug: normalizedSlug } })
  if (!existing) return false

  await prisma.blogPost.delete({ where: { id: existing.id } })
  return true
}
