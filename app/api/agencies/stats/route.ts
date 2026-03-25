import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'

/**
 * GET /api/agencies/stats
 * Get agency statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    if (userRole !== ROLES.AGENCY) {
      return NextResponse.json(
        { success: false, message: 'Only agencies can access this endpoint' },
        { status: 403 }
      )
    }

    // Get all recruitment records for this agency
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
    const active = recruitments.filter((r: any) => r.status === 'ACTIVE').length
    const completed = recruitments.filter((r: any) => r.status === 'COMPLETED').length
    const inactive = recruitments.filter((r: any) => r.status === 'INACTIVE').length

    // Calculate average rating
    const rated = recruitments.filter((r: any) => r.rating !== null)
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / rated.length
        : 0

    return NextResponse.json({
      success: true,
      data: {
        totalCaregivers: total,
        activeCaregivers: active,
        completedPlacements: completed,
        inactiveCaregivers: inactive,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        ratedCount: rated.length,
      },
    })
  } catch (error: any) {
    console.error('Get agency stats error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
