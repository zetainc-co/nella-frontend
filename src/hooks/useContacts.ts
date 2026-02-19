'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import type { BackendContact, ContactsQuery, UpdateContactPayload, CreateContactPayload } from '@/types/contacts'

const CONTACTS_KEY = ['contacts']

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().session?.accessToken
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function fetchContacts(query?: ContactsQuery): Promise<BackendContact[]> {
  const params = new URLSearchParams()
  if (query?.phone) params.set('phone', query.phone)
  if (query?.lead_status) params.set('lead_status', query.lead_status)

  const url = `/api/contacts${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al cargar contactos')
  return res.json()
}

export function useContacts(query?: ContactsQuery) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, query],
    queryFn: () => fetchContacts(query),
  })
}

export function useContact(id: number) {
  return useQuery({
    queryKey: [...CONTACTS_KEY, id],
    queryFn: async () => {
      const res = await fetch(`/api/contacts/${id}`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Contacto no encontrado')
      return res.json() as Promise<BackendContact>
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateContactPayload) => {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al crear contacto')
      return res.json() as Promise<BackendContact>
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateContactPayload }) => {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error al actualizar contacto')
      return res.json() as Promise<BackendContact>
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Error al eliminar contacto')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CONTACTS_KEY }),
  })
}
