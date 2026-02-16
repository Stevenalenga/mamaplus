'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import { getBlogPosts } from '@/lib/blog'
import SEOHead from '@/components/seo-head'

export default function BlogPage() {
  const posts = getBlogPosts()
  
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MamaPlus Blog',
    description: 'Childcare tips, parenting advice, and caregiver career guidance from MamaPlus Kenya',
    url: 'https://mamaplus.co.ke/blog',
  }

  const categories = [...new Set(posts.map(post => post.category))]

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Childcare Blog - Tips, Advice & Resources"
        description="Expert childcare tips, parenting advice, and caregiver career guidance. Learn about child development, safety, training, and quality care practices in Kenya."
        keywords={[
          'childcare blog Kenya',
          'parenting tips Africa',
          'caregiver career advice',
          'child development resources',
          'childcare best practices',
        ]}
        canonicalUrl="https://mamaplus.co.ke/blog"
        schema={blogSchema}
      />

      {/* Hero Section */}
      <section className="pt-20 pb-10 px-4 sm:pt-24 sm:pb-12 md:pt-32 md:pb-16 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 md:mb-6 leading-tight">
            MamaPlus <span className="text-secondary">Blog</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold max-w-3xl mx-auto px-4">
            Expert insights on childcare, parenting, and building a career as a professional caregiver
          </p>
        </div>
      </section>

      {/* Categories */}
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

      {/* Blog Posts Grid */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <article key={post.slug} className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/50 transition group">
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-primary/40" />
                </div>
                
                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 group-hover:text-primary transition line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-KE', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
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

      {/* CTA Section */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Stay Updated</h2>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Get the latest childcare tips and resources delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-primary"
            />
            <Button className="bg-primary hover:bg-primary/90 text-white py-3">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
