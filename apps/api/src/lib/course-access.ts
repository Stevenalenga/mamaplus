import type { JWTPayload } from './auth'
import { hasRole } from './auth'
import { ROLES } from './roles'

export type AuthFailure = {
  status: 401 | 403
  body: { success: false; message: string }
}

export function requireAdminForCourseWrite(currentUser: JWTPayload | null): AuthFailure | null {
  if (!currentUser) {
    return { status: 401, body: { success: false, message: 'Not authenticated' } }
  }

  if (!hasRole(currentUser, ROLES.ADMIN)) {
    return {
      status: 403,
      body: { success: false, message: 'Only administrators can manage courses' },
    }
  }

  return null
}
