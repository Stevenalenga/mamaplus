import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCourseRating } from '@/lib/db-utils'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { requireAdminForCourseWrite } from '@/lib/course-access'

/**
 * GET /api/courses/[id]
 * Get course by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)

    // Try to find by ID first, then by slug
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                description: true,
                content: true,
                duration: true,
                order: true,
                isFree: true,
                videoUrl: true,
                resourceUrls: true
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        reviews: {
          where: { isPublished: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    const canViewUnpublished = !!currentUser && (
      hasRole(currentUser, ROLES.ADMIN) ||
      (hasRole(currentUser, ROLES.INSTRUCTOR) && course.instructorId === currentUser.userId)
    )

    if (!course.isPublished && !canViewUnpublished) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Get average rating
    const rating = await getCourseRating(course.id)

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        rating
      }
    })

  } catch (error: any) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/courses/[id]
 * Update course (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    const data = await request.json()

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.durationLabel !== undefined && { durationLabel: data.durationLabel }),
        ...(data.scheduleDates !== undefined && { scheduleDates: data.scheduleDates }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.priceUSD !== undefined && { priceUSD: data.priceUSD }),
        ...(data.priceKES !== undefined && { priceKES: data.priceKES }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.whatYouLearn !== undefined && { whatYouLearn: data.whatYouLearn }),
        ...(data.specialOffer !== undefined && { specialOffer: data.specialOffer }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl })
      }
    })

    return NextResponse.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    })

  } catch (error: any) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request)
    const authError = requireAdminForCourseWrite(currentUser)
    if (authError) return authError

    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    await prisma.course.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
