import { NextResponse } from 'next/server'
import { clearAdminSessionResponse } from '@/lib/admin-auth'

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url))
  return clearAdminSessionResponse(response)
}
