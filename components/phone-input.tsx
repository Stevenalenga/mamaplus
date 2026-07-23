'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DEFAULT_PHONE_COUNTRY,
  getPhoneCountry,
  PHONE_COUNTRIES,
} from '@/lib/phone-countries'

type PhoneInputProps = {
  countryCode: string
  onCountryChange: (countryCode: string) => void
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  id?: string
}

export function PhoneInput({
  countryCode,
  onCountryChange,
  value,
  onChange,
  disabled = false,
  required = false,
  id = 'phoneNumber',
}: PhoneInputProps) {
  const country = getPhoneCountry(countryCode)

  return (
    <div className="flex gap-2">
      <Select
        value={countryCode}
        onValueChange={onCountryChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Country code"
          className="w-[150px] shrink-0 bg-white border-border focus:border-primary"
        >
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {PHONE_COUNTRIES.map((option) => (
            <SelectItem key={option.code} value={option.code}>
              {option.name} (+{option.dialCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          +{country.dialCode}
        </span>
        <Input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={country.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          required={required}
          className="w-full bg-white border-border focus:border-primary pl-16"
        />
      </div>
    </div>
  )
}

export { DEFAULT_PHONE_COUNTRY }
