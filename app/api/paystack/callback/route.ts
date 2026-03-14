import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get('reference')
  const trxref = searchParams.get('trxref')

  // Use either reference or trxref
  const paymentReference = reference || trxref

  if (!paymentReference) {
    return NextResponse.redirect(new URL('/test-payment?status=error', request.url))
  }

  // Verify the payment
  try {
    const response = await paystack.transaction.verify(paymentReference)

    if (response.status && response.data.status === 'success') {
      return NextResponse.redirect(
        new URL(`/test-payment?status=success&reference=${paymentReference}`, request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL('/test-payment?status=failed', request.url)
      )
    }
  } catch (error) {
    console.error('Callback verification error:', error)
    return NextResponse.redirect(new URL('/test-payment?status=error', request.url))
  }
}
