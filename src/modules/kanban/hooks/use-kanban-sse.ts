'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { queryKeys } from '@/core/api/query-keys'
import { useProjectStore } from '@/core/store/project-store'

export function useKanbanSSE() {
  const queryClient = useQueryClient()
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)

  useEffect(() => {
    const socket = io('/contacts')

    socket.on('contact:updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kanban.leads() })
    })

    socket.on('connect_error', () => {
      // silently handle connection errors
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedProjectId, queryClient])
}
