'use client'

import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'
import { useKanbanLeads } from '@/modules/kanban/hooks/use-kanban-leads'
import type { LeadDetailsPanelProps } from '@/modules/kanban/types/kanban-types'
import { Phone, Mail, Sparkles, User } from 'lucide-react'
import { getInitials } from '@shared/utils'
import { useKanbanConstants } from '@/modules/kanban/hooks'

export function LeadDetailsPanel({ open, onClose }: LeadDetailsPanelProps) {
  const selectedLeadId = useKanbanStore(s => s.selectedLeadId)
  const { data: leads = [] } = useKanbanLeads()
  const { STAGE_LABELS } = useKanbanConstants()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:w-[480px] flex flex-col gap-0 p-0 overflow-hidden">

        {/* Header con identidad del lead */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-black text-sm font-bold shrink-0"
              style={{ backgroundColor: '#8BD21D' }}
            >
              {getInitials(lead.name || '?')}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg text-foreground truncate">
                {lead.name || 'Sin nombre'}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{lead.phone}</p>
            </div>
            <span className="px-3 py-1 bg-[#8BD21D]/10 text-[#8BD21D] text-xs font-medium rounded-full shrink-0">
              {STAGE_LABELS[lead.stage]}
            </span>
          </div>
        </SheetHeader>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">

          {/* Resumen IA — protagonista */}
          <div className="rounded-xl border border-[#8BD21D]/20 bg-[#8BD21D]/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8BD21D]" />
              <span className="text-xs font-semibold text-[#8BD21D] uppercase tracking-wider">
                Resumen IA
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {lead.ai_summary || 'Sin resumen disponible.'}
            </p>
          </div>

          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contacto
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{lead.phone}</span>
              </div>
              {lead.email ? (
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-muted-foreground/50">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Sin email</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estado
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {lead.lead_status && (
                <Badge variant={lead.probability_label} size="default">
                  {lead.lead_status}
                </Badge>
              )}
              {lead.handoff_active && (
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full font-medium">
                  Handoff activo
                </span>
              )}
              {!lead.lead_status && !lead.handoff_active && (
                <span className="text-sm text-muted-foreground">Sin clasificar</span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones fijas en el pie */}
        <div className="px-6 py-4 border-t border-border shrink-0 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-[#8BD21D]/10 hover:text-[#8BD21D] hover:border-[#8BD21D]/30"
            onClick={() => {}}
          >
            <User className="w-4 h-4 mr-2" />
            Ver perfil completo
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}
