import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { addBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/blog'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
}

const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
}

function saveImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/)
  if (!match) {
    return ''
  }

  const mime = match[1]
  const base64Data = match[2]
  const extension = mime.split('/')[1].replace('jpeg', 'jpg')
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`
  const filePath = path.join(uploadsDir, fileName)

  ensureUploadsDir()
  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'))

  return `/uploads/${fileName}`
}

function parseImageField(body: any) {
  if (typeof body.imageData === 'string' && body.imageData.startsWith('data:')) {
    return saveImageDataUrl(body.imageData)
  }

  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    return body.imageUrl.trim()
  }

  if (typeof body.image === 'string' && body.image.trim()) {
    return body.image.trim()
  }

  return undefined
}

function validatePostBody(body: any) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    content: typeof body.content === 'string' ? body.content.trim() : '',
    author: typeof body.author === 'string' ? body.author.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : '',
    image: parseImageField(body),
    readTime: typeof body.readTime === 'string' ? body.readTime.trim() : '',
    tags: parseTags(body.tags),
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, content, author, category, image, readTime, tags } = validatePostBody(body)

  if (!title || !description || !content || !author || !category || !readTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const newPost = addBlogPost({
      title,
      description,
      content,
      author,
      category,
      tags,
      image,
      readTime,
    })

    return NextResponse.json(newPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save blog post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const { title, description, content, author, category, image, readTime, tags } = validatePostBody(body)

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  if (!title || !description || !content || !author || !category || !readTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const updatedPost = updateBlogPost(slug, {
      title,
      description,
      content,
      author,
      category,
      tags,
      image,
      readTime,
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

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  }

  try {
    const deleted = deleteBlogPost(slug)

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete blog post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
