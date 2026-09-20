import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLES } from '@/lib/roles'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { isExpoPushToken, sendExpoPushMessages } from '@/lib/push-notifications'

async function requireAdmin(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user || user.role !== ROLES.ADMIN) return null
  return user
}

/**
 * GET /api/admin/notifications
 * List recent notification send history + device token counts.
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
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

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats: {
          deviceTokens: tokenCount,
          usersWithDevices: usersWithTokens.length,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Admin notifications GET error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

/**
 * POST /api/admin/notifications
 * Send a push notification to all devices, a role, or a single user.
 *
 * Body: { title, body, audience: 'ALL'|'ROLE'|'USER', targetRole?, targetUserId?, data? }
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const message = typeof body.body === 'string' ? body.body.trim() : ''
    const audience = typeof body.audience === 'string' ? body.audience.trim().toUpperCase() : ''
    const targetRole =
      typeof body.targetRole === 'string' && body.targetRole.trim()
        ? body.targetRole.trim().toUpperCase()
        : null
    const targetUserId =
      typeof body.targetUserId === 'string' && body.targetUserId.trim()
        ? body.targetUserId.trim()
        : null
    const data =
      body.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? (body.data as Record<string, unknown>)
        : undefined

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'title and body are required' },
        { status: 400 }
      )
    }

    if (!['ALL', 'ROLE', 'USER'].includes(audience)) {
      return NextResponse.json(
        { success: false, message: 'audience must be ALL, ROLE, or USER' },
        { status: 400 }
      )
    }

    if (audience === 'ROLE' && !targetRole) {
      return NextResponse.json(
        { success: false, message: 'targetRole is required when audience is ROLE' },
        { status: 400 }
      )
    }

    if (audience === 'USER' && !targetUserId) {
      return NextResponse.json(
        { success: false, message: 'targetUserId is required when audience is USER' },
        { status: 400 }
      )
    }

    const where =
      audience === 'ALL'
        ? {}
        : audience === 'ROLE'
          ? { user: { role: targetRole! } }
          : { userId: targetUserId! }

    const tokens = await prisma.pushToken.findMany({
      where,
      select: { id: true, token: true, userId: true },
    })

    const validTokens = tokens.filter((t) => isExpoPushToken(t.token))

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
          sentById: admin.id,
        },
      })

      return NextResponse.json({
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

    // Drop tokens Expo reports as permanently invalid
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
        sentById: admin.id,
      },
    })

    return NextResponse.json({
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
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
