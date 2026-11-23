// Role constants used throughout the application
export const ROLES = {
  PENDING: 'PENDING',
  USER: 'USER',
  AGENCY: 'AGENCY',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN_ASSISTANT: 'ADMIN_ASSISTANT',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Human-readable display names for each role
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [ROLES.PENDING]: 'New User',
  [ROLES.USER]: 'Caregiver',
  [ROLES.AGENCY]: 'Agency',
  [ROLES.INSTRUCTOR]: 'Educator',
  [ROLES.ADMIN_ASSISTANT]: 'Admin Assistant',
  [ROLES.ADMIN]: 'Administrator',
}

// Dashboard path for each role
export const ROLE_DASHBOARD: Record<Role, string> = {
  [ROLES.PENDING]: '/onboarding',
  [ROLES.USER]: '/dashboard/user',
  [ROLES.AGENCY]: '/dashboard/agency',
  [ROLES.INSTRUCTOR]: '/dashboard/educator',
  [ROLES.ADMIN_ASSISTANT]: '/dashboard/admin-assistant',
  [ROLES.ADMIN]: '/dashboard/admin',
}

// Badge color classes for each role
export const ROLE_BADGE_COLORS: Record<Role, string> = {
  [ROLES.PENDING]: 'bg-gray-100 text-gray-800',
  [ROLES.USER]: 'bg-blue-100 text-blue-800',
  [ROLES.AGENCY]: 'bg-orange-100 text-orange-800',
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

/** Check if a role is considered fully onboarded (not PENDING) */
export function isOnboarded(role: string | undefined): boolean {
  return !!role && role !== ROLES.PENDING
}
