'use client'

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
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

// URL directa al backend NestJS — evita el proxy de Next.js que no soporta WS upgrade
const BACKEND_WS_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useContacts(query?: ContactsQuery) {
  const params = new URLSearchParams()
  if (query?.phone) params.set('phone', query.phone)
  if (query?.lead_status) params.set('lead_status', query.lead_status)
  if (query?.project_id) params.set('project_id', query.project_id)
  const qs = params.toString()

  return useQuery<BackendContact[]>({
    queryKey: [...queryKeys.contacts.all(query?.project_id), query],
    queryFn: async () => {
      const res = await apiClient.get<{ items: BackendContact[] } | BackendContact[]>(
        `/api/contacts${qs ? `?${qs}` : ''}`,
      )
      return Array.isArray(res) ? res : (res as { items: BackendContact[] }).items ?? []
    },
    // Stale time alta — el socket invalida el cache en tiempo real
    staleTime: 30_000,
  })
}

export function useContactsSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Conectar directamente al backend (CORS: origin: '*') — el proxy de Next.js
    // no soporta WebSocket upgrade, causando 404 en polling infinito
    const socket = io(`${BACKEND_WS_URL}/contacts`, {
      transports: ['websocket'],
    })

    socket.on('contact:updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all() })
    })

    socket.on('connect_error', (err) => {
      console.debug('contacts socket connect_error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient])
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
