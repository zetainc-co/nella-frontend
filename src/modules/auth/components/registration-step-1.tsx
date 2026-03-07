// src/components/auth/registration-step-1.tsx
'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationStep1Schema } from '@/modules/auth/hooks/auth-validations'
import { LATAM_COUNTRIES, INDUSTRIES, COMPANY_SIZES } from '@shared/data/countries-latam'
import type { RegistrationStepProps, CompanySize } from '@/modules/auth/types/auth-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RegistrationStep1({
  initialData,
  onNext,
}: RegistrationStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationStep1Schema),
    defaultValues: {
      companyName: initialData.companyName || '',
      industry: initialData.industry || '',
      industryOther: initialData.industryOther || '',
      companySize: initialData.companySize as CompanySize | undefined,
      country: initialData.country || '',
    },
  })

  const industry = watch('industry')
  const companySize = watch('companySize')
  const showOtherIndustry = industry === 'other'

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Section title */}
      <h2 className="text-lg font-semibold text-white mb-1">Información de la Empresa</h2>

      {/* Nombre de Empresa */}
      <div className="space-y-1.5">
        <label htmlFor="companyName" className="tech-label">
          Nombre de la empresa <span className="text-destructive">*</span>
        </label>
        <Input
          id="companyName"
          type="text"
          {...register('companyName')}
          placeholder="Mi Empresa S.A."
          className={cn('auth-input', errors.companyName && 'border-destructive')}
        />
        {errors.companyName && (
          <p className="text-xs text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      {/* Industria */}
      <div className="space-y-1.5">
        <label className="tech-label">
          Industria / Sector <span className="text-destructive">*</span>
        </label>
        <Select
          value={watch('industry')}
          onValueChange={(value) => setValue('industry', value)}
        >
          <SelectTrigger className={cn('tech-select', errors.industry && 'border-destructive')}>
            <SelectValue placeholder="Selecciona tu industria" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.industry && (
          <p className="text-xs text-destructive">{errors.industry.message}</p>
        )}
      </div>

      {/* Campo "Otro" condicional */}
      {showOtherIndustry && (
        <div className="space-y-1.5">
          <label htmlFor="industryOther" className="tech-label">
            Especifica tu industria <span className="text-destructive">*</span>
          </label>
          <Input
            id="industryOther"
            type="text"
            {...register('industryOther')}
            placeholder="Ej: Consultoría financiera"
            className={cn('auth-input', errors.industryOther && 'border-destructive')}
          />
          {errors.industryOther && (
            <p className="text-xs text-destructive">{errors.industryOther.message}</p>
          )}
        </div>
      )}

      {/* Tamaño de Empresa — Pill Buttons */}
      <div className="space-y-1.5">
        <label className="tech-label">
          Tamaño de la empresa <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COMPANY_SIZES.map((size) => {
            const isSelected = companySize === size.value
            return (
              <button
                key={size.value}
                type="button"
                onClick={() => setValue('companySize', size.value as CompanySize)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isSelected
                    ? 'text-[#0a1015]'
                    : 'text-white/50 hover:text-white/80'
                )}
                style={
                  isSelected
                    ? { background: '#8C28FA', boxShadow: '0 0 14px rgba(140,40,250,0.35)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {size.label}
              </button>
            )
          })}
        </div>
        {errors.companySize && (
          <p className="text-xs text-destructive">{errors.companySize.message}</p>
        )}
      </div>

      {/* País */}
      <div className="space-y-1.5">
        <label className="tech-label">
          País <span className="text-destructive">*</span>
        </label>
        <Select
          value={watch('country')}
          onValueChange={(value) => setValue('country', value)}
        >
          <SelectTrigger className={cn('tech-select', errors.country && 'border-destructive')}>
            <SelectValue placeholder="Selecciona tu país" />
          </SelectTrigger>
          <SelectContent>
            {LATAM_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-xs text-destructive">{errors.country.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/login"
          className="text-sm transition-colors"
          style={{ color: 'rgba(240,244,255,0.35)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(240,244,255,0.6)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(240,244,255,0.35)' }}
        >
          ← Volver al login
        </Link>
        <Button type="submit" className="btn-primary w-auto px-6 gap-1.5">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
