import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateCourseProgress } from '@/lib/db-utils'

/**
 * GET /api/progress
 * Get user's progress for a course or lesson
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')
    const lessonId = searchParams.get('lessonId')

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
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
    const { userId, lessonId, isCompleted, watchedDuration } = await request.json()

    if (!userId || !lessonId) {
      return NextResponse.json(
        { message: 'User ID and Lesson ID are required' },
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
