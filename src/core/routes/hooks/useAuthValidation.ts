'use client'

import { useAuthStore } from '@/core/store/auth-store'

interface AuthValidationResult {
  isValid: boolean
  isLoading: boolean
}

export function useAuthValidation(): AuthValidationResult {
  const { isAuthenticated, isLoading, session } = useAuthStore()

  const isValid =
    isAuthenticated &&
    !!session?.accessToken &&
    !!session?.tenantId

  return { isValid, isLoading }
}
