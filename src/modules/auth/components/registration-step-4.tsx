// src/components/auth/registration-step-4.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationStep4Schema } from '@/modules/auth/hooks/auth-validations'
import type { RegistrationStepProps } from '@/modules/auth/types/auth-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CountryPhoneSelector } from '@/modules/auth/components/country-phone-selector'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, MessageSquare } from 'lucide-react'
import { useOtpVerification } from '@/modules/auth/hooks/useOtpVerification'

export function RegistrationStep4({ initialData, onNext, onBack }: RegistrationStepProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationStep4Schema),
    defaultValues: {
      whatsappNumber: initialData.whatsappNumber || '',
    },
  })

  const whatsappNumber = watch('whatsappNumber')

  const {
    otpSent,
    otpVerified,
    isSending,
    isVerifying,
    otpCode,
    otpError,
    inputRefs,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
  } = useOtpVerification(whatsappNumber)

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">WhatsApp Business</h3>
        <p className="text-sm text-muted-foreground">
          Ingresa el número de WhatsApp Business de tu empresa. Te enviaremos un código para verificarlo.
        </p>
      </div>

      {/* Número WhatsApp */}
      <div className="space-y-3">
        <CountryPhoneSelector
          value={whatsappNumber}
          onChange={(value) => setValue('whatsappNumber', value)}
          error={errors.whatsappNumber?.message}
          label="Número WhatsApp Business"
        />

        {!otpSent && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSendOtp}
            disabled={isSending || !whatsappNumber || !!errors.whatsappNumber}
            className="w-full gap-2"
          >
            {isSending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando código...</>
            ) : (
              <><MessageSquare className="h-4 w-4" /> Enviar código de verificación</>
            )}
          </Button>
        )}
      </div>

      {/* OTP Input */}
      {otpSent && !otpVerified && (
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Código enviado a <span className="font-medium text-foreground">{whatsappNumber}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otpCode.map((digit, index) => (
              <Input
                key={`otp-${index}`}
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                disabled={isVerifying}
                className="h-12 w-10 text-center text-lg font-bold"
              />
            ))}
          </div>
          {isVerifying && (
            <div className="flex justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Verificando...</span>
            </div>
          )}
          {otpError && <p className="text-sm text-center text-destructive">{otpError}</p>}
        </div>
      )}

      {/* Número verificado */}
      {otpVerified && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">Número verificado</p>
            <p className="text-sm text-green-700 dark:text-green-300">{whatsappNumber}</p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" className="gap-2" disabled={!otpVerified}>
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
