'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'

export interface WhatsappConfigData {
  id: string
  phone_number_id: string
  verified_name: string
  chatwoot_inbox_id: number | null
  is_active: boolean
  created_at: string
}

export interface WhatsappConnectPayload {
  phone_number_id: string
  meta_token: string
  app_secret: string
}

interface WhatsappConnectResponse {
  success: boolean
  data: WhatsappConfigData
}

interface WhatsappConfigResponse {
  success: boolean
  data: WhatsappConfigData | null
}

export function useWhatsappConfig() {
  return useQuery<WhatsappConfigData | null>({
    queryKey: queryKeys.whatsapp.config(),
    queryFn: async () => {
      const result = await apiClient.get<WhatsappConfigResponse>('/api/whatsapp/config')
      return result?.data ?? null
    },
    staleTime: 30_000,
    retry: false,
  })
}

export function useConnectWhatsapp() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (payload: WhatsappConnectPayload) =>
      apiClient.post<WhatsappConnectResponse>('/api/whatsapp/connect', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.config() })
      toast.success('WhatsApp conectado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al conectar WhatsApp. Verifica las credenciales.',
      }),
  })
}

export interface WhatsappUpdatePayload {
  phone_number_id?: string
  meta_token?: string
  app_secret?: string
}

export function useUpdateWhatsapp() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (payload: WhatsappUpdatePayload) =>
      apiClient.patch<WhatsappConnectResponse>('/api/whatsapp/config', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.config() })
      toast.success('Credenciales actualizadas correctamente')
    },
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al actualizar las credenciales.',
      }),
  })
}

export function useDisconnectWhatsapp() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: () => apiClient.delete<{ success: boolean }>('/api/whatsapp/disconnect'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.config() })
      toast.success('WhatsApp desconectado')
    },
    onError: (error: Error) =>
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al desconectar WhatsApp',
      }),
  })
}
