import jwt from 'jsonwebtoken'
import type { Context } from 'hono'
import { prisma } from '@mamaplus/database'
import type { AppEnv } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000
const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000

export interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
}

export interface SessionView {
  id: string
  userAgent: string | null
  ip: string | null
  createdAt: Date
  lastSeenAt: Date
  expiresAt: Date
  revokedAt: Date | null
  current: boolean
}

type SessionRecord = {
  id: string
  userAgent: string | null
  ip: string | null
  createdAt: Date
  lastSeenAt: Date
  expiresAt: Date
  revokedAt: Date | null
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (!decoded?.userId || !decoded?.role || !decoded?.sessionId) return null
    return {
      userId: decoded.userId,
      email: decoded.email || '',
      role: decoded.role,
      sessionId: decoded.sessionId,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function requestClientMeta(c: Context) {
  const forwarded = c.req.header('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || c.req.header('x-real-ip') || null
  return {
    userAgent: c.req.header('user-agent')?.slice(0, 512) || null,
    ip: ip?.slice(0, 64) || null,
  }
}

export function toSessionView(session: SessionRecord, currentSessionId?: string): SessionView {
  return {
    id: session.id,
    userAgent: session.userAgent,
    ip: session.ip,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    current: session.id === currentSessionId,
  }
}

export async function issueAuthToken(
  c: Context,
  user: { id: string; email?: string | null; phoneNumber?: string | null; role: string }
) {
  const meta = requestClientMeta(c)
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: meta.userAgent,
      ip: meta.ip,
    },
  })

  const token = generateToken({
    userId: user.id,
    email: user.email ?? user.phoneNumber ?? '',
    role: user.role,
    sessionId: session.id,
  })

  return { token, session: toSessionView(session, session.id) }
}

export async function getUser(c: Context<AppEnv>): Promise<JWTPayload | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const decoded = verifyToken(authHeader.substring(7))
  if (!decoded) return null

  const session = await prisma.session.findUnique({
    where: { id: decoded.sessionId },
    include: {
      user: {
        select: { id: true, email: true, phoneNumber: true, role: true, loginBlocked: true },
      },
    },
  })

  if (!session || session.revokedAt || session.userId !== decoded.userId) return null
  if (session.expiresAt.getTime() <= Date.now()) return null
  if (!session.user || session.user.loginBlocked) return null

  if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_INTERVAL_MS) {
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => undefined)
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? session.user.phoneNumber ?? decoded.email,
    role: session.user.role,
    sessionId: session.id,
  }
}

export function hasRole(user: JWTPayload | null, role: string | string[]): boolean {
  if (!user) return false
  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(user.role)
}
