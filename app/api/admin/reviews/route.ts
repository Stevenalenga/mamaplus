import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const published = new URL(request.url).searchParams.get('published')
    const where =
      published === 'true'
        ? { isPublished: true }
        : published === 'false'
          ? { isPublished: false }
          : {}

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { reviewId, isPublished } = await request.json()
    if (!reviewId || isPublished === undefined) {
      return NextResponse.json(
        { success: false, message: 'reviewId and isPublished are required' },
        { status: 400 },
      )
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: Boolean(isPublished) },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { reviewId } = await request.json()
    if (!reviewId) {
      return NextResponse.json({ success: false, message: 'reviewId is required' }, { status: 400 })
    }

    await prisma.review.delete({ where: { id: reviewId } })

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
