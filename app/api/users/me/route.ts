import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/db-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/users/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gender: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            payments: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })

  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/users/me
 * Update the authenticated user's name, email, and/or password.
 *
 * Body (all fields optional):
 *   name            – display name
 *   email           – new email address (must be unique)
 *   currentPassword – required when changing password
 *   newPassword     – new password (min 8 characters)
 */
export async function PATCH(request: NextRequest) {
  const currentUser = await getAuthenticatedUser(request)
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const userId = currentUser.id

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, currentPassword, newPassword } = body as {
    name?: string
    email?: string
    currentPassword?: string
    newPassword?: string
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  if (name !== undefined) {
    const trimmed = String(name).trim()
    if (trimmed.length === 0) {
      return NextResponse.json({ success: false, message: 'Name cannot be empty' }, { status: 400 })
    }
    updateData.name = trimmed
  }

  if (email !== undefined) {
    const trimmedEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 })
    }
    if (trimmedEmail !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Email address is already in use' },
          { status: 409 },
        )
      }
      updateData.email = trimmedEmail
    }
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is required to set a new password' },
        { status: 400 },
      )
    }
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Password changes are not supported for social login accounts' },
        { status: 400 },
      )
    }
    const isCorrect = await verifyPassword(String(currentPassword), user.password)
    if (!isCorrect) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }
    const newPwd = String(newPassword)
    if (newPwd.length < 8) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 8 characters' },
        { status: 400 },
      )
    }
    updateData.password = await hashPassword(newPwd)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ success: false, message: 'No changes provided' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, avatar: true, updatedAt: true },
  })

  return NextResponse.json({
    success: true,
    data: updated,
    message: 'Profile updated successfully',
  })
}
