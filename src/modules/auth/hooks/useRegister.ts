'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'
import type { RegistrationFormData } from '@/modules/auth/types/auth-types'

export function useRegister() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()

  return useMutation({
    mutationFn: (formData: RegistrationFormData) => authService.register(formData),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al registrar usuario')
    },
  })
}
