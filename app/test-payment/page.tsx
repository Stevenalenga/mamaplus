'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import Link from 'next/link'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function TestPaymentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    amount: '',
    courseName: 'Introduction to Caregiving',
    currency: 'USD'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Check if we're in live mode
  const isLiveMode = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.startsWith('pk_live')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const initializePayment = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Validate form
      if (!formData.email || !formData.amount) {
        setMessage({ type: 'error', text: 'Please fill in all fields' })
        setLoading(false)
        return
      }

      const amountInKobo = parseFloat(formData.amount) * 100 // Convert to cents (smallest currency unit)

      if (amountInKobo < 100) {
        setMessage({ type: 'error', text: 'Amount must be at least $1 USD' })
        setLoading(false)
        return
      }

      // Initialize payment with backend
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: amountInKobo,
          currency: formData.currency,
          metadata: {
            courseName: formData.courseName,
            custom_fields: []
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize payment')
      }

      // Load Paystack inline script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)
        
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Paystack popup
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: amountInKobo,
        currency: formData.currency,
        ref: data.data.reference,
        metadata: {
          courseName: formData.courseName
        },
        onClose: function() {
          setMessage({ type: 'error', text: 'Payment cancelled' })
          setLoading(false)
        },
        callback: function(response: any) {
          verifyPayment(response.reference)
        }
      })

      handler.openIframe()
      setLoading(false)

    } catch (error: any) {
      console.error('Payment initialization error:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to initialize payment' })
      setLoading(false)
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/paystack/verify?reference=${reference}`)
      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Payment successful! Reference: ${reference}` 
        })
        // Clear form
        setFormData({ email: '', amount: '', courseName: 'Introduction to Caregiving', currency: 'USD' })
      } else {
        setMessage({ type: 'error', text: 'Payment verification failed' })
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setMessage({ type: 'error', text: 'Failed to verify payment' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="p-8 shadow-lg">
          {isLiveMode && (
            <Alert className="mb-6 bg-orange-50 text-orange-800 border-orange-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">🟢 LIVE MODE - Real payments will be processed!</span>
              </div>
            </Alert>
          )}
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">{isLiveMode ? 'Payment' : 'Test Payment'}</h1>
            <p className="text-muted-foreground">
              {isLiveMode ? 'Make a payment using real money' : 'Test Paystack integration - No real charges'}
            </p>
          </div>

          {message && (
            <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              {message.text}
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Course Name</label>
              <Input
                type="text"
                name="courseName"
                placeholder="Course name"
                value={formData.courseName}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <Input
                type="email"
                name="email"
                placeholder="test@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount (USD)</label>
              <Input
                type="number"
                name="amount"
                placeholder="10.00"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full"
                min="1"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Enter amount in US Dollars</p>
            </div>

            <Button
              onClick={initializePayment}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 mt-6"
            >
              {loading ? 'Processing...' : 'Pay with Paystack'}
            </Button>
          </div>

          {!isLiveMode && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-sm text-yellow-800 mb-2">Test Card Details</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Card Number:</strong> 4084 0840 8408 4081</p>
                <p><strong>CVV:</strong> 408</p>
                <p><strong>Expiry:</strong> Any future date</p>
                <p><strong>PIN:</strong> 0000</p>
                <p><strong>OTP:</strong> 123456</p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-primary hover:underline text-sm">
              Back to home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
