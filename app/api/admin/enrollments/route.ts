import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

/**
 * GET /api/admin/enrollments
 * PATCH /api/admin/enrollments — body: { enrollmentId, status?, progress? }
 * POST /api/admin/enrollments — body: { userId, courseId }
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const status = searchParams.get('status') || ''
    const courseId = searchParams.get('courseId') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (courseId) where.courseId = courseId
    if (search) {
      where.OR = [
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
        { user: { phoneNumber: { contains: search } } },
        { course: { title: { contains: search } } },
      ]
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { enrollments, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    console.error('Admin list enrollments error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { userId, courseId } = await request.json()
    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, message: 'userId and courseId are required' },
        { status: 400 },
      )
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'User is already enrolled in this course' },
        { status: 409 },
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(
      { success: true, data: enrollment, message: 'Enrollment created' },
      { status: 201 },
    )
  } catch (error: unknown) {
    console.error('Admin create enrollment error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { enrollmentId, status, progress } = await request.json()
    if (!enrollmentId) {
      return NextResponse.json(
        { success: false, message: 'enrollmentId is required' },
        { status: 400 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (progress !== undefined) {
      const p = Math.min(100, Math.max(0, Number(progress)))
      updateData.progress = p
      if (p === 100) {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
      }
    }
    if (status === 'CANCELLED') {
      updateData.completedAt = null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No changes provided' }, { status: 400 })
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({ success: true, data: enrollment, message: 'Enrollment updated' })
  } catch (error: unknown) {
    console.error('Admin update enrollment error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
