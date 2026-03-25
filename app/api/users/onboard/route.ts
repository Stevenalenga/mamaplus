import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'

const VALID_ONBOARD_ROLES = [ROLES.USER, ROLES.AGENCY, ROLES.INSTRUCTOR]
const VALID_GENDERS = ['MALE', 'FEMALE']

/**
 * POST /api/users/onboard
 * Complete onboarding: set role and (for caregivers) gender.
 * Only callable by authenticated users whose current role is PENDING.
 */
export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  const userId = session.user.id
  const currentRole = (session.user as any).role

  if (currentRole !== ROLES.PENDING) {
    return NextResponse.json(
      { success: false, message: 'Onboarding already completed' },
      { status: 400 },
    )
  }

  let body: { role?: string; gender?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
  }

  const { role, gender } = body

  if (!role || !VALID_ONBOARD_ROLES.includes(role as any)) {
    return NextResponse.json(
      {
        success: false,
        message: `Role must be one of: ${VALID_ONBOARD_ROLES.join(', ')}`,
      },
      { status: 400 },
    )
  }

  // Gender is required only for caregivers (USER role)
  if (role === ROLES.USER) {
    if (!gender || !VALID_GENDERS.includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Gender (MALE or FEMALE) is required for caregivers' },
        { status: 400 },
      )
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        gender: role === ROLES.USER ? gender : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gender: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Onboard error:', error)
    return NextResponse.json({ success: false, message: 'Failed to complete onboarding' }, { status: 500 })
  }
}
