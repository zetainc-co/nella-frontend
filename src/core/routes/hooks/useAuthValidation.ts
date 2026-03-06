'use client'

import { useSyncExternalStore } from 'react'
import { useAuthStore } from '@/core/store/auth-store'
import { AuthValidationResult } from '@/modules/auth/types/auth-types'

function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  )
}

export function useAuthValidation(): AuthValidationResult {
  const { isAuthenticated, isLoading, session } = useAuthStore()
  const hasHydrated = useHasHydrated()

  // Wait for Zustand persist to rehydrate before evaluating auth
  if (!hasHydrated) {
    return { isValid: false, isLoading: true }
  }

  const isValid =
    isAuthenticated &&
    !!session?.accessToken &&
    !!session?.tenantId

  return { isValid, isLoading }
}
