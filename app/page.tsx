'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return

    // If authenticated, redirect to appropriate dashboard
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role
      if (userRole === 'ADMIN') {
        window.location.href = '/dashboard/admin'
      } else {
        window.location.href = '/dashboard/user'
      }
    } else if (status === 'unauthenticated') {
      // Not authenticated, redirect to login
      window.location.href = '/login'
    }
  }, [session, status])

  // Show loading while checking session
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

