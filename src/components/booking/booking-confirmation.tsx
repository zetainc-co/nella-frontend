import { CheckCircle2, CalendarDays, Clock, Video } from 'lucide-react'
import { BookingAgent, BookingLead, MONTH_NAMES } from '@/types/booking'

interface BookingConfirmationProps {
  agent: BookingAgent
  lead: BookingLead
  selectedDay: number
  selectedSlot: string
  month: number
  year: number
}

export function BookingConfirmation({
  agent,
  lead,
  selectedDay,
  selectedSlot,
  month,
  year,
}: BookingConfirmationProps) {
  return (
    <div
      className="flex flex-col items-center gap-6 p-8 text-center"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Ícono de éxito */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 72,
          height: 72,
          background: 'rgba(158,255,0,0.1)',
          border: '1px solid rgba(158,255,0,0.3)',
          boxShadow: '0 0 30px rgba(158,255,0,0.2)',
        }}
      >
        <CheckCircle2 size={36} style={{ color: '#9EFF00' }} />
      </div>

      {/* Título */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#f0f4ff' }}>
          ¡Reunión agendada!
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(240,244,255,0.55)' }}>
          Te esperamos, {lead.name}.
        </p>
      </div>

      {/* Detalles */}
      <div
        className="w-full rounded-xl p-5 flex flex-col gap-3 text-left"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <CalendarDays size={16} className="shrink-0" style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {selectedDay} de {MONTH_NAMES[month]} de {year}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} className="shrink-0" style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {selectedSlot} — {agent.duration} minutos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Video size={16} className="shrink-0" style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {agent.platform}
          </span>
        </div>
      </div>

      {/* Agente */}
      <p className="text-sm" style={{ color: 'rgba(240,244,255,0.45)' }}>
        Tu reunión es con{' '}
        <span style={{ color: 'rgba(240,244,255,0.75)' }}>{agent.name}</span>
      </p>
    </div>
  )
}
