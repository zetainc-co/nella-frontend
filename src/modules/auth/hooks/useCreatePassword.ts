'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createPasswordSchema, calculatePasswordStrength, type CreatePasswordFormData } from '@/modules/auth/hooks/auth-validations'

export function useCreatePassword(token: string, email: string) {
  const router = useRouter()
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
  })

  const password = form.watch('password')

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const onSubmit = async (data: CreatePasswordFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 410) {
          setTokenExpired(true)
          setError('El link de activación expiró')
        } else if (response.status === 409) {
          router.push('/login?message=account-already-activated')
        } else {
          setError(result.message || 'Error al crear la contraseña')
        }
        return
      }

      const { tenantSlug } = result.data
      if (!tenantSlug) {
        setError('Error al obtener información del tenant')
        return
      }

      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
      const port = appDomain === 'localhost' ? ':3001' : ''
      const protocol = appDomain === 'localhost' ? 'http' : 'https'
      const loginUrl = `${protocol}://${tenantSlug}.${appDomain}${port}/login?email=${encodeURIComponent(email)}&message=account-activated`

      window.location.href = loginUrl
    } catch {
      setError('Error de conexión. Intenta nuevamente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendActivation = async () => {
    try {
      const response = await fetch('/api/auth/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        router.push(`/login?message=activation-resent&email=${encodeURIComponent(email)}`)
      }
    } catch {
      setError('Error al reenviar el email')
    }
  }

  const toggleShowPassword = () => setShowPassword(prev => !prev)
  const toggleShowConfirmPassword = () => setShowConfirmPassword(prev => !prev)

  return {
    form,
    passwordStrength,
    isSubmitting,
    error,
    tokenExpired,
    showPassword,
    showConfirmPassword,
    password,
    onSubmit,
    handleResendActivation,
    toggleShowPassword,
    toggleShowConfirmPassword,
  }
}
