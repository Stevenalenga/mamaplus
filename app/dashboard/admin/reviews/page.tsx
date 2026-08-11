'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Review = {
  id: string
  rating: number
  comment: string | null
  isPublished: boolean
  createdAt: string
  user: { name: string | null; email: string | null }
  course: { title: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [publishedFilter, setPublishedFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = publishedFilter !== 'all' ? `?published=${publishedFilter}` : ''
      const res = await fetch(`/api/admin/reviews${params}`)
      const data = await res.json()
      if (data.success) setReviews(data.data)
    } finally {
      setLoading(false)
    }
  }, [publishedFilter])

  useEffect(() => { load() }, [load])

  const togglePublish = async (reviewId: string, isPublished: boolean) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, isPublished }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(isPublished ? 'Review published' : 'Review hidden')
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  const deleteReview = async (reviewId: string) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Review deleted')
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Moderation</h2>
          <p className="text-sm text-muted-foreground">Publish, hide, or remove course reviews</p>
        </div>
        <Select value={publishedFilter} onValueChange={setPublishedFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reviews</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader><CardTitle className="text-base">Course Reviews</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reviews found</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{r.course.title}</p>
                      <p className="text-sm text-muted-foreground">{r.user.name || r.user.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                    </div>
                    <Badge variant={r.isPublished ? 'default' : 'secondary'}>
                      {r.isPublished ? 'Published' : 'Hidden'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => togglePublish(r.id, !r.isPublished)}>
                      {r.isPublished ? 'Hide' : 'Publish'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteReview(r.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
