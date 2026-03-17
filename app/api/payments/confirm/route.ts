import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { updatePaymentAndEnroll } from '@/lib/db-utils'

/**
 * POST /api/payments/confirm
 * Confirm payment and create enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const { reference, status, gatewayResponse } = await request.json()

    if (!reference || !status) {
      return NextResponse.json(
        { message: 'Reference and status are required' },
        { status: 400 }
      )
    }

    const payment = await updatePaymentAndEnroll(
      reference,
      status as 'SUCCESS' | 'FAILED',
      gatewayResponse
    )

    return NextResponse.json({
      success: true,
      data: payment,
      message: status === 'SUCCESS' ? 'Payment confirmed and enrollment created' : 'Payment marked as failed'
    })

  } catch (error: any) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
