'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { useProjectStore } from '@/core/store/project-store'
import type { BackendContact } from '@/modules/contacts/types/contacts'
import { transformContactToLead } from '@/modules/kanban/stores/kanban-store'

export function useKanbanLeads() {
  const selectedProjectId = useProjectStore(s => s.selectedProjectId)

  return useQuery({
    queryKey: [...queryKeys.kanban.leads(), selectedProjectId] as const,
    queryFn: async () => {
      const endpoint = selectedProjectId
        ? `/api/contacts?project_id=${selectedProjectId}`
        : '/api/contacts'
      const raw = await apiClient.get<{ items: BackendContact[] } | BackendContact[]>(endpoint)
      const contacts: BackendContact[] = Array.isArray(raw)
        ? raw
        : ((raw as { items: BackendContact[] })?.items ?? [])
      return contacts.map(transformContactToLead)
    },
    staleTime: 30_000,
  })
}
