import { describe, it, expect } from 'vitest'

describe('useCalendarEvents module', () => {
  it('module exports useCalendarEvents', async () => {
    const mod = await import('@/modules/calendar/hooks/useCalendarEvents')
    expect(typeof mod.useCalendarEvents).toBe('function')
  })
})

describe('calendar-api module', () => {
  it('module exports mapBackendEventToLocal', async () => {
    const mod = await import('@/modules/calendar/services/calendar-api')
    expect(typeof mod.mapBackendEventToLocal).toBe('function')
  })

  it('module exports calendarFetch', async () => {
    const mod = await import('@/modules/calendar/services/calendar-api')
    expect(typeof mod.calendarFetch).toBe('function')
  })
})
