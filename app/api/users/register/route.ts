import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/db-utils'
import { generateTokenEdge, setAuthCookie } from '@/lib/auth'
import { ROLES } from '@/lib/roles'
import { handleCorsPreflight, jsonWithCors } from '@/lib/api-cors'
import {
  isValidEmail,
  isValidPhoneDigits,
  normalizeEmail,
  normalizePhoneDigits,
  userLoginLabel,
} from '@/lib/user-identity'

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request) ?? new NextResponse(null, { status: 204 })
}

/**
 * POST /api/users/register
 * Register with email and/or phone (at least one required). Both are unique.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phoneNumber } = await request.json()

    if (!password) {
      return jsonWithCors(
        request,
        { success: false, message: 'Password is required' },
        { status: 400 }
      )
    }

    const rawEmail = typeof email === 'string' ? email.trim() : ''
    const rawPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : ''

    if (!rawEmail && !rawPhone) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Please provide an email address or a phone number',
        },
        { status: 400 }
      )
    }

    let normalizedEmail: string | null = null
    let normalizedPhone: string | null = null

    if (rawEmail) {
      if (!isValidEmail(rawEmail)) {
        return jsonWithCors(
          request,
          { success: false, message: 'Please enter a valid email address' },
          { status: 400 }
        )
      }
      normalizedEmail = normalizeEmail(rawEmail)
    }

    if (rawPhone) {
      normalizedPhone = normalizePhoneDigits(rawPhone)
      if (!isValidPhoneDigits(normalizedPhone)) {
        return jsonWithCors(
          request,
          { success: false, message: 'Please enter a valid phone number' },
          { status: 400 }
        )
      }
    }

    if (password.length < 8) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      )
    }

    if (name && name.trim().length < 2) {
      return jsonWithCors(
        request,
        {
          success: false,
          message: 'Name must be at least 2 characters long',
        },
        { status: 400 }
      )
    }

    if (normalizedEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
      if (existingEmail) {
        return jsonWithCors(
          request,
          {
            success: false,
            message: 'An account with this email already exists. Please log in instead.',
          },
          { status: 409 }
        )
      }
    }

    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: normalizedPhone },
      })
      if (existingPhone) {
        return jsonWithCors(
          request,
          {
            success: false,
            message:
              'An account with this phone number already exists. Please log in instead.',
          },
          { status: 409 }
        )
      }
    }

    const hashedPassword = await hashPassword(password)
    const role = ROLES.PENDING

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        phoneNumber: normalizedPhone,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phoneNumber: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    })

    const token = await generateTokenEdge({
      userId: user.id,
      email: user.email ?? user.phoneNumber ?? '',
      role: user.role,
    })

    await setAuthCookie(token)

    console.log('User registered successfully:', userLoginLabel(user))

    return jsonWithCors(
      request,
      {
        success: true,
        data: {
          user,
          token,
        },
        message: 'User registered successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('User registration error:', error)

    if (error?.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target || '')
      const isPhone = target.includes('phoneNumber')
      return jsonWithCors(
        request,
        {
          success: false,
          message: isPhone
            ? 'An account with this phone number already exists. Please log in instead.'
            : 'An account with this email already exists. Please log in instead.',
        },
        { status: 409 }
      )
    }

    return jsonWithCors(
      request,
      {
        success: false,
        message:
          error.message ||
          'An error occurred during registration. Please try again.',
      },
      { status: 500 }
    )
  }
}
