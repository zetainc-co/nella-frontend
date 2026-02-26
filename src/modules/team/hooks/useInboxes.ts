'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../services/team-service'
import { useApiError } from '@/shared/hooks/useApiError'

const INBOXES_QUERY_KEY = ['inboxes']
const INBOX_MEMBERS_QUERY_KEY = (inboxId: number) => ['inbox-members', inboxId]

/**
 * Hook para listar inboxes
 */
export function useInboxes() {
  return useQuery({
    queryKey: INBOXES_QUERY_KEY,
    queryFn: () => teamService.listInboxes(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para listar members de un inbox
 */
export function useInboxMembers(inboxId: number | null) {
  return useQuery({
    queryKey: INBOX_MEMBERS_QUERY_KEY(inboxId || 0),
    queryFn: () => teamService.listInboxMembers(inboxId!),
    enabled: inboxId !== null,
    staleTime: 1000 * 30, // 30 segundos
  })
}

/**
 * Hook para agregar members a un inbox
 */
export function useAddInboxMembers() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ inboxId, userIds }: { inboxId: number; userIds: number[] }) =>
      teamService.addInboxMembers(inboxId, userIds),
    onSuccess: (_, { inboxId }) => {
      queryClient.invalidateQueries({ queryKey: INBOX_MEMBERS_QUERY_KEY(inboxId) })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al agregar miembros al inbox',
      })
    },
  })
}

/**
 * Hook para actualizar members de un inbox (reemplaza todos)
 */
export function useUpdateInboxMembers() {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()

  return useMutation({
    mutationFn: ({ inboxId, userIds }: { inboxId: number; userIds: number[] }) =>
      teamService.updateInboxMembers(inboxId, userIds),
    onSuccess: (_, { inboxId }) => {
      queryClient.invalidateQueries({ queryKey: INBOX_MEMBERS_QUERY_KEY(inboxId) })
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al actualizar miembros del inbox',
      })
    },
  })
}
