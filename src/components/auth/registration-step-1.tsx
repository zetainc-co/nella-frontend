// src/components/auth/registration-step-1.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema } from '@/lib/registration-validations'
import { LATAM_COUNTRIES, INDUSTRIES, COMPANY_SIZES } from '@/lib/countries-latam'
import { RegistrationFormData } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface RegistrationStep1Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
}

export function RegistrationStep1({
  initialData,
  onNext,
}: RegistrationStep1Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: initialData.companyName || '',
      industry: initialData.industry || '',
      industryOther: initialData.industryOther || '',
      companySize: initialData.companySize as '1-10' | '11-50' | '51-200' | '200+' | undefined,
      country: initialData.country || '',
    },
  })

  const industry = watch('industry')
  const showOtherIndustry = industry === 'other'

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre de Empresa */}
        <div className="space-y-2">
          <label htmlFor="companyName" className="tech-label">
            Nombre de la empresa <span className="text-destructive">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            {...register('companyName')}
            placeholder="Mi Empresa S.A."
            className={`tech-input ${errors.companyName ? 'border-destructive' : ''}`}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">{errors.companyName.message}</p>
          )}
        </div>

        {/* Industria */}
        <div className="space-y-2">
          <label htmlFor="industry" className="tech-label">
            Industria / Sector <span className="text-destructive">*</span>
          </label>
          <Select
            value={watch('industry')}
            onValueChange={(value) => setValue('industry', value)}
          >
            <SelectTrigger className={`tech-select ${errors.industry ? 'border-destructive' : ''}`}>
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
            <p className="text-sm text-destructive">{errors.industry.message}</p>
          )}
        </div>

        {/* Campo "Otro" condicional */}
        {showOtherIndustry && (
          <div className="space-y-2">
            <label htmlFor="industryOther" className="tech-label">
              Especifica tu industria <span className="text-destructive">*</span>
            </label>
            <input
              id="industryOther"
              type="text"
              {...register('industryOther')}
              placeholder="Ej: Consultoría financiera"
              className={`tech-input ${errors.industryOther ? 'border-destructive' : ''}`}
            />
            {errors.industryOther && (
              <p className="text-sm text-destructive">{errors.industryOther.message}</p>
            )}
          </div>
        )}

        {/* Tamaño de Empresa */}
        <div className="space-y-2">
          <label htmlFor="companySize" className="tech-label">
            Tamaño de la empresa <span className="text-destructive">*</span>
          </label>
          <Select
            value={watch('companySize')}
            onValueChange={(value) => setValue('companySize', value as '1-10' | '11-50' | '51-200' | '200+')}
          >
            <SelectTrigger className={`tech-select ${errors.companySize ? 'border-destructive' : ''}`}>
              <SelectValue placeholder="Selecciona el tamaño" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySize && (
            <p className="text-sm text-destructive">{errors.companySize.message}</p>
          )}
        </div>

        {/* País */}
        <div className="space-y-2">
          <label htmlFor="country" className="tech-label">
            País <span className="text-destructive">*</span>
          </label>
          <Select
            value={watch('country')}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger className={`tech-select ${errors.country ? 'border-destructive' : ''}`}>
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
            <p className="text-sm text-destructive">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Botón Siguiente */}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
