'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  phoneNumber: string | null
  avatar: string | null
  isVerified: boolean
  _count?: {
    enrollments: number
    payments: number
    reviews: number
  }
}

interface UseCurrentUserReturn {
  user: User | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCurrentUser(): UseCurrentUserReturn {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const isLoading = status === 'loading'
  const error = status === 'unauthenticated' ? 'Not authenticated' : null

  // Convert NextAuth session user to our User type
  const user: User | null = session?.user ? {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name || null,
    role: (session.user as any).role || 'USER',
    phoneNumber: (session.user as any).phoneNumber || null,
    avatar: (session.user as any).avatar || session.user.image || null,
    isVerified: (session.user as any).isVerified || false,
    _count: (session.user as any)._count
  } : null

  // Refetch session
  const refetch = () => {
    update()
  }

  return {
    user,
    isLoading,
    error,
    refetch
  }
}
