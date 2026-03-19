import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { ROLES, type Role } from '@/lib/roles'

const VALID_ROLES = Object.values(ROLES)

/**
 * GET /api/admin/users?search=...&role=...&page=1&limit=20
 * Search / list users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const currentUser = session?.user as { id?: string; role?: string } | undefined
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const roleFilter = searchParams.get('role') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ]
    }

    if (roleFilter && VALID_ROLES.includes(roleFilter as Role)) {
      where.role = roleFilter
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error('Admin list users error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/admin/users
 * Update a user's role (admin only)
 * Body: { userId: string, role: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    const currentUser = session?.user as { id?: string; role?: string } | undefined
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, message: 'userId and role are required' },
        { status: 400 },
      )
    }

    if (!VALID_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 },
      )
    }

    // Prevent admin from changing their own role
    if (userId === currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot change your own role' },
        { status: 400 },
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: `Role updated to ${role}`,
    })
  } catch (error: any) {
    console.error('Admin update role error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 },
    )
  }
}
