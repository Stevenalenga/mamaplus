import { NextResponse } from 'next/server'
import { createAdminSessionResponse, validateAdminCredentials } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const body = await request.json()
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password.trim() : ''

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  return createAdminSessionResponse(response)
}
