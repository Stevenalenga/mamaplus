import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/db-utils'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password')
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              gender: true,
              phoneNumber: true,
              avatar: true,
              isVerified: true
            }
          })

          if (!user) {
            console.log('User not found:', email)
            return null
          }

          // Verify password
          const isValidPassword = await verifyPassword(password, user.password)

          if (!isValidPassword) {
            console.log('Invalid password for user:', email)
            return null
          }

          console.log('Login successful:', email)

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            gender: user.gender,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            isVerified: user.isVerified
          }
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.gender = (user as any).gender ?? null
        token.phoneNumber = (user as any).phoneNumber
        token.avatar = (user as any).avatar
        token.isVerified = (user as any).isVerified
      }
      // Re-fetch role and gender from DB when session is updated (e.g. after onboarding)
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, gender: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.gender = dbUser.gender ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        ;(session.user as any).role = token.role
        ;(session.user as any).gender = token.gender
        ;(session.user as any).phoneNumber = token.phoneNumber
        ;(session.user as any).avatar = token.avatar
        ;(session.user as any).isVerified = token.isVerified
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
}
