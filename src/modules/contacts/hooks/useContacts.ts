'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useApiError } from '@/shared/hooks/useApiError'
import type {
  BackendContact,
  ContactsQuery,
  UpdateContactPayload,
  CreateContactPayload,
} from '@/modules/contacts/types/contacts'

export function useContacts(query?: ContactsQuery) {
  const params = new URLSearchParams()
  if (query?.phone) params.set('phone', query.phone)
  if (query?.lead_status) params.set('lead_status', query.lead_status)
  const qs = params.toString()

  return useQuery<BackendContact[]>({
    queryKey: [...queryKeys.contacts.all(), query],
    queryFn: () =>
      apiClient.get<BackendContact[]>(`/api/contacts${qs ? `?${qs}` : ''}`),
  })
}

export function useContact(id: number) {
  return useQuery<BackendContact>({
    queryKey: queryKeys.contacts.detail(id),
    queryFn: () => apiClient.get<BackendContact>(`/api/contacts/${id}`),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (payload: CreateContactPayload) =>
      apiClient.post<BackendContact>('/api/contacts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto creado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al crear contacto' }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactPayload }) =>
      apiClient.patch<BackendContact>(`/api/contacts/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto actualizado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al actualizar contacto' }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
      toast.success('Contacto eliminado correctamente')
    },
    onError: (error: Error) =>
      handleError(error, { showToast: true, fallbackMessage: 'Error al eliminar contacto' }),
  })
}
