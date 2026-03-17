'use client'

import { Card } from '@/components/ui/card'

export type PaymentMethod = 'card' | 'mpesa' | 'airtel'

interface Props {
  onMethodChange: (method: PaymentMethod) => void
  selectedMethod: PaymentMethod
}

export default function PaymentMethodSelector({ onMethodChange, selectedMethod }: Props) {
  const methods = [
    {
      id: 'card' as PaymentMethod,
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Verve',
      currency: 'USD',
      icon: '💳',
      available: true
    },
    {
      id: 'mpesa' as PaymentMethod,
      name: 'M-Pesa',
      description: 'Pay with M-Pesa mobile money',
      currency: 'KES',
      icon: '📱',
      available: true
    },
    {
      id: 'airtel' as PaymentMethod,
      name: 'Airtel Money',
      description: 'Pay with Airtel Money',
      currency: 'KES',
      icon: '📱',
      available: true
    }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-3">
        Select Payment Method
      </label>
      
      {methods.map((method) => (
        <Card
          key={method.id}
          className={`p-4 cursor-pointer transition-all border-2 ${
            selectedMethod === method.id
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
          } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => method.available && onMethodChange(method.id)}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{method.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{method.name}</div>
              <div className="text-xs text-muted-foreground">{method.description}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-primary">{method.currency}</div>
              {selectedMethod === method.id && (
                <div className="text-xs text-green-600 font-medium mt-1">✓ Selected</div>
              )}
            </div>
          </div>
        </Card>
      ))}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Mobile money (M-Pesa/Airtel) payments are processed in Kenyan Shillings (KES), 
          while card payments are in US Dollars (USD).
        </p>
      </div>
    </div>
  )
}
