'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useMetricsSocket(projectId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId) return

    const socket = io(`${BACKEND_URL}/metrics`, {
      transports: ['websocket'],
    })

    socket.emit('join:project', projectId)

    socket.on('metrics:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', projectId] })
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId, queryClient])
}
