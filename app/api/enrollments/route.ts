import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserEnrolledCourses } from '@/lib/db-utils'

/**
 * GET /api/enrollments
 * Get user enrollments
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const enrollments = await getUserEnrolledCourses(userId)

    return NextResponse.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    })

  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/enrollments
 * Create enrollment (usually after payment)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId } = await request.json()

    if (!userId || !courseId) {
      return NextResponse.json(
        { message: 'User ID and Course ID are required' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Already enrolled in this course' },
        { status: 409 }
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE'
      },
      include: {
        course: true
      }
    })

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create enrollment error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
