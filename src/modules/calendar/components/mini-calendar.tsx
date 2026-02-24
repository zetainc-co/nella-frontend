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
  isToday,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

  const monthDays = getMonthGrid(viewMonth)
  const monthLabel = format(viewMonth, 'MMMM yyyy', { locale: es })
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  return (
    <div className="px-3 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">{capitalizedLabel}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {monthDays.map(day => {
          const isCurrentDay = isToday(day)
          const isInMonth = isSameMonth(day, viewMonth)

          return (
            <button
              key={day.toISOString()}
              className={`
                text-center text-xs py-1 rounded-full transition-colors
                ${!isInMonth ? 'text-muted-foreground/40' : 'text-foreground hover:bg-accent'}
                ${isCurrentDay ? 'bg-primary text-primary-foreground font-bold hover:bg-primary/90' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
