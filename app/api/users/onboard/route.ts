import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'

const VALID_ONBOARD_ROLES = [ROLES.USER, ROLES.AGENCY, ROLES.INSTRUCTOR]
const VALID_GENDERS = ['MALE', 'FEMALE']

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * POST /api/users/onboard
 * Complete onboarding: set role and (for caregivers) gender.
 * Only callable by authenticated users whose current role is PENDING.
 * Supports NextAuth session (web) and Bearer JWT (mobile).
 */
export async function POST(request: NextRequest) {
  const currentUser = await getAuthenticatedUser(request)

  if (!currentUser) {
    return jsonWithCors(
      request,
      { success: false, message: 'Not authenticated' },
      { status: 401 },
    )
  }

  const userId = currentUser.id
  const currentRole = currentUser.role

  if (currentRole !== ROLES.PENDING) {
    return jsonWithCors(
      request,
      { success: false, message: 'Onboarding already completed' },
      { status: 400 },
    )
  }

  let body: { role?: string; gender?: string }
  try {
    body = await request.json()
  } catch {
    return jsonWithCors(
      request,
      { success: false, message: 'Invalid request body' },
      { status: 400 },
    )
  }

  const { role, gender } = body

  if (!role || !VALID_ONBOARD_ROLES.includes(role as any)) {
    return jsonWithCors(
      request,
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
      return jsonWithCors(
        request,
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
        phoneNumber: true,
        avatar: true,
        isVerified: true,
      },
    })

    // Keep auth-token cookie (web) and return a fresh JWT (mobile) after role change
    const token = await generateTokenEdge({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    })
    await setAuthCookie(token)

    return jsonWithCors(request, {
      success: true,
      data: {
        user: updatedUser,
        token,
      },
    })
  } catch (error) {
    console.error('Onboard error:', error)
    return jsonWithCors(
      request,
      { success: false, message: 'Failed to complete onboarding' },
      { status: 500 },
    )
  }
}
