'use client'

import { Phone, Mail, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/stores/kanban-store'
import { useKanbanConstants } from '@/hooks/kanban'
import { cn } from '@/lib/utils'
import type { LeadModalProps } from '@/types/kanban-types'

export function LeadModal({ open, onClose }: LeadModalProps) {
  const { selectedLeadId, leads } = useKanbanStore()
  const { getChannelIcon, getChannelColor, getChannelLabel, getStageLabel } = useKanbanConstants()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  const ChannelIcon = getChannelIcon(lead.source_channel)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-panel custom-scrollbar p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl text-foreground">
            {lead.name || lead.phone}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contacto
            </h3>

            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-4 h-4 text-primary-neon" />
              <span>{lead.phone}</span>
            </div>

            {lead.email && (
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-4 h-4 text-primary-neon" />
                <span>{lead.email}</span>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3 text-foreground">
                <Building2 className="w-4 h-4 text-primary-neon" />
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
                <ChannelIcon className={cn('w-4 h-4', getChannelColor(lead.source_channel))} />
                <span className="text-sm text-foreground">
                  {getChannelLabel(lead.source_channel)}
                </span>
              </div>

              <span className="px-3 py-1 bg-primary-neon/10 text-primary-neon text-xs rounded-full">
                {getStageLabel(lead.stage)}
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
            <p className="text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
              {lead.ai_summary}
            </p>
          </div>
        </div>

        {/* Footer: Acciones */}
        <div className="p-6 pt-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              // TODO: Navegar a /contacts/[id]
              console.log('Ver perfil:', lead.id)
            }}
          >
            Ver perfil completo
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              // TODO: Navegar a /chat?lead=[id]
              console.log('Ir al chat:', lead.id)
            }}
          >
            Ir al chat
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              console.log('Asignar vendedor:', lead.id)
            }}
          >
            Asignar vendedor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
