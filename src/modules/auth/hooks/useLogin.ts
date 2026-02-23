'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/modules/auth/services/auth-service'
import { useAuthStore } from '@/core/store/auth-store'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()

  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      authService.login(email, password),
    onSuccess: ({ user, session }) => {
      setUser(user)
      setSession(session)
      router.push('/dashboard')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Error al iniciar sesion')
    },
  })
}
