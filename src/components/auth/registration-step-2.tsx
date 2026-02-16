// src/components/auth/registration-step-2.tsx
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { step2Schema } from '@/lib/registration-validations'
import { validateEmailUnique } from '@/lib/registration-storage'
import { calculatePasswordStrength } from '@/lib/registration-validations'
import { RegistrationFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { CountryPhoneSelector } from '@/components/auth/country-phone-selector'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

interface RegistrationStep2Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack: () => void
}

export function RegistrationStep2({
  initialData,
  onNext,
  onBack,
}: RegistrationStep2Props) {
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: initialData.fullName || '',
      email: initialData.email || '',
      phone: initialData.phone || '+57',
      password: initialData.password || '',
      confirmPassword: initialData.password || '',
    },
  })

  const password = watch('password')
  const email = watch('email')

  // Calcular fuerza de contraseña
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  // Validar email único al perder foco
  const handleEmailBlur = async () => {
    if (!email || errors.email) return

    setIsValidatingEmail(true)
    setEmailAvailable(null)

    try {
      const isUnique = await validateEmailUnique(email)
      setEmailAvailable(isUnique)

      if (!isUnique) {
        setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado',
        })
      } else {
        clearErrors('email')
      }
    } catch (error) {
      console.error('Error validando email:', error)
    } finally {
      setIsValidatingEmail(false)
    }
  }

  const onSubmit = handleSubmit((data) => {
    // Remover confirmPassword antes de guardar
    const { confirmPassword, ...dataToSave } = data
    onNext(dataToSave)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="tech-label">
            Nombre completo <span className="text-destructive">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            {...register('fullName')}
            placeholder="Juan Pérez"
            className={`tech-input ${errors.fullName ? 'border-destructive' : ''}`}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="tech-label">
            Email corporativo <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              {...register('email')}
              onBlur={handleEmailBlur}
              placeholder="juan@miempresa.com"
              className={`tech-input ${errors.email ? 'border-destructive' : ''}`}
            />
            {isValidatingEmail && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isValidatingEmail && emailAvailable === true && (
              <div className="absolute right-3 top-3">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <CountryPhoneSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.phone?.message}
              label="Teléfono"
            />
          )}
        />

        {/* Contraseña */}
        <div className="space-y-2">
          <label htmlFor="password" className="tech-label">
            Contraseña <span className="text-destructive">*</span>
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className={`tech-input ${errors.password ? 'border-destructive' : ''}`}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}

          {/* Indicador de fuerza */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 1 ? 'bg-destructive' : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 3 ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordStrength === 1 && 'Débil'}
                {passwordStrength === 2 && 'Media'}
                {passwordStrength === 3 && 'Fuerte'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="tech-label">
            Confirmar contraseña <span className="text-destructive">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••••"
            className={`tech-input ${errors.confirmPassword ? 'border-destructive' : ''}`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
