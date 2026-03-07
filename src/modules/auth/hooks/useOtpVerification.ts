'use client'

import { useState, useRef } from 'react'

export function useOtpVerification(whatsappNumber: string) {
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSendOtp = async () => {
    if (!whatsappNumber) return
    setIsSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setOtpSent(true)
    setIsSending(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value
    setOtpCode(newCode)
    setOtpError(null)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      verifyOtp(newCode.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOtp = async (code: string) => {
    setIsVerifying(true)
    setOtpError(null)
    try {
      const response = await fetch('/api/auth/verify-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: whatsappNumber, code }),
      })
      if (response.ok) {
        setOtpVerified(true)
      } else {
        const data = await response.json().catch(() => ({}))
        setOtpError(data.message ?? 'Código incorrecto. Intenta nuevamente.')
        setOtpCode(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    } catch {
      setOtpError('Error de conexión. Intenta nuevamente.')
      setOtpCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } finally {
      setIsVerifying(false)
    }
  }

  return {
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
  }
}
