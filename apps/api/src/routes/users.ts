import { Hono, type Context } from 'hono'
import { prisma } from '@mamaplus/database'
import type { AppEnv } from '../types'
import { getUser, hasRole, issueAuthToken, toSessionView } from '../lib/auth'
import { hashPassword, verifyPassword } from '../lib/db-utils'
import { isValidEmail, normalizeEmail } from '../lib/user-identity'
import { ROLES } from '../lib/roles'
import { uploadToStorage } from '../lib/storage'
import { isExpoPushToken } from '../lib/push-notifications'

const VALID_ONBOARD_ROLES = [ROLES.USER, ROLES.AGENCY, ROLES.INSTRUCTOR]
const VALID_GENDERS = ['MALE', 'FEMALE']

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

type UploadedFile = {
  type: string
  size: number
  arrayBuffer: () => Promise<ArrayBuffer>
}

async function getAuthContext(c: Context<AppEnv>) {
  const currentUser = await getUser(c)
  if (!currentUser) return { error: 'Unauthorized' as const, status: 401 as const }
  return { currentUser }
}

export const usersRouter = new Hono<AppEnv>()

/**
 * GET /api/users/me
 * Get current authenticated user
 */
usersRouter.get('/api/users/me', async (c) => {
  try {
    const currentUser = await getUser(c)

    if (!currentUser) {
      return c.json({ message: 'Not authenticated' }, 401)
    }

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
            reviews: true,
          },
        },
      },
    })

    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    return c.json({
      success: true,
      data: user,
    })
  } catch (error: any) {
    console.error('Get current user error:', error)
    return c.json({ message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * PATCH /api/users/me
 * Update the authenticated user's name, email, phone number, and/or password.
 */
usersRouter.patch('/api/users/me', async (c) => {
  const currentUser = await getUser(c)
  if (!currentUser) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const userId = currentUser.userId

  let body: Record<string, unknown>
  try {
    body = (await c.req.json()) as Record<string, unknown>
  } catch {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { name, email, phoneNumber, currentPassword, newPassword } = body as {
    name?: string
    email?: string
    phoneNumber?: string
    currentPassword?: string
    newPassword?: string
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return c.json({ success: false, message: 'User not found' }, 404)
  }

  const updateData: {
    name?: string
    email?: string
    phoneNumber?: string
    password?: string
  } = {}

  if (name !== undefined) {
    const trimmed = String(name).trim()
    if (trimmed.length === 0) {
      return c.json({ success: false, message: 'Name cannot be empty' }, 400)
    }
    updateData.name = trimmed
  }

  if (email !== undefined) {
    const trimmedEmail = normalizeEmail(String(email))
    if (!isValidEmail(trimmedEmail)) {
      return c.json({ success: false, message: 'Invalid email address' }, 400)
    }
    const currentEmail = user.email ? normalizeEmail(user.email) : null
    if (trimmedEmail !== currentEmail) {
      const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
      if (existing && existing.id !== userId) {
        return c.json({ success: false, message: 'Email address is already in use' }, 409)
      }
      updateData.email = trimmedEmail
    }
  }

  if (phoneNumber !== undefined) {
    const normalizedPhone = String(phoneNumber).replace(/\D/g, '')
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      return c.json({ success: false, message: 'Please enter a valid phone number' }, 400)
    }
    if (normalizedPhone !== user.phoneNumber) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      })
      if (existingPhone && existingPhone.id !== userId) {
        return c.json({ success: false, message: 'Phone number is already in use' }, 409)
      }
      updateData.phoneNumber = normalizedPhone
    }
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      return c.json(
        { success: false, message: 'Current password is required to set a new password' },
        400
      )
    }
    if (!user.password) {
      return c.json(
        { success: false, message: 'Password changes are not supported for social login accounts' },
        400
      )
    }
    const isCorrect = await verifyPassword(String(currentPassword), user.password)
    if (!isCorrect) {
      return c.json({ success: false, message: 'Current password is incorrect' }, 400)
    }
    const newPwd = String(newPassword)
    if (newPwd.length < 8) {
      return c.json({ success: false, message: 'New password must be at least 8 characters' }, 400)
    }
    updateData.password = await hashPassword(newPwd)
  }

  if (Object.keys(updateData).length === 0) {
    return c.json({ success: false, message: 'No changes provided' }, 400)
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        updatedAt: true,
      },
    })

    return c.json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    })
  } catch (error: unknown) {
    const prismaError = error as { code?: string; meta?: { target?: string | string[] } }
    if (prismaError?.code === 'P2002') {
      const target = Array.isArray(prismaError.meta?.target)
        ? prismaError.meta.target.join(',')
        : String(prismaError.meta?.target || '')
      const isPhone = target.includes('phoneNumber')
      return c.json(
        {
          success: false,
          message: isPhone ? 'Phone number is already in use' : 'Email address is already in use',
        },
        409
      )
    }
    throw error
  }
})

/**
 * POST /api/users/me/avatar
 * Upload a new profile picture for the authenticated user.
 */
usersRouter.post('/api/users/me/avatar', async (c) => {
  const currentUser = await getUser(c)
  if (!currentUser) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const userId = currentUser.userId
  if (!userId) {
    return c.json({ success: false, message: 'Invalid session' }, 401)
  }

  let formData: FormData
  try {
    formData = await c.req.formData()
  } catch {
    return c.json({ success: false, message: 'Invalid form data' }, 400)
  }

  const file = formData.get('file') as UploadedFile | null
  if (!file) {
    return c.json({ success: false, message: 'No file provided' }, 400)
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return c.json(
      {
        success: false,
        message: 'Invalid file type. Only JPG, PNG, GIF and WebP images are allowed.',
      },
      400
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ success: false, message: 'File size exceeds 5MB limit.' }, 400)
  }

  const bytes = await file.arrayBuffer()
  const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`

  const result = await uploadToStorage(base64, 'image', {
    folder: 'mamaplus/avatars',
  })

  if (!result.success || !result.secureUrl) {
    return c.json({ success: false, message: result.error || 'Upload failed' }, 500)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: result.secureUrl },
  })

  return c.json({
    success: true,
    data: { avatarUrl: result.secureUrl },
    message: 'Profile picture updated successfully',
  })
})

/**
 * DELETE /api/users/me/avatar
 * Remove the profile picture for the authenticated user.
 */
usersRouter.delete('/api/users/me/avatar', async (c) => {
  const currentUser = await getUser(c)
  if (!currentUser) {
    return c.json({ success: false, message: 'Unauthorized' }, 401)
  }

  const userId = currentUser.userId
  if (!userId) {
    return c.json({ success: false, message: 'Invalid session' }, 401)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  })

  return c.json({ success: true, message: 'Profile picture removed' })
})

/**
 * POST /api/users/onboard
 * Complete onboarding: set role and (for caregivers) gender.
 * Only callable by authenticated users whose current role is PENDING.
 */
usersRouter.post('/api/users/onboard', async (c) => {
  const currentUser = await getUser(c)

  if (!currentUser) {
    return c.json({ success: false, message: 'Not authenticated' }, 401)
  }

  const userId = currentUser.userId
  const currentRole = currentUser.role

  if (currentRole !== ROLES.PENDING) {
    return c.json({ success: false, message: 'Onboarding already completed' }, 400)
  }

  let body: { role?: string; gender?: string }
  try {
    body = (await c.req.json()) as { role?: string; gender?: string }
  } catch {
    return c.json({ success: false, message: 'Invalid request body' }, 400)
  }

  const { role, gender } = body

  if (!role || !VALID_ONBOARD_ROLES.includes(role as any)) {
    return c.json(
      {
        success: false,
        message: `Role must be one of: ${VALID_ONBOARD_ROLES.join(', ')}`,
      },
      400
    )
  }

  if (role === ROLES.USER) {
    if (!gender || !VALID_GENDERS.includes(gender)) {
      return c.json(
        { success: false, message: 'Gender (MALE or FEMALE) is required for caregivers' },
        400
      )
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        gender: role === ROLES.USER ? gender ?? null : null,
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

    const issued = await issueAuthToken(c, updatedUser)

    return c.json({
      success: true,
      data: {
        user: updatedUser,
        token: issued.token,
        session: issued.session,
      },
    })
  } catch (error) {
    console.error('Onboard error:', error)
    return c.json({ success: false, message: 'Failed to complete onboarding' }, 500)
  }
})

/**
 * POST /api/users/push-token
 * Register or refresh the current user's Expo push token.
 */
usersRouter.post('/api/users/push-token', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body: any = await c.req.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : ''
    const deviceId =
      typeof body.deviceId === 'string' && body.deviceId.trim() ? body.deviceId.trim() : null

    if (!token || !isExpoPushToken(token)) {
      return c.json({ success: false, message: 'Valid Expo push token is required' }, 400)
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return c.json({ success: false, message: 'platform must be ios, android, or web' }, 400)
    }

    const saved = await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId: user.userId,
        token,
        platform,
        deviceId,
      },
      update: {
        userId: user.userId,
        platform,
        deviceId,
      },
    })

    return c.json({
      success: true,
      data: { id: saved.id, token: saved.token, platform: saved.platform },
      message: 'Push token registered',
    })
  } catch (error: unknown) {
    console.error('Register push token error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

/**
 * DELETE /api/users/push-token
 * Remove a push token (e.g. on logout).
 */
usersRouter.delete('/api/users/push-token', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) {
      return c.json({ success: false, message: 'Unauthorized' }, 401)
    }

    const body: any = await c.req.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token.trim() : ''

    if (token) {
      await prisma.pushToken.deleteMany({
        where: { token, userId: user.userId },
      })
    } else {
      await prisma.pushToken.deleteMany({
        where: { userId: user.userId },
      })
    }

    return c.json({ success: true, message: 'Push token removed' })
  } catch (error: unknown) {
    console.error('Delete push token error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ success: false, message }, 500)
  }
})

usersRouter.get('/api/users/sessions', async (c) => {
  const user = await getUser(c)
  if (!user) return c.json({ success: false, message: 'Not authenticated' }, 401)

  const sessions = await prisma.session.findMany({
    where: { userId: user.userId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return c.json({
    success: true,
    data: sessions.map((session) => toSessionView(session, user.sessionId)),
  })
})

usersRouter.delete('/api/users/sessions/:id', async (c) => {
  const user = await getUser(c)
  if (!user) return c.json({ success: false, message: 'Not authenticated' }, 401)

  const id = c.req.param('id')
  const session = await prisma.session.findFirst({
    where: { id, userId: user.userId },
  })
  if (!session) return c.json({ success: false, message: 'Session not found' }, 404)

  if (!session.revokedAt) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    })
  }

  return c.json({ success: true, message: 'Session revoked' })
})

/**
 * GET /api/users/:id
 * Admin or self only
 */
usersRouter.get('/api/users/:id', async (c) => {
  try {
    const auth = await getAuthContext(c)
    if ('error' in auth) {
      return c.json({ message: auth.error }, auth.status)
    }

    const id = c.req.param('id')
    const isAdmin = hasRole(auth.currentUser, ROLES.ADMIN)
    if (!isAdmin && auth.currentUser.userId !== id) {
      return c.json({ message: 'Forbidden' }, 403)
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
      return c.json({ message: 'User not found' }, 404)
    }

    return c.json({ success: true, data: user })
  } catch (error: unknown) {
    console.error('Get user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ message }, 500)
  }
})

/**
 * PATCH /api/users/:id
 * Admin or self only (self cannot change role)
 */
usersRouter.patch('/api/users/:id', async (c) => {
  try {
    const auth = await getAuthContext(c)
    if ('error' in auth) {
      return c.json({ message: auth.error }, auth.status)
    }

    const id = c.req.param('id')
    const isAdmin = hasRole(auth.currentUser, ROLES.ADMIN)
    if (!isAdmin && auth.currentUser.userId !== id) {
      return c.json({ message: 'Forbidden' }, 403)
    }

    const { name, phoneNumber, avatar } = (await c.req.json()) as any

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

    return c.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    })
  } catch (error: unknown) {
    console.error('Update user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ message }, 500)
  }
})

/**
 * DELETE /api/users/:id
 * Admin only
 */
usersRouter.delete('/api/users/:id', async (c) => {
  try {
    const auth = await getAuthContext(c)
    if ('error' in auth) {
      return c.json({ message: auth.error }, auth.status)
    }

    if (!hasRole(auth.currentUser, ROLES.ADMIN)) {
      return c.json({ message: 'Forbidden' }, 403)
    }

    const id = c.req.param('id')
    if (id === auth.currentUser.userId) {
      return c.json({ message: 'You cannot delete your own account' }, 400)
    }

    await prisma.user.delete({ where: { id } })

    return c.json({ success: true, message: 'User deleted successfully' })
  } catch (error: unknown) {
    console.error('Delete user error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return c.json({ message }, 500)
  }
})
