'use client'

import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useKanbanStore } from '@/stores/kanban-store'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useKanbanSSE() {
  const fetchContacts = useKanbanStore(state => state.fetchContacts)
  const upsertContact = useKanbanStore(state => state.upsertContact)
  const isLoading = useKanbanStore(state => state.isLoading)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      fetchContacts()
      initialized.current = true
    }

    const socket = io(`${API_URL}/contacts`, {
      transports: ['websocket'],
    })

    socket.on('contact:updated', (contact) => {
      upsertContact(contact)
    })

    return () => {
      socket.disconnect()
    }
  }, [fetchContacts, upsertContact])

  return isLoading
}
