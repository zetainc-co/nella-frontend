// src/components/auth/registration-step-4.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { step4Schema } from '@/lib/registration-validations'
import { validateWhatsAppToken, validateWhatsAppNumber } from '@/lib/registration-storage'
import { RegistrationFormData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CountryPhoneSelector } from '@/components/auth/country-phone-selector'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface RegistrationStep4Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack: () => void
}

export function RegistrationStep4({
  initialData,
  onNext,
  onBack,
}: RegistrationStep4Props) {
  const [isValidatingToken, setIsValidatingToken] = useState(false)
  const [isValidatingNumber, setIsValidatingNumber] = useState(false)
  const [tokenValidation, setTokenValidation] = useState<{ valid: boolean; message: string } | null>(null)
  const [numberValidation, setNumberValidation] = useState<{ valid: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      whatsappNumber: initialData.whatsappNumber || '',
      whatsappToken: initialData.whatsappToken || '',
    },
  })

  const whatsappNumber = watch('whatsappNumber')
  const whatsappToken = watch('whatsappToken')

  // Validar número de WhatsApp
  const handleValidateNumber = async () => {
    if (!whatsappNumber || errors.whatsappNumber) return

    setIsValidatingNumber(true)
    setNumberValidation(null)

    try {
      const result = await validateWhatsAppNumber(whatsappNumber)
      setNumberValidation(result)

      if (!result.valid) {
        setError('whatsappNumber', {
          type: 'manual',
          message: result.message,
        })
      } else {
        clearErrors('whatsappNumber')
      }
    } catch (error) {
      console.error('Error validando número:', error)
    } finally {
      setIsValidatingNumber(false)
    }
  }

  // Validar token de WhatsApp
  const handleValidateToken = async () => {
    if (!whatsappToken || errors.whatsappToken || !whatsappNumber) return

    setIsValidatingToken(true)
    setTokenValidation(null)

    try {
      const result = await validateWhatsAppToken(whatsappToken, whatsappNumber)
      setTokenValidation(result)

      if (!result.valid) {
        setError('whatsappToken', {
          type: 'manual',
          message: result.message,
        })
      } else {
        clearErrors('whatsappToken')
      }
    } catch (error) {
      console.error('Error validando token:', error)
    } finally {
      setIsValidatingToken(false)
    }
  }

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Información */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Importante:</strong> Nella se conecta a tu cuenta de WhatsApp Business via Meta API.
            Necesitarás tu número de teléfono y un token de acceso.
          </p>
        </div>

        {/* Número de WhatsApp */}
        <div className="space-y-2">
          <CountryPhoneSelector
            value={whatsappNumber}
            onChange={(value) => setValue('whatsappNumber', value)}
            error={errors.whatsappNumber?.message}
          />

          {/* Botón de validación */}
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateNumber}
            disabled={isValidatingNumber || !whatsappNumber}
            className="w-full gap-2"
          >
            {isValidatingNumber ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando número...
              </>
            ) : (
              'Validar número'
            )}
          </Button>

          {/* Resultado de validación */}
          {numberValidation && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 ${
                numberValidation.valid
                  ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                  : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
              }`}
            >
              {numberValidation.valid ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <p className="text-sm">{numberValidation.message}</p>
            </div>
          )}
        </div>

        {/* Token de WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsappToken">
            Token de acceso de WhatsApp Business <span className="text-destructive">*</span>
          </Label>
          <Input
            id="whatsappToken"
            type="password"
            {...register('whatsappToken')}
            placeholder="Pega aquí tu token de Meta API..."
            className={`font-mono text-xs ${errors.whatsappToken ? 'border-destructive' : ''}`}
          />
          {errors.whatsappToken && (
            <p className="text-sm text-destructive">{errors.whatsappToken.message}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Lo encuentras en tu cuenta de{' '}
            <a
              href="https://business.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Meta Business Suite
            </a>
            .
          </p>

          {/* Botón de validación */}
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateToken}
            disabled={isValidatingToken || !whatsappToken || !numberValidation?.valid}
            className="w-full gap-2"
          >
            {isValidatingToken ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando token...
              </>
            ) : (
              'Validar token con Meta API'
            )}
          </Button>

          {/* Resultado de validación */}
          {tokenValidation && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 ${
                tokenValidation.valid
                  ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
                  : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
              }`}
            >
              {tokenValidation.valid ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <p className="text-sm">{tokenValidation.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          type="submit"
          className="gap-2"
          disabled={!tokenValidation?.valid || !numberValidation?.valid}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
