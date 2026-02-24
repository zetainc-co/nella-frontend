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

const LEAD_STATUS_TO_BADGE: Record<string, { probability: number; label: LeadProbability }> = {
  'HOT LEAD': { probability: 90, label: 'high' },
  'WARM LEAD': { probability: 60, label: 'medium' },
  'COLD LEAD': { probability: 30, label: 'low' },
  'DESCARTADO': { probability: 0, label: 'low' },
}

const DEFAULT_BADGE = { probability: 30, label: 'low' as LeadProbability }

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
