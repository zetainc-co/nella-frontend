// src/types/calendar-types.ts

export type ProjectName = 'MundoStetic' | 'TechCorp' | 'Solventum'
export type CalendarLayer = 'my-agenda' | 'team-agenda' | 'ai-appointments'
export type ConfirmationStatus = 'confirmed' | 'pending' | 'cancelled'
export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'
export type BlockDuration = 15 | 30 | 60
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export interface CalendarEvent {
  id: string
  title: string
  client: string
  project: string           // free string from backend; use ProjectName for form options
  startTime: string         // "09:00"
  endTime: string           // "10:30"
  date: string              // ISO date "2026-02-16"
  location?: string
  videoCallLink?: string
  confirmationStatus: ConfirmationStatus
  layer: CalendarLayer
  leadStage?: LeadStage
  hasBudget?: 'approved' | 'pending'
  notes?: string
  contactId?: string | null
  googleMeetLink?: string | null
  syncStatus?: 'local' | 'synced' | 'error'
}

// Raw event shape returned by the backend API
export interface BackendCalendarEvent {
  id: string
  title: string
  project: string
  client: string
  contactId: string | null
  startAt: string           // ISO timestamp "2026-02-20T10:00:00.000Z"
  endAt: string             // ISO timestamp "2026-02-20T11:00:00.000Z"
  location: string | null
  videoCallLink: string | null
  confirmationStatus: ConfirmationStatus
  layer: CalendarLayer
  leadStage: LeadStage | null
  hasBudget: 'approved' | 'pending' | null
  notes: string | null
  googleMeetLink: string | null
  syncStatus: 'local' | 'synced' | 'error'
}

export interface BookingLink {
  id: string
  title: string
  slug: string
  durationMinutes: number
  isTeamLink: boolean
  rotationType: 'round_robin' | 'least_busy' | null
  isActive: boolean
  createdBy: string
}

export type GoogleCalendarStatus =
  | { connected: false }
  | {
      connected: true
      email: string
      calendarId: string
      watchExpiresAt: string
      lastSyncedAt: string
    }

export interface TimeSlot {
  start: string  // "09:00"
  end: string    // "12:00"
}

export interface AvailabilityDay {
  day: DayKey
  enabled: boolean
  slots: TimeSlot[]
}

export interface NewEventFormData {
  title: string
  project: ProjectName
  client: string
  date: string
  startTime: string
  endTime: string
  location?: string
  videoCallLink?: string
  confirmationStatus: ConfirmationStatus
  leadStage?: LeadStage
  hasBudget?: 'approved' | 'pending'
  notes?: string
}

// ============================================
// UI Constants
// ============================================

const KNOWN_PROJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MundoStetic: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: '#3b82f6' },
  TechCorp:    { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: '#f97316' },
  Solventum:   { bg: 'rgba(168,85,247,0.15)', text: '#a855f7', border: '#a855f7' },
}

const DEFAULT_PROJECT_COLORS = {
  bg: 'rgba(100,116,139,0.15)',
  text: '#64748b',
  border: '#64748b',
}

// Use this function instead of PROJECT_COLORS[project] directly
export function getProjectColors(project: string): { bg: string; text: string; border: string } {
  return KNOWN_PROJECT_COLORS[project] ?? DEFAULT_PROJECT_COLORS
}

// Keep for backwards compatibility with project-filters.tsx which uses known projects
export const PROJECT_COLORS: Record<ProjectName, { bg: string; text: string; border: string }> = {
  MundoStetic: KNOWN_PROJECT_COLORS.MundoStetic,
  TechCorp:    KNOWN_PROJECT_COLORS.TechCorp,
  Solventum:   KNOWN_PROJECT_COLORS.Solventum,
}

export const LAYER_CONFIG: Record<CalendarLayer, { dot: string; label: string }> = {
  'my-agenda':        { dot: '#a855f7', label: 'Mi Agenda' },
  'team-agenda':      { dot: '#3b82f6', label: 'Agenda del Equipo' },
  'ai-appointments':  { dot: '#a855f7', label: 'Citas IA' },
}

export const TIME_OPTIONS: string[] = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})
