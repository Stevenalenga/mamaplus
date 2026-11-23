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
