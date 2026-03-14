import { NextRequest, NextResponse } from 'next/server'
import { paystack, PaystackInitializeParams } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, currency, metadata } = body

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
