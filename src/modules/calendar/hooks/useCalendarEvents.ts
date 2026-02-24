// src/hooks/useCalendarEvents.ts
'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addDays, format, startOfWeek } from 'date-fns'
import { useCalendarStore } from '@/modules/calendar/stores/calendar-store'
import { useAuthStore } from '@/core/store/auth-store'
import { calendarFetch, mapBackendEventToLocal } from '@/modules/calendar/services/calendar-api'
import type { BackendCalendarEvent } from '@/modules/calendar/types/calendar-types'

interface EventsResponse {
  data: BackendCalendarEvent[]
}

export function useCalendarEvents() {
  const { currentWeekStart, setEvents } = useCalendarStore()
  const { session } = useAuthStore()
  const queryClient = useQueryClient()

  const monday = startOfWeek(currentWeekStart, { weekStartsOn: 1 })
  const from = format(monday, 'yyyy-MM-dd')
  const to = format(addDays(monday, 6), 'yyyy-MM-dd')

  const query = useQuery<BackendCalendarEvent[]>({
    queryKey: ['calendar-events', from, to],
    queryFn: async () => {
      const data = await calendarFetch<EventsResponse>(
        `/calendar/events?from=${from}&to=${to}`
      )
      return data.data ?? []
    },
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  })

  // Sync fetched events into the Zustand store
  useEffect(() => {
    if (query.data) {
      setEvents(query.data.map(mapBackendEventToLocal))
    }
  }, [query.data, setEvents])

  function refetchEvents() {
    queryClient.invalidateQueries({ queryKey: ['calendar-events', from, to] })
  }

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetchEvents,
  }
}
