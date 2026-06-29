import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export type AuthenticatedUser = {
  id: string
  email: string
  role: string
  name?: string | null
}

/**
 * Resolve the current user from mobile JWT (Bearer) or NextAuth session (web).
 */
export async function getAuthenticatedUser(
  request?: NextRequest
): Promise<AuthenticatedUser | null> {
  const user = await getCurrentUser(request)
  if (!user) {
    return null
  }

  return {
    id: user.userId,
    email: user.email,
    role: user.role,
  }
}
