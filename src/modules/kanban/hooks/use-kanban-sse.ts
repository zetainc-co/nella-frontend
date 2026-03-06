'use client'

import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { useProjectStore } from '@/core/store/project-store'

// Sin URL absoluta — conecta al mismo origen (Next.js proxea /socket.io/ al backend)
// Esto evita bloqueos de ad-blockers por peticiones cross-origin

export function useKanbanSSE() {
  const fetchContacts = useKanbanStore(state => state.fetchContacts)
  const upsertContact = useKanbanStore(state => state.upsertContact)
  const isLoading = useKanbanStore(state => state.isLoading)
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId)
  const initialized = useRef(false)

  // Refs estables — evitan recrear el socket si Zustand
  // devuelve nuevas referencias de función en algún render
  const fetchContactsRef = useRef(fetchContacts)
  const upsertContactRef = useRef(upsertContact)

  useEffect(() => { fetchContactsRef.current = fetchContacts }, [fetchContacts])
  useEffect(() => { upsertContactRef.current = upsertContact }, [upsertContact])

  useEffect(() => {
    // Always fetch on mount and when project changes
    fetchContactsRef.current()
    initialized.current = true

    const socket = io('/contacts')

    socket.on('contact:updated', (contact) => {
      if (contact && typeof contact === 'object' && contact.id) {
        upsertContactRef.current(contact)
      } else {
        fetchContactsRef.current()
      }
    })

    socket.on('connect_error', (err) => {
      console.debug('kanban socket connect_error:', err.message)
    })

    const fallbackInterval = setInterval(() => {
      fetchContactsRef.current()
    }, 10000)

    return () => {
      socket.disconnect()
      clearInterval(fallbackInterval)
    }
  }, [selectedProjectId])

  return isLoading
}
