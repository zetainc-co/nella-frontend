'use client'

import { Instagram, Facebook, Music, MessageCircle } from 'lucide-react'
import type { LeadStage, SourceChannel, KanbanColumnConfig } from '@/types/kanban-types'

// ============================================
// Constantes del Kanban (única fuente de verdad)
// ============================================

const STAGE_LABELS: Record<LeadStage, string> = {
  new: 'Nuevo',
  contacted: 'Calificado',
  proposal: 'Negociación',
  closed: 'Cerrado'
}

const STAGE_ORDER: LeadStage[] = ['new', 'contacted', 'proposal', 'closed']

const CHANNEL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
  whatsapp: MessageCircle
}

const CHANNEL_COLORS: Record<SourceChannel, string> = {
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  tiktok: 'text-cyan-500',
  whatsapp: 'text-green-500'
}

const CHANNEL_LABELS: Record<SourceChannel, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp'
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { stage: 'new', title: 'Nuevo' },
  { stage: 'contacted', title: 'Calificado' },
  { stage: 'proposal', title: 'Negociación' },
  { stage: 'closed', title: 'Cerrado' }
]

/**
 * Hook personalizado para acceder a constantes y utilidades de mapeo del Kanban
 * Proporciona funciones helper para trabajar con etapas y canales
 */
export function useKanbanConstants() {
  /**
   * Obtiene la etiqueta en español de una etapa
   */
  const getStageLabel = (stage: LeadStage): string => {
    return STAGE_LABELS[stage]
  }

  /**
   * Obtiene el índice de una etapa en el orden del flujo
   */
  const getStageIndex = (stage: LeadStage): number => {
    return STAGE_ORDER.indexOf(stage)
  }

  /**
   * Verifica si una etapa puede avanzar a otra (no retroceder)
   */
  const canMoveToStage = (fromStage: LeadStage, toStage: LeadStage): boolean => {
    const fromIndex = getStageIndex(fromStage)
    const toIndex = getStageIndex(toStage)
    return toIndex >= fromIndex
  }

  /**
   * Obtiene la siguiente etapa en el flujo
   */
  const getNextStage = (currentStage: LeadStage): LeadStage | null => {
    const currentIndex = getStageIndex(currentStage)
    return STAGE_ORDER[currentIndex + 1] || null
  }

  /**
   * Obtiene la etapa anterior en el flujo
   */
  const getPreviousStage = (currentStage: LeadStage): LeadStage | null => {
    const currentIndex = getStageIndex(currentStage)
    return currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null
  }

  /**
   * Obtiene la etiqueta en español de un canal
   */
  const getChannelLabel = (channel: SourceChannel): string => {
    return CHANNEL_LABELS[channel]
  }

  /**
   * Obtiene el ícono de un canal
   */
  const getChannelIcon = (channel: SourceChannel) => {
    return CHANNEL_ICONS[channel]
  }

  /**
   * Obtiene la clase de color de un canal
   */
  const getChannelColor = (channel: SourceChannel): string => {
    return CHANNEL_COLORS[channel]
  }

  /**
   * Verifica si una etapa es la primera
   */
  const isFirstStage = (stage: LeadStage): boolean => {
    return getStageIndex(stage) === 0
  }

  /**
   * Verifica si una etapa es la última
   */
  const isLastStage = (stage: LeadStage): boolean => {
    return getStageIndex(stage) === STAGE_ORDER.length - 1
  }

  /**
   * Obtiene todas las etapas disponibles
   */
  const getAllStages = () => STAGE_ORDER

  /**
   * Obtiene todos los canales disponibles
   */
  const getAllChannels = (): SourceChannel[] => {
    return Object.keys(CHANNEL_LABELS) as SourceChannel[]
  }

  return {
    // Constantes
    STAGE_LABELS,
    STAGE_ORDER,
    CHANNEL_ICONS,
    CHANNEL_COLORS,
    CHANNEL_LABELS,
    KANBAN_COLUMNS,

    // Funciones de utilidad para etapas
    getStageLabel,
    getStageIndex,
    canMoveToStage,
    getNextStage,
    getPreviousStage,
    isFirstStage,
    isLastStage,
    getAllStages,

    // Funciones de utilidad para canales
    getChannelLabel,
    getChannelIcon,
    getChannelColor,
    getAllChannels
  }
}

