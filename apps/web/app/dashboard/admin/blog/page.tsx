import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { ROLES } from '@/lib/roles'
import { getBlogPosts } from '@/lib/blog'
import { AdminBlogEditor } from '@/components/admin/blog-editor'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const session = await auth()
  const role = session?.user?.role

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/admin/blog')
  }

  if (role !== ROLES.ADMIN && role !== ROLES.ADMIN_ASSISTANT) {
    redirect('/dashboard/user')
  }

  const posts = await getBlogPosts({ includeUnpublished: true })

  return (
    <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Content</p>
            <h1 className="text-3xl font-bold text-primary">Blog Management</h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              Create, edit, and delete MamaPlus blog posts. Changes are saved to the database and appear on the public blog.
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline">View public blog</Button>
          </Link>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <AdminBlogEditor existingPosts={posts} />
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quick stats</p>
              <h2 className="text-3xl font-bold text-primary">{posts.length}</h2>
              <p className="text-sm text-muted-foreground">Blog posts in database</p>
            </div>
            <div className="rounded-xl border border-border p-4 bg-gray-50">
              <p className="text-sm font-semibold text-foreground mb-2">Latest posts</p>
              <ul className="space-y-3">
                {posts.slice(0, 5).map((post) => (
                  <li key={post.slug} className="rounded-xl bg-white p-4 shadow-sm border border-border/60">
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {post.publishedAt} · {post.category}
                      {post.isPublished === false ? ' · Draft' : ''}
                    </p>
                  </li>
                ))}
                {posts.length === 0 && (
                  <li className="text-sm text-muted-foreground">No posts yet. Create your first article.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
    </div>
  )
}
