import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { ROLES } from '@/lib/roles'
import {
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPosts,
} from '@/lib/blog'
import { uploadToStorage } from '@/lib/storage'

function canManageBlog(role: string | undefined) {
  return role === ROLES.ADMIN || role === ROLES.ADMIN_ASSISTANT
}

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

/** Prefer a site-relative /api/files/... path so images keep working across hosts. */
function toPublicImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  try {
    if (trimmed.startsWith('/')) return trimmed
    const parsed = new URL(trimmed)
    if (parsed.pathname.startsWith('/api/files/')) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // keep original
  }
  return trimmed
}

async function resolveImageField(body: any): Promise<
  { ok: true; image: string | undefined } | { ok: false; error: string }
> {
  if (typeof body.imageData === 'string' && body.imageData.startsWith('data:')) {
    const result = await uploadToStorage(body.imageData, 'image', {
      folder: 'mamaplus/blog',
    })
    if (!result.success || !result.url) {
      return { ok: false, error: result.error || 'Failed to upload cover image' }
    }
    return { ok: true, image: toPublicImageUrl(result.url) }
  }

  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    return { ok: true, image: toPublicImageUrl(body.imageUrl) }
  }

  if (typeof body.image === 'string' && body.image.trim()) {
    return { ok: true, image: toPublicImageUrl(body.image) }
  }

  // Explicit clear
  if (body.clearImage === true) {
    return { ok: true, image: '' }
  }

  return { ok: true, image: undefined }
}

function validatePostBody(body: any) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    content: typeof body.content === 'string' ? body.content.trim() : '',
    author: typeof body.author === 'string' ? body.author.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : '',
    readTime: typeof body.readTime === 'string' ? body.readTime.trim() : '',
    tags: parseTags(body.tags),
    isPublished:
      typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
  }
}

async function requireBlogAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || !canManageBlog(user.role)) {
    return null
  }
  return user
}

export async function GET(request: NextRequest) {
  const user = await requireBlogAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await getBlogPosts({ includeUnpublished: true })
  return NextResponse.json({ success: true, data: posts })
}

export async function POST(request: NextRequest) {
  const user = await requireBlogAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, content, author, category, readTime, tags, isPublished } =
    validatePostBody(body)

  if (!title || !description || !content || !author || !category || !readTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const imageResult = await resolveImageField(body)
  if (!imageResult.ok) {
    return NextResponse.json({ error: imageResult.error }, { status: 400 })
  }

  try {
    const newPost = await addBlogPost({
      title,
      description,
      content,
      author,
      authorId: user.id,
      category,
      tags,
      image: imageResult.image,
      readTime,
      isPublished: isPublished ?? true,
    })

    return NextResponse.json(newPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save blog post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await requireBlogAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const { title, description, content, author, category, readTime, tags, isPublished } =
    validatePostBody(body)

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  if (!title || !description || !content || !author || !category || !readTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const imageResult = await resolveImageField(body)
  if (!imageResult.ok) {
    return NextResponse.json({ error: imageResult.error }, { status: 400 })
  }

  try {
    const updatedPost = await updateBlogPost(slug, {
      title,
      description,
      content,
      author,
      authorId: user.id,
      category,
      tags,
      // undefined keeps existing image; '' clears it
      image: imageResult.image,
      readTime,
      isPublished,
    })

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(updatedPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update blog post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireBlogAdmin(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  try {
    const deleted = await deleteBlogPost(slug)

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete blog post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
