'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/core/store/auth-store'
import { apiClient } from '@/core/api/api-client'

export interface UpdateProfileDto {
  full_name?: string
  current_password?: string
  new_password?: string
}

interface ProfileResponse {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      apiClient.patch<ProfileResponse>('/api/users/me', dto),
    onSuccess: (data) => {
      if (data.full_name) {
        updateUser({ fullName: data.full_name })
      }
      toast.success('Perfil actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el perfil')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: { current_password: string; new_password: string }) =>
      apiClient.patch<ProfileResponse>('/api/users/me', dto),
    onSuccess: () => {
      toast.success('Contrasena actualizada exitosamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al cambiar la contrasena')
    },
  })
}
