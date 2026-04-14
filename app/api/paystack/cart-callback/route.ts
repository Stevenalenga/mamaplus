import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack'
import { prisma } from '@/lib/db'

/**
 * GET /api/paystack/cart-callback
 * Paystack redirects here after the user completes or cancels payment.
 * Verifies the transaction, updates the payment record, and creates
 * enrollments for every purchased course that exists in the database.
 * Static catalogue courses (id '1'–'5') are noted in metadata only.
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { searchParams } = request.nextUrl
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  if (!reference) {
    return NextResponse.redirect(new URL('/courses?payment=error', appUrl))
  }

  try {
    const verification = await paystack.transaction.verify(reference)

    if (!verification.status || verification.data.status !== 'success') {
      // Mark payment failed if record exists
      await prisma.payment
        .update({
          where: { reference },
          data: {
            status: 'FAILED',
            gatewayResponse: verification.data?.gateway_response ?? 'Payment not successful',
          },
        })
        .catch(() => {
          // Record may not exist (anonymous checkout) — ignore
        })

      return NextResponse.redirect(new URL('/courses?payment=failed', appUrl))
    }

    // Payment was successful — update payment record
    const payment = await prisma.payment
      .update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
          gatewayResponse: verification.data.gateway_response,
        },
      })
      .catch(() => null) // May not exist for anonymous users

    // Create enrollments for each DB course purchased
    if (payment?.userId) {
      const raw = verification.data.metadata
      const courseIds: string[] =
        (raw as Record<string, unknown>)?.courseIds instanceof Array
          ? ((raw as Record<string, unknown>).courseIds as string[])
          : payment.metadata
          ? (JSON.parse(payment.metadata)?.courseIds ?? [])
          : []

      for (const courseId of courseIds) {
        const courseExists = await prisma.course.findUnique({ where: { id: courseId } })
        if (courseExists) {
          await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: payment.userId, courseId } },
            update: { status: 'ACTIVE' },
            create: { userId: payment.userId, courseId, status: 'ACTIVE' },
          })
        }
        // Static courses (id '1'–'5') are not in the DB — admin enrolls manually
      }
    }

    return NextResponse.redirect(
      new URL(`/courses?payment=success&reference=${reference}`, appUrl)
    )
  } catch (error) {
    console.error('Cart callback error:', error)
    return NextResponse.redirect(new URL('/courses?payment=error', appUrl))
  }
}
