'use client'

// DEPRECATED: This component has been replaced by LeadModal (lead-modal.tsx)
// which uses Dialog instead of Sheet for a Trello-style centered modal UX.
// This file is kept temporarily for potential rollback. Remove in future PR.

import { Phone, Mail, Building2, Instagram, Facebook, Music, MessageCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/stores/kanban-store'
import type { LeadDetailsPanelProps } from '@/types/kanban-types'

const channelIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
  whatsapp: MessageCircle
}

const channelColors = {
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  tiktok: 'text-cyan-500',
  whatsapp: 'text-green-500'
}

const stageLabels = {
  new: 'Nuevo',
  contacted: 'Contactado',
  proposal: 'En Propuesta',
  closed: 'Cierre'
}

export function LeadDetailsPanel({ open, onClose }: LeadDetailsPanelProps) {
  const { selectedLeadId, leads } = useKanbanStore()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  const ChannelIcon = channelIcons[lead.source_channel as keyof typeof channelIcons]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:w-[500px] glass-panel overflow-y-auto custom-scrollbar">
        <SheetHeader>
          <SheetTitle className="text-xl text-foreground">
            {lead.name || 'Sin nombre'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contacto
            </h3>

            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-4 h-4 text-[#CEF25D]" />
              <span>{lead.phone}</span>
            </div>

            {lead.email && (
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-4 h-4 text-[#CEF25D]" />
                <span>{lead.email}</span>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3 text-foreground">
                <Building2 className="w-4 h-4 text-[#CEF25D]" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>

          {/* Canal y Etapa */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Estado
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChannelIcon className={cn('w-4 h-4', channelColors[lead.source_channel as keyof typeof channelColors])} />
                <span className="text-sm text-foreground capitalize">
                  {lead.source_channel}
                </span>
              </div>

              <span className="px-3 py-1 bg-[#CEF25D]/10 text-[#CEF25D] text-xs rounded-full">
                {stageLabels[lead.stage as keyof typeof stageLabels]}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              En esta etapa: {lead.time_in_stage}
            </div>
          </div>

          {/* Resumen IA */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumen IA
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {lead.ai_summary}
            </p>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                // TODO: Navegar a /contacts/[id]
                console.log('Ver perfil:', lead.id)
              }}
            >
              Ver perfil completo
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                // TODO: Navegar a /chat?lead=[id]
                console.log('Ir al chat:', lead.id)
              }}
            >
              Ir al chat
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                console.log('Asignar vendedor:', lead.id)
              }}
            >
              Asignar vendedor
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
