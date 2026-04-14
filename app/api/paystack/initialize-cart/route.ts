import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack'
import { prisma } from '@/lib/db'

/**
 * POST /api/paystack/initialize-cart
 * Initialize a Paystack transaction for a cart of multiple courses.
 * Stores all courseIds in metadata for enrollment after payment.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, courseIds, amount, currency, paymentMethod, userId } = await request.json()

    if (!email || !amount || !courseIds?.length) {
      return NextResponse.json(
        { message: 'Email, amount, and at least one course are required' },
        { status: 400 }
      )
    }

    const reference = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const paystackAmount = Math.round(amount * 100) // convert to smallest currency unit

    const channels: ('card' | 'mobile_money')[] =
      paymentMethod === 'card' ? ['card'] : ['mobile_money']

    const metadata: Record<string, unknown> = {
      cartPurchase: true,
      courseIds,
      userId: userId ?? null,
      customerName: name ?? '',
      phone_number: phone ?? '',
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: name ?? '' },
        { display_name: 'Courses', variable_name: 'course_ids', value: courseIds.join(', ') },
      ],
    }

    if (paymentMethod !== 'card') {
      metadata.payment_method = paymentMethod === 'mpesa' ? 'mpesa' : 'airtel'
    }

    const response = await paystack.transaction.initialize({
      email,
      amount: paystackAmount,
      currency: currency || 'KES',
      reference,
      callback_url: `${appUrl}/api/paystack/cart-callback`,
      channels,
      metadata,
    })

    // Persist a PENDING payment record tied to the user
    if (userId) {
      await prisma.payment.create({
        data: {
          userId,
          courseId: null,
          reference,
          amount,
          currency: currency || 'KES',
          status: 'PENDING',
          paymentMethod: paymentMethod || 'card',
          phoneNumber: phone ?? null,
          metadata: JSON.stringify(metadata),
        },
      })
    }

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Cart payment initialization error:', error)
    return NextResponse.json({ message }, { status: 500 })
  }
}
