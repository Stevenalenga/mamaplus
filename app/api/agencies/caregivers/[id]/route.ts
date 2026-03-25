import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'

/**
 * PATCH /api/agencies/caregivers/[id]
 * Update recruitment status, rating, or notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    if (userRole !== ROLES.AGENCY) {
      return NextResponse.json(
        { success: false, message: 'Only agencies can update caregiver records' },
        { status: 403 }
      )
    }

    const recruitmentId = params.id
    const body = await request.json()
    const { status, rating, reviewComment, recruiterNotes } = body

    // Verify this recruitment belongs to this agency
    const recruitment = await prisma.agencyCaregiver.findUnique({
      where: { id: recruitmentId },
    })

    if (!recruitment) {
      return NextResponse.json(
        { success: false, message: 'Recruitment record not found' },
        { status: 404 }
      )
    }

    if (recruitment.agencyId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only update your own recruitment records' },
        { status: 403 }
      )
    }

    // Validate rating
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (rating !== undefined) updateData.rating = rating
    if (reviewComment !== undefined) updateData.reviewComment = reviewComment
    if (recruiterNotes !== undefined) updateData.recruiterNotes = recruiterNotes
    
    // Set completedAt if status changes to COMPLETED or INACTIVE
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

    return NextResponse.json({
      success: true,
      message: 'Recruitment record updated',
      data: updated,
    })
  } catch (error: any) {
    console.error('Update recruitment error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update recruitment record' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agencies/caregivers/[id]
 * Remove a caregiver from agency (soft delete by setting status to INACTIVE)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any).role

    if (userRole !== ROLES.AGENCY) {
      return NextResponse.json(
        { success: false, message: 'Only agencies can remove caregivers' },
        { status: 403 }
      )
    }

    const recruitmentId = params.id

    const recruitment = await prisma.agencyCaregiver.findUnique({
      where: { id: recruitmentId },
    })

    if (!recruitment) {
      return NextResponse.json(
        { success: false, message: 'Recruitment record not found' },
        { status: 404 }
      )
    }

    if (recruitment.agencyId !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only remove your own caregivers' },
        { status: 403 }
      )
    }

    // Soft delete by setting status to INACTIVE
    await prisma.agencyCaregiver.update({
      where: { id: recruitmentId },
      data: {
        status: 'INACTIVE',
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Caregiver removed from agency',
    })
  } catch (error: any) {
    console.error('Remove caregiver error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove caregiver' },
      { status: 500 }
    )
  }
}
