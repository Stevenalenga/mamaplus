import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const ADMIN_SESSION_COOKIE = 'mamaplus_admin_session'
export const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || 'mamaplus-admin-token'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mamaplus.co.ke'
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

export function validateAdminCredentials(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_TOKEN
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  }
}

export function createAdminSessionResponse(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: ADMIN_SESSION_TOKEN,
    ...getSessionCookieOptions(),
    maxAge: 60 * 60 * 24,
  })
  return response
}

export function clearAdminSessionResponse(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
  return response
}
