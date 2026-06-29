import { NextRequest } from 'next/server'
import { auth } from '@/auth'
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
  const jwtUser = request ? await getCurrentUser(request) : null
  if (jwtUser) {
    return {
      id: jwtUser.userId,
      email: jwtUser.email,
      role: jwtUser.role,
    }
  }

  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    role: (session.user as { role?: string }).role ?? 'USER',
    name: session.user.name,
  }
}
