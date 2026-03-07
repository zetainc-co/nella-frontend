// src/components/auth/email-verification.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, AlertCircle } from 'lucide-react'
import { useEmailVerification } from '@/modules/auth/hooks/useEmailVerification'

import type { EmailVerificationProps } from '@/modules/auth/types/auth-types'

export function EmailVerification({
  email,
  onVerified,
  onResendCode,
}: EmailVerificationProps) {
  const {
    code,
    isVerifying,
    error,
    timeLeft,
    inputRefs,
    isExpired,
    isMaxAttempts,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
    formatTime,
  } = useEmailVerification(email, onVerified, onResendCode)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Verifica tu email</h2>
        <p className="text-sm text-muted-foreground">
          Hemos enviado un código de 6 dígitos a
        </p>
        <p className="font-medium">{email}</p>
      </div>

      {/* Código de verificación */}
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={`otp-${index}`}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying || isExpired || isMaxAttempts}
              className={`h-14 w-12 text-center text-xl font-bold ${
                error ? 'border-destructive' : ''
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Verificando código...</p>
          </div>
        )}
      </div>

      {/* Timer */}
      <div className="text-center">
        {isExpired ? (
          <div className="rounded-lg bg-yellow-50 p-3 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100">
            <p className="text-sm font-medium">El código ha expirado</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            El código expira en{' '}
            <span className="font-mono font-bold text-foreground">{formatTime(timeLeft)}</span>
          </p>
        )}
      </div>

      {/* Reenviar código */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿No recibiste el código?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={!isExpired && !isMaxAttempts}
            className={`font-medium ${
              !isExpired && !isMaxAttempts
                ? 'cursor-not-allowed text-muted-foreground'
                : 'text-primary hover:underline'
            }`}
          >
            Reenviar código
          </button>
        </p>
      </div>

    </div>
  )
}
