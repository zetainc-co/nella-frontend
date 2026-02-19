'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { contactsApi, ContactsQuery, UpdateContactPayload, CreateContactPayload } from '@/lib/contacts/contacts-api'

const CONTACTS_KEY = ['contacts']
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useContacts(query?: ContactsQuery) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, query],
    queryFn: () => contactsApi.getAll(query),
  })
}

export function useContact(id: number) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: () => contactsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => contactsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactPayload }) =>
      contactsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contactsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

// SSE: escucha nuevos contactos en tiempo real y actualiza la lista automáticamente
export function useContactsSSE() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let source: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>
    let closed = false

    function connect() {
      if (closed) return
      source = new EventSource(`${API_URL}/contacts/events`)

      source.onmessage = () => {
        queryClient.invalidateQueries({ queryKey: CONTACTS_KEY })
      }

      source.onerror = () => {
        source?.close()
        // Reconectar en 3s si el componente sigue montado
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      closed = true
      clearTimeout(reconnectTimer)
      source?.close()
    }
  }, [queryClient])
}
