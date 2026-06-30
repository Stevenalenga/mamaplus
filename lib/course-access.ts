import { NextResponse } from 'next/server'
import { JWTPayload, hasRole } from '@/lib/auth'
import { ROLES } from '@/lib/roles'

export function requireAdminForCourseWrite(currentUser: JWTPayload | null) {
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  if (!hasRole(currentUser, ROLES.ADMIN)) {
    return NextResponse.json(
      { success: false, message: 'Only administrators can manage courses' },
      { status: 403 }
    )
  }

  return null
}
