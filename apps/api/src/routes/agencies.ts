import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { prisma } from '@mamaplus/database'
import { getUser, hasRole } from '../lib/auth'
import { ROLES } from '../lib/roles'

export const agenciesRouter = new Hono<AppEnv>()

/**
 * GET /api/agencies/stats
 * Agency recruitment statistics for the signed-in agency.
 */
agenciesRouter.get('/api/agencies/stats', async (c) => {
  try {
    const currentUser = getUser(c)

    if (!currentUser) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    if (!hasRole(currentUser, ROLES.AGENCY)) {
      return c.json(
        { success: false, message: 'Only agencies can access this endpoint' },
        403
      )
    }

    const userId = currentUser.userId

    const recruitments = await prisma.agencyCaregiver.findMany({
      where: { agencyId: userId },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const total = recruitments.length
    const active = recruitments.filter((r) => r.status === 'ACTIVE').length
    const completed = recruitments.filter((r) => r.status === 'COMPLETED').length
    const inactive = recruitments.filter((r) => r.status === 'INACTIVE').length

    const rated = recruitments.filter((r) => r.rating !== null)
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
        : 0

    return c.json({
      success: true,
      data: {
        totalCaregivers: total,
        activeCaregivers: active,
        completedPlacements: completed,
        inactiveCaregivers: inactive,
        avgRating: Math.round(avgRating * 10) / 10,
        ratedCount: rated.length,
      },
    })
  } catch (error: any) {
    console.error('Get agency stats error:', error)
    return c.json(
      { success: false, message: error.message || 'Failed to fetch statistics' },
      500
    )
  }
})

/**
 * GET /api/agencies/caregivers
 * Available caregivers, or this agency's recruited caregivers when ?recruited=true.
 */
agenciesRouter.get('/api/agencies/caregivers', async (c) => {
  try {
    const currentUser = getUser(c)

    if (!currentUser) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    if (!hasRole(currentUser, ROLES.AGENCY)) {
      return c.json(
        { success: false, message: 'Only agencies can access this endpoint' },
        403
      )
    }

    const userId = currentUser.userId
    const recruited = c.req.query('recruited') === 'true'

    if (recruited) {
      const recruitedCaregivers = await prisma.agencyCaregiver.findMany({
        where: { agencyId: userId },
        include: {
          caregiver: {
            select: {
              id: true,
              name: true,
              email: true,
              gender: true,
              phoneNumber: true,
              avatar: true,
              createdAt: true,
              _count: {
                select: {
                  enrollments: true,
                  certificates: true,
                },
              },
            },
          },
        },
        orderBy: { recruitedAt: 'desc' },
      })

      return c.json({
        success: true,
        data: recruitedCaregivers.map((rec) => ({
          id: rec.id,
          caregiverId: rec.caregiverId,
          status: rec.status,
          rating: rec.rating,
          reviewComment: rec.reviewComment,
          recruiterNotes: rec.recruiterNotes,
          recruitedAt: rec.recruitedAt,
          completedAt: rec.completedAt,
          caregiver: rec.caregiver,
        })),
      })
    }

    const recruitedIds = await prisma.agencyCaregiver.findMany({
      where: { agencyId: userId },
      select: { caregiverId: true },
    })

    const recruitedCaregiverIds = recruitedIds.map((r) => r.caregiverId)

    const availableCaregivers = await prisma.user.findMany({
      where: {
        role: ROLES.USER,
        id: {
          notIn: recruitedCaregiverIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        phoneNumber: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return c.json({
      success: true,
      data: availableCaregivers,
    })
  } catch (error: any) {
    console.error('Get caregivers error:', error)
    return c.json(
      { success: false, message: error.message || 'Failed to fetch caregivers' },
      500
    )
  }
})

/**
 * POST /api/agencies/caregivers
 * Recruit a caregiver.
 */
agenciesRouter.post('/api/agencies/caregivers', async (c) => {
  try {
    const currentUser = getUser(c)

    if (!currentUser) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    if (!hasRole(currentUser, ROLES.AGENCY)) {
      return c.json(
        { success: false, message: 'Only agencies can recruit caregivers' },
        403
      )
    }

    const userId = currentUser.userId
    const body = await c.req.json<any>()
    const { caregiverId, recruiterNotes } = body

    if (!caregiverId) {
      return c.json({ success: false, message: 'Caregiver ID is required' }, 400)
    }

    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
      select: { id: true, role: true },
    })

    if (!caregiver) {
      return c.json({ success: false, message: 'Caregiver not found' }, 404)
    }

    if (caregiver.role !== ROLES.USER) {
      return c.json({ success: false, message: 'User is not a caregiver' }, 400)
    }

    const existing = await prisma.agencyCaregiver.findUnique({
      where: {
        agencyId_caregiverId: {
          agencyId: userId,
          caregiverId: caregiverId,
        },
      },
    })

    if (existing) {
      return c.json({ success: false, message: 'Caregiver already recruited' }, 400)
    }

    const recruitment = await prisma.agencyCaregiver.create({
      data: {
        agencyId: userId,
        caregiverId: caregiverId,
        status: 'ACTIVE',
        recruiterNotes: recruiterNotes || null,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            phoneNumber: true,
            avatar: true,
          },
        },
      },
    })

    return c.json({
      success: true,
      message: 'Caregiver recruited successfully',
      data: recruitment,
    })
  } catch (error: any) {
    console.error('Recruit caregiver error:', error)
    return c.json(
      { success: false, message: error.message || 'Failed to recruit caregiver' },
      500
    )
  }
})

/**
 * GET /api/agencies/caregivers/search
 * Registered before /api/agencies/caregivers/:id.
 */
agenciesRouter.get('/api/agencies/caregivers/search', async (c) => {
  const currentUser = getUser(c)
  if (!currentUser || !hasRole(currentUser, ROLES.AGENCY)) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const query = c.req.query('query')

  if (!query) {
    return c.json({ success: false, message: 'Search query is required' }, 400)
  }

  try {
    const caregivers = await prisma.user.findMany({
      where: {
        role: ROLES.USER,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        agencyRecruitments: {
          none: {
            agencyId: currentUser.userId,
          },
        },
      } as any,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
      take: 10,
    })

    return c.json({ success: true, data: caregivers })
  } catch (error) {
    console.error('Failed to search for caregivers:', error)
    return c.json({ success: false, message: 'An internal error occurred' }, 500)
  }
})

/**
 * PATCH /api/agencies/caregivers/:id
 * Update recruitment status, rating, or notes.
 */
agenciesRouter.patch('/api/agencies/caregivers/:id', async (c) => {
  try {
    const currentUser = getUser(c)

    if (!currentUser) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    if (!hasRole(currentUser, ROLES.AGENCY)) {
      return c.json(
        { success: false, message: 'Only agencies can update caregiver records' },
        403
      )
    }

    const userId = currentUser.userId
    const recruitmentId = c.req.param('id')
    const body = await c.req.json<any>()
    const { status, rating, reviewComment, recruiterNotes } = body

    const recruitment = await prisma.agencyCaregiver.findUnique({
      where: { id: recruitmentId },
    })

    if (!recruitment) {
      return c.json({ success: false, message: 'Recruitment record not found' }, 404)
    }

    if (recruitment.agencyId !== userId) {
      return c.json(
        { success: false, message: 'You can only update your own recruitment records' },
        403
      )
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return c.json({ success: false, message: 'Rating must be between 1 and 5' }, 400)
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (rating !== undefined) updateData.rating = rating
    if (reviewComment !== undefined) updateData.reviewComment = reviewComment
    if (recruiterNotes !== undefined) updateData.recruiterNotes = recruiterNotes

    if (status === 'COMPLETED' || status === 'INACTIVE') {
      updateData.completedAt = new Date()
    }

    const updated = await prisma.agencyCaregiver.update({
      where: { id: recruitmentId },
      data: updateData,
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
            phoneNumber: true,
            avatar: true,
          },
        },
      },
    })

    return c.json({
      success: true,
      message: 'Recruitment record updated',
      data: updated,
    })
  } catch (error: any) {
    console.error('Update recruitment error:', error)
    return c.json(
      { success: false, message: error.message || 'Failed to update recruitment record' },
      500
    )
  }
})

/**
 * DELETE /api/agencies/caregivers/:id
 * Soft-remove a caregiver by setting status to INACTIVE.
 */
agenciesRouter.delete('/api/agencies/caregivers/:id', async (c) => {
  try {
    const currentUser = getUser(c)

    if (!currentUser) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    if (!hasRole(currentUser, ROLES.AGENCY)) {
      return c.json(
        { success: false, message: 'Only agencies can remove caregivers' },
        403
      )
    }

    const userId = currentUser.userId
    const recruitmentId = c.req.param('id')

    const recruitment = await prisma.agencyCaregiver.findUnique({
      where: { id: recruitmentId },
    })

    if (!recruitment) {
      return c.json({ success: false, message: 'Recruitment record not found' }, 404)
    }

    if (recruitment.agencyId !== userId) {
      return c.json(
        { success: false, message: 'You can only remove your own caregivers' },
        403
      )
    }

    await prisma.agencyCaregiver.update({
      where: { id: recruitmentId },
      data: {
        status: 'INACTIVE',
        completedAt: new Date(),
      },
    })

    return c.json({
      success: true,
      message: 'Caregiver removed from agency',
    })
  } catch (error: any) {
    console.error('Remove caregiver error:', error)
    return c.json(
      { success: false, message: error.message || 'Failed to remove caregiver' },
      500
    )
  }
})

/**
 * POST /api/agencies/sponsorships
 * Sponsor a caregiver's enrollment in a course.
 */
agenciesRouter.post('/api/agencies/sponsorships', async (c) => {
  const currentUser = getUser(c)
  if (!currentUser || !hasRole(currentUser, ROLES.AGENCY)) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const agencyId = currentUser.userId
  const body = await c.req.json<any>()
  const { caregiverId, courseId } = body

  if (!caregiverId || !courseId) {
    return c.json(
      { success: false, message: 'Caregiver ID and Course ID are required' },
      400
    )
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return c.json({ success: false, message: 'Course not found' }, 404)
    }

    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId, role: ROLES.USER },
    })

    if (!caregiver) {
      return c.json({ success: false, message: 'Caregiver not found' }, 404)
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: caregiverId,
        courseId: courseId,
      },
    })

    if (existingEnrollment) {
      return c.json(
        { success: false, message: 'Caregiver is already enrolled in this course' },
        409
      )
    }

    const paymentReference = `SPONSOR-${agencyId.slice(0, 8)}-${courseId.slice(0, 8)}-${Date.now()}`

    const payment = await prisma.payment.create({
      data: {
        userId: agencyId,
        courseId: courseId,
        reference: paymentReference,
        amount: course.priceKES,
        currency: 'KES',
        status: 'SUCCESS',
        paymentMethod: 'SPONSORED',
        channel: 'agency_sponsorship',
        paidAt: new Date(),
        metadata: JSON.stringify({
          sponsoredCaregiverId: caregiverId,
          sponsoredCaregiverEmail: caregiver.email,
          agencyName: undefined,
        }),
      },
    })

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: caregiverId,
        courseId: courseId,
        status: 'ACTIVE',
      },
    })

    return c.json({
      success: true,
      message: 'Sponsorship successful!',
      data: {
        paymentId: payment.id,
        enrollmentId: enrollment.id,
      },
    })
  } catch (error) {
    console.error('Sponsorship creation failed:', error)
    return c.json({ success: false, message: 'An internal error occurred' }, 500)
  }
})
