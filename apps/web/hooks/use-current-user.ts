'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  gender: string | null
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

  // Memoize by primitive values so the object reference stays stable across
  // session polls, preventing useEffect deps from firing on every poll.
  const user: User | null = useMemo(() => {
    if (!session?.user) return null
    return {
      id: session.user.id as string,
      email: session.user.email as string,
      name: session.user.name || null,
      role: (session.user as any).role || 'PENDING',
      gender: (session.user as any).gender || null,
      phoneNumber: (session.user as any).phoneNumber || null,
      avatar: (session.user as any).avatar || session.user.image || null,
      isVerified: (session.user as any).isVerified || false,
      _count: (session.user as any)._count,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.user?.id,
    session?.user?.email,
    session?.user?.name,
    (session?.user as any)?.role,
    (session?.user as any)?.avatar,
    session?.user?.image,
    (session?.user as any)?.isVerified,
  ])

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
