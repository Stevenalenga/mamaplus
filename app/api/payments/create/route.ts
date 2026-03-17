import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * POST /api/payments/create
 * Create payment record before initializing with payment gateway
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, courseId, amount, currency, paymentMethod } = await request.json()

    if (!userId || !amount || !currency) {
      return NextResponse.json(
        { message: 'User ID, amount, and currency are required' },
        { status: 400 }
      )
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        reference,
        amount,
        currency,
        paymentMethod: paymentMethod || 'card',
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment record created'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
