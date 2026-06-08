import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTokenEdge } from '@/lib/auth'

async function verifyGoogleIdToken(idToken: string) {
  // Use Google's tokeninfo endpoint for simplicity
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  if (!res.ok) return null
  const data = await res.json()
  return {
    email: data.email,
    name: data.name || null,
    avatar: data.picture || null
  }
}

async function verifyMicrosoftAccessToken(accessToken: string) {
  // Use Microsoft Graph to get user profile
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  return {
    email: data.mail || data.userPrincipalName,
    name: data.displayName || null,
    avatar: null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, idToken, accessToken } = body as {
      provider: string
      idToken?: string
      accessToken?: string
    }

    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider is required' }, { status: 400 })
    }

    let profile: { email: string; name?: string | null; avatar?: string | null } | null = null

    if (provider === 'google') {
      if (!idToken) return NextResponse.json({ success: false, message: 'idToken required for Google' }, { status: 400 })
      profile = await verifyGoogleIdToken(idToken)
    } else if (provider === 'microsoft') {
      if (!accessToken) return NextResponse.json({ success: false, message: 'accessToken required for Microsoft' }, { status: 400 })
      profile = await verifyMicrosoftAccessToken(accessToken)
    } else {
      return NextResponse.json({ success: false, message: 'Unsupported provider' }, { status: 400 })
    }

    if (!profile || !profile.email) {
      return NextResponse.json({ success: false, message: 'Failed to verify provider token' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: profile.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name || 'OAuth User',
          password: '',
          role: 'PENDING',
          isVerified: true,
          avatar: profile.avatar || null
        }
      })
    }

    const token = await generateTokenEdge({ userId: user.id, email: user.email, role: user.role })

    return NextResponse.json({ success: true, data: { user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, isVerified: user.isVerified }, token } })
  } catch (error: any) {
    console.error('Social auth error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}
