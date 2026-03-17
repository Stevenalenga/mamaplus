import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack'
import { validateKenyanPhoneNumber, formatPhoneNumber } from '@/lib/validation'
import { getMinimumAmount } from '@/lib/currency'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, phone_number, amount, provider, currency, metadata, userId, courseId } = await request.json()

    // Validate required inputs
    if (!email || !phone_number || !amount) {
      return NextResponse.json(
        { message: 'Email, phone number, and amount are required' },
        { status: 400 }
      )
    }

    // Validate provider
    const validProviders = ['mpesa', 'airtel', 'mtn', 'vodafone', 'tigo']
    if (!validProviders.includes(provider?.toLowerCase())) {
      return NextResponse.json(
        { message: 'Invalid mobile money provider. Supported: mpesa, airtel, mtn, vodafone, tigo' },
        { status: 400 }
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
      return NextResponse.json(
        { message: 'Invalid phone number format. Use: 254XXXXXXXXX or 07XXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate minimum amount
    const minAmount = getMinimumAmount(paymentCurrency)
    const amountInMajorUnit = amount / 100 // Convert from cents to major unit
    if (amountInMajorUnit < minAmount) {
      return NextResponse.json(
        { message: `Minimum amount is ${minAmount} ${paymentCurrency}` },
        { status: 400 }
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
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/paystack/callback`
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

    return NextResponse.json({
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

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    )
  }
}
