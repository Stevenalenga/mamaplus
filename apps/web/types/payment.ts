// Payment-related TypeScript types

export type PaymentChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'

export type MobileMoneyProvider = 'mpesa' | 'airtel' | 'mtn' | 'vodafone' | 'tigo'

export type PaymentMethod = 'card' | 'mpesa' | 'airtel' | 'mtn' | 'bank_transfer'

export type Currency = 'USD' | 'KES' | 'GHS' | 'UGX' | 'NGN' | 'ZAR'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'abandoned'

export interface PaymentMetadata {
  courseName?: string
  userId?: string
  payment_method?: string
  phone_number?: string
  custom_fields?: Array<{
    display_name: string
    variable_name: string
    value: string
  }>
  [key: string]: any
}

export interface PaymentInitializationData {
  email: string
  amount: number
  currency: Currency
  payment_method: PaymentMethod
  metadata?: PaymentMetadata
}

export interface MobileMoneyPaymentData extends PaymentInitializationData {
  phone_number: string
  provider: MobileMoneyProvider
}

export interface CardPaymentData extends PaymentInitializationData {
  // Card-specific fields can be added here
}

export interface PaymentResponse {
  success: boolean
  message: string
  data: {
    reference: string
    authorization_url?: string
    access_code?: string
  }
  instructions?: string
}

export interface PaymentVerificationData {
  success: boolean
  message: string
  data: {
    id: number
    status: PaymentStatus
    reference: string
    amount: number
    currency: string
    channel: PaymentChannel
    gateway_response: string
    paid_at?: string
    created_at: string
    metadata: PaymentMetadata
  }
}
