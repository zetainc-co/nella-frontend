'use client'

import { useMutation } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth-service'
import { useApiError } from '@/shared/hooks/useApiError'
import { toast } from 'sonner'

export function useForgotPassword() {
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Código enviado', {
        description: 'Si el email está registrado, recibirás un código de verificación en tu correo.',
      })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al enviar el código de recuperación',
      })
    },
  })
}
