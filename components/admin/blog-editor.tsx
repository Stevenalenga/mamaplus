'use client'

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, X } from 'lucide-react'
import { BlogPost } from '@/lib/blog'

interface AdminBlogEditorProps {
  existingPosts: BlogPost[]
}

const defaultFormData = {
  title: '',
  description: '',
  author: 'MamaPlus Team',
  category: 'Parenting Tips',
  tags: 'childcare, caregiving',
  image: '',
  readTime: '5 min read',
  content: '',
}

export function AdminBlogEditor({ existingPosts }: AdminBlogEditorProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(defaultFormData)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url')
  const [localImageData, setLocalImageData] = useState<string | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const sortedPosts = useMemo(
    () => [...existingPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [existingPosts]
  )

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setLocalImageData(null)
      return
    }

    const maxFileSize = 5 * 1024 * 1024 // 5 MB
    if (file.size > maxFileSize) {
      setStatus({
        type: 'error',
        message: 'Image is too large. Please use a file smaller than 5 MB or provide an image URL.',
      })
      setLocalImageData(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLocalImageData(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setSelectedSlug(null)
    setImageSource('url')
    setLocalImageData(null)
    setFormData(defaultFormData)
    setStatus(null)
  }

  const startEdit = (post: BlogPost) => {
    setSelectedSlug(post.slug)
    setImageSource('url')
    setLocalImageData(null)
    setFormData({
      title: post.title,
      description: post.description,
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      image: post.image ?? '',
      readTime: post.readTime,
      content: post.content,
    })
    setStatus(null)
  }

  const handleDelete = async (slug: string) => {
    const confirmed = window.confirm('Delete this blog post? This cannot be undone.')
    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setStatus(null)

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      })

      const result = await response.json()
      if (!response.ok) {
        setStatus({ type: 'error', message: result.error || 'Unable to delete blog post' })
      } else {
        setStatus({ type: 'success', message: 'Blog post deleted successfully' })
        if (selectedSlug === slug) {
          resetForm()
        }
        router.refresh()
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Unexpected error while deleting blog post' })
    }

    setSubmitting(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus(null)

    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        readTime: formData.readTime,
      }

      if (selectedSlug) {
        payload.slug = selectedSlug
      }

      if (imageSource === 'upload' && localImageData) {
        payload.imageData = localImageData
      } else if (imageSource === 'url' && formData.image) {
        payload.imageUrl = formData.image
      }

      const response = await fetch('/api/admin/blog', {
        method: selectedSlug ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setStatus({ type: 'error', message: result.error || 'Unable to save blog post' })
      } else {
        setStatus({ type: 'success', message: selectedSlug ? 'Blog post updated successfully' : 'Blog post created successfully' })
        resetForm()
        router.refresh()
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Unexpected error while saving blog post' })
    }

    setSubmitting(false)
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">Admin blog editor</h2>
            <p className="text-sm text-muted-foreground">Create new blog posts and review existing content.</p>
          </div>
          <div className="text-sm text-muted-foreground">Total posts: {existingPosts.length}</div>
        </div>

        {status && (
          <div className={`rounded-xl p-4 mt-6 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 mt-6">
          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="How to choose the right caregiver"
              required
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Short description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A short summary of the blog post"
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">Author</label>
            <Input name="author" value={formData.author} onChange={handleChange} required />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">Category</label>
            <Input name="category" value={formData.category} onChange={handleChange} required />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">Read time</label>
            <Input name="readTime" value={formData.readTime} onChange={handleChange} required />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">Tags</label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="childcare, parenting, training"
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="block text-sm font-medium text-foreground">Cover image</label>
              <div className="inline-flex rounded-full border border-border bg-background p-1 text-xs text-muted-foreground">
                <button
                  type="button"
                  className={`px-3 py-2 rounded-full ${imageSource === 'url' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => {
                    setImageSource('url')
                    setLocalImageData(null)
                  }}
                >
                  URL
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 rounded-full ${imageSource === 'upload' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}
                  onClick={() => {
                    setImageSource('upload')
                    setFormData((prev) => ({ ...prev, image: '' }))
                  }}
                >
                  Upload
                </button>
              </div>
            </div>

            {imageSource === 'url' ? (
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            ) : (
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            )}

            {(localImageData || formData.image) && (
              <div className="rounded-2xl border border-border overflow-hidden bg-background">
                <img
                  src={localImageData ?? formData.image}
                  alt="Cover preview"
                  className="w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-4 md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Content</label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the full article content here..."
              rows={10}
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="submit" disabled={submitting || !formData.title || !formData.description || !formData.content} className="w-full sm:w-auto">
              {submitting ? (selectedSlug ? 'Updating post...' : 'Saving post...') : selectedSlug ? 'Update blog post' : 'Create blog post'}
            </Button>
            {selectedSlug ? (
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cancel edit
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-primary mb-4">Existing posts</h3>
        <div className="grid gap-4">
          {sortedPosts.map((post) => (
            <div key={post.slug} className="rounded-2xl border border-border bg-background/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{post.category} • {post.readTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => startEdit(post)} className="text-sm">
                    <Pencil className="mr-2 w-4 h-4" /> Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => handleDelete(post.slug)} className="text-sm">
                    <Trash2 className="mr-2 w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">Published: {new Date(post.publishedAt).toLocaleDateString('en-KE')}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
