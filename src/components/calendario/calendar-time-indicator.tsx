// src/components/calendario/calendar-time-indicator.tsx
'use client'

import { useState, useEffect } from 'react'

function getCurrentMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function formatTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function CalendarTimeIndicator() {
  const [minutes, setMinutes] = useState(getCurrentMinutes)

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(getCurrentMinutes())
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
      style={{ top: `${minutes}px` }}
    >
      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap -translate-x-full">
        {formatTime(minutes)}
      </span>
      <div className="flex-1 h-px bg-red-500" />
      <div className="size-2 rounded-full bg-red-500 -ml-1" />
    </div>
  )
}
