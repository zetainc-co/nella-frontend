import { MONTH_NAMES } from '@/types/booking'

interface TimeSlotsProps {
  utcSlots: string[]
  selectedUtcSlot: string | null
  onSelectSlot: (utcSlot: string) => void
  selectedDate: string
}

// El backend devuelve los horarios en hora local del agente — se muestran tal como vienen.
function formatSlotDisplay(slot: string): string {
  return slot
}

function formatDateDisplay(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  return `${day} de ${MONTH_NAMES[month - 1]} de ${year}`
}

export function TimeSlots({ utcSlots, selectedUtcSlot, onSelectSlot, selectedDate }: TimeSlotsProps) {
  return (
    <div
      className="flex flex-col gap-4 px-6 pb-6 md:px-8 md:pb-8"
      style={{ animation: 'slideIn 0.2s ease-out' }}
    >
      {/* Titulo del dia seleccionado */}
      <div>
        <p className="text-sm font-medium" style={{ color: 'rgba(240,244,255,0.55)' }}>
          Horarios disponibles
        </p>
        <p className="text-base font-semibold mt-0.5" style={{ color: '#f0f4ff' }}>
          {formatDateDisplay(selectedDate)}
        </p>
      </div>

      {/* Grid de slots */}
      {utcSlots.length === 0 ? (
        <p className="text-sm text-center py-4" style={{ color: 'rgba(240,244,255,0.35)' }}>
          No hay horarios disponibles para este dia.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {utcSlots.map(utcSlot => {
          const isSelected = selectedUtcSlot === utcSlot
          const localDisplay = formatSlotDisplay(utcSlot)
          return (
            <button
              key={utcSlot}
              onClick={() => onSelectSlot(utcSlot)}
              aria-label={`Seleccionar horario ${localDisplay}`}
              className="rounded-lg text-sm font-medium transition-all duration-150 py-2.5"
              style={{
                background: isSelected ? '#9EFF00' : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? '1px solid #9EFF00'
                  : '1px solid rgba(255,255,255,0.08)',
                color: isSelected ? '#0a1015' : 'rgba(240,244,255,0.7)',
                boxShadow: isSelected ? '0 0 14px rgba(158,255,0,0.3)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(158,255,0,0.35)'
                  e.currentTarget.style.background = 'rgba(158,255,0,0.08)'
                  e.currentTarget.style.color = '#f0f4ff'
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'rgba(240,244,255,0.7)'
                }
              }}
            >
              {localDisplay}
            </button>
          )
        })}
        </div>
      )}
    </div>
  )
}
