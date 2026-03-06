'use client'

import { useState, useEffect, useRef } from 'react'

const MAX_ATTEMPTS = 5
const TIMER_DURATION = 10 * 60

export function useEmailVerification(email: string, onVerified: () => void, onResendCode: () => void) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [attempts, setAttempts] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(null)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeToVerify: string) => {
    setIsVerifying(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeToVerify }),
      })
      if (response.ok) { setIsVerifying(false); onVerified(); return }
      const data = await response.json().catch(() => ({}))
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Has excedido el número máximo de intentos. Por favor, solicita un nuevo código.')
      } else {
        setError(data.message ?? `Código incorrecto. Te quedan ${MAX_ATTEMPTS - newAttempts} intento(s).`)
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
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

  return {
    code,
    isVerifying,
    error,
    timeLeft,
    inputRefs,
    isExpired: timeLeft <= 0,
    isMaxAttempts: attempts >= MAX_ATTEMPTS,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleResend,
    formatTime,
  }
}
