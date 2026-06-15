import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * POST /api/users/login
 * Authenticate user and return user data with JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Please enter a valid email address'
        },
        { status: 400 }
      )
    }

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
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Invalid email or password. Please check your credentials and try again.'
        },
        { status: 401 }
      )
    }

    if (!user.password) {
      console.error('Login failed: User has no password set -', email)
      return jsonWithCors(
        request,
        {
          success: false,
          message:
            'This account uses Google or Microsoft sign-in. Please use those options on the login screen.'
        },
        { status: 401 }
      )
    }

    console.log('Attempting password verification for user:', email)
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      console.log('Login failed: Invalid password for user -', email)
      const isPlainTextMatch = password === user.password
      if (isPlainTextMatch) {
        console.error('⚠️ WARNING: User has plain-text password! User should reset password:', email)
      }
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Invalid email or password. Please check your credentials and try again.'
        },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', email)

    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    await setAuthCookie(token)

    const { password: _, ...userWithoutPassword } = user

    return jsonWithCors(request, {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return jsonWithCors(
      request,
      {
        success: false,
        message: error.message || 'An error occurred during login. Please try again.'
      },
      { status: 500 }
    )
  }
}
