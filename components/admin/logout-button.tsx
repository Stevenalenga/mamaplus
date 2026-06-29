'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Still send the user to login even if the request fails.
    }

    router.push('/admin/login')
    router.refresh()
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={loading}>
      {loading ? 'Signing out...' : 'Logout'}
    </Button>
  )
}
