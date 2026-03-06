'use client'

import {
  Sheet,
  SheetTitle,
  SheetHeader,
  SheetContent,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MapPin, Sparkles, User, Tag, UserCircle, MoveRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { mapLeadStatusToStage, mapStageToBadge } from '@/modules/kanban/hooks/use-kanban-constants'

interface ContactProfileDrawerProps {
  open: boolean
  onClose: () => void
  contact: {
    id: number
    name: string | null
    phone: string
    email: string | null
    lead_status?: string
    handoff_active?: boolean
    ai_summary?: string | null
    tags?: string[]
    last_interaction_at?: string | null
    source?: string | null
    next_purchase_prediction?: string | null
  } | null
  assignedAgentId?: string | null
  agentName?: string | null
}

const getInitials = (name: string | null, phone: string) => {
  if (name && name.trim()) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }
  // Usar los últimos 2 dígitos del teléfono si no hay nombre
  return phone.slice(-2)
}

const getLeadStatusColor = (status?: string) => {
  const colors: Record<string, string> = {
    'HOT LEAD': 'bg-red-500/10 text-red-400',
    'WARM LEAD': 'bg-orange-500/10 text-orange-400',
    'COLD': 'bg-blue-500/10 text-blue-400',
    'QUALIFIED': 'bg-green-500/10 text-green-400',
  }
  return colors[status || ''] || 'bg-gray-500/10 text-gray-400'
}

const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Nunca'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays} días`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ContactProfileDrawer({
  open,
  onClose,
  contact,
  assignedAgentId,
  agentName
}: ContactProfileDrawerProps) {
  const router = useRouter()

  if (!contact) return null

  // Calcular métricas del Kanban basadas en el lead_status
  const stage = mapLeadStatusToStage(contact.lead_status || null)
  const { probability, displayLabel } = mapStageToBadge(stage)

  const handleViewFullProfile = () => {
    router.push(`/contacts/${contact.id}`)
    onClose()
  }

  const handleMoveToKanban = () => {
    router.push(`/trending`)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:w-[400px] flex flex-col gap-0 p-0 overflow-hidden bg-[#0a0a0a]">

        {/* Header centrado con avatar grande */}
        <div className="px-6 pt-8 pb-6 border-b border-white/[0.06] shrink-0">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Avatar grande */}
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-black text-2xl font-bold shrink-0 shadow-lg"
              style={{ backgroundColor: '#9EFF00' }}
            >
              {getInitials(contact.name, contact.phone)}
            </div>

            {/* Nombre */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#f0f4ff]">
                {contact.name || contact.phone}
              </h2>
              {/* TODO: Agregar job_title y company si están disponibles en custom_attributes */}
              {/* <p className="text-sm text-[#f0f4ff]/60">Directora Comercial</p>
              <p className="text-xs text-[#f0f4ff]/40">TechCorp SA</p> */}
            </div>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-6">

          {/* Datos de Contacto */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#f0f4ff]">
              Datos de Contacto
            </h3>
            <div className="space-y-4">
              {/* Email */}
              {contact.email ? (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#f0f4ff]/40 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#f0f4ff]/40 mb-1">Email</p>
                    <p className="text-sm text-[#f0f4ff] break-all">{contact.email}</p>
                  </div>
                </div>
              ) : null}

              {/* Teléfono / WhatsApp */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#f0f4ff]/40 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#f0f4ff]/40 mb-1">Teléfono / WhatsApp</p>
                  <p className="text-sm text-[#f0f4ff]">{contact.phone}</p>
                </div>
              </div>

              {/* TODO: Ubicación si está disponible */}
              {/* <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#f0f4ff]/40 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#f0f4ff]/40 mb-1">Ubicación</p>
                  <p className="text-sm text-[#f0f4ff]">CDMX, México</p>
                </div>
              </div> */}
            </div>
          </div>

          {/* Agente asignado */}
          {assignedAgentId && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#f0f4ff]">
                Agente Asignado
              </h3>
              <div className="flex items-start gap-3">
                <UserCircle className="w-5 h-5 text-[#f0f4ff]/40 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0f4ff]">
                    {agentName || (
                      <span className="text-[#f0f4ff]/60 italic">
                        Agente no disponible
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Última Actividad */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#f0f4ff]">
              Última Actividad
            </h3>
            <div className="space-y-3">
              {/* Tiempo relativo */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${contact.last_interaction_at ? 'bg-[#9EFF00] animate-pulse' : 'bg-[#f0f4ff]/20'}`} />
                <span className={`text-sm font-medium ${contact.last_interaction_at ? 'text-[#9EFF00]' : 'text-[#f0f4ff]/40'}`}>
                  {formatRelativeTime(contact.last_interaction_at)}
                </span>
              </div>
              {/* Fecha completa */}
              {contact.last_interaction_at && (
                <p className="text-xs text-[#f0f4ff]/60 pl-4">
                  {formatFullDate(contact.last_interaction_at)}
                </p>
              )}
            </div>
          </div>

          {/* Información del Deal */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#f0f4ff]">
              Oportunidad
            </h3>
            <div className="space-y-3">
              {/* Predicción de compra */}
              <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                <span className="text-xs text-[#f0f4ff]/60">Cierre estimado</span>
                <span className={`text-sm ${contact.next_purchase_prediction ? 'text-[#f0f4ff]' : 'text-[#f0f4ff]/40'}`}>
                  {contact.next_purchase_prediction ? formatFullDate(contact.next_purchase_prediction) : 'No definido'}
                </span>
              </div>

              {/* Fuente del lead */}
              <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                <span className="text-xs text-[#f0f4ff]/60">Fuente</span>
                <span className={`text-sm capitalize ${contact.source ? 'text-[#f0f4ff]' : 'text-[#f0f4ff]/40'}`}>
                  {contact.source || 'No especificada'}
                </span>
              </div>
            </div>
          </div>

          {/* Métricas IA */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#f0f4ff]">
              Métricas IA
            </h3>

            {/* Probabilidad de Cierre - Barra */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#f0f4ff]/60">Probabilidad de Cierre</span>
                <span className="text-base font-bold text-[#9EFF00]">{probability}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9EFF00] rounded-full transition-all duration-500"
                  style={{ width: `${probability}%` }}
                />
              </div>
            </div>

            {/* Probabilidad de Cierre - Círculo */}
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                {/* Círculo de fondo */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#9EFF00"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - probability / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                {/* Porcentaje en el centro */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#f0f4ff]">{probability}%</span>
                </div>
              </div>
            </div>

            {/* Etiquetas Kanban */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs text-[#f0f4ff]/60">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/[0.05] border border-white/[0.1] text-[#f0f4ff]/80 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón Mover a Kanban */}
            <Button
              onClick={handleMoveToKanban}
              className="w-full bg-[#9EFF00] hover:bg-[#8EEF00] text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MoveRight className="w-4 h-4" />
              Mover a Kanban
            </Button>
          </div>

          {/* Resumen IA */}
          {contact.ai_summary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9EFF00]" />
                <h3 className="text-base font-semibold text-[#f0f4ff]">
                  Resumen IA
                </h3>
              </div>
              <p className="text-sm text-[#f0f4ff]/70 leading-relaxed whitespace-pre-line">
                {contact.ai_summary}
              </p>
            </div>
          )}

          {/* Estado */}
          {(contact.lead_status || contact.handoff_active) && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#f0f4ff]">
                Estado
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {contact.lead_status && (
                  <span className={`px-3 py-1 text-xs rounded-md font-medium ${getLeadStatusColor(contact.lead_status)}`}>
                    {contact.lead_status}
                  </span>
                )}
                {contact.handoff_active && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-md font-medium">
                    Handoff activo
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones fijas en el pie */}
        <div className="px-6 py-4 border-t border-white/[0.06] shrink-0 space-y-2 bg-[#0a0a0a]">
          <Button
            variant="outline"
            className="w-full justify-center bg-transparent border-[#9EFF00]/30 text-[#9EFF00] hover:bg-[#9EFF00]/10 hover:border-[#9EFF00] transition-colors"
            onClick={handleViewFullProfile}
          >
            <User className="w-4 h-4 mr-2" />
            Ver perfil completo
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  )
}
