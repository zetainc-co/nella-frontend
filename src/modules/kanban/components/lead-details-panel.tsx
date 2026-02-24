'use client'

import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import type { LeadDetailsPanelProps } from '@/modules/kanban/types/kanban-types'
import { Phone, Mail } from 'lucide-react'

const stageLabels = {
  new: 'Nuevo',
  contacted: 'Calificado',
  proposal: 'Negociación',
  closed: 'Cerrado'
}

export function LeadDetailsPanel({ open, onClose }: LeadDetailsPanelProps) {
  const { selectedLeadId, leads } = useKanbanStore()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:w-[500px] glass-panel overflow-y-auto custom-scrollbar">
        <SheetHeader>
          <SheetTitle className="text-xl text-foreground">
            {lead.name || 'Sin nombre'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
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
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Estado
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {lead.lead_status || 'Sin clasificar'}
              </span>

              <span className="px-3 py-1 bg-[#CEF25D]/10 text-[#CEF25D] text-xs rounded-full">
                {stageLabels[lead.stage]}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumen IA
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {lead.ai_summary || 'Sin resumen disponible'}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                console.log('Ver perfil:', lead.id)
              }}
            >
              Ver perfil completo
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                console.log('Ir al chat:', lead.id)
              }}
            >
              Ir al chat
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
