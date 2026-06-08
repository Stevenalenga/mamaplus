import Constants from 'expo-constants'

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  'http://10.0.2.2:3000'

export const AUTH_STORAGE_KEY = 'mamaplus_auth'

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  PENDING: 'New User',
  USER: 'Caregiver',
  AGENCY: 'Agency',
  INSTRUCTOR: 'Educator',
  ADMIN_ASSISTANT: 'Admin Assistant',
  ADMIN: 'Administrator'
}

export const ROLE_DASHBOARD_LABELS: Record<string, string> = {
  PENDING: 'Complete onboarding to unlock the portal.',
  USER: 'Browse courses, enroll, and track progress.',
  AGENCY: 'Manage caregivers and agency details.',
  INSTRUCTOR: 'Manage your courses and learners.',
  ADMIN_ASSISTANT: 'Support administrators and manage requests.',
  ADMIN: 'Access full admin controls.'
}
