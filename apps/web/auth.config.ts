import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import AzureAD from 'next-auth/providers/azure-ad'

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')
}

type ApiUser = {
  id: string
  email?: string | null
  name?: string | null
  role?: string
  gender?: string | null
  phoneNumber?: string | null
  avatar?: string | null
  isVerified?: boolean
}

async function loginWithApi(identifier: string, password: string) {
  const response = await fetch(`${apiBase()}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identifier, password }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success || !data?.data?.token) return null
  return data.data as { user: ApiUser; token: string }
}

async function exchangeSocial(
  provider: 'google' | 'microsoft',
  tokens: { idToken?: string; accessToken?: string }
) {
  const response = await fetch(`${apiBase()}/api/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, ...tokens }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.success || !data?.data?.token) return null
  return data.data as { user: ApiUser; token: string }
}

function applyApiUser(user: { id?: string; email?: string | null; name?: string | null }, result: { user: ApiUser; token: string }) {
  const apiUser = result.user
  user.id = apiUser.id
  user.email = apiUser.email || user.email
  user.name = apiUser.name || user.name
  const target = user as typeof user & {
    role?: string
    gender?: string | null
    phoneNumber?: string | null
    avatar?: string | null
    isVerified?: boolean
    accessToken?: string
  }
  target.role = apiUser.role || 'PENDING'
  target.gender = apiUser.gender ?? null
  target.phoneNumber = apiUser.phoneNumber ?? null
  target.avatar = apiUser.avatar ?? null
  target.isVerified = apiUser.isVerified ?? true
  target.accessToken = result.token
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing identifier or password')
          return null
        }

        const identifier = credentials.email as string
        const password = credentials.password as string

        try {
          const result = await loginWithApi(identifier, password)
          if (!result) {
            console.log('API login failed for:', identifier)
            return null
          }

          console.log('Login successful:', result.user.email || identifier)

          return {
            id: result.user.id,
            email: result.user.email ?? identifier,
            name: result.user.name,
            role: result.user.role || 'PENDING',
            gender: result.user.gender,
            phoneNumber: result.user.phoneNumber,
            avatar: result.user.avatar,
            isVerified: result.user.isVerified ?? false,
            accessToken: result.token,
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          if (!account.id_token) {
            console.error('Google sign-in did not include an id token')
            return false
          }
          const result = await exchangeSocial('google', { idToken: account.id_token })
          if (!result) return false
          applyApiUser(user, result)
          return true
        } catch (error) {
          console.error('Error in Google sign-in:', error)
          return false
        }
      }

      if (account?.provider === 'azure-ad') {
        try {
          if (!account.access_token) {
            console.error('Microsoft sign-in did not include an access token')
            return false
          }
          const result = await exchangeSocial('microsoft', { accessToken: account.access_token })
          if (!result) return false
          applyApiUser(user, result)
          return true
        } catch (error) {
          console.error('Error in Microsoft sign-in:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as { role?: string }).role
        token.gender = (user as { gender?: string | null }).gender ?? null
        token.phoneNumber = (user as { phoneNumber?: string | null }).phoneNumber
        token.avatar = (user as { avatar?: string | null }).avatar
        token.isVerified = (user as { isVerified?: boolean }).isVerified
        token.accessToken = (user as { accessToken?: string }).accessToken
      }

      if (trigger === 'update' && token.accessToken) {
        try {
          const response = await fetch(`${apiBase()}/api/users/me`, {
            headers: { Authorization: `Bearer ${token.accessToken}` },
            cache: 'no-store',
          })
          const data = await response.json().catch(() => null)
          const profile = data?.data || data?.user
          if (response.ok && profile) {
            token.role = profile.role ?? token.role
            token.gender = profile.gender ?? null
            token.name = profile.name ?? token.name
            token.avatar = profile.avatar ?? token.avatar
            token.phoneNumber = profile.phoneNumber ?? token.phoneNumber
          }
        } catch (error) {
          console.error('Failed to refresh session from API:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.gender = (token.gender as string | null) ?? null
        session.user.phoneNumber = (token.phoneNumber as string | null) ?? null
        session.user.avatar = (token.avatar as string | null) ?? null
        session.user.isVerified = Boolean(token.isVerified)
        session.accessToken = token.accessToken as string | undefined
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  basePath: '/api/auth',
  trustHost: true,
}
