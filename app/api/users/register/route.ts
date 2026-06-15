import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * POST /api/users/register
 * Register a new user and auto-login with JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phoneNumber } = await request.json()

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

    if (password.length < 8) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      )
    }

    if (name && name.trim().length < 2) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Name must be at least 2 characters long'
        },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Registration failed: User already exists -', email)
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'An account with this email already exists. Please log in instead.'
        },
        { status: 409 }
      )
    }

    console.log('Creating new user:', email)
    const hashedPassword = await hashPassword(password)
    const role = ROLES.PENDING

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true,
        createdAt: true
      }
    })

    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    await setAuthCookie(token)

    console.log('User registered successfully:', email)

    return jsonWithCors(
      request,
      {
        success: true,
        data: {
          user,
          token
        },
        message: 'User registered successfully'
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('User registration error:', error)
    return jsonWithCors(
      request,
      {
        success: false,
        message: error.message || 'An error occurred during registration. Please try again.'
      },
      { status: 500 }
    )
  }
}
