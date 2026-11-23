import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import { getBlogPosts, getBlogPostsByCategory } from '@/lib/blog'
import SEOHead from '@/components/seo-head'

export const dynamic = 'force-dynamic'

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string | string[] }> | { category?: string | string[] }
}) {
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams
  const category = resolvedSearchParams?.category
  const allPosts = await getBlogPosts()
  const posts = category ? await getBlogPostsByCategory(category) : allPosts
  const categories = [...new Set(allPosts.map((post) => post.category))]

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MamaPlus Learn Library',
    description: 'Articles on childcare training, child development, and professional caregiver practice from MamaPlus Kenya',
    url: 'https://mamaplus.co.ke/blog',
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Learning Library - Articles on Childcare Training"
        description="Articles and resources from MamaPlus on childcare training, child development, and professional caregiver practice in Kenya."
        keywords={[
          'childcare training articles Kenya',
          'caregiver learning resources',
          'child development resources',
          'MamaPlus learn library',
        ]}
        canonicalUrl="https://mamaplus.co.ke/blog"
        schema={blogSchema}
      />

      <section className="pt-24 pb-10 px-4 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-3">Learn library</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight">
            Articles for people who care for children
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            A resource library on training, child development, and professional practice. For learning paths and courses, visit the Learn hub.
          </p>
          <div className="mt-6">
            <Link href="/learn">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Back to Learn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-6 px-4 lg:px-8 border-b border-border bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Link href="/blog">
              <Button variant="outline" className="text-sm">All Posts</Button>
            </Link>
            {categories.map((category) => (
              <Link key={category} href={`/blog?category=${encodeURIComponent(category)}`}>
                <Button variant="outline" className="text-sm">{category}</Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/50 transition group">
                {post.image ? (
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-primary/40" />
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="mb-3">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 group-hover:text-primary transition line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent">
                      Read More <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Keep learning</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Browse more articles or enrol in a professional childcare course.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/learn">
              <Button className="bg-primary hover:bg-primary/90 text-white py-3">
                Open Learn
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent py-3">
                Explore courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
