import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'

/**
 * POST /api/users/login
 * Authenticate user and return user data with JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Please enter a valid email address' 
        },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true
      }
    })

    if (!user) {
      console.log('Login failed: User not found -', email)
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid email or password. Please check your credentials and try again.' 
        },
        { status: 401 }
      )
    }

    // Check if password field exists
    if (!user.password) {
      console.error('Login failed: User has no password set -', email)
      return NextResponse.json(
        { 
          success: false,
          message: 'Account error. Please contact support or reset your password.' 
        },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Attempting password verification for user:', email)
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      console.log('Login failed: Invalid password for user -', email)
      // Check if password is stored as plain text (for debugging)
      const isPlainTextMatch = password === user.password
      if (isPlainTextMatch) {
        console.error('⚠️ WARNING: User has plain-text password! User should reset password:', email)
      }
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid email or password. Please check your credentials and try again.' 
        },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', email)

    // Generate JWT token
    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'An error occurred during login. Please try again.' 
      },
      { status: 500 }
    )
  }
}
