import { Hono, type Context } from 'hono'
import type { AppEnv } from '../types'
import { prisma } from '@mamaplus/database'
import { getUser, hasRole } from '../lib/auth'
import { hashPassword } from '../lib/db-utils'
import { ROLES, type Role } from '../lib/roles'
import { addBlogPost, deleteBlogPost, getBlogPosts, updateBlogPost } from '../lib/blog'
import { uploadToStorage } from '../lib/storage'
import { isExpoPushToken, sendExpoPushMessages } from '../lib/push-notifications'

export const adminRouter = new Hono<AppEnv>()

const VALID_ROLES = Object.values(ROLES)

async function requireAdmin(c: Context<AppEnv>) {
  const user = await getUser(c)
  if (!user || !hasRole(user, ROLES.ADMIN)) return null
  return user
}

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

function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

/** Prefer a site-relative /api/files/... path so images keep working across hosts. */
function toPublicImageUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  try {
    if (trimmed.startsWith('/')) return trimmed
    const parsed = new URL(trimmed)
    if (parsed.pathname.startsWith('/api/files/')) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // keep original
  }
  return trimmed
}

async function resolveImageField(
  body: any
): Promise<{ ok: true; image: string | undefined } | { ok: false; error: string }> {
  if (typeof body.imageData === 'string' && body.imageData.startsWith('data:')) {
    const result = await uploadToStorage(body.imageData, 'image', {
      folder: 'mamaplus/blog',
    })
    if (!result.success || !result.url) {
      return { ok: false, error: result.error || 'Failed to upload cover image' }
    }
    return { ok: true, image: toPublicImageUrl(result.url) }
  }

  if (typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    return { ok: true, image: toPublicImageUrl(body.imageUrl) }
  }

  if (typeof body.image === 'string' && body.image.trim()) {
    return { ok: true, image: toPublicImageUrl(body.image) }
  }

  if (body.clearImage === true) {
    return { ok: true, image: '' }
  }

  return { ok: true, image: undefined }
}

function validatePostBody(body: any) {
  return {
    title: typeof body.title === 'string' ? body.title.trim() : '',
    description: typeof body.description === 'string' ? body.description.trim() : '',
    content: typeof body.content === 'string' ? body.content.trim() : '',
    author: typeof body.author === 'string' ? body.author.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : '',
    readTime: typeof body.readTime === 'string' ? body.readTime.trim() : '',
    tags: parseTags(body.tags),
    isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
  }
}

async function requireBlogAdmin(c: Context<AppEnv>) {
  const user = await getUser(c)
  if (!user || !hasRole(user, [ROLES.ADMIN, ROLES.ADMIN_ASSISTANT])) {
    return null
  }
  return user
}

async function allocateCertificateIdentity(): Promise<{ serial: number; certificateNumber: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await prisma.certificate.aggregate({ _max: { serial: true } })
    const serial = (last._max.serial ?? 0) + 1
    const certificateNumber = `MP-${new Date().getFullYear()}-${String(serial).padStart(6, '0')}`
    const clash = await prisma.certificate.findFirst({
      where: { OR: [{ serial }, { certificateNumber }] },
    })
    if (!clash) return { serial, certificateNumber }
  }
  throw new Error('Could not allocate a certificate number')
}

/**
 * GET /api/admin/stats
 */
adminRouter.get('/api/admin/stats', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
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

    const roleCounts = Object.fromEntries(usersByRole.map((r) => [r.role, r._count?.id ?? 0]))

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

    return c.json({
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
          topByEnrollment: topCourses.map((course) => ({
            id: course.id,
            title: course.title,
            enrollments: course._count?.enrollments ?? 0,
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
    return c.json({ success: false, message }, 500)
  }
})

async function attachSessionStatus<T extends { id: string }>(users: T[], now: Date) {
  const ids = users.map((user) => user.id)
  if (ids.length === 0) {
    return users.map((user) => ({ ...user, lastLoginAt: null as Date | null, liveSessionCount: 0 }))
  }

  const [lastLogins, live] = await Promise.all([
    prisma.session.groupBy({
      by: ['userId'],
      where: { userId: { in: ids } },
      _max: { createdAt: true },
    }),
    prisma.session.groupBy({
      by: ['userId'],
      where: { userId: { in: ids }, revokedAt: null, expiresAt: { gt: now } },
      _count: { _all: true },
    }),
  ])

  const lastByUser = new Map(lastLogins.map((row) => [row.userId, row._max.createdAt]))
  const liveByUser = new Map(live.map((row) => [row.userId, row._count._all]))

  return users.map((user) => ({
    ...user,
    lastLoginAt: lastByUser.get(user.id) ?? null,
    liveSessionCount: liveByUser.get(user.id) ?? 0,
  }))
}

async function revokeUserSessions(userId: string) {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return result.count
}

/**
 * GET /api/admin/users
 */
adminRouter.get('/api/admin/users', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const search = c.req.query('search')?.trim() || ''
    const roleFilter = c.req.query('role') || ''
    const isVerified = c.req.query('isVerified')
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { phoneNumber: { contains: search } },
      ]
    }

    if (roleFilter && VALID_ROLES.includes(roleFilter as Role)) {
      where.role = roleFilter
    }

    if (isVerified === 'true') where.isVerified = true
    if (isVerified === 'false') where.isVerified = false

    const liveOnly = c.req.query('live') === 'true'
    const blocked = c.req.query('loginBlocked')
    const now = new Date()
    if (liveOnly) {
      where.sessions = { some: { revokedAt: null, expiresAt: { gt: now } } }
    }
    if (blocked === 'true') where.loginBlocked = true
    if (blocked === 'false') where.loginBlocked = false

    const [users, total, liveUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phoneNumber: true,
          isVerified: true,
          loginBlocked: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.user.count({
        where: { sessions: { some: { revokedAt: null, expiresAt: { gt: now } } } },
      }),
    ])

    const withSessions = await attachSessionStatus(users, now)

    return c.json({
      success: true,
      data: {
        users: withSessions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        liveUsers,
      },
    })
  } catch (error: any) {
    console.error('Admin list users error:', error)
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * PATCH /api/admin/users
 * Body: { userId, role }
 */
adminRouter.patch('/api/admin/users', async (c) => {
  try {
    const currentUser = await requireAdmin(c)
    if (!currentUser) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { userId, role } = await c.req.json<any>()

    if (!userId || !role) {
      return c.json({ success: false, message: 'userId and role are required' }, 400)
    }

    if (!VALID_ROLES.includes(role as Role)) {
      return c.json(
        { success: false, message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        400
      )
    }

    if (userId === currentUser.userId) {
      return c.json({ success: false, message: 'You cannot change your own role' }, 400)
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

    return c.json({
      success: true,
      data: user,
      message: `Role updated to ${role}`,
    })
  } catch (error: any) {
    console.error('Admin update role error:', error)
    if (error.code === 'P2025') {
      return c.json({ success: false, message: 'User not found' }, 404)
    }
    return c.json({ success: false, message: error.message || 'Internal server error' }, 500)
  }
})

adminRouter.post('/api/admin/users/:id/sessions/revoke', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ success: false, message: 'Unauthorized' }, 403)

    const id = c.req.param('id')
    if (id === admin.userId) {
      return c.json({ success: false, message: 'You cannot end your own session from here' }, 400)
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return c.json({ success: false, message: 'User not found' }, 404)

    const revoked = await revokeUserSessions(id)
    return c.json({
      success: true,
      data: { revoked },
      message: revoked > 0 ? 'Signed-in sessions ended' : 'This user has no active session',
    })
  } catch (error: unknown) {
    console.error('Admin revoke sessions error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

adminRouter.post('/api/admin/users/:id/password', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ success: false, message: 'Unauthorized' }, 403)

    const id = c.req.param('id')
    if (id === admin.userId) {
      return c.json({ success: false, message: 'You cannot reset your own password from here' }, 400)
    }

    const body = await c.req.json<any>().catch(() => ({}))
    const password = typeof body.password === 'string' ? body.password : ''
    if (password.length < 8) {
      return c.json({ success: false, message: 'Password must be at least 8 characters' }, 400)
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return c.json({ success: false, message: 'User not found' }, 404)

    await prisma.user.update({
      where: { id },
      data: { password: await hashPassword(password) },
    })
    await revokeUserSessions(id)

    return c.json({
      success: true,
      message: 'Password reset. The user must sign in again.',
    })
  } catch (error: unknown) {
    console.error('Admin reset password error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

adminRouter.patch('/api/admin/users/:id/access', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) return c.json({ success: false, message: 'Unauthorized' }, 403)

    const id = c.req.param('id')
    if (id === admin.userId) {
      return c.json({ success: false, message: 'You cannot block your own account' }, 400)
    }

    const body = await c.req.json<any>().catch(() => ({}))
    if (typeof body.loginBlocked !== 'boolean') {
      return c.json({ success: false, message: 'loginBlocked must be true or false' }, 400)
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!user) return c.json({ success: false, message: 'User not found' }, 404)

    await prisma.user.update({
      where: { id },
      data: { loginBlocked: body.loginBlocked },
    })
    if (body.loginBlocked) await revokeUserSessions(id)

    return c.json({
      success: true,
      message: body.loginBlocked ? 'Login blocked and sessions ended' : 'Login allowed again',
    })
  } catch (error: unknown) {
    console.error('Admin login block error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/users/:id
 */
adminRouter.get('/api/admin/users/:id', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const id = c.req.param('id')
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
        loginBlocked: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          where: { revokedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { lastSeenAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            lastSeenAt: true,
            expiresAt: true,
            userAgent: true,
            ip: true,
          },
        },
        _count: {
          select: { enrollments: true, payments: true, certificates: true, reviews: true },
        },
        enrollments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            progress: true,
            createdAt: true,
            course: { select: { id: true, title: true } },
          },
        },
        payments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 404)
    }

    const lastLogin = await prisma.session.findFirst({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    return c.json({
      success: true,
      data: { ...user, lastLoginAt: lastLogin?.createdAt ?? null },
    })
  } catch (error: unknown) {
    console.error('Admin get user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/schools
 */
adminRouter.get('/api/admin/schools', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const schools = await prisma.school.findMany({
      include: { _count: { select: { educators: true } } },
      orderBy: { name: 'asc' },
    })

    return c.json({ success: true, data: schools })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * POST /api/admin/schools
 */
adminRouter.post('/api/admin/schools', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { name, location, county, studentCount, isActive } = await c.req.json<any>()
    if (!name?.trim()) {
      return c.json({ success: false, message: 'Name is required' }, 400)
    }

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        county: county?.trim() || null,
        studentCount: Number(studentCount) || 0,
        isActive: isActive !== false,
      },
    })

    return c.json({ success: true, data: school }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/schools/:id
 */
adminRouter.get('/api/admin/schools/:id', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const id = c.req.param('id')
    const school = await prisma.school.findUnique({
      where: { id },
      include: { educators: true, _count: { select: { educators: true } } },
    })

    if (!school) {
      return c.json({ success: false, message: 'School not found' }, 404)
    }

    return c.json({ success: true, data: school })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * PATCH /api/admin/schools/:id
 */
adminRouter.patch('/api/admin/schools/:id', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const id = c.req.param('id')
    const { name, location, county, studentCount, isActive } = await c.req.json<any>()

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(county !== undefined && { county: county?.trim() || null }),
        ...(studentCount !== undefined && { studentCount: Number(studentCount) || 0 }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    })

    return c.json({ success: true, data: school })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * DELETE /api/admin/schools/:id
 */
adminRouter.delete('/api/admin/schools/:id', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const id = c.req.param('id')
    await prisma.school.delete({ where: { id } })

    return c.json({ success: true, message: 'School deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/educators
 */
adminRouter.get('/api/admin/educators', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const schoolId = c.req.query('schoolId')

    const educators = await prisma.educator.findMany({
      where: schoolId ? { schoolId } : undefined,
      include: { school: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    })

    return c.json({ success: true, data: educators })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * POST /api/admin/educators
 */
adminRouter.post('/api/admin/educators', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { name, email, phone, subject, schoolId, isActive } = await c.req.json<any>()
    if (!name?.trim()) {
      return c.json({ success: false, message: 'Name is required' }, 400)
    }

    const educator = await prisma.educator.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        schoolId: schoolId || null,
        isActive: isActive !== false,
      },
      include: { school: { select: { id: true, name: true } } },
    })

    return c.json({ success: true, data: educator }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * PATCH /api/admin/educators
 */
adminRouter.patch('/api/admin/educators', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { id, name, email, phone, subject, schoolId, isActive } = await c.req.json<any>()
    if (!id) {
      return c.json({ success: false, message: 'id is required' }, 400)
    }

    const educator = await prisma.educator.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(subject !== undefined && { subject: subject?.trim() || null }),
        ...(schoolId !== undefined && { schoolId: schoolId || null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
      include: { school: { select: { id: true, name: true } } },
    })

    return c.json({ success: true, data: educator })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * DELETE /api/admin/educators
 */
adminRouter.delete('/api/admin/educators', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { id } = await c.req.json<any>()
    if (!id) {
      return c.json({ success: false, message: 'id is required' }, 400)
    }

    await prisma.educator.delete({ where: { id } })

    return c.json({ success: true, message: 'Educator deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/enrollments
 */
adminRouter.get('/api/admin/enrollments', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const search = c.req.query('search')?.trim() || ''
    const status = c.req.query('status') || ''
    const courseId = c.req.query('courseId') || ''
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (courseId) where.courseId = courseId
    if (search) {
      where.OR = [
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
        { user: { phoneNumber: { contains: search } } },
        { course: { title: { contains: search } } },
      ]
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ])

    return c.json({
      success: true,
      data: { enrollments, total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    console.error('Admin list enrollments error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * POST /api/admin/enrollments
 * Body: { userId, courseId }
 */
adminRouter.post('/api/admin/enrollments', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { userId, courseId } = await c.req.json<any>()
    if (!userId || !courseId) {
      return c.json({ success: false, message: 'userId and courseId are required' }, 400)
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existing) {
      return c.json(
        { success: false, message: 'User is already enrolled in this course' },
        409
      )
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, status: 'ACTIVE' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return c.json({ success: true, data: enrollment, message: 'Enrollment created' }, 201)
  } catch (error: unknown) {
    console.error('Admin create enrollment error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * PATCH /api/admin/enrollments
 * Body: { enrollmentId, status?, progress? }
 */
adminRouter.patch('/api/admin/enrollments', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { enrollmentId, status, progress } = await c.req.json<any>()
    if (!enrollmentId) {
      return c.json({ success: false, message: 'enrollmentId is required' }, 400)
    }

    const updateData: {
      status?: string
      progress?: number
      completedAt?: Date | null
    } = {}
    if (status !== undefined) updateData.status = status
    if (progress !== undefined) {
      const p = Math.min(100, Math.max(0, Number(progress)))
      updateData.progress = p
      if (p === 100) {
        updateData.status = 'COMPLETED'
        updateData.completedAt = new Date()
      }
    }
    if (status === 'CANCELLED') {
      updateData.completedAt = null
    }

    if (Object.keys(updateData).length === 0) {
      return c.json({ success: false, message: 'No changes provided' }, 400)
    }

    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    })

    return c.json({ success: true, data: enrollment, message: 'Enrollment updated' })
  } catch (error: unknown) {
    console.error('Admin update enrollment error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/certificates
 */
adminRouter.get('/api/admin/certificates', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const search = c.req.query('search')?.trim() || ''

    const serialSearch = /^\d+$/.test(search) ? Number(search) : null
    const where = search
      ? {
          OR: [
            { certificateNumber: { contains: search } },
            ...(serialSearch ? [{ serial: serialSearch }] : []),
            { user: { email: { contains: search } } },
            { user: { name: { contains: search } } },
          ],
        }
      : {}

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    })

    return c.json({ success: true, data: certificates })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * POST /api/admin/certificates
 */
adminRouter.post('/api/admin/certificates', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { userId, courseId } = await c.req.json<any>()
    if (!userId || !courseId) {
      return c.json({ success: false, message: 'userId and courseId are required' }, 400)
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (!enrollment) {
      return c.json({ success: false, message: 'User is not enrolled in this course' }, 400)
    }

    const existing = await prisma.certificate.findFirst({
      where: { userId, courseId },
    })
    if (existing) {
      return c.json(
        { success: false, message: 'Certificate already issued for this course' },
        409
      )
    }

    const identity = await allocateCertificateIdentity()

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        serial: identity.serial,
        certificateNumber: identity.certificateNumber,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    await prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    })

    return c.json({ success: true, data: certificate, message: 'Certificate issued' }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * DELETE /api/admin/certificates
 */
adminRouter.delete('/api/admin/certificates', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { certificateId } = await c.req.json<any>()
    if (!certificateId) {
      return c.json({ success: false, message: 'certificateId is required' }, 400)
    }

    await prisma.certificate.delete({ where: { id: certificateId } })

    return c.json({ success: true, message: 'Certificate revoked' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/reviews
 */
adminRouter.get('/api/admin/reviews', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const published = c.req.query('published')
    const where =
      published === 'true' ? { isPublished: true } : published === 'false' ? { isPublished: false } : {}

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return c.json({ success: true, data: reviews })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * PATCH /api/admin/reviews
 */
adminRouter.patch('/api/admin/reviews', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { reviewId, isPublished } = await c.req.json<any>()
    if (!reviewId || isPublished === undefined) {
      return c.json({ success: false, message: 'reviewId and isPublished are required' }, 400)
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: Boolean(isPublished) },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    })

    return c.json({ success: true, data: review })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * DELETE /api/admin/reviews
 */
adminRouter.delete('/api/admin/reviews', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const { reviewId } = await c.req.json<any>()
    if (!reviewId) {
      return c.json({ success: false, message: 'reviewId is required' }, 400)
    }

    await prisma.review.delete({ where: { id: reviewId } })

    return c.json({ success: true, message: 'Review deleted' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/agencies
 */
adminRouter.get('/api/admin/agencies', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const search = c.req.query('search')?.trim() || ''
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = { role: ROLES.AGENCY }
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

    return c.json({
      success: true,
      data: {
        agencies,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        placementStats: Object.fromEntries(placementStats.map((s) => [s.status, s._count.id])),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/payments
 */
adminRouter.get('/api/admin/payments', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const status = c.req.query('status') || ''
    const currency = c.req.query('currency') || ''
    const search = c.req.query('search')?.trim() || ''
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}
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

    return c.json({
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
    return c.json({ success: false, message }, 500)
  }
})

type NotificationAudience = {
  audience: 'ALL' | 'ROLE' | 'USER'
  targetRole: string | null
  targetUserId: string | null
}

function parseNotificationAudience(input: {
  audience?: unknown
  targetRole?: unknown
  targetUserId?: unknown
}): NotificationAudience | { error: string } {
  const audience = typeof input.audience === 'string' ? input.audience.trim().toUpperCase() : ''
  const targetRole =
    typeof input.targetRole === 'string' && input.targetRole.trim()
      ? input.targetRole.trim().toUpperCase()
      : null
  const targetUserId =
    typeof input.targetUserId === 'string' && input.targetUserId.trim()
      ? input.targetUserId.trim()
      : null

  if (audience !== 'ALL' && audience !== 'ROLE' && audience !== 'USER') {
    return { error: 'audience must be ALL, ROLE, or USER' }
  }

  if (audience === 'ROLE') {
    if (!targetRole || !VALID_ROLES.includes(targetRole as Role)) {
      return { error: 'targetRole must be a known role' }
    }
  }

  if (audience === 'USER' && !targetUserId) {
    return { error: 'targetUserId is required when audience is USER' }
  }

  return {
    audience,
    targetRole: audience === 'ROLE' ? targetRole : null,
    targetUserId: audience === 'USER' ? targetUserId : null,
  }
}

function notificationTokenWhere(audience: NotificationAudience) {
  if (audience.audience === 'ALL') return {}
  if (audience.audience === 'ROLE') return { user: { role: audience.targetRole! } }
  return { userId: audience.targetUserId! }
}

async function countNotificationRecipients(audience: NotificationAudience) {
  const tokens = await prisma.pushToken.findMany({
    where: notificationTokenWhere(audience),
    select: { token: true, userId: true },
  })
  const validTokens = tokens.filter((token) => isExpoPushToken(token.token))
  return {
    people: new Set(validTokens.map((token) => token.userId)).size,
    devices: validTokens.length,
    validTokens,
  }
}

/**
 * GET /api/admin/notifications/preview
 * Query: audience, targetRole?, targetUserId?
 */
adminRouter.get('/api/admin/notifications/preview', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const parsed = parseNotificationAudience({
      audience: c.req.query('audience'),
      targetRole: c.req.query('targetRole'),
      targetUserId: c.req.query('targetUserId'),
    })
    if ('error' in parsed) {
      return c.json({ success: false, message: parsed.error }, 400)
    }

    const { people, devices } = await countNotificationRecipients(parsed)
    return c.json({ success: true, data: { people, devices } })
  } catch (error: unknown) {
    console.error('Admin notifications preview error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/notifications
 */
adminRouter.get('/api/admin/notifications', async (c) => {
  try {
    if (!await requireAdmin(c)) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const [logs, tokenCount, usersWithTokens] = await Promise.all([
      prisma.notificationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          sentBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.pushToken.count(),
      prisma.pushToken.groupBy({
        by: ['userId'],
        _count: { userId: true },
      }),
    ])

    const targetIds = [
      ...new Set(logs.map((log) => log.targetUserId).filter((id): id is string => Boolean(id))),
    ]
    const targets =
      targetIds.length === 0
        ? []
        : await prisma.user.findMany({
            where: { id: { in: targetIds } },
            select: { id: true, name: true, email: true },
          })
    const targetById = new Map(targets.map((user) => [user.id, user]))

    return c.json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          ...log,
          targetUser: log.targetUserId ? targetById.get(log.targetUserId) ?? null : null,
        })),
        stats: {
          deviceTokens: tokenCount,
          usersWithDevices: usersWithTokens.length,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Admin notifications GET error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * POST /api/admin/notifications
 * Body: { title, body, audience: 'ALL'|'ROLE'|'USER', targetRole?, targetUserId?, data? }
 */
adminRouter.post('/api/admin/notifications', async (c) => {
  try {
    const admin = await requireAdmin(c)
    if (!admin) {
      return c.json({ success: false, message: 'Unauthorized' }, 403)
    }

    const body = await c.req.json<any>()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const message = typeof body.body === 'string' ? body.body.trim() : ''
    const data =
      body.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : undefined

    if (!title || !message) {
      return c.json({ success: false, message: 'title and body are required' }, 400)
    }

    const parsed = parseNotificationAudience(body)
    if ('error' in parsed) {
      return c.json({ success: false, message: parsed.error }, 400)
    }

    const { audience, targetRole, targetUserId } = parsed
    const { validTokens } = await countNotificationRecipients(parsed)

    if (validTokens.length === 0) {
      const log = await prisma.notificationLog.create({
        data: {
          title,
          body: message,
          data: data ? JSON.stringify(data) : null,
          audience,
          targetRole,
          targetUserId,
          successCount: 0,
          failureCount: 0,
          sentById: admin.userId,
        },
      })

      return c.json({
        success: true,
        data: log,
        message: 'No registered device tokens for this audience',
      })
    }

    const { successCount, failureCount, tickets } = await sendExpoPushMessages(
      validTokens.map((t) => ({
        to: t.token,
        title,
        body: message,
        data,
        sound: 'default',
        channelId: 'default',
        priority: 'high',
      }))
    )

    const invalidTokens: string[] = []
    tickets.forEach((ticket, index) => {
      if (
        ticket.status === 'error' &&
        (ticket.details?.error === 'DeviceNotRegistered' ||
          ticket.message?.includes('DeviceNotRegistered'))
      ) {
        invalidTokens.push(validTokens[index].token)
      }
    })
    if (invalidTokens.length > 0) {
      await prisma.pushToken.deleteMany({
        where: { token: { in: invalidTokens } },
      })
    }

    const log = await prisma.notificationLog.create({
      data: {
        title,
        body: message,
        data: data ? JSON.stringify(data) : null,
        audience,
        targetRole,
        targetUserId,
        successCount,
        failureCount,
        sentById: admin.userId,
      },
    })

    return c.json({
      success: true,
      data: {
        ...log,
        targetedDevices: validTokens.length,
      },
      message: `Notification sent to ${successCount} device(s)`,
    })
  } catch (error: unknown) {
    console.error('Admin notifications POST error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * GET /api/admin/blog
 */
adminRouter.get('/api/admin/blog', async (c) => {
  const user = await requireBlogAdmin(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const posts = await getBlogPosts({ includeUnpublished: true })
  return c.json({ success: true, data: posts })
})

/**
 * POST /api/admin/blog
 */
adminRouter.post('/api/admin/blog', async (c) => {
  const user = await requireBlogAdmin(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<any>()
  const { title, description, content, author, category, readTime, tags, isPublished } =
    validatePostBody(body)

  if (!title || !description || !content || !author || !category || !readTime) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const imageResult = await resolveImageField(body)
  if (!imageResult.ok) {
    return c.json({ error: imageResult.error }, 400)
  }

  try {
    const newPost = await addBlogPost({
      title,
      description,
      content,
      author,
      authorId: user.userId,
      category,
      tags,
      image: imageResult.image,
      readTime,
      isPublished: isPublished ?? true,
    })

    return c.json(newPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save blog post'
    return c.json({ error: message }, 500)
  }
})

/**
 * PUT /api/admin/blog
 */
adminRouter.put('/api/admin/blog', async (c) => {
  const user = await requireBlogAdmin(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<any>()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const { title, description, content, author, category, readTime, tags, isPublished } =
    validatePostBody(body)

  if (!slug) {
    return c.json({ error: 'Missing slug' }, 400)
  }

  if (!title || !description || !content || !author || !category || !readTime) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const imageResult = await resolveImageField(body)
  if (!imageResult.ok) {
    return c.json({ error: imageResult.error }, 400)
  }

  try {
    const updatedPost = await updateBlogPost(slug, {
      title,
      description,
      content,
      author,
      authorId: user.userId,
      category,
      tags,
      image: imageResult.image,
      readTime,
      isPublished,
    })

    if (!updatedPost) {
      return c.json({ error: 'Post not found' }, 404)
    }

    return c.json(updatedPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update blog post'
    return c.json({ error: message }, 500)
  }
})

/**
 * DELETE /api/admin/blog
 */
adminRouter.delete('/api/admin/blog', async (c) => {
  const user = await requireBlogAdmin(c)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<any>()
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''

  if (!slug) {
    return c.json({ error: 'Missing slug' }, 400)
  }

  try {
    const deleted = await deleteBlogPost(slug)

    if (!deleted) {
      return c.json({ error: 'Post not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete blog post'
    return c.json({ error: message }, 500)
  }
})
