import { CheckCircle2, CalendarDays, Clock, Video, User } from 'lucide-react';
import type { BookingConfirmResponse } from '@/modules/calendar/types/booking';
import { MONTH_NAMES } from '@/modules/calendar/types/booking';

interface BookingConfirmationProps {
  confirmData: BookingConfirmResponse;
  leadName: string;
}

// El backend devuelve scheduledAt con la hora local del agente en formato ISO.
// Se extrae la fecha y hora directamente del string sin conversión de zona horaria.
function formatScheduledAt(isoString: string): { date: string; time: string } {
  const [datePart, timePart] = isoString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const time = timePart.substring(0, 5) // "09:00"
  const date = `${day} de ${MONTH_NAMES[month - 1]} de ${year}`
  return { date, time }
}

export function BookingConfirmation({
  confirmData,
  leadName,
}: BookingConfirmationProps) {
  const { date: localDate, time: localTime } = formatScheduledAt(confirmData.scheduledAt);

  return (
    <div
      className="flex flex-col items-center gap-6 p-8 text-center"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Icono de exito */}
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

      {/* Titulo */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: '#f0f4ff' }}>
          ¡Reunion agendada!
        </h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(240,244,255,0.55)' }}>
          Te esperamos, {leadName}.
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
            {localDate} — {localTime}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} className="shrink-0" style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {confirmData.durationMin} minutos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Video size={16} className="shrink-0" style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {confirmData.platform}
          </span>
        </div>
      </div>

      {/* Agente */}
      <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(240,244,255,0.45)' }}>
        <User size={14} className="shrink-0" />
        Tu reunion es con{' '}
        <span style={{ color: 'rgba(240,244,255,0.75)' }}>{confirmData.agentName}</span>
      </p>
    </div>
  );
}
