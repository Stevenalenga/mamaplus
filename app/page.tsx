import { getBlogPosts } from '@/lib/blog'
import { HomeLanding } from '@/components/home-landing'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let posts: { slug: string; title: string; description: string; category: string }[] = []
  try {
    posts = (await getBlogPosts()).slice(0, 3).map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
    }))
  } catch {
    posts = []
  }

  return <HomeLanding posts={posts} />
}
