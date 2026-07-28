import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'
import { findUserByIdentifier, userLoginLabel } from '@/lib/user-identity'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * POST /api/users/login
 * Authenticate with email or phone number + password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const identifier = String(body.email || body.phoneNumber || body.identifier || '').trim()
    const password = body.password

    if (!identifier || !password) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Email or phone number, and password are required',
        },
        { status: 400 }
      )
    }

    const { error, user } = await findUserByIdentifier(identifier)

    if (error) {
      return jsonWithCors(
        request,
        { success: false, message: error },
        { status: 400 }
      )
    }

    if (!user) {
      return jsonWithCors(
        request,
        {
          success: false,
          message:
            'Invalid email/phone or password. Please check your credentials and try again.',
        },
        { status: 401 }
      )
    }

    if (!user.password) {
      return jsonWithCors(
        request,
        {
          success: false,
          message:
            'This account uses Google or Microsoft sign-in. Please use those options on the login screen.',
        },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return jsonWithCors(
        request,
        {
          success: false,
          message:
            'Invalid email/phone or password. Please check your credentials and try again.',
        },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', userLoginLabel(user))

    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email ?? user.phoneNumber ?? '',
      role: user.role,
    })

    await setAuthCookie(token)

    const { password: _, ...userWithoutPassword } = user

    return jsonWithCors(request, {
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Login successful',
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return jsonWithCors(
      request,
      {
        success: false,
        message: error.message || 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    )
  }
}
