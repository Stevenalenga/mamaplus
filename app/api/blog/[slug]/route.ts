import { NextRequest, NextResponse } from 'next/server'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * GET /api/blog/[slug]
 * Public single published blog post + related posts.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolved = context.params instanceof Promise ? await context.params : context.params
    const slug = resolved.slug

    const post = await getBlogPost(slug)
    if (!post) {
      return jsonWithCors(
        request,
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    const allPosts = await getBlogPosts()
    const relatedPosts = allPosts
      .filter(
        (candidate) =>
          candidate.slug !== post.slug &&
          (candidate.category === post.category ||
            candidate.tags.some((tag) => post.tags.includes(tag)))
      )
      .slice(0, 3)

    return jsonWithCors(request, {
      success: true,
      data: {
        post,
        relatedPosts,
      },
    })
  } catch (error) {
    console.error('Public blog detail error:', error)
    return jsonWithCors(
      request,
      { success: false, message: 'Failed to load blog post' },
      { status: 500 }
    )
  }
}
