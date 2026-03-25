import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'

/**
 * GET /api/agencies/caregivers
 * Get all available caregivers or agency's recruited caregivers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    // Only agencies can access this endpoint
    if (userRole !== ROLES.AGENCY) {
      return NextResponse.json(
        { success: false, message: 'Only agencies can access this endpoint' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const recruited = url.searchParams.get('recruited') === 'true'

    if (recruited) {
      // Get caregivers recruited by this agency
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

      return NextResponse.json({
        success: true,
        data: recruitedCaregivers.map((rec: any) => ({
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
    } else {
      // Get all available caregivers (not yet recruited by this agency)
      const recruitedIds = await prisma.agencyCaregiver.findMany({
        where: { agencyId: userId },
        select: { caregiverId: true },
      })

      const recruitedCaregiverIds = recruitedIds.map((r: any) => r.caregiverId)

      const availableCaregivers = await prisma.user.findMany({
        where: {
          role: ROLES.USER, // Caregivers have USER role
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

      return NextResponse.json({
        success: true,
        data: availableCaregivers,
      })
    }
  } catch (error: any) {
    console.error('Get caregivers error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch caregivers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agencies/caregivers
 * Recruit a caregiver
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    if (userRole !== ROLES.AGENCY) {
      return NextResponse.json(
        { success: false, message: 'Only agencies can recruit caregivers' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { caregiverId, recruiterNotes } = body

    if (!caregiverId) {
      return NextResponse.json(
        { success: false, message: 'Caregiver ID is required' },
        { status: 400 }
      )
    }

    // Verify the caregiver exists and is actually a caregiver
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
      select: { id: true, role: true },
    })

    if (!caregiver) {
      return NextResponse.json(
        { success: false, message: 'Caregiver not found' },
        { status: 404 }
      )
    }

    if (caregiver.role !== ROLES.USER) {
      return NextResponse.json(
        { success: false, message: 'User is not a caregiver' },
        { status: 400 }
      )
    }

    // Check if already recruited
    const existing = await prisma.agencyCaregiver.findUnique({
      where: {
        agencyId_caregiverId: {
          agencyId: userId,
          caregiverId: caregiverId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Caregiver already recruited' },
        { status: 400 }
      )
    }

    // Create recruitment record
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

    return NextResponse.json({
      success: true,
      message: 'Caregiver recruited successfully',
      data: recruitment,
    })
  } catch (error: any) {
    console.error('Recruit caregiver error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to recruit caregiver' },
      { status: 500 }
    )
  }
}
