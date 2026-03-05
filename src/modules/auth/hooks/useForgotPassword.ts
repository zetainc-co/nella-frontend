// src/modules/auth/hooks/useForgotPassword.ts
'use client'

import { useMutation } from '@tanstack/react-query'
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

export function useForgotPassword() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: async (email: string) => {
      const tenantSlug = getTenantSlug()
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tenantSlug }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al enviar el código')
      }
      return response.json()
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al enviar el código de recuperación',
      })
    },
  })
}
