// src/components/calendario/modals/links-modal.tsx
'use client'

import { Copy, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LinksModalProps {
  open: boolean
  onClose: () => void
}

const MOCK_LINK = 'citas.nella.com/equipo/demo'

export function LinksModal({ open, onClose }: LinksModalProps) {
  function handleCopy() {
    navigator.clipboard.writeText(`https://${MOCK_LINK}`)
    toast.success('Link copiado al portapapeles')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Enlaces de Agendamiento Activos
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <div className="rounded-lg p-4 border-2 border-purple-500/60 bg-background/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Demo Comercial (Equipo)</h3>
                  <span className="text-purple-400 text-base">✦</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rotacion automatica de vendedores
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-md px-2 py-0.5 font-medium">
                <Calendar className="size-3" />
                Sincronizado
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {['JL', 'AN', 'RS'].map((initials, i) => (
                  <div
                    key={i}
                    className="size-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white"
                    style={{
                      backgroundColor: ['#3b82f6', '#a855f7', '#22c55e'][i],
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">3 vendedores en rotacion</span>
            </div>

            <p className="text-xs text-muted-foreground font-medium mb-2">
              Link publico de agendamiento
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-muted-foreground font-mono truncate">
                {MOCK_LINK}
              </div>
              <Button
                onClick={handleCopy}
                className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                <Copy className="size-4" />
                Copiar Link
              </Button>
            </div>

            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                🕐 30 min por reunion
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3" /> Asignacion inteligente
              </span>
            </div>
          </div>

          <div className="mt-4 bg-accent/40 rounded-lg p-3 text-xs text-muted-foreground">
            <span className="text-yellow-400 mr-1">💡 Tip:</span>
            Los clientes que agenden a traves de este link seran asignados automaticamente al
            vendedor con menos carga de trabajo.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
