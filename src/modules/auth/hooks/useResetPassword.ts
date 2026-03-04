'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/modules/auth/services/auth-service'
import { useApiError } from '@/shared/hooks/useApiError'
import { toast } from 'sonner'

interface ResetPasswordInput {
  email: string
  code: string
  newPassword: string
}

export function useResetPassword() {
  const router = useRouter()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ email, code, newPassword }: ResetPasswordInput) =>
      authService.resetPassword(email, code, newPassword),
    onSuccess: () => {
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña fue actualizada exitosamente. Inicia sesión con tu nueva contraseña.',
      })
      router.push('/login')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Código inválido o expirado',
      })
    },
  })
}
