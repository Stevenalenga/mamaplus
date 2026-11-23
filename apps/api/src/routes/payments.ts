import { Hono } from 'hono'
import crypto from 'crypto'
import type { AppEnv } from '../types'
import { prisma } from '@mamaplus/database'
import { paystack } from '../lib/paystack'
import { updatePaymentAndEnroll } from '../lib/db-utils'
import { validateKenyanPhoneNumber, formatPhoneNumber } from '../lib/validation'
import { getMinimumAmount } from '../lib/currency'
import { getSiteUrl } from '../lib/site-url'

export const paymentsRouter = new Hono<AppEnv>()

/**
 * POST /api/payments/create
 * Create payment record before initializing with payment gateway
 */
paymentsRouter.post('/api/payments/create', async (c) => {
  try {
    const { userId, courseId, amount, currency, paymentMethod } = await c.req.json()

    if (!userId || !amount || !currency) {
      return c.json(
        { message: 'User ID, amount, and currency are required' },
        400
      )
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        reference,
        amount,
        currency,
        paymentMethod: paymentMethod || 'card',
        status: 'PENDING'
      }
    })

    return c.json({
      success: true,
      data: payment,
      message: 'Payment record created'
    }, 201)
  } catch (error: any) {
    console.error('Create payment error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/payments/confirm
 * Confirm payment and create enrollment
 */
paymentsRouter.post('/api/payments/confirm', async (c) => {
  try {
    const { reference, status, gatewayResponse } = await c.req.json()

    if (!reference || !status) {
      return c.json(
        { message: 'Reference and status are required' },
        400
      )
    }

    const payment = await updatePaymentAndEnroll(
      reference,
      status as 'SUCCESS' | 'FAILED',
      gatewayResponse
    )

    return c.json({
      success: true,
      data: payment,
      message: status === 'SUCCESS' ? 'Payment confirmed and enrollment created' : 'Payment marked as failed'
    })
  } catch (error: any) {
    console.error('Confirm payment error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

paymentsRouter.post('/api/paystack/initialize', async (c) => {
  try {
    const body = await c.req.json()
    const { email, amount, currency, metadata, userId, courseId } = body

    // Validate input
    if (!email || !amount) {
      return c.json(
        { message: 'Email and amount are required' },
        400
      )
    }

    // Initialize payment with Paystack
    const response = await paystack.transaction.initialize({
      email,
      amount,
      currency: currency || 'USD',
      metadata,
      callback_url: `${(process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, '')}/api/paystack/callback`
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

    return c.json({
      success: true,
      data: response.data
    })
  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

/**
 * POST /api/paystack/initialize-cart
 * Initialize a Paystack transaction for a cart of multiple courses.
 * Stores all courseIds in metadata for enrollment after payment.
 */
paymentsRouter.post('/api/paystack/initialize-cart', async (c) => {
  try {
    const { email, name, phone, courseIds, amount, currency, paymentMethod, userId } = await c.req.json()

    if (!email || !amount || !courseIds?.length) {
      return c.json(
        { message: 'Email, amount, and at least one course are required' },
        400
      )
    }

    const reference = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const appUrl = (process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, '')
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

    return c.json({ success: true, data: response.data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Cart payment initialization error:', error)
    return c.json({ message }, 500)
  }
})

paymentsRouter.post('/api/paystack/mobile-money/initialize', async (c) => {
  try {
    const { email, phone_number, amount, provider, currency, metadata, userId, courseId } = await c.req.json()

    // Validate required inputs
    if (!email || !phone_number || !amount) {
      return c.json(
        { message: 'Email, phone number, and amount are required' },
        400
      )
    }

    // Validate provider
    const validProviders = ['mpesa', 'airtel', 'mtn', 'vodafone', 'tigo']
    if (!validProviders.includes(provider?.toLowerCase())) {
      return c.json(
        { message: 'Invalid mobile money provider. Supported: mpesa, airtel, mtn, vodafone, tigo' },
        400
      )
    }

    // Set currency based on provider if not provided
    let paymentCurrency = currency || 'KES'
    if (provider?.toLowerCase() === 'mpesa' || provider?.toLowerCase() === 'airtel') {
      paymentCurrency = 'KES' // Kenya
    } else if (provider?.toLowerCase() === 'mtn' || provider?.toLowerCase() === 'vodafone') {
      paymentCurrency = 'GHS' // Ghana (default for MTN/Vodafone)
    }

    // Format and validate phone number (currently for Kenyan numbers)
    const formattedPhone = formatPhoneNumber(phone_number)
    if (paymentCurrency === 'KES' && !validateKenyanPhoneNumber(formattedPhone)) {
      return c.json(
        { message: 'Invalid phone number format. Use: 254XXXXXXXXX or 07XXXXXXXX' },
        400
      )
    }

    // Validate minimum amount
    const minAmount = getMinimumAmount(paymentCurrency)
    const amountInMajorUnit = amount / 100 // Convert from cents to major unit
    if (amountInMajorUnit < minAmount) {
      return c.json(
        { message: `Minimum amount is ${minAmount} ${paymentCurrency}` },
        400
      )
    }

    // Initialize mobile money payment with Paystack
    const response = await paystack.transaction.initializeMobileMoney({
      email,
      phone_number: formattedPhone,
      amount,
      provider: provider.toLowerCase(),
      currency: paymentCurrency as 'KES' | 'GHS' | 'UGX',
      metadata: {
        ...metadata,
        payment_method: provider.toLowerCase(),
        phone_number: formattedPhone,
      },
      callback_url: `${(process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, '')}/api/paystack/callback`
    })

    // Save payment record to database if userId provided
    if (userId && response.data.reference) {
      await prisma.payment.create({
        data: {
          userId,
          courseId: courseId || null,
          reference: response.data.reference,
          amount: amount / 100, // Convert from cents to main unit
          currency: paymentCurrency,
          status: 'PENDING',
          paymentMethod: provider.toLowerCase(),
          channel: 'mobile_money',
          phoneNumber: formattedPhone,
          metadata: JSON.stringify({
            ...metadata,
            payment_method: provider.toLowerCase(),
            phone_number: formattedPhone
          })
        }
      })
    }

    const instructions: Record<string, string> = {
      mpesa: 'Enter your M-Pesa PIN when prompted on your phone',
      airtel: 'Enter your Airtel Money PIN when prompted on your phone',
    }

    return c.json({
      success: true,
      data: response.data,
      message: `Check your phone for ${provider} payment prompt`,
      instructions: instructions[provider.toLowerCase()] || 'Follow the prompts on your phone to complete payment'
    })
  } catch (error: any) {
    console.error('Mobile money initialization error:', error)

    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error.message?.includes('not enabled')) {
      errorMessage = 'Mobile money payments are not yet enabled. Please contact support.'
    } else if (error.message?.includes('currency')) {
      errorMessage = 'The selected currency is not supported for mobile money payments.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return c.json(
      { message: errorMessage },
      500
    )
  }
})

paymentsRouter.get('/api/paystack/verify', async (c) => {
  try {
    const reference = c.req.query('reference')

    if (!reference) {
      return c.json(
        { message: 'Payment reference is required' },
        400
      )
    }

    // Verify payment with Paystack
    const response = await paystack.transaction.verify(reference)

    console.log(`Verifying payment ${reference}: Status = ${response.data.status}`)

    // Return the full data regardless of status
    // Frontend will handle different statuses appropriately
    return c.json({
      success: true, // API call succeeded
      data: response.data,
      message: response.data.status === 'success'
        ? 'Payment verified successfully'
        : `Payment status: ${response.data.status}`
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})

paymentsRouter.get('/api/paystack/callback', async (c) => {
  const reference = c.req.query('reference')
  const trxref = c.req.query('trxref')

  // Use either reference or trxref
  const paymentReference = reference || trxref

  if (!paymentReference) {
    return c.redirect(`${getSiteUrl()}/test-payment?status=error`)
  }

  // Verify the payment
  try {
    const response = await paystack.transaction.verify(paymentReference)

    if (response.status && response.data.status === 'success') {
      return c.redirect(`${getSiteUrl()}/test-payment?status=success&reference=${encodeURIComponent(paymentReference)}`)
    } else {
      return c.redirect(`${getSiteUrl()}/test-payment?status=failed`)
    }
  } catch (error) {
    console.error('Callback verification error:', error)
    return c.redirect(`${getSiteUrl()}/test-payment?status=error`)
  }
})

/**
 * GET /api/paystack/cart-callback
 * Paystack redirects here after the user completes or cancels payment.
 * Verifies the transaction, updates the payment record, and creates
 * enrollments for every purchased course that exists in the database.
 * Static catalogue courses (id '1'–'5') are noted in metadata only.
 */
paymentsRouter.get('/api/paystack/cart-callback', async (c) => {
  const reference = c.req.query('reference') || c.req.query('trxref')

  if (!reference) {
    return c.redirect(`${getSiteUrl()}/courses?payment=error`)
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

      return c.redirect(`${getSiteUrl()}/courses?payment=failed`)
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

    return c.redirect(`${getSiteUrl()}/courses?payment=success&reference=${reference}`)
  } catch (error) {
    console.error('Cart callback error:', error)
    return c.redirect(`${getSiteUrl()}/courses?payment=error`)
  }
})

paymentsRouter.post('/api/paystack/webhook', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('x-paystack-signature')

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return c.json(
        { message: 'Invalid signature' },
        401
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

    return c.json({ message: 'Webhook received' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return c.json(
      { message: error.message || 'Internal server error' },
      500
    )
  }
})
