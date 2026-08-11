import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { role: ROLES.AGENCY }
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { phoneNumber: { contains: search } },
      ]
    }

    const [agencies, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              recruitedCaregivers: true,
            },
          },
          recruitedCaregivers: {
            take: 5,
            orderBy: { recruitedAt: 'desc' },
            select: {
              id: true,
              status: true,
              recruitedAt: true,
              caregiver: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    const placementStats = await prisma.agencyCaregiver.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        agencies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        placementStats: Object.fromEntries(
          placementStats.map((s) => [s.status, s._count.id]),
        ),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
