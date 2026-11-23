export type PhoneCountry = {
  code: string
  name: string
  dialCode: string
  placeholder: string
  minLength: number
  maxLength: number
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'KE', name: 'Kenya', dialCode: '254', placeholder: '712 345 678', minLength: 9, maxLength: 9 },
  { code: 'UG', name: 'Uganda', dialCode: '256', placeholder: '712 345 678', minLength: 9, maxLength: 9 },
  { code: 'TZ', name: 'Tanzania', dialCode: '255', placeholder: '712 345 678', minLength: 9, maxLength: 9 },
  { code: 'RW', name: 'Rwanda', dialCode: '250', placeholder: '712 345 678', minLength: 9, maxLength: 9 },
  { code: 'ET', name: 'Ethiopia', dialCode: '251', placeholder: '91 123 4567', minLength: 9, maxLength: 9 },
  { code: 'SS', name: 'South Sudan', dialCode: '211', placeholder: '912 345 678', minLength: 9, maxLength: 9 },
  { code: 'NG', name: 'Nigeria', dialCode: '234', placeholder: '801 234 5678', minLength: 10, maxLength: 10 },
  { code: 'GH', name: 'Ghana', dialCode: '233', placeholder: '24 123 4567', minLength: 9, maxLength: 9 },
  { code: 'ZA', name: 'South Africa', dialCode: '27', placeholder: '82 123 4567', minLength: 9, maxLength: 9 },
  { code: 'GB', name: 'United Kingdom', dialCode: '44', placeholder: '7911 123456', minLength: 10, maxLength: 10 },
  { code: 'US', name: 'United States', dialCode: '1', placeholder: '555 123 4567', minLength: 10, maxLength: 10 },
]

export const DEFAULT_PHONE_COUNTRY = 'KE'

export function getPhoneCountry(code: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.code === code) ?? PHONE_COUNTRIES[0]
}

export function parseStoredPhoneNumber(stored: string | null | undefined): {
  countryCode: string
  nationalNumber: string
} {
  if (!stored) {
    return { countryCode: DEFAULT_PHONE_COUNTRY, nationalNumber: '' }
  }

  const digits = stored.replace(/\D/g, '')
  const sortedCountries = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  )

  for (const country of sortedCountries) {
    if (digits.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        nationalNumber: digits.slice(country.dialCode.length),
      }
    }
  }

  return { countryCode: DEFAULT_PHONE_COUNTRY, nationalNumber: digits }
}
