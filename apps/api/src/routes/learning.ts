import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { prisma } from '@mamaplus/database'
import { getUserEnrolledCourses, calculateCourseProgress } from '../lib/db-utils'
import { getUser, hasRole } from '../lib/auth'
import { ROLES } from '../lib/roles'

export const learningRouter = new Hono<AppEnv>()

/**
 * GET /api/enrollments
 * Get user enrollments
 */
learningRouter.get('/api/enrollments', async (c) => {
  try {
    const currentUser = await getUser(c)
    if (!currentUser) {
      return c.json(
        { success: false, message: 'Not authenticated' },
        401
      )
    }

    const requestedUserId = c.req.query('userId')
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId

    if (!userId) {
      return c.json(
        { success: false, message: 'User ID is required' },
        400
      )
    }

    const enrollments = await getUserEnrolledCourses(userId)

    return c.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    })
  } catch (error: any) {
    console.error('Get enrollments error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/enrollments
 * Create enrollment (usually after payment)
 */
learningRouter.post('/api/enrollments', async (c) => {
  try {
    const currentUser = await getUser(c)
    if (!currentUser) {
      return c.json(
        { success: false, message: 'Not authenticated' },
        401
      )
    }

    const { userId: requestedUserId, courseId } = await c.req.json()
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId

    if (!userId || !courseId) {
      return c.json(
        { success: false, message: 'User ID and Course ID are required' },
        400
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
      return c.json(
        { success: false, message: 'Already enrolled in this course' },
        409
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

    return c.json({
      success: true,
      data: enrollment,
      message: 'Enrollment created successfully'
    }, 201)
  } catch (error: any) {
    console.error('Create enrollment error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * GET /api/progress
 * Get user's progress for a course or lesson
 */
learningRouter.get('/api/progress', async (c) => {
  try {
    const currentUser = await getUser(c)
    if (!currentUser) {
      return c.json(
        { success: false, message: 'Not authenticated' },
        401
      )
    }

    const requestedUserId = c.req.query('userId')
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId
    const courseId = c.req.query('courseId')
    const lessonId = c.req.query('lessonId')

    if (!userId) {
      return c.json(
        { success: false, message: 'User ID is required' },
        400
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

      return c.json({
        success: true,
        data: progress
      })
    }

    // Get progress for entire course
    if (courseId) {
      const courseProgress = await calculateCourseProgress(userId, courseId)

      return c.json({
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

    return c.json({
      success: true,
      data: allProgress,
      count: allProgress.length
    })
  } catch (error: any) {
    console.error('Get progress error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/progress
 * Update lesson progress
 */
learningRouter.post('/api/progress', async (c) => {
  try {
    const currentUser = await getUser(c)
    if (!currentUser) {
      return c.json(
        { success: false, message: 'Not authenticated' },
        401
      )
    }

    const { userId: requestedUserId, lessonId, isCompleted, watchedDuration } = await c.req.json()
    const isAdmin = hasRole(currentUser, ROLES.ADMIN)
    const userId = requestedUserId && isAdmin ? requestedUserId : currentUser.userId

    if (!userId || !lessonId) {
      return c.json(
        { success: false, message: 'User ID and Lesson ID are required' },
        400
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

    return c.json({
      success: true,
      data: progress,
      message: 'Progress updated'
    })
  } catch (error: any) {
    console.error('Update progress error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})
