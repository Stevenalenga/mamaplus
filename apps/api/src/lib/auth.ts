import jwt from 'jsonwebtoken'
import type { Context } from 'hono'
import type { AppEnv } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (!decoded?.userId || !decoded?.role) return null
    return {
      userId: decoded.userId,
      email: decoded.email || '',
      role: decoded.role,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function getUser(c: Context<AppEnv>): JWTPayload | null {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyToken(authHeader.substring(7))
}

export function hasRole(user: JWTPayload | null, role: string | string[]): boolean {
  if (!user) return false
  const roles = Array.isArray(role) ? role : [role]
  return roles.includes(user.role)
}
