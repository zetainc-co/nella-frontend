// src/types/calendar-types.ts

export type ProjectName = 'MundoStetic' | 'TechCorp' | 'NellaSales'
export type CalendarLayer = 'my-agenda' | 'team-agenda' | 'ai-appointments'
export type ConfirmationStatus = 'confirmed' | 'pending' | 'cancelled'
export type DayKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom'
export type BlockDuration = 15 | 30 | 60
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export interface CalendarEvent {
  id: string
  title: string
  client: string
  project: ProjectName
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

export const PROJECT_COLORS: Record<ProjectName, { bg: string; text: string; border: string }> = {
  MundoStetic: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: '#3b82f6' },
  TechCorp:    { bg: 'rgba(249,115,22,0.15)', text: '#f97316', border: '#f97316' },
  NellaSales:  { bg: 'rgba(132,204,22,0.15)', text: '#84cc16', border: '#84cc16' },
}

export const LAYER_CONFIG: Record<CalendarLayer, { dot: string; label: string }> = {
  'my-agenda':        { dot: '#22c55e', label: 'Mi Agenda' },
  'team-agenda':      { dot: '#3b82f6', label: 'Agenda del Equipo' },
  'ai-appointments':  { dot: '#a855f7', label: 'Citas IA' },
}

export const TIME_OPTIONS: string[] = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})
