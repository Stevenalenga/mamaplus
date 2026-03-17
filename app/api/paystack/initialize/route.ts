import { NextRequest, NextResponse } from 'next/server'
import { paystack, PaystackInitializeParams } from '@/lib/paystack'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, currency, metadata, userId, courseId } = body

    // Validate input
    if (!email || !amount) {
      return NextResponse.json(
        { message: 'Email and amount are required' },
        { status: 400 }
      )
    }

    // Initialize payment with Paystack
    const response = await paystack.transaction.initialize({
      email,
      amount,
      currency: currency || 'USD',
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paystack/callback`
    })

    // Save payment record to database if userId provided
    if (userId && response.data.reference) {
      await prisma.payment.create({
        data: {
          userId,
          courseId: courseId || null,
          reference: response.data.reference,
          amount: amount / 100, // Convert from cents to main unit
          currency: currency || 'USD',
          status: 'PENDING',
          paymentMethod: 'card',
          channel: 'card',
          metadata: JSON.stringify(metadata)
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: response.data
    })

  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
