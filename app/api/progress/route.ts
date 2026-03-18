import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateCourseProgress } from '@/lib/db-utils'
import { getCurrentUser, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'

/**
 * GET /api/progress
 * Get user's progress for a course or lesson
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const requestedUserId = searchParams.get('userId')
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get progress for specific lesson
    if (lessonId) {
      const progress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: progress
      })
    }

    // Get progress for entire course
    if (courseId) {
      const courseProgress = await calculateCourseProgress(userId, courseId)

      return NextResponse.json({
        success: true,
        data: {
          courseId,
          progress: courseProgress
        }
      })
    }

    // Get all user progress
    const allProgress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            module: {
              select: {
                courseId: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: allProgress,
      count: allProgress.length
    })

  } catch (error: any) {
    console.error('Get progress error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/progress
 * Update lesson progress
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { userId: requestedUserId, lessonId, isCompleted, watchedDuration } = await request.json()
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId

    if (!userId || !lessonId) {
      return NextResponse.json(
        { success: false, message: 'User ID and Lesson ID are required' },
        { status: 400 }
      )
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        isCompleted: isCompleted ?? undefined,
        watchedDuration: watchedDuration ?? undefined,
        lastWatchedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        isCompleted: isCompleted || false,
        watchedDuration: watchedDuration || 0,
        lastWatchedAt: new Date()
      }
    })

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } }
    })

    if (lesson?.module?.courseId) {
      const courseProgress = await calculateCourseProgress(userId, lesson.module.courseId)
      await prisma.enrollment.updateMany({
        where: {
          userId,
          courseId: lesson.module.courseId
        },
        data: {
          progress: courseProgress,
          status: courseProgress === 100 ? 'COMPLETED' : 'ACTIVE',
          ...(courseProgress === 100 ? { completedAt: new Date() } : { completedAt: null })
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Progress updated'
    })

  } catch (error: any) {
    console.error('Update progress error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
