// src/components/auth/country-phone-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { LATAM_COUNTRIES } from '@/lib/countries-latam'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CountryPhoneSelectorProps {
  value: string // E.164 completo: "+573001234567"
  onChange: (e164: string) => void
  error?: string
}

export function CountryPhoneSelector({
  value,
  onChange,
  error,
}: CountryPhoneSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(LATAM_COUNTRIES[4]) // Colombia por defecto
  const [localNumber, setLocalNumber] = useState('')

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      const country = LATAM_COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (country) {
        setSelectedCountry(country)
        setLocalNumber(value.slice(country.dialCode.length))
      }
    }
  }, [])

  // Combinar y notificar cambios
  useEffect(() => {
    const e164 = `${selectedCountry.dialCode}${localNumber.replace(/\D/g, '')}`
    onChange(e164)
  }, [selectedCountry, localNumber, onChange])

  const handleCountryChange = (countryCode: string) => {
    const country = LATAM_COUNTRIES.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos
    const digits = e.target.value.replace(/\D/g, '')
    setLocalNumber(digits)
  }

  return (
    <div className="space-y-2">
      <Label>Número de WhatsApp Business</Label>

      <div className="flex gap-2">
        {/* Selector de país */}
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LATAM_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {country.dialCode}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Input del número local */}
        <Input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="300 123 4567"
          className="flex-1"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Formato E.164: {selectedCountry.dialCode}{localNumber || '...'}
      </p>
    </div>
  )
}
