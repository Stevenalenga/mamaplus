import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { ROLES } from '@/lib/roles'

async function getAuthContext(request: NextRequest) {
  const currentUser = await getAuthenticatedUser(request)
  if (!currentUser) return { error: 'Unauthorized', status: 401 as const }
  return { currentUser }
}

/**
 * GET /api/users/[id]
 * Admin or self only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext(request)
    if ('error' in auth) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const isAdmin = auth.currentUser.role === ROLES.ADMIN
    if (!isAdmin && auth.currentUser.id !== id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            payments: true,
            reviews: true,
            certificates: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error: unknown) {
    console.error('Get user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

/**
 * PATCH /api/users/[id]
 * Admin or self only (self cannot change role)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext(request)
    if ('error' in auth) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const isAdmin = auth.currentUser.role === ROLES.ADMIN
    if (!isAdmin && auth.currentUser.id !== id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { name, phoneNumber, avatar } = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        phoneNumber,
        avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    })
  } catch (error: unknown) {
    console.error('Update user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[id]
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthContext(request)
    if ('error' in auth) {
      return NextResponse.json({ message: auth.error }, { status: auth.status })
    }

    if (auth.currentUser.role !== ROLES.ADMIN) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    if (id === auth.currentUser.id) {
      return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
