// src/modules/auth/hooks/useRegister.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import { useApiError } from '@/shared/hooks/useApiError'
import type { RegistrationFormData } from '@/modules/auth/types/auth-types'

export function useRegister() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (formData: RegistrationFormData) => authService.register(formData),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al registrar usuario',
      })
    },
  })
}
