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

    // Check if payment was successful
    if (response.data.status === 'success') {
      // Here you can save the payment details to your database
      console.log('Payment verified successfully:', response.data)
      
      return NextResponse.json({
        success: true,
        data: response.data,
        message: 'Payment verified successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment was not successful',
        data: response.data
      })
    }

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
