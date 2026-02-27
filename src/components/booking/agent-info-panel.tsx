import { Clock, Video } from 'lucide-react'
import { BookingAgent, BookingLead } from '@/types/booking'

interface AgentInfoPanelProps {
  agent: BookingAgent
  lead: BookingLead
}

export function AgentInfoPanel({ agent, lead }: AgentInfoPanelProps) {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Avatar + Nombre del agente */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-xl font-bold text-lg shrink-0"
          style={{
            width: 56,
            height: 56,
            background: 'rgba(158,255,0,0.15)',
            border: '1px solid rgba(158,255,0,0.3)',
            color: '#9EFF00',
          }}
        >
          {agent.initials}
        </div>
        <div>
          <div className="font-semibold text-base" style={{ color: '#f0f4ff' }}>
            {agent.name}
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>
            {agent.role}
          </div>
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

      {/* Detalles de la reunión */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Clock
            className="shrink-0"
            size={16}
            style={{ color: 'rgba(240,244,255,0.45)' }}
          />
          <span className="text-sm" style={{ color: 'rgba(240,244,255,0.7)' }}>
            {agent.duration} minutos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Video
            className="shrink-0"
            size={16}
            style={{ color: 'rgba(240,244,255,0.45)' }}
          />
          <span className="text-sm" style={{ color: 'rgba(240,244,255,0.7)' }}>
            {agent.platform}
          </span>
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

      {/* Saludo al lead */}
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold" style={{ color: '#9EFF00' }}>
          ¡Hola, {lead.name}!
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,244,255,0.55)' }}>
          Tu reunión está a un paso. Elige el día y la hora que mejor te funcionen
          y quedará todo listo.
        </p>
      </div>
    </div>
  )
}
