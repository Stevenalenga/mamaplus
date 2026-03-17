import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

/**
 * POST /api/users/logout
 * Logout user by clearing auth cookie
 */
export async function POST() {
  try {
    // Clear auth cookie
    await clearAuthCookie()

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    })
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
