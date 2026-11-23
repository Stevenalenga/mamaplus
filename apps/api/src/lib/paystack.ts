// Paystack types and utility functions

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// Types
export type PaymentChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'
export type MobileMoneyProvider = 'mpesa' | 'airtel' | 'mtn' | 'vodafone' | 'tigo'

export interface PaystackInitializeParams {
  email: string
  amount: number // in cents/kobo (smallest currency unit)
  currency?: string
  reference?: string
  callback_url?: string
  channels?: PaymentChannel[]
  metadata?: {
    courseName?: string
    userId?: string
    payment_method?: string
    phone_number?: string
    custom_fields?: any[]
    [key: string]: any
  }
}

export interface MobileMoneyInitializeParams {
  email: string
  amount: number
  phone_number: string
  provider: MobileMoneyProvider
  currency: 'KES' | 'GHS' | 'UGX'
  reference?: string
  callback_url?: string
  metadata?: {
    courseName?: string
    userId?: string
    [key: string]: any
  }
}

export interface PaystackResponse<T = any> {
  status: boolean
  message: string
  data: T
}

export interface PaystackTransaction {
  id: number
  domain: string
  status: string
  reference: string
  amount: number
  message: string | null
  gateway_response: string
  paid_at: string
  created_at: string
  channel: string
  currency: string
  ip_address: string
  metadata: any
  customer: {
    id: number
    first_name: string | null
    last_name: string | null
    email: string
    customer_code: string
    phone: string | null
    metadata: any
    risk_action: string
  }
  authorization: {
    authorization_code: string
    bin: string
    last4: string
    exp_month: string
    exp_year: string
    channel: string
    card_type: string
    bank: string
    country_code: string
    brand: string
    reusable: boolean
    signature: string
    account_name: string | null
  }
}

// Paystack API Client
export const paystack = {
  transaction: {
    initialize: async (params: PaystackInitializeParams): Promise<PaystackResponse> => {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initialize transaction')
      }

      return data
    },

    verify: async (reference: string): Promise<PaystackResponse<PaystackTransaction>> => {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify transaction')
      }

      return data
    },

    /**
     * Initialize a mobile money payment
     * This will trigger an STK push for M-Pesa or similar for other providers
     */
    initializeMobileMoney: async (params: MobileMoneyInitializeParams): Promise<PaystackResponse> => {
      const { email, amount, phone_number, provider, currency, reference, callback_url, metadata } = params

      const payload: PaystackInitializeParams = {
        email,
        amount,
        currency,
        reference,
        callback_url,
        channels: ['mobile_money'],
        metadata: {
          ...metadata,
          payment_method: provider,
          phone_number: phone_number,
          custom_fields: [
            {
              display_name: 'Phone Number',
              variable_name: 'phone_number',
              value: phone_number
            },
            {
              display_name: 'Provider',
              variable_name: 'provider',
              value: provider
            }
          ]
        }
      }

      return paystack.transaction.initialize(payload)
    }
  }
}

// Utility functions
export const convertToKobo = (amount: number): number => {
  return Math.round(amount * 100)
}

export const convertFromKobo = (amount: number): number => {
  return amount / 100
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: { [key: string]: string } = {
    NGN: '₦',
    KES: 'KSh',
    USD: '$',
    GHS: 'GH₵',
    ZAR: 'R'
  }
  
  const symbol = currencySymbols[currency] || currency
  const amountInMain = convertFromKobo(amount)
  
  return `${symbol}${amountInMain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default paystack
