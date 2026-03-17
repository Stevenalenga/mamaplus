import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { updatePaymentAndEnroll } from '@/lib/db-utils'

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
        const channel = event.data.channel
        const paymentMethod = event.data.metadata?.payment_method
        
        if (channel === 'mobile_money') {
          console.log(`Mobile money payment successful via ${paymentMethod}`)
          console.log('Phone number:', event.data.metadata?.phone_number)
        }
        
        // Update payment in database and create enrollment
        try {
          await updatePaymentAndEnroll(
            event.data.reference,
            'SUCCESS',
            event.data.gateway_response
          )
          console.log('Payment confirmed and enrollment created:', event.data.reference)
        } catch (dbError) {
          console.error('Database update error:', dbError)
          // Continue to prevent duplicate webhook calls, but log the error
        }
        
        break

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data)
        const failedChannel = event.data.channel
        
        if (failedChannel === 'mobile_money') {
          console.log('Mobile money payment failed')
          console.log('Failure reason:', event.data.gateway_response)
        }
        
        // Update payment status to failed
        try {
          await updatePaymentAndEnroll(
            event.data.reference,
            'FAILED',
            event.data.gateway_response
          )
        } catch (dbError) {
          console.error('Database update error:', dbError)
        }
        
        break

      case 'charge.pending':
        // Payment is pending (common for mobile money)
        console.log('Payment pending:', event.data)
        
        if (event.data.channel === 'mobile_money') {
          console.log('Mobile money payment pending - waiting for user to complete on phone')
          // Status is already PENDING in database, no update needed
        }
        break

      case 'transfer.success':
        // For refunds or payouts
        console.log('Transfer successful:', event.data)
        break

      case 'transfer.failed':
        // Transfer/refund failed
        console.log('Transfer failed:', event.data)
        break

      default:
        console.log('Unhandled event type:', event.event)
        console.log('Event data:', event.data)
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
