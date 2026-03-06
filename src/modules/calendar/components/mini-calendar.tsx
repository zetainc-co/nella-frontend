// src/components/calendario/mini-calendar.tsx
'use client'

import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameWeek,
  isToday,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarStore } from '@/modules/calendar/stores/calendar-store'

const DAY_NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function getMonthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days: Date[] = []
  let current = start
  while (current <= end) {
    days.push(current)
    current = addDays(current, 1)
  }
  return days
}

export function MiniCalendar() {
  const [viewMonth, setViewMonth] = useState(() => new Date())
  const { currentWeekStart, goToDate } = useCalendarStore()

  const monthDays = getMonthGrid(viewMonth)
  const monthLabel = format(viewMonth, 'MMMM yyyy', { locale: es })
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  function handleDayClick(day: Date) {
    goToDate(day)
    // Si el día pertenece a otro mes, actualizar la vista del mini calendario
    if (!isSameMonth(day, viewMonth)) {
      setViewMonth(day)
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-bold" style={{ color: '#f0f4ff' }}>{capitalizedLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(240,244,255,0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#f0f4ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(240,244,255,0.5)'
            }}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(240,244,255,0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#f0f4ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(240,244,255,0.5)'
            }}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((name, i) => (
          <div key={i} className="text-center text-xs font-semibold py-2" style={{ color: 'rgba(240,244,255,0.4)' }}>
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const isCurrentDay = isToday(day)
          const isInMonth = isSameMonth(day, viewMonth)
          const isSelectedWeek = isSameWeek(day, currentWeekStart, { weekStartsOn: 1 })

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className="text-center text-sm py-2 rounded-lg transition-all cursor-pointer font-medium"
              style={
                isCurrentDay
                  ? {
                      background: '#8C28FA',
                      color: '#ffffff',
                      fontWeight: 'bold',
                    }
                  : !isInMonth
                    ? {
                        color: 'rgba(240,244,255,0.25)',
                      }
                    : {
                        color: 'rgba(240,244,255,0.7)',
                      }
              }
              onMouseEnter={(e) => {
                if (!isCurrentDay) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#f0f4ff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrentDay) {
                  e.currentTarget.style.background = isSelectedWeek ? 'rgba(255,255,255,0.03)' : 'transparent'
                  e.currentTarget.style.color = !isInMonth ? 'rgba(240,244,255,0.25)' : 'rgba(240,244,255,0.7)'
                }
              }}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
