// src/components/calendario/modals/event-details-modal.tsx
'use client'

import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Video, FileText, User, Building2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Modal } from '@shared/components/modal/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CalendarEvent } from '@/modules/calendar/types/calendar-types'
import { getProjectColors } from '@/modules/calendar/types/calendar-types'

interface EventDetailsModalProps {
  open: boolean
  onClose: () => void
  event: CalendarEvent | null
}

const STAGE_LABELS: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  proposal: 'Propuesta',
  closed: 'Cierre',
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
}

const STATUS_ICONS = {
  confirmed: CheckCircle2,
  pending: AlertCircle,
  cancelled: XCircle,
}

function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function EventDetailsModal({ open, onClose, event }: EventDetailsModalProps) {
  if (!event) return null

  const colors = getProjectColors(event.project)
  const StatusIcon = STATUS_ICONS[event.confirmationStatus] || AlertCircle

  const headerContent = (
    <div className="flex items-start gap-3">
      <div
        className="size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: colors.bg }}
      >
        <Calendar className="size-5" style={{ color: colors.text }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            {event.project}
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-foreground leading-snug">{event.title}</h2>
      </div>
    </div>
  )

  const footerContent = (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose}>
        Cerrar
      </Button>
    </div>
  )

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      header={headerContent}
      footer={footerContent}
      size="lg"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Fecha y Hora</p>
              <p className="text-sm text-foreground">{formatDate(event.date)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Cliente</p>
              <p className="text-sm text-foreground">{event.client}</p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">Ubicación / Plataforma</p>
                <p className="text-sm text-foreground">{event.location}</p>
              </div>
            </div>
          )}

          {(event.videoCallLink || event.googleMeetLink) && (
            <div className="flex items-start gap-3">
              <Video className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">Link de Videollamada</p>
                <a
                  href={event.googleMeetLink || event.videoCallLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {event.googleMeetLink || event.videoCallLink}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <StatusIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Estado de Confirmación</p>
              <Badge
                variant={
                  event.confirmationStatus === 'confirmed'
                    ? 'default'
                    : event.confirmationStatus === 'cancelled'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {STATUS_LABELS[event.confirmationStatus]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contexto del Lead */}
        {(event.leadStage || event.hasBudget) && (
          <div className="rounded-lg border border-border p-4 space-y-4 bg-accent/20">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Contexto del Lead</p>
            </div>

            {event.leadStage && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Etapa del Lead</p>
                <Badge variant="outline">{STAGE_LABELS[event.leadStage] || event.leadStage}</Badge>
              </div>
            )}

            {event.hasBudget && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Presupuesto</p>
                <Badge variant={event.hasBudget === 'approved' ? 'default' : 'secondary'}>
                  {event.hasBudget === 'approved' ? 'Aprobado' : 'Pendiente'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Notas */}
        {event.notes && (
          <div className="flex items-start gap-3">
            <FileText className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">Notas Adicionales</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{event.notes}</p>
            </div>
          </div>
        )}

        {/* Estado de sincronización */}
        {event.syncStatus && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {event.syncStatus === 'synced' && (
              <>
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Sincronizado con Google Calendar</span>
              </>
            )}
            {event.syncStatus === 'local' && (
              <>
                <AlertCircle className="size-4 text-yellow-500" />
                <span>Solo en Nella (no sincronizado)</span>
              </>
            )}
            {event.syncStatus === 'error' && (
              <>
                <XCircle className="size-4 text-red-500" />
                <span>Error al sincronizar</span>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
