// Role constants used throughout the application
export const ROLES = {
  USER: 'USER',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN_ASSISTANT: 'ADMIN_ASSISTANT',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Roles that users can self-select at signup
export const SELF_REGISTERABLE_ROLES: Role[] = [ROLES.USER, ROLES.INSTRUCTOR]

// Human-readable display names for each role
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [ROLES.USER]: 'Student / Caregiver',
  [ROLES.INSTRUCTOR]: 'Teacher / Educator',
  [ROLES.ADMIN_ASSISTANT]: 'Admin Assistant',
  [ROLES.ADMIN]: 'Administrator',
}

// Dashboard path for each role
export const ROLE_DASHBOARD: Record<Role, string> = {
  [ROLES.USER]: '/dashboard/user',
  [ROLES.INSTRUCTOR]: '/dashboard/educator',
  [ROLES.ADMIN_ASSISTANT]: '/dashboard/admin-assistant',
  [ROLES.ADMIN]: '/dashboard/admin',
}

// Badge color classes for each role
export const ROLE_BADGE_COLORS: Record<Role, string> = {
  [ROLES.USER]: 'bg-blue-100 text-blue-800',
  [ROLES.INSTRUCTOR]: 'bg-emerald-100 text-emerald-800',
  [ROLES.ADMIN_ASSISTANT]: 'bg-amber-100 text-amber-800',
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
}

/** Get dashboard path for a role string, defaulting to /dashboard/user */
export function getDashboardForRole(role: string | undefined): string {
  return ROLE_DASHBOARD[role as Role] || ROLE_DASHBOARD[ROLES.USER]
}

/** Get human-readable display name for a role string */
export function getRoleDisplayName(role: string | undefined): string {
  return ROLE_DISPLAY_NAMES[role as Role] || 'User'
}

/** Get badge color classes for a role string */
export function getRoleBadgeColor(role: string | undefined): string {
  return ROLE_BADGE_COLORS[role as Role] || ROLE_BADGE_COLORS[ROLES.USER]
}

/** Check if a role string is valid for self-registration */
export function isValidSelfRegisterRole(role: string): boolean {
  return SELF_REGISTERABLE_ROLES.includes(role as Role)
}
