'use client'

import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'

// Sin URL absoluta — conecta al mismo origen (Next.js proxea /socket.io/ al backend)
// Esto evita bloqueos de ad-blockers por peticiones cross-origin

export function useKanbanSSE() {
  const fetchContacts = useKanbanStore(state => state.fetchContacts)
  const upsertContact = useKanbanStore(state => state.upsertContact)
  const isLoading = useKanbanStore(state => state.isLoading)
  const initialized = useRef(false)

  // Refs estables — evitan recrear el socket si Zustand
  // devuelve nuevas referencias de función en algún render
  const fetchContactsRef = useRef(fetchContacts)
  const upsertContactRef = useRef(upsertContact)

  useEffect(() => { fetchContactsRef.current = fetchContacts }, [fetchContacts])
  useEffect(() => { upsertContactRef.current = upsertContact }, [upsertContact])

  useEffect(() => {
    if (!initialized.current) {
      fetchContactsRef.current()
      initialized.current = true
    }

    // Sin forzar 'websocket' — socket.io usa polling como fallback automático
    // si el proxy/Nginx no tiene WS upgrade configurado
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

    // Hard fallback: si WS nunca conecta o el evento nunca llega,
    // refresca cada 10s para mantener el kanban sincronizado
    const fallbackInterval = setInterval(() => {
      fetchContactsRef.current()
    }, 10000)

    return () => {
      socket.disconnect()
      clearInterval(fallbackInterval)
    }
  }, []) // deps vacías — accede a funciones del store via refs

  return isLoading
}
