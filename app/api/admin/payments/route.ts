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
    const status = searchParams.get('status') || ''
    const currency = searchParams.get('currency') || ''
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (currency && currency !== 'all') where.currency = currency
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
      ]
    }

    const [payments, total, summary] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
      prisma.payment.groupBy({
        by: ['currency', 'status'],
        _sum: { amount: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        summary: summary.map((s) => ({
          currency: s.currency,
          status: s.status,
          total: s._sum.amount ?? 0,
          count: s._count.id,
        })),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
