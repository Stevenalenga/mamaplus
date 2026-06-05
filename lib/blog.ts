import * as fs from 'fs'
import * as path from 'path'

export interface BlogPost {
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
}

const blogPostsPath = path.join(process.cwd(), 'data', 'blog-posts.json')

function readBlogPosts(): BlogPost[] {
  try {
    const file = fs.readFileSync(blogPostsPath, 'utf8')
    return JSON.parse(file) as BlogPost[]
  } catch (error) {
    console.error('Failed to read blog posts from JSON:', error)
    return []
  }
}

function writeBlogPosts(posts: BlogPost[]) {
  fs.writeFileSync(blogPostsPath, JSON.stringify(posts, null, 2), 'utf8')
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

function sortPostsByDate(posts: BlogPost[]) {
  return [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

function generateUniqueSlug(title: string, posts: BlogPost[]) {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let index = 1

  while (posts.some((post) => normalizeSlug(post.slug) === slug)) {
    slug = `${baseSlug}-${index}`
    index += 1
  }

  return slug
}

export function getBlogPosts(): BlogPost[] {
  return sortPostsByDate(readBlogPosts())
}

export function getBlogPost(slug: string | string[] | undefined): BlogPost | undefined {
  if (!slug) return undefined
  const normalizedSlug = normalizeSlug(Array.isArray(slug) ? slug.join('/') : slug)
  return readBlogPosts().find((post) => normalizeSlug(post.slug) === normalizedSlug)
}

export function getBlogPostsByCategory(category: string | string[] | undefined): BlogPost[] {
  if (!category) return sortPostsByDate(readBlogPosts())
  const normalizedCategory = normalizeSlug(Array.isArray(category) ? category[0] : category)
  return sortPostsByDate(readBlogPosts().filter((post) => normalizeSlug(post.category) === normalizedCategory))
}

export function getBlogPostsByTag(tag: string | string[] | undefined): BlogPost[] {
  if (!tag) return sortPostsByDate(readBlogPosts())
  const normalizedTag = normalizeSlug(Array.isArray(tag) ? tag[0] : tag)
  return sortPostsByDate(readBlogPosts().filter((post) => post.tags.some((currentTag) => normalizeSlug(currentTag) === normalizedTag)))
}

export function addBlogPost(postData: {
  title: string
  description: string
  content: string
  author: string
  category: string
  tags: string[]
  image?: string
  readTime: string
  publishedAt?: string
  updatedAt?: string
}): BlogPost {
  const posts = readBlogPosts()
  const newPost: BlogPost = {
    slug: generateUniqueSlug(postData.title, posts),
    title: postData.title,
    description: postData.description,
    content: postData.content,
    author: postData.author,
    category: postData.category,
    tags: postData.tags,
    image: postData.image,
    readTime: postData.readTime,
    publishedAt: postData.publishedAt || new Date().toISOString().split('T')[0],
    updatedAt: postData.updatedAt,
  }

  posts.push(newPost)
  writeBlogPosts(posts)

  return newPost
}

export function updateBlogPost(slug: string, postData: {
  title?: string
  description?: string
  content?: string
  author?: string
  category?: string
  tags?: string[]
  image?: string
  readTime?: string
  updatedAt?: string
}): BlogPost | undefined {
  const posts = readBlogPosts()
  const normalizedSlug = normalizeSlug(slug)
  const postIndex = posts.findIndex((post) => normalizeSlug(post.slug) === normalizedSlug)

  if (postIndex === -1) {
    return undefined
  }

  const existingPost = posts[postIndex]
  const updatedPost: BlogPost = {
    ...existingPost,
    title: postData.title ?? existingPost.title,
    description: postData.description ?? existingPost.description,
    content: postData.content ?? existingPost.content,
    author: postData.author ?? existingPost.author,
    category: postData.category ?? existingPost.category,
    tags: postData.tags ?? existingPost.tags,
    image: postData.image ?? existingPost.image,
    readTime: postData.readTime ?? existingPost.readTime,
    updatedAt: postData.updatedAt || new Date().toISOString().split('T')[0],
  }

  posts[postIndex] = updatedPost
  writeBlogPosts(posts)

  return updatedPost
}

export function deleteBlogPost(slug: string): boolean {
  const posts = readBlogPosts()
  const normalizedSlug = normalizeSlug(slug)
  const filteredPosts = posts.filter((post) => normalizeSlug(post.slug) !== normalizedSlug)

  if (filteredPosts.length === posts.length) {
    return false
  }

  writeBlogPosts(filteredPosts)
  return true
}
