// Currency conversion utilities

/**
 * Static exchange rates (updated March 2026)
 * For production, consider using a real-time API like:
 * - exchangerate-api.io
 * - openexchangerates.org
 * - currencyapi.com
 */
export const CURRENCY_RATES = {
  USD_TO_KES: 145, // 1 USD = 145 KES (approximate)
  USD_TO_GHS: 12,  // 1 USD = 12 GHS (approximate)
  KES_TO_USD: 0.0069, // 1 KES = 0.0069 USD
  GHS_TO_USD: 0.083,  // 1 GHS = 0.083 USD
}

/**
 * Convert USD to Kenyan Shillings
 * @param usdAmount - Amount in USD (can be in dollars or cents)
 * @param inCents - If true, treats input as cents (default: false)
 * @returns Amount in KES
 */
export function convertUSDToKES(usdAmount: number, inCents: boolean = false): number {
  const usd = inCents ? usdAmount / 100 : usdAmount
  return Math.round(usd * CURRENCY_RATES.USD_TO_KES)
}

/**
 * Convert KES to USD
 * @param kesAmount - Amount in KES
 * @returns Amount in USD (in dollars, not cents)
 */
export function convertKESToUSD(kesAmount: number): number {
  return Math.round((kesAmount * CURRENCY_RATES.KES_TO_USD) * 100) / 100
}

/**
 * Convert USD to Ghanaian Cedis
 * @param usdAmount - Amount in USD
 * @param inCents - If true, treats input as cents (default: false)
 * @returns Amount in GHS
 */
export function convertUSDToGHS(usdAmount: number, inCents: boolean = false): number {
  const usd = inCents ? usdAmount / 100 : usdAmount
  return Math.round(usd * CURRENCY_RATES.USD_TO_GHS * 100) / 100
}

/**
 * Convert amount to cents/kobo (Paystack requires amounts in smallest unit)
 * @param amount - Amount in major currency unit (e.g., 10.50)
 * @param currency - Currency code
 * @returns Amount in smallest unit (cents/kobo)
 */
export function toSmallestUnit(amount: number, currency: string): number {
  // Most currencies use 2 decimal places
  return Math.round(amount * 100)
}

/**
 * Convert amount from cents/kobo to major currency unit
 * @param amount - Amount in smallest unit
 * @param currency - Currency code
 * @returns Amount in major unit (e.g., dollars/shillings)
 */
export function fromSmallestUnit(amount: number, currency: string): number {
  return amount / 100
}

/**
 * Format currency for display
 * @param amount - Amount to format (in major unit, e.g., 1000.50)
 * @param currency - Currency code
 * @returns Formatted string (e.g., "$1,000.50" or "KES 1,000.50")
 */
export function formatCurrency(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  switch (currency.toUpperCase()) {
    case 'USD':
      return `$${formatted}`
    case 'KES':
      return `KES ${formatted}`
    case 'GHS':
      return `GHS ${formatted}`
    default:
      return `${currency} ${formatted}`
  }
}

/**
 * Get currency symbol
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'USD':
      return '$'
    case 'KES':
      return 'KES'
    case 'GHS':
      return 'GHS'
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
    default:
      return currency
  }
}

/**
 * Fetch live exchange rate from API (optional enhancement)
 * @param from - Source currency
 * @param to - Target currency
 * @returns Exchange rate
 */
export async function getLiveExchangeRate(from: string, to: string): Promise<number> {
  // Example implementation with exchangerate-api.io
  // Uncomment and add API key in production
  /*
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/pair/${from}/${to}`
    )
    const data = await response.json()
    return data.conversion_rate
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error)
    // Fallback to static rates
  }
  */
  
  // Use static rates for now
  if (from === 'USD' && to === 'KES') return CURRENCY_RATES.USD_TO_KES
  if (from === 'USD' && to === 'GHS') return CURRENCY_RATES.USD_TO_GHS
  if (from === 'KES' && to === 'USD') return CURRENCY_RATES.KES_TO_USD
  if (from === 'GHS' && to === 'USD') return CURRENCY_RATES.GHS_TO_USD
  
  return 1 // Same currency or not supported
}

/**
 * Get minimum payment amount per currency
 * Based on Paystack requirements
 * @param currency - Currency code
 * @returns Minimum amount in that currency
 */
export function getMinimumAmount(currency: string): number {
  switch (currency.toUpperCase()) {
    case 'USD':
      return 1 // $1.00
    case 'KES':
      return 10 // KES 10
    case 'GHS':
      return 1 // GHS 1
    default:
      return 1
  }
}
