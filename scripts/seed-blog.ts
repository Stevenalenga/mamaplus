import fs from 'fs'
import path from 'path'
import { prisma } from '../lib/db'

type JsonBlogPost = {
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

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'blog-posts.json')
  if (!fs.existsSync(filePath)) {
    console.log('No data/blog-posts.json found — skipping seed')
    return
  }

  const posts = JSON.parse(fs.readFileSync(filePath, 'utf8')) as JsonBlogPost[]
  let created = 0
  let updated = 0

  for (const post of posts) {
    const data = {
      title: post.title,
      description: post.description,
      content: post.content,
      author: post.author,
      category: post.category,
      tags: JSON.stringify(post.tags || []),
      image: post.image || null,
      readTime: post.readTime,
      publishedAt: new Date(post.publishedAt),
      isPublished: true,
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      await prisma.blogPost.update({ where: { slug: post.slug }, data })
      updated += 1
      console.log('Updated:', post.slug)
    } else {
      await prisma.blogPost.create({
        data: {
          slug: post.slug,
          ...data,
        },
      })
      created += 1
      console.log('Created:', post.slug)
    }
  }

  console.log(`✅ Seeded blog posts (created ${created}, updated ${updated})`)
}

main()
  .catch((error) => {
    console.error('❌ Seed blog error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
