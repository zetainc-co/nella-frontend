'use client'

import type { LeadStage, LeadProbability, KanbanColumnConfig } from '@/modules/kanban/types/kanban-types'

// ============================================
// Constantes del Kanban (unica fuente de verdad)
// ============================================

const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'Nuevo',
  contacted: 'Calificado',
  proposal: 'Negociación',
  closed: 'Cerrado'
}

const STAGE_ORDER: LeadStage[] = ['new', 'contacted', 'proposal', 'closed']

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { stage: 'new', title: 'Nuevo' },
  { stage: 'contacted', title: 'Calificado' },
  { stage: 'proposal', title: 'Negociación' },
  { stage: 'closed', title: 'Cerrado' }
]

// ============================================
// Mapeo de lead_status (n8n) → stage (kanban)
// ============================================

const LEAD_STATUS_TO_STAGE: Record<string, LeadStage> = {
  'COLD LEAD': 'new',
  'HOT LEAD': 'contacted',
  'WARM LEAD': 'proposal',
  'DESCARTADO': 'closed',
}

// ============================================
// Mapeo de ai_etapa (Dify) → stage (kanban)
// ============================================

export const STATUS_TO_STAGE: Record<string, LeadStage> = {
  'diagnostico': 'new',
  'dolor': 'new',
  'solucion': 'contacted',
  'negociacion': 'proposal',
  'soporte humano': 'proposal',
  'agendado': 'closed',
  'cierre ganado': 'closed',
  'cierre perdido': 'closed',
}

// ============================================
// Mapeo de stage (kanban) → { status, lead_status } para PATCH
// ============================================

export const STAGE_TO_STATUS: Record<LeadStage, { status: string; lead_status: string | null }> = {
  'new':       { status: 'Diagnostico',  lead_status: null },
  'contacted': { status: 'Solucion',     lead_status: 'WARM LEAD' },
  'proposal':  { status: 'Negociacion',  lead_status: 'HOT LEAD' },
  'closed':    { status: 'Agendado',     lead_status: null },
}

const LEAD_STATUS_TO_BADGE: Record<string, { probability: number; label: LeadProbability }> = {
  'HOT LEAD': { probability: 90, label: 'high' },
  'WARM LEAD': { probability: 60, label: 'medium' },
  'COLD LEAD': { probability: 30, label: 'low' },
  'DESCARTADO': { probability: 0, label: 'low' },
}

const DEFAULT_BADGE = { probability: 30, label: 'low' as LeadProbability }

// ============================================
// Fuente única de verdad: stage → badge
// El % se calcula por stage del kanban, NO por lead_status
// ============================================

export const STAGE_BADGE: Record<LeadStage, { probability: number; label: LeadProbability; displayLabel: string }> = {
  'new':       { probability: 25,  label: 'low',    displayLabel: 'Nuevo' },
  'contacted': { probability: 50,  label: 'medium', displayLabel: 'Calificado' },
  'proposal':  { probability: 75,  label: 'medium', displayLabel: 'Negociación' },
  'closed':    { probability: 100, label: 'high',   displayLabel: 'Lead' },
}

export function mapStageToBadge(stage: LeadStage): { probability: number; label: LeadProbability; displayLabel: string } {
  return STAGE_BADGE[stage]
}

export function mapLeadStatusToStage(leadStatus: string | null): LeadStage {
  return LEAD_STATUS_TO_STAGE[leadStatus ?? ''] ?? 'new'
}

export function mapLeadStatusToBadge(leadStatus: string | null): { probability: number; label: LeadProbability } {
  return LEAD_STATUS_TO_BADGE[leadStatus ?? ''] ?? DEFAULT_BADGE
}

export function useKanbanConstants() {
  const getStageLabel = (stage: LeadStage): string => {
    return STAGE_LABELS[stage]
  }

  const getStageIndex = (stage: LeadStage): number => {
    return STAGE_ORDER.indexOf(stage)
  }

  const canMoveToStage = (fromStage: LeadStage, toStage: LeadStage): boolean => {
    const fromIndex = getStageIndex(fromStage)
    const toIndex = getStageIndex(toStage)
    return toIndex >= fromIndex
  }

  const getNextStage = (currentStage: LeadStage): LeadStage | null => {
    const currentIndex = getStageIndex(currentStage)
    return STAGE_ORDER[currentIndex + 1] || null
  }

  const getPreviousStage = (currentStage: LeadStage): LeadStage | null => {
    const currentIndex = getStageIndex(currentStage)
    return currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null
  }

  const isFirstStage = (stage: LeadStage): boolean => {
    return getStageIndex(stage) === 0
  }

  const isLastStage = (stage: LeadStage): boolean => {
    return getStageIndex(stage) === STAGE_ORDER.length - 1
  }

  const getAllStages = () => STAGE_ORDER

  return {
    STAGE_LABELS,
    STAGE_ORDER,
    KANBAN_COLUMNS,
    getStageLabel,
    getStageIndex,
    canMoveToStage,
    getNextStage,
    getPreviousStage,
    isFirstStage,
    isLastStage,
    getAllStages,
  }
}
