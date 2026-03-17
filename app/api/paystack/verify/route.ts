import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { message: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const response = await paystack.transaction.verify(reference)

    console.log(`Verifying payment ${reference}: Status = ${response.data.status}`)

    // Return the full data regardless of status
    // Frontend will handle different statuses appropriately
    return NextResponse.json({
      success: true, // API call succeeded
      data: response.data,
      message: response.data.status === 'success' 
        ? 'Payment verified successfully'
        : `Payment status: ${response.data.status}`
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
