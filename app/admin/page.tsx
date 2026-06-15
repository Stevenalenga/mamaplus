import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import SEOHead from '@/components/seo-head'
import { AdminBlogEditor } from '@/components/admin/blog-editor'
import { LogoutButton } from '@/components/admin/logout-button'
import { getBlogPosts } from '@/lib/blog'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login')
  }

  const posts = getBlogPosts()

  return (
    <div className="min-h-screen bg-background px-4 py-10 lg:px-8">
      <SEOHead
        title="MamaPlus Admin Portal"
        description="Manage MamaPlus blog content from the secure admin portal."
        keywords={['admin portal', 'blog management', 'MamaPlus admin']}
        canonicalUrl="https://mamaplus.co.ke/admin"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Admin portal</p>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">Manage blog posts</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-2xl">
              Create new blog posts, review existing articles, and keep the MamaPlus blog content up to date.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog">
              <Button variant="outline">View public blog</Button>
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
            <AdminBlogEditor existingPosts={posts} />
          </div>
          <div className="rounded-[2rem] border border-border bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quick stats</p>
                <h2 className="text-3xl font-bold text-primary">{posts.length}</h2>
                <p className="text-sm text-muted-foreground">Published blog posts</p>
              </div>
              <div className="rounded-3xl border border-border p-4 bg-background/50">
                <p className="text-sm font-semibold text-foreground mb-2">Latest published</p>
                <ul className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <li key={post.slug} className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="font-semibold text-foreground">{post.title}</p>
                      <p className="text-sm text-muted-foreground">{post.publishedAt} · {post.category}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
