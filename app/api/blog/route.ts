import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts, getBlogPostsByCategory } from '@/lib/blog'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * GET /api/blog
 * Public list of published blog posts. Optional ?category= filter.
 */
export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category')?.trim()
    const posts = category
      ? await getBlogPostsByCategory(category)
      : await getBlogPosts()

    const categories = [
      ...new Set((await getBlogPosts()).map((post) => post.category).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b))

    return jsonWithCors(request, {
      success: true,
      data: {
        posts,
        categories,
      },
    })
  } catch (error) {
    console.error('Public blog list error:', error)
    return jsonWithCors(
      request,
      { success: false, message: 'Failed to load blog posts' },
      { status: 500 }
    )
  }
}
