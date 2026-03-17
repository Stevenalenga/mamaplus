import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'

/**
 * POST /api/users/register
 * Register a new user and auto-login with JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phoneNumber } = await request.json()

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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      )
    }

    // Validate name if provided
    if (name && name.trim().length < 2) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Name must be at least 2 characters long' 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Registration failed: User already exists -', email)
      return NextResponse.json(
        { 
          success: false,
          message: 'An account with this email already exists. Please log in instead.' 
        },
        { status: 409 }
      )
    }

    // Hash password
    console.log('Creating new user:', email)
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        role: 'USER'
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

    // Generate JWT token for auto-login
    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Set auth cookie
    await setAuthCookie(token)

    console.log('User registered successfully:', email)

    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('User registration error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'An error occurred during registration. Please try again.' 
      },
      { status: 500 }
    )
  }
}
