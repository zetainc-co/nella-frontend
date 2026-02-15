'use client'

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useKanbanConstants } from '@/hooks/kanban'
import { useKanbanStore } from '@/stores/kanban-store'
import type { LeadModalProps } from '@/types/kanban-types'
import { Phone, Mail, Building2, Clock, Sparkles, ArrowRight } from 'lucide-react'

export function LeadModal({ open, onClose }: LeadModalProps) {
  const { selectedLeadId, leads } = useKanbanStore()
  const { getChannelIcon, getChannelColor, getChannelLabel, getStageLabel } = useKanbanConstants()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  const ChannelIcon = getChannelIcon(lead.source_channel)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-hidden glass-panel p-0 border-primary-neon/20">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden">
          {/* Gradiente de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-neon/10 via-transparent to-transparent" />

          <DialogHeader className="relative p-6 pb-5">
            <div className="flex items-start gap-4">
              {/* Ícono de canal con glow */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary-neon/20 blur-xl rounded-full" />
                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-primary-neon/30">
                  <ChannelIcon className={cn('w-6 h-6', getChannelColor(lead.source_channel))} />
                </div>
              </div>

              {/* Nombre y badge de estado */}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                  {lead.name || lead.phone}
                </DialogTitle>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Badge de etapa con gradiente */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary-neon/20 to-primary-neon/10 border border-primary-neon/30 text-primary-neon text-xs font-semibold rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-neon animate-pulse" />
                    {getStageLabel(lead.stage)}
                  </span>

                  {/* Canal */}
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {getChannelLabel(lead.source_channel)}
                  </span>

                  {/* Tiempo */}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.time_in_stage}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Línea divisoria con glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary-neon/30 to-transparent" />
        </div>

        {/* Body con scroll */}
        <div className="overflow-y-auto custom-scrollbar max-h-[calc(90vh-280px)]">
          <div className="p-6 space-y-4">
            {/* Card de Contacto */}
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary-neon/30 hover:shadow-lg hover:shadow-primary-neon/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-neon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary-neon rounded-full" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Información de Contacto
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-foreground group/item">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-neon/10 border border-primary-neon/20">
                      <Phone className="w-4 h-4 text-primary-neon" />
                    </div>
                    <span className="text-sm font-medium">{lead.phone}</span>
                  </div>

                  {lead.email && (
                    <div className="flex items-center gap-3 text-foreground group/item">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-neon/10 border border-primary-neon/20">
                        <Mail className="w-4 h-4 text-primary-neon" />
                      </div>
                      <span className="text-sm font-medium">{lead.email}</span>
                    </div>
                  )}

                  {lead.company && (
                    <div className="flex items-center gap-3 text-foreground group/item">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-neon/10 border border-primary-neon/20">
                        <Building2 className="w-4 h-4 text-primary-neon" />
                      </div>
                      <span className="text-sm font-medium">{lead.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card de Resumen IA */}
            <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary-neon/30 hover:shadow-lg hover:shadow-primary-neon/5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-neon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary-neon rounded-full" />
                  <Sparkles className="w-3.5 h-3.5 text-primary-neon" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Análisis IA
                  </h3>
                </div>

                <div className="relative">
                  {/* Gradiente fade al final si hay scroll */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />

                  <p className="text-sm text-foreground/90 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {lead.ai_summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="relative border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="p-6 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between group border-primary-neon/20 hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/50 transition-all duration-300"
              onClick={() => {
                // TODO: Navegar a /contacts/[id]
                console.log('Ver perfil:', lead.id)
              }}
            >
              <span className="font-medium">Ver perfil completo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between group border-primary-neon/20 hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/50 transition-all duration-300"
              onClick={() => {
                // TODO: Navegar a /chat?lead=[id]
                console.log('Ir al chat:', lead.id)
              }}
            >
              <span className="font-medium">Ir al chat</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between group border-primary-neon/20 hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/50 transition-all duration-300"
              onClick={() => {
                console.log('Asignar vendedor:', lead.id)
              }}
            >
              <span className="font-medium">Asignar vendedor</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
