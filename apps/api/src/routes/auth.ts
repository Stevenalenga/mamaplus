import { Hono } from 'hono'
import { prisma } from '@mamaplus/database'
import type { AppEnv } from '../types'
import { getUser, issueAuthToken } from '../lib/auth'
import { hashPassword, verifyPassword } from '../lib/db-utils'
import { ROLES } from '../lib/roles'
import {
  findUserByIdentifier,
  isValidEmail,
  isValidPhoneDigits,
  normalizeEmail,
  normalizePhoneDigits,
  userLoginLabel,
} from '../lib/user-identity'
import { ADMIN_EMAIL, validateAdminCredentials } from '../lib/admin-credentials'
import { getAbsoluteUrl } from '../lib/site-url'

type SocialProfile = {
  email?: string
  name?: string | null
  avatar?: string | null
}

async function verifyGoogleIdToken(idToken: string): Promise<SocialProfile | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  )
  if (!res.ok) return null
  const data: any = await res.json()
  return {
    email: data.email,
    name: data.name || null,
    avatar: data.picture || null,
  }
}

async function verifyMicrosoftAccessToken(accessToken: string): Promise<SocialProfile | null> {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data: any = await res.json()
  return {
    email: data.mail || data.userPrincipalName,
    name: data.displayName || null,
    avatar: null,
  }
}

export const authRouter = new Hono<AppEnv>()

/**
 * POST /api/users/login
 * Authenticate with email or phone number + password
 */
authRouter.post('/api/users/login', async (c) => {
  try {
    const body: any = await c.req.json()
    const identifier = String(body.email || body.phoneNumber || body.identifier || '').trim()
    const password = body.password

    if (!identifier || !password) {
      return c.json(
        {
          success: false,
          message: 'Email or phone number, and password are required',
        },
        400
      )
    }

    const { error, user } = await findUserByIdentifier(identifier)

    if (error) {
      return c.json({ success: false, message: error }, 400)
    }

    if (!user) {
      return c.json(
        {
          success: false,
          message:
            'Invalid email/phone or password. Please check your credentials and try again.',
        },
        401
      )
    }

    if (user.loginBlocked) {
      return c.json(
        {
          success: false,
          message: 'This account is blocked. Contact an administrator.',
        },
        403
      )
    }

    if (!user.password) {
      return c.json(
        {
          success: false,
          message:
            'This account uses Google or Microsoft sign-in. Please use those options on the login screen.',
        },
        401
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return c.json(
        {
          success: false,
          message:
            'Invalid email/phone or password. Please check your credentials and try again.',
        },
        401
      )
    }

    console.log('Login successful for user:', userLoginLabel(user))

    const issued = await issueAuthToken(c, user)

    const { password: _password, ...userWithoutPassword } = user

    return c.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token: issued.token,
        session: issued.session,
      },
      message: 'Login successful',
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json(
      {
        success: false,
        message: error.message || 'An error occurred during login. Please try again.',
      },
      500
    )
  }
})

/**
 * POST /api/users/register
 * Register with email and/or phone (at least one required). Both are unique.
 */
authRouter.post('/api/users/register', async (c) => {
  try {
    const { email, password, name, phoneNumber } = (await c.req.json()) as any

    if (!password) {
      return c.json({ success: false, message: 'Password is required' }, 400)
    }

    const rawEmail = typeof email === 'string' ? email.trim() : ''
    const rawPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : ''

    if (!rawEmail && !rawPhone) {
      return c.json(
        {
          success: false,
          message: 'Please provide an email address or a phone number',
        },
        400
      )
    }

    let normalizedEmail: string | null = null
    let normalizedPhone: string | null = null

    if (rawEmail) {
      if (!isValidEmail(rawEmail)) {
        return c.json({ success: false, message: 'Please enter a valid email address' }, 400)
      }
      normalizedEmail = normalizeEmail(rawEmail)
    }

    if (rawPhone) {
      normalizedPhone = normalizePhoneDigits(rawPhone)
      if (!isValidPhoneDigits(normalizedPhone)) {
        return c.json({ success: false, message: 'Please enter a valid phone number' }, 400)
      }
    }

    if (password.length < 8) {
      return c.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        400
      )
    }

    if (name && name.trim().length < 2) {
      return c.json(
        {
          success: false,
          message: 'Name must be at least 2 characters long',
        },
        400
      )
    }

    if (normalizedEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (existingEmail) {
        return c.json(
          {
            success: false,
            message: 'An account with this email already exists. Please log in instead.',
          },
          409
        )
      }
    }

    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      })
      if (existingPhone) {
        return c.json(
          {
            success: false,
            message: 'An account with this phone number already exists. Please log in instead.',
          },
          409
        )
      }
    }

    const hashedPassword = await hashPassword(password)
    const role = ROLES.PENDING

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        phoneNumber: normalizedPhone,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    })

    const issued = await issueAuthToken(c, user)

    console.log('User registered successfully:', userLoginLabel(user))

    return c.json(
      {
        success: true,
        data: {
          user,
          token: issued.token,
          session: issued.session,
        },
        message: 'User registered successfully',
      },
      201
    )
  } catch (error: any) {
    console.error('User registration error:', error)

    if (error?.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target || '')
      const isPhone = target.includes('phoneNumber')
      return c.json(
        {
          success: false,
          message: isPhone
            ? 'An account with this phone number already exists. Please log in instead.'
            : 'An account with this email already exists. Please log in instead.',
        },
        409
      )
    }

    return c.json(
      {
        success: false,
        message: error.message || 'An error occurred during registration. Please try again.',
      },
      500
    )
  }
})

/**
 * POST /api/users/logout
 */
authRouter.post('/api/users/logout', async (c) => {
  try {
    const user = await getUser(c)
    if (!user) {
      return c.json({ success: false, message: 'Not authenticated' }, 401)
    }

    await prisma.session.update({
      where: { id: user.sessionId },
      data: { revokedAt: new Date() },
    })

    return c.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error: any) {
    console.error('Logout error:', error)
    return c.json({ message: error.message || 'Internal server error' }, 500)
  }
})

/**
 * POST /api/auth/social
 */
authRouter.post('/api/auth/social', async (c) => {
  try {
    const body: any = await c.req.json()
    const { provider, idToken, accessToken } = body as {
      provider: string
      idToken?: string
      accessToken?: string
    }

    if (!provider) {
      return c.json({ success: false, message: 'Provider is required' }, 400)
    }

    let profile: SocialProfile | null = null

    if (provider === 'google') {
      if (!idToken) {
        return c.json({ success: false, message: 'idToken required for Google' }, 400)
      }
      profile = await verifyGoogleIdToken(idToken)
    } else if (provider === 'microsoft') {
      if (!accessToken) {
        return c.json({ success: false, message: 'accessToken required for Microsoft' }, 400)
      }
      profile = await verifyMicrosoftAccessToken(accessToken)
    } else {
      return c.json({ success: false, message: 'Unsupported provider' }, 400)
    }

    if (!profile || !profile.email) {
      return c.json({ success: false, message: 'Failed to verify provider token' }, 400)
    }

    const email = normalizeEmail(profile.email)
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || 'OAuth User',
          password: '',
          role: 'PENDING',
          isVerified: true,
          avatar: profile.avatar || null,
          oauthProvider: provider === 'microsoft' ? 'azure-ad' : provider,
        },
      })
    }

    if (user.loginBlocked) {
      return c.json(
        { success: false, message: 'This account is blocked. Contact an administrator.' },
        403
      )
    }

    const issued = await issueAuthToken(c, user)

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          gender: user.gender,
          phoneNumber: user.phoneNumber,
        },
        token: issued.token,
        session: issued.session,
      },
    })
  } catch (error: any) {
    console.error('Social auth error:', error)
    return c.json({ success: false, message: error.message || 'Server error' }, 500)
  }
})

/**
 * POST /api/admin/login
 */
authRouter.post('/api/admin/login', async (c) => {
  const body: any = await c.req.json()
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password.trim() : ''

  if (!validateAdminCredentials(email, password)) {
    return c.json({ error: 'Invalid admin credentials' }, 401)
  }

  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!user) {
    return c.json({ error: 'Admin account is not set up' }, 401)
  }
  if (user.loginBlocked) {
    return c.json({ error: 'This account is blocked. Contact an administrator.' }, 403)
  }

  const issued = await issueAuthToken(c, {
    id: user.id,
    email: user.email ?? ADMIN_EMAIL,
    role: ROLES.ADMIN,
  })

  return c.json({
    success: true,
    data: {
      token: issued.token,
      session: issued.session,
      user: {
        id: user.id,
        email: ADMIN_EMAIL,
        role: ROLES.ADMIN,
        name: user.name ?? null,
      },
    },
  })
})

/**
 * GET /api/admin/logout
 */
authRouter.get('/api/admin/logout', (c) => {
  return c.redirect(getAbsoluteUrl('/admin/login'))
})

/**
 * POST /api/admin/logout
 */
authRouter.post('/api/admin/logout', (c) => {
  return c.json({ success: true })
})
