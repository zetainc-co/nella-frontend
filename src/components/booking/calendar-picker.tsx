'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES } from '@/types/booking'

interface CalendarPickerProps {
  availableDays: number[]
  selectedDay: number | null
  onSelectDay: (day: number) => void
  month?: number  // ignorado — se usa weekStart internamente
  year?: number   // ignorado — se usa weekStart internamente
  onMonthChange?: (month: number, year: number) => void
}

const DAY_HEADERS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

// Retorna el lunes de la semana que contiene `date`
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  // getDay: 0=domingo → retroceder 6, resto → retroceder (day - 1)
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d
}

export function CalendarPicker({
  availableDays,
  selectedDay,
  onSelectDay,
  onMonthChange,
}: CalendarPickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentWeekStart = getWeekStart(today)
  const [weekStart, setWeekStart] = useState<Date>(() => new Date(currentWeekStart))

  // 7 fechas de la semana visible (Lu → Do)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  // Solo se puede retroceder si la semana visible no es la semana actual
  const canGoPrev = weekStart.getTime() > currentWeekStart.getTime()

  function prevWeek() {
    if (!canGoPrev) return
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() - 7)
    setWeekStart(newStart)
    onMonthChange?.(newStart.getMonth(), newStart.getFullYear())
  }

  function nextWeek() {
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() + 7)
    setWeekStart(newStart)
    onMonthChange?.(newStart.getMonth(), newStart.getFullYear())
  }

  // "23 Feb — 1 Mar 2026"  o  "24 — 30 Mar 2026"
  function getWeekLabel(): string {
    const first = weekDays[0]
    const last = weekDays[6]
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} — ${last.getDate()} ${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`
    }
    return `${first.getDate()} ${MONTH_NAMES[first.getMonth()]} — ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`
  }

  return (
    <div className="flex flex-col gap-5 p-6 md:p-8">
      {/* Navegación de semana */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevWeek}
          disabled={!canGoPrev}
          className="flex items-center justify-center rounded-lg transition-all duration-150"
          style={{
            width: 32,
            height: 32,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: canGoPrev ? 'rgba(240,244,255,0.6)' : 'rgba(240,244,255,0.18)',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => {
            if (canGoPrev) {
              e.currentTarget.style.borderColor = 'rgba(158,255,0,0.3)'
              e.currentTarget.style.color = '#9EFF00'
            }
          }}
          onMouseLeave={e => {
            if (canGoPrev) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'rgba(240,244,255,0.6)'
            }
          }}
          aria-label="Semana anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
          {getWeekLabel()}
        </span>

        <button
          onClick={nextWeek}
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
          aria-label="Semana siguiente"
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

        {/* Celdas de la semana visible */}
        {weekDays.map((date, idx) => {
          const day = date.getDate()
          const isPast = date.getTime() < today.getTime()
          const isToday = date.getTime() === today.getTime()
          const isAvailable = availableDays.includes(day) && !isPast
          const isSelected = selectedDay === day

          return (
            <button
              key={idx}
              onClick={() => isAvailable && onSelectDay(day)}
              disabled={!isAvailable}
              className="flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 relative"
              style={{
                height: 38,
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                background: isSelected
                  ? 'rgba(158,255,0,0.15)'
                  : isToday
                  ? 'rgba(255,255,255,0.04)'
                  : 'transparent',
                border: isSelected
                  ? '1px solid rgba(158,255,0,0.4)'
                  : isToday
                  ? '1px solid rgba(255,255,255,0.1)'
                  : '1px solid transparent',
                boxShadow: isSelected ? '0 0 10px 0 rgba(158,255,0,0.15)' : 'none',
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
                  e.currentTarget.style.background = isToday ? 'rgba(255,255,255,0.04)' : 'transparent'
                  e.currentTarget.style.borderColor = isToday ? 'rgba(255,255,255,0.1)' : 'transparent'
                }
              }}
              aria-label={`${day} de ${MONTH_NAMES[date.getMonth()]}`}
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
