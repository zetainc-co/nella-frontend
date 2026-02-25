// src/modules/auth/hooks/useLogin.ts
'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import { useApiError } from '@/shared/hooks/useApiError'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authService.login(email, password),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al iniciar sesión',
      })
    },
  })
}
