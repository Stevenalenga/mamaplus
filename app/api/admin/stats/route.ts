import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'

export const dynamic = 'force-dynamic'

function startOfDaysAgo(days: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d
}

async function getSchoolStats(): Promise<{ active: number; educators: number }> {
  const client = prisma as typeof prisma & {
    school?: { count: (args?: unknown) => Promise<number> }
    educator?: { count: (args?: unknown) => Promise<number> }
  }

  if (!client.school?.count || !client.educator?.count) {
    return { active: 0, educators: 0 }
  }

  try {
    const [active, educators] = await Promise.all([
      client.school.count({ where: { isActive: true } }),
      client.educator.count({ where: { isActive: true } }),
    ])
    return { active, educators }
  } catch {
    return { active: 0, educators: 0 }
  }
}

/**
 * GET /api/admin/stats
 * Platform-wide analytics for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getAuthenticatedUser(request)
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const weekAgo = startOfDaysAgo(7)
    const monthAgo = startOfDaysAgo(30)
    const thirtyDaysAgo = startOfDaysAgo(30)

    const [
      totalUsers,
      usersByRole,
      newUsersThisWeek,
      newUsersThisMonth,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      avgProgressResult,
      publishedCourses,
      draftCourses,
      topCourses,
      revenueByCurrency,
      revenueByMethod,
      revenueDaily,
      recentUsers,
      recentEnrollments,
      recentPayments,
      schoolStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.enrollment.aggregate({ _avg: { progress: true } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isPublished: false } }),
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5,
      }),
      prisma.payment.groupBy({
        by: ['currency'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          paidAt: { gte: thirtyDaysAgo },
        },
        select: { amount: true, currency: true, paidAt: true },
        orderBy: { paidAt: 'asc' },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.enrollment.findMany({
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: {
          id: true,
          amount: true,
          currency: true,
          paidAt: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: 5,
      }),
      getSchoolStats(),
    ])

    const roleCounts = Object.fromEntries(
      usersByRole.map((r) => [r.role, r._count?.id ?? 0]),
    )

    const revenueTotals = revenueByCurrency.map((r) => ({
      currency: r.currency,
      total: r._sum?.amount ?? 0,
      count: r._count?.id ?? 0,
    }))

    const revenueByPaymentMethod = revenueByMethod.map((r) => ({
      method: r.paymentMethod,
      total: r._sum?.amount ?? 0,
      count: r._count?.id ?? 0,
    }))

    const dailyRevenueMap = new Map<string, number>()
    for (const p of revenueDaily) {
      if (!p.paidAt) continue
      const key = p.paidAt.toISOString().slice(0, 10)
      dailyRevenueMap.set(key, (dailyRevenueMap.get(key) ?? 0) + p.amount)
    }
    const revenueOverTime = Array.from(dailyRevenueMap.entries()).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100,
    }))

    type ActivityItem = {
      id: string
      type: 'user_registered' | 'enrollment' | 'payment'
      title: string
      description: string
      createdAt: string
    }

    const recentActivity: ActivityItem[] = [
      ...recentUsers.map((u) => ({
        id: `user-${u.id}`,
        type: 'user_registered' as const,
        title: 'New user registered',
        description: u.name || u.email || 'Unknown user',
        createdAt: u.createdAt.toISOString(),
      })),
      ...recentEnrollments.map((e) => ({
        id: `enrollment-${e.id}`,
        type: 'enrollment' as const,
        title: 'New enrollment',
        description: `${e.user.name || e.user.email || 'User'} enrolled in ${e.course.title}`,
        createdAt: e.createdAt.toISOString(),
      })),
      ...recentPayments.map((p) => ({
        id: `payment-${p.id}`,
        type: 'payment' as const,
        title: 'Payment received',
        description: `${p.currency} ${p.amount.toLocaleString()} from ${p.user.name || p.user.email || 'User'}`,
        createdAt: (p.paidAt ?? p.createdAt).toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: roleCounts,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollments,
          avgProgress: Math.round(avgProgressResult._avg.progress ?? 0),
        },
        courses: {
          published: publishedCourses,
          draft: draftCourses,
          topByEnrollment: topCourses.map((c) => ({
            id: c.id,
            title: c.title,
            enrollments: c._count?.enrollments ?? 0,
          })),
        },
        revenue: {
          byCurrency: revenueTotals,
          byPaymentMethod: revenueByPaymentMethod,
          overTime: revenueOverTime,
        },
        schools: {
          active: schoolStats.active,
          educators: schoolStats.educators,
        },
        recentActivity,
      },
    })
  } catch (error: unknown) {
    console.error('Admin stats error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
