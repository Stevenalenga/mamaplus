import { prisma } from '@/lib/db'
import { formatPhoneNumber } from '@/lib/validation'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Digits-only international phone (E.164 without +). */
export function normalizePhoneDigits(phone: string): string {
  return String(phone).replace(/\D/g, '')
}

export function isEmailIdentifier(value: string): boolean {
  return value.includes('@')
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email))
}

export function isValidPhoneDigits(phone: string): boolean {
  const digits = normalizePhoneDigits(phone)
  return digits.length >= 10 && digits.length <= 15
}

/** Candidate phone forms for lookup (local 07… and international 254…). */
export function phoneLookupCandidates(phone: string): string[] {
  const digits = normalizePhoneDigits(phone)
  const candidates = new Set<string>()
  if (digits) candidates.add(digits)
  try {
    const formatted = formatPhoneNumber(digits)
    if (formatted) candidates.add(formatted)
  } catch {
    // ignore formatting errors
  }
  if (digits.startsWith('0') && digits.length >= 10) {
    candidates.add('254' + digits.slice(1))
  }
  return Array.from(candidates)
}

/**
 * Resolve a login/register identifier to either email or phone lookup.
 * Values containing @ are treated as email; otherwise as phone digits.
 */
export function parseIdentifier(raw: string):
  | { type: 'email'; email: string }
  | { type: 'phone'; phoneNumber: string }
  | { type: 'invalid'; message: string } {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { type: 'invalid', message: 'Email or phone number is required' }
  }

  if (isEmailIdentifier(trimmed)) {
    const email = normalizeEmail(trimmed)
    if (!isValidEmail(email)) {
      return { type: 'invalid', message: 'Please enter a valid email address' }
    }
    return { type: 'email', email }
  }

  const phoneNumber = normalizePhoneDigits(trimmed)
  if (!isValidPhoneDigits(phoneNumber)) {
    return { type: 'invalid', message: 'Please enter a valid phone number' }
  }
  return { type: 'phone', phoneNumber }
}

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  gender: true,
  phoneNumber: true,
  avatar: true,
  isVerified: true,
} as const

export async function findUserByIdentifier(raw: string) {
  const parsed = parseIdentifier(raw)
  if (parsed.type === 'invalid') {
    return { error: parsed.message as string, user: null }
  }

  if (parsed.type === 'email') {
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: authUserSelect,
    })
    return { error: null, user }
  }

  for (const candidate of phoneLookupCandidates(parsed.phoneNumber)) {
    const user = await prisma.user.findUnique({
      where: { phoneNumber: candidate },
      select: authUserSelect,
    })
    if (user) return { error: null, user }
  }

  return { error: null, user: null }
}

/** Prefer email for JWT/session display; fall back to phone. */
export function userLoginLabel(user: { email: string | null; phoneNumber: string | null }): string {
  return user.email || user.phoneNumber || 'user'
}
