'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { formatPhoneNumber, displayPhoneNumber } from '@/lib/validation'

interface Props {
  provider: 'mpesa' | 'airtel'
  onSubmit: (phone: string, amount: number) => void
  loading: boolean
  error?: string
}

export default function MobileMoneyForm({ provider, onSubmit, loading, error: externalError }: Props) {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [formattedDisplay, setFormattedDisplay] = useState('')

  // Update formatted display when phone changes
  useEffect(() => {
    if (phone) {
      try {
        const formatted = formatPhoneNumber(phone)
        setFormattedDisplay(displayPhoneNumber(formatted))
      } catch {
        setFormattedDisplay('')
      }
    } else {
      setFormattedDisplay('')
    }
  }, [phone])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate phone
    const phoneRegex = /^(254|0|\\+254)?[17]\d{8}$/
    const cleanedPhone = phone.replace(/[\s\-+]/g, '')
    
    if (!phoneRegex.test(cleanedPhone)) {
      setError('Invalid phone number. Format: 254712345678 or 0712345678')
      return
    }

    // Validate amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Amount must be at least KES 10')
      return
    }

    // Convert to cents and submit
    const formattedPhone = formatPhoneNumber(phone)
    onSubmit(formattedPhone, Math.round(numAmount * 100))
  }

  const providerName = provider === 'mpesa' ? 'M-Pesa' : 'Airtel Money'
  const providerColor = provider === 'mpesa' ? 'green' : 'red'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <div className="flex items-start gap-2">
          <span className="text-lg">ℹ️</span>
          <div className="text-sm">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Enter your {providerName} phone number and amount</li>
              <li>Click "Pay with {providerName}"</li>
              <li>You will receive an STK push on your phone</li>
              <li>Enter your {providerName} PIN to complete payment</li>
            </ol>
          </div>
        </div>
      </Alert>

      {(error || externalError) && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          <span className="text-lg">⚠️</span>
          <span className="ml-2 text-sm">{error || externalError}</span>
        </Alert>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          {providerName} Phone Number
        </label>
        <Input
          type="tel"
          placeholder="254712345678 or 0712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
          required
          disabled={loading}
        />
        {formattedDisplay && (
          <p className="text-xs text-muted-foreground mt-1">
            Format: {formattedDisplay}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Enter your {providerName} registered number
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Amount (KES)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            KES
          </span>
          <Input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-14"
            min="10"
            step="1"
            required
            disabled={loading}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Minimum amount: KES 10
        </p>
      </div>

      {amount && parseFloat(amount) >= 10 && (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold text-primary">
              KES {parseFloat(amount).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className={`w-full font-semibold py-6 text-white ${
          provider === 'mpesa' 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          `Pay with ${providerName}`
        )}
      </Button>

      {loading && (
        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="animate-pulse text-lg">📱</span>
            <p>
              <strong>Check your phone!</strong> Enter your {providerName} PIN when prompted.
            </p>
          </div>
        </Alert>
      )}
    </form>
  )
}
