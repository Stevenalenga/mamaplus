import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        console.log('Payment successful:', event.data)
        // Here you would typically:
        // 1. Update your database
        // 2. Grant access to course
        // 3. Send confirmation email
        // 4. etc.
        break

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data)
        break

      default:
        console.log('Unhandled event type:', event.event)
    }

    return NextResponse.json({ message: 'Webhook received' })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
