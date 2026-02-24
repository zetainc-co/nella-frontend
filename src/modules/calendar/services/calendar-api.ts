// src/lib/calendar-api.ts
// Client-side utilities for the calendar module
import { useAuthStore } from '@/core/store/auth-store'
import type { BackendCalendarEvent, CalendarEvent } from '@/modules/calendar/types/calendar-types'

// ─── Auth headers ─────────────────────────────────────────────────────────────

export function getCalendarAuthHeaders(): Record<string, string> {
  const state = useAuthStore.getState()
  const headers: Record<string, string> = {}
  if (state.session?.accessToken) {
    headers['Authorization'] = `Bearer ${state.session.accessToken}`
  }
  if (state.session?.tenantSlug) {
    headers['X-Tenant-Id'] = state.session.tenantSlug
  }
  return headers
}

// ─── Event mapping ────────────────────────────────────────────────────────────

export function mapBackendEventToLocal(event: BackendCalendarEvent): CalendarEvent {
  // Parse UTC timestamps to extract date and time components
  const startDate = new Date(event.startAt)
  const endDate = new Date(event.endAt)

  const date = event.startAt.split('T')[0]
  const startTime = `${String(startDate.getUTCHours()).padStart(2, '0')}:${String(startDate.getUTCMinutes()).padStart(2, '0')}`
  const endTime = `${String(endDate.getUTCHours()).padStart(2, '0')}:${String(endDate.getUTCMinutes()).padStart(2, '0')}`

  return {
    id: event.id,
    title: event.title,
    client: event.client ?? '',
    project: event.project ?? '',
    date,
    startTime,
    endTime,
    location: event.location ?? undefined,
    videoCallLink: event.videoCallLink ?? undefined,
    confirmationStatus: event.confirmationStatus,
    layer: event.layer,
    leadStage: event.leadStage ?? undefined,
    hasBudget: event.hasBudget ?? undefined,
    notes: event.notes ?? undefined,
    contactId: event.contactId ?? undefined,
    googleMeetLink: event.googleMeetLink,
    syncStatus: event.syncStatus,
  }
}

// ─── Generic authenticated fetch ─────────────────────────────────────────────

export async function calendarFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = { ...getCalendarAuthHeaders() }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la solicitud' }))
    throw new Error(error.message || error.error || `HTTP ${response.status}`)
  }

  return response.json()
}
