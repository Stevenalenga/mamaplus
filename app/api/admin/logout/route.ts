import { NextResponse } from 'next/server'
import { clearAdminSessionResponse } from '@/lib/admin-auth'
import { getAbsoluteUrl } from '@/lib/site-url'

function logoutResponse(request: Request, redirect = false) {
  if (redirect) {
    const response = NextResponse.redirect(getAbsoluteUrl('/admin/login', request))
    return clearAdminSessionResponse(response)
  }

  const response = NextResponse.json({ success: true })
  return clearAdminSessionResponse(response)
}

export async function GET(request: Request) {
  return logoutResponse(request, true)
}

export async function POST() {
  const response = NextResponse.json({ success: true })
  return clearAdminSessionResponse(response)
}
