import Constants from 'expo-constants'
import { Platform } from 'react-native'

function getDefaultApiUrl(): string {
  switch (Platform.OS) {
    case 'android':
      return 'http://10.0.2.2:3000'
    case 'web':
    case 'ios':
    default:
      return 'http://localhost:3000'
  }
}

function normalizeApiUrlForPlatform(url: string): string {
  const trimmed = url.replace(/\/$/, '')

  if (Platform.OS === 'web') {
    return trimmed
      .replace('10.0.2.2', 'localhost')
      .replace('127.0.0.1', 'localhost')
  }

  if (Platform.OS === 'android') {
    return trimmed
      .replace('localhost', '10.0.2.2')
      .replace('127.0.0.1', '10.0.2.2')
  }

  return trimmed
}

function resolveApiBaseUrl(): string {
  const configured = (
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL
  )?.trim()

  const base = configured || getDefaultApiUrl()
  return normalizeApiUrlForPlatform(base)
}

export const API_BASE_URL = resolveApiBaseUrl()

if (__DEV__) {
  console.info('[MamaPlus] API_BASE_URL:', API_BASE_URL, '| platform:', Platform.OS)
}

export const AUTH_STORAGE_KEY = 'mamaplus_auth'

export function getOAuthExtra() {
  return (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>
}

export function isGoogleAuthConfigured() {
  const extra = getOAuthExtra()
  const clientId = extra.expoGoogleClientId?.trim()
  const webClientId = extra.expoGoogleWebClientId?.trim()

  if (Platform.OS === 'web') {
    return Boolean(webClientId)
  }

  return Boolean(clientId || webClientId)
}

export function isMicrosoftAuthConfigured() {
  return Boolean(getOAuthExtra().expoMicrosoftClientId?.trim())
}

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
