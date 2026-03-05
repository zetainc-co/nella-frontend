// src/modules/auth/hooks/useResetPassword.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useApiError } from '@/shared/hooks/useApiError'

function getTenantSlug(): string {
  if (typeof window === 'undefined') return ''
  const hostname = window.location.hostname
  const appDomain = (process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost').split(':')[0]
  if (hostname.endsWith(`.${appDomain}`)) {
    const subdomain = hostname.slice(0, hostname.length - appDomain.length - 1)
    if (subdomain && subdomain !== 'www' && !subdomain.includes('.')) return subdomain
  }
  return process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? ''
}

interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
}

export function useResetPassword() {
  const router = useRouter()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const tenantSlug = getTenantSlug()
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, tenantSlug }),
      })
      if (!response.ok) {
        const res = await response.json()
        throw new Error(res.error || 'Error al restablecer la contraseña')
      }
      return response.json()
    },
    onSuccess: () => {
      router.push('/login?message=password-reset')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al restablecer la contraseña',
      })
    },
  })
}
