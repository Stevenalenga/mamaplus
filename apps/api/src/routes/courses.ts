import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { getUser, hasRole } from '../lib/auth'
import { requireAdminForCourseWrite } from '../lib/course-access'
import { prisma } from '@mamaplus/database'
import { getCourseRating, searchCourses } from '../lib/db-utils'
import { ROLES } from '../lib/roles'
import {
  decodeLessonResourceMeta,
  decodeModuleDescription,
  encodeLessonResourceMeta,
  encodeModuleDescription,
} from '../lib/course-authoring'

export const coursesRouter = new Hono<AppEnv>()

function createSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * GET /api/courses
 * Get all published courses or search courses
 */
coursesRouter.get('/api/courses', async (c) => {
  try {
    const query = c.req.query('q')
    const category = c.req.query('category')
    const level = c.req.query('level')
    const featured = c.req.query('featured')
    const mine = c.req.query('mine') === 'true'

    if (mine) {
      const currentUser = await getUser(c)
      if (!currentUser) {
        return c.json(
          { success: false, message: 'Not authenticated' },
          401
        )
      }

      if (!hasRole(currentUser, ROLES.ADMIN)) {
        return c.json(
          { success: false, message: 'Forbidden' },
          403
        )
      }

      const ownedCourses = await prisma.course.findMany({
        where: {
          ...(category && { category }),
          ...(level && { level: level as any }),
        },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: {
                  order: 'asc'
                }
              }
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      return c.json({
        success: true,
        data: ownedCourses,
        count: ownedCourses.length
      })
    }

    // Search if query provided
    if (query) {
      const courses = await searchCourses(query, {
        category: category || undefined,
        level: level || undefined
      })

      return c.json({
        success: true,
        data: courses,
        count: courses.length
      })
    }

    // Otherwise, get all courses with filters
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
        ...(level && { level: level as any }),
        ...(featured === 'true' && { isFeatured: true })
      },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true,
                order: true,
                isFree: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return c.json({
      success: true,
      data: courses,
      count: courses.length
    })
  } catch (error: any) {
    console.error('Get courses error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/courses
 * Create a new course (Admin only)
 */
coursesRouter.post('/api/courses', async (c) => {
  try {
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const data = await c.req.json()

    if (!data.title?.trim() || !data.description?.trim()) {
      return c.json(
        { success: false, message: 'title and description are required' },
        400
      )
    }

    const baseSlug = data.slug?.trim() || createSlug(data.title)
    let slug = baseSlug
    let suffix = 1

    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        thumbnail: data.thumbnail,
        level: data.level || 'BEGINNER',
        category: data.category || 'Professional Training',
        duration: data.duration || 0,
        durationLabel: data.durationLabel,
        scheduleDates: data.scheduleDates,
        location: data.location,
        priceUSD: data.priceUSD ?? 0,
        priceKES: data.priceKES ?? 0,
        currency: data.currency || 'USD',
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        requirements: data.requirements,
        whatYouLearn: data.whatYouLearn,
        keyBenefits: data.keyBenefits,
        specialOffer: data.specialOffer,
        instructorId: data.instructorId || null,
        videoUrl: data.videoUrl,
        previewUrl: data.previewUrl
      }
    })

    const moduleCount = await prisma.module.count({ where: { courseId: course.id } })
    if (moduleCount === 0) {
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: 'Course Overview',
          description: encodeModuleDescription('', false),
          order: 1,
        },
      })
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: 'Introduction',
          description: 'Course introduction',
          content: 'file',
          duration: 0,
          order: 1,
          isFree: true,
        },
      })
    }

    return c.json({
      success: true,
      data: course,
      message: 'Course created successfully'
    }, 201)
  } catch (error: any) {
    console.error('Create course error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/courses/:id/publish
 */
coursesRouter.post('/api/courses/:id/publish', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: true }
        }
      }
    })

    if (!course) {
      return c.json({ success: false, message: 'Course not found' }, 404)
    }

    const hasAtLeastOneModule = course.modules.length > 0
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0)

    if (!course.title?.trim() || !course.description?.trim() || !hasAtLeastOneModule || totalLessons === 0) {
      return c.json(
        {
          success: false,
          message: 'Course needs title, description, at least one section and one lesson before publish',
        },
        400
      )
    }

    const published = await prisma.course.update({
      where: { id },
      data: { isPublished: true }
    })

    return c.json({ success: true, data: published, message: 'Course published successfully' })
  } catch (error: any) {
    console.error('Publish course error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * POST /api/courses/:id/unpublish
 */
coursesRouter.post('/api/courses/:id/unpublish', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!course) {
      return c.json({ success: false, message: 'Course not found' }, 404)
    }

    const unpublished = await prisma.course.update({
      where: { id },
      data: { isPublished: false }
    })

    return c.json({ success: true, data: unpublished, message: 'Course unpublished successfully' })
  } catch (error: any) {
    console.error('Unpublish course error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * POST /api/courses/:id/modules
 */
coursesRouter.post('/api/courses/:id/modules', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!course) {
      return c.json({ success: false, message: 'Course not found' }, 404)
    }

    const { title, description, isMilestone } = await c.req.json()
    if (!title?.trim()) {
      return c.json({ success: false, message: 'title is required' }, 400)
    }

    const existingCount = await prisma.module.count({
      where: { courseId: id }
    })

    const module = await prisma.module.create({
      data: {
        courseId: id,
        title: title.trim(),
        description: encodeModuleDescription(description, isMilestone),
        order: existingCount + 1,
      }
    })

    return c.json({ success: true, data: module, message: 'Section created successfully' }, 201)
  } catch (error: any) {
    console.error('Create module error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * PATCH /api/courses/:id/modules/:moduleId
 * DELETE /api/courses/:id/modules/:moduleId
 */
coursesRouter.patch('/api/courses/:id/modules/:moduleId', async (c) => {
  try {
    const id = c.req.param('id')
    const moduleId = c.req.param('moduleId')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const data = await c.req.json()
    const existingModule = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!existingModule || existingModule.courseId !== id) {
      return c.json({ success: false, message: 'Section not found' }, 404)
    }

    const existingMeta = decodeModuleDescription(existingModule.description)

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.order !== undefined && { order: data.order }),
        description: encodeModuleDescription(
          data.description !== undefined ? data.description : existingMeta.description,
          data.isMilestone !== undefined ? data.isMilestone : existingMeta.isMilestone,
        ),
      }
    })

    return c.json({ success: true, data: module, message: 'Section updated successfully' })
  } catch (error: any) {
    console.error('Update module error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

coursesRouter.delete('/api/courses/:id/modules/:moduleId', async (c) => {
  try {
    const id = c.req.param('id')
    const moduleId = c.req.param('moduleId')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const existingModule = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!existingModule || existingModule.courseId !== id) {
      return c.json({ success: false, message: 'Section not found' }, 404)
    }

    await prisma.module.delete({ where: { id: moduleId } })

    return c.json({ success: true, message: 'Section deleted successfully' })
  } catch (error: any) {
    console.error('Delete module error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * POST /api/courses/:id/modules/:moduleId/lessons
 */
coursesRouter.post('/api/courses/:id/modules/:moduleId/lessons', async (c) => {
  try {
    const id = c.req.param('id')
    const moduleId = c.req.param('moduleId')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const module = await prisma.module.findUnique({ where: { id: moduleId } })
    if (!module || module.courseId !== id) {
      return c.json({ success: false, message: 'Section not found' }, 404)
    }

    const { title, description, type, url, isMilestone, duration } = await c.req.json()
    if (!title?.trim()) {
      return c.json({ success: false, message: 'title is required' }, 400)
    }

    const existingCount = await prisma.lesson.count({
      where: { moduleId }
    })

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: title.trim(),
        description: description || null,
        content: type || null,
        videoUrl: type === 'video' ? (url || null) : null,
        duration: duration || 0,
        order: existingCount + 1,
        isFree: false,
        resourceUrls: encodeLessonResourceMeta(url, isMilestone),
      }
    })

    return c.json({ success: true, data: lesson, message: 'Lesson created successfully' }, 201)
  } catch (error: any) {
    console.error('Create lesson error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * PATCH /api/courses/:id/modules/:moduleId/lessons/:lessonId
 * DELETE /api/courses/:id/modules/:moduleId/lessons/:lessonId
 */
coursesRouter.patch('/api/courses/:id/modules/:moduleId/lessons/:lessonId', async (c) => {
  try {
    const moduleId = c.req.param('moduleId')
    const lessonId = c.req.param('lessonId')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const existingLesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!existingLesson || existingLesson.moduleId !== moduleId) {
      return c.json({ success: false, message: 'Lesson not found' }, 404)
    }

    const data = await c.req.json()
    const existingMeta = decodeLessonResourceMeta(existingLesson.resourceUrls)

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { content: data.type }),
        ...(data.type === 'video' && data.url !== undefined && { videoUrl: data.url }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.order !== undefined && { order: data.order }),
        resourceUrls: encodeLessonResourceMeta(
          data.url !== undefined ? data.url : existingMeta.url,
          data.isMilestone !== undefined ? data.isMilestone : existingMeta.isMilestone,
        ),
      }
    })

    return c.json({ success: true, data: updatedLesson, message: 'Lesson updated successfully' })
  } catch (error: any) {
    console.error('Update lesson error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

coursesRouter.delete('/api/courses/:id/modules/:moduleId/lessons/:lessonId', async (c) => {
  try {
    const moduleId = c.req.param('moduleId')
    const lessonId = c.req.param('lessonId')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const existingLesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!existingLesson || existingLesson.moduleId !== moduleId) {
      return c.json({ success: false, message: 'Lesson not found' }, 404)
    }

    await prisma.lesson.delete({ where: { id: lessonId } })

    return c.json({ success: true, message: 'Lesson deleted successfully' })
  } catch (error: any) {
    console.error('Delete lesson error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * GET /api/courses/:id
 * Get course by ID or slug
 */
coursesRouter.get('/api/courses/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)

    // Try to find by ID first, then by slug
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
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
      return c.json(
        { message: 'Course not found' },
        404
      )
    }

    const canViewUnpublished = !!currentUser && (
      hasRole(currentUser, ROLES.ADMIN) ||
      (hasRole(currentUser, ROLES.INSTRUCTOR) && course.instructorId === currentUser.userId)
    )

    if (!course.isPublished && !canViewUnpublished) {
      return c.json(
        { message: 'Course not found' },
        404
      )
    }

    // Get average rating
    const rating = await getCourseRating(course.id)

    return c.json({
      success: true,
      data: {
        ...course,
        rating
      }
    })
  } catch (error: any) {
    console.error('Get course error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * PATCH /api/courses/:id
 * Update course (Admin only)
 */
coursesRouter.patch('/api/courses/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existingCourse) {
      return c.json(
        { success: false, message: 'Course not found' },
        404
      )
    }

    const data = await c.req.json()

    const course = await prisma.course.update({
      where: { id },
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
        ...(data.keyBenefits !== undefined && { keyBenefits: data.keyBenefits }),
        ...(data.specialOffer !== undefined && { specialOffer: data.specialOffer }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl })
      }
    })

    return c.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    })
  } catch (error: any) {
    console.error('Update course error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * DELETE /api/courses/:id
 * Delete course (Admin only)
 */
coursesRouter.delete('/api/courses/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const currentUser = await getUser(c)
    const denied = requireAdminForCourseWrite(currentUser)
    if (denied) return c.json(denied.body, denied.status)

    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existingCourse) {
      return c.json(
        { success: false, message: 'Course not found' },
        404
      )
    }

    await prisma.course.delete({
      where: { id }
    })

    return c.json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete course error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})
