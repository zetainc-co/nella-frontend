'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES } from '@/types/booking'

interface CalendarPickerProps {
  availableDays: number[]
  selectedDay: number | null
  onSelectDay: (day: number) => void
  month?: number  // 0-indexed (0 = enero)
  year?: number
}

const DAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// Retorna el offset del primer día (0 = Lunes, 6 = Domingo)
function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // getDay(): 0=domingo, 1=lunes... convertir a lunes=0
  return day === 0 ? 6 : day - 1
}

export function CalendarPicker({
  availableDays,
  selectedDay,
  onSelectDay,
  month,
  year,
}: CalendarPickerProps) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(month ?? today.getMonth())
  const [viewYear, setViewYear] = useState(year ?? today.getFullYear())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOffset = getFirstDayOffset(viewYear, viewMonth)

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  // Construir array de celdas (null = celda vacía de offset)
  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="flex flex-col gap-5 p-6 md:p-8">
      {/* Navegación de mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(240,244,255,0.6)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(158,255,0,0.3)'
            e.currentTarget.style.color = '#9EFF00'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'rgba(240,244,255,0.6)'
          }}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          onClick={nextMonth}
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(240,244,255,0.6)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(158,255,0,0.3)'
            e.currentTarget.style.color = '#9EFF00'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = 'rgba(240,244,255,0.6)'
          }}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Cabeceras de días */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            className="flex items-center justify-center text-xs font-medium pb-1"
            style={{ color: 'rgba(240,244,255,0.35)' }}
          >
            {d}
          </div>
        ))}

        {/* Celdas del mes */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />
          }

          const isAvailable = availableDays.includes(day)
          const isSelected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => isAvailable && onSelectDay(day)}
              disabled={!isAvailable}
              className="flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 relative"
              style={{
                height: 38,
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                background: isSelected
                  ? 'rgba(158,255,0,0.15)'
                  : 'transparent',
                border: isSelected
                  ? '1px solid rgba(158,255,0,0.4)'
                  : '1px solid transparent',
                boxShadow: isSelected
                  ? '0 0 10px 0 rgba(158,255,0,0.15)'
                  : 'none',
                color: isSelected
                  ? '#9EFF00'
                  : isAvailable
                  ? '#f0f4ff'
                  : 'rgba(240,244,255,0.2)',
              }}
              onMouseEnter={e => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.background = 'rgba(158,255,0,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(158,255,0,0.2)'
                }
              }}
              onMouseLeave={e => {
                if (isAvailable && !isSelected) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
              aria-label={`${day} de ${MONTH_NAMES[viewMonth]}`}
            >
              <span>{day}</span>
              {/* Punto de disponibilidad */}
              {isAvailable && !isSelected && (
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#9EFF00',
                    position: 'absolute',
                    bottom: 4,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
