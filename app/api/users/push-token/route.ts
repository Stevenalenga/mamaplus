import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/get-authenticated-user'
import { isExpoPushToken } from '@/lib/push-notifications'

/**
 * POST /api/users/push-token
 * Register or refresh the current user's Expo push token.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : ''
    const deviceId =
      typeof body.deviceId === 'string' && body.deviceId.trim()
        ? body.deviceId.trim()
        : null

    if (!token || !isExpoPushToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Valid Expo push token is required' },
        { status: 400 }
      )
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json(
        { success: false, message: 'platform must be ios, android, or web' },
        { status: 400 }
      )
    }

    const saved = await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId: user.id,
        token,
        platform,
        deviceId,
      },
      update: {
        userId: user.id,
        platform,
        deviceId,
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: saved.id, token: saved.token, platform: saved.platform },
      message: 'Push token registered',
    })
  } catch (error: unknown) {
    console.error('Register push token error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

/**
 * DELETE /api/users/push-token
 * Remove a push token (e.g. on logout).
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''

    if (token) {
      await prisma.pushToken.deleteMany({
        where: { token, userId: user.id },
      })
    } else {
      await prisma.pushToken.deleteMany({
        where: { userId: user.id },
      })
    }

    return NextResponse.json({ success: true, message: 'Push token removed' })
  } catch (error: unknown) {
    console.error('Delete push token error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
