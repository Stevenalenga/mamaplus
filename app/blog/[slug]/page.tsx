'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, User, Tag as TagIcon } from 'lucide-react'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import SEOHead from '@/components/seo-head'
import ReactMarkdown from 'react-markdown'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = getBlogPost(slug)
  const allPosts = getBlogPosts()
  const relatedPosts = allPosts.filter(p => 
    p.slug !== slug && 
    (p.category === post?.category || p.tags.some(tag => post?.tags.includes(tag)))
  ).slice(0, 3)

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image || 'https://mamaplus.co.ke/og-image.jpg',
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MamaPlus',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mamaplus.co.ke/logo.png',
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.title}
        description={post.description}
        keywords={post.tags}
        canonicalUrl={`https://mamaplus.co.ke/blog/${post.slug}`}
        schema={articleSchema}
      />

      {/* Back Button */}
      <section className="pt-20 sm:pt-24 px-4 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto py-4">
          <Link href="/blog">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <article className="py-8 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString('en-KE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Featured Image Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl mb-8 flex items-center justify-center">
            <TagIcon className="w-20 h-20 text-primary/40" />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-primary mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-primary mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-foreground mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-muted-foreground mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                a: ({node, ...props}) => <a className="text-primary hover:underline font-semibold" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon className="w-5 h-5 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span 
                  key={tag}
                  className="inline-block bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-8 text-center">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/50 transition">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <TagIcon className="w-12 h-12 text-primary/40" />
                  </div>
                  <div className="p-5">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedPost.description}
                    </p>
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent text-sm">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-10 px-4 sm:py-12 md:py-16 lg:px-8 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">Ready to Get Started?</h2>
          <p className="text-base sm:text-lg md:text-xl text-secondary font-semibold mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Whether you're a parent or caregiver, MamaPlus is here to support you
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/services">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3">
                Find Services
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent px-6 py-3">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
