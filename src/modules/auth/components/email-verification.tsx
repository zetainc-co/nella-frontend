// src/components/auth/email-verification.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle2, AlertCircle } from 'lucide-react'

interface EmailVerificationProps {
  email: string
  onVerified: () => void
  onResendCode: () => void
}

const CORRECT_CODE = '000000'
const MAX_ATTEMPTS = 5
const TIMER_DURATION = 10 * 60 // 10 minutos en segundos

export function EmailVerification({
  email,
  onVerified,
  onResendCode,
}: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [attempts, setAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  // Auto-focus primer input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)
    setError(null)

    // Auto-focus siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verificar cuando se completan los 6 dígitos
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: borrar y volver al input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Arrow keys: navegar entre inputs
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()

      // Auto-verificar
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true)
    setError(null)

    // Simular delay de verificación
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (codeToVerify === CORRECT_CODE) {
      setIsVerifying(false)
      onVerified()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Has excedido el número máximo de intentos. Por favor, solicita un nuevo código.')
      } else {
        setError(
          `Código incorrecto. Te quedan ${MAX_ATTEMPTS - newAttempts} intento(s).`
        )
      }

      // Limpiar código
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setIsVerifying(false)
    }
  }

  const handleResend = () => {
    setCode(['', '', '', '', '', ''])
    setAttempts(0)
    setError(null)
    setTimeLeft(TIMER_DURATION)
    inputRefs.current[0]?.focus()
    onResendCode()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isExpired = timeLeft <= 0
  const isMaxAttempts = attempts >= MAX_ATTEMPTS

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
              key={index}
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

      {/* Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium">Tip para desarrollo:</p>
            <p>El código de verificación es: <span className="font-mono font-bold">000000</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
