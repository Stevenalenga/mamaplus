// Phone number validation utilities for mobile money

/**
 * Validates Kenyan phone numbers for M-Pesa and Airtel Money
 * Format: 254XXXXXXXXX (12 digits total)
 * @param phone - Phone number to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateKenyanPhoneNumber(phone: string): boolean {
  // Format: 254XXXXXXXXX (12 digits total)
  // Valid prefixes after 254: 7 (Safaricom/Airtel) or 1 (Safaricom)
  const regex = /^254[17]\d{8}$/
  return regex.test(phone.replace(/\s+/g, ''))
}

/**
 * Formats phone number to Kenyan standard format (254XXXXXXXXX)
 * Handles various input formats:
 * - 0712345678 -> 254712345678
 * - 712345678 -> 254712345678
 * - 254712345678 -> 254712345678
 * - +254712345678 -> 254712345678
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, and plus signs
  let cleaned = phone.replace(/[\s\-+]/g, '')
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1)
  }
  
  // If doesn't start with 254, prepend it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned
  }
  
  return cleaned
}

/**
 * Validates that phone number is for M-Pesa (Safaricom)
 * M-Pesa numbers: 254700000000-254799999999, 254100000000-254199999999
 * @param phone - Phone number to check
 * @returns boolean - true if M-Pesa number
 */
export function isMpesaNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Safaricom prefixes: 2547 (M-Pesa) and 2541
  return /^254[17]\d{8}$/.test(formatted)
}

/**
 * Validates that phone number is for Airtel Money
 * Airtel numbers: 254700000000-254799999999 (overlaps with Safaricom in reality)
 * Note: In practice, both Safaricom and Airtel use 254-7XX range
 * @param phone - Phone number to check
 * @returns boolean - true if potentially Airtel number
 */
export function isAirtelNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Airtel also uses 2547 prefix (same as Safaricom 7-series)
  return /^2547\d{8}$/.test(formatted)
}

/**
 * Get phone number provider based on common prefixes
 * Note: This is a best effort - actual provider may vary
 * @param phone - Phone number to check
 * @returns 'safaricom' | 'airtel' | 'unknown'
 */
export function getPhoneProvider(phone: string): 'safaricom' | 'airtel' | 'unknown' {
  const formatted = formatPhoneNumber(phone)
  
  // Common Safaricom prefixes (not exhaustive)
  if (/^254(7[0124]|1[01])\d{7}$/.test(formatted)) {
    return 'safaricom'
  }
  
  // Common Airtel prefixes (not exhaustive)
  if (/^254(7[358]|6[25])\d{7}$/.test(formatted)) {
    return 'airtel'
  }
  
  return 'unknown'
}

/**
 * Display phone number in user-friendly format
 * 254712345678 -> +254 712 345 678
 * @param phone - Phone number to format
 * @returns Formatted display string
 */
export function displayPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone)
  if (formatted.length === 12) {
    return `+${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6, 9)} ${formatted.slice(9)}`
  }
  return phone
}
