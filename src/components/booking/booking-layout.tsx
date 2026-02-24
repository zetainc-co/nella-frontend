'use client'

import { useState } from 'react'
import { AuthBackground, AuthBranding } from '@/components/auth/shared'
import { AgentInfoPanel } from './agent-info-panel'
import { CalendarPicker } from './calendar-picker'
import { TimeSlots } from './time-slots'
import { BookingConfirmation } from './booking-confirmation'
import {
  MOCK_AGENT,
  MOCK_LEAD,
  MOCK_AVAILABLE_DAYS,
  MOCK_TIME_SLOTS,
  MONTH_NAMES,
} from '@/types/booking'

interface BookingLayoutProps {
  token: string
}

export function BookingLayout({ token: _token }: BookingLayoutProps) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  // Track the active view month so TimeSlots shows the correct month name
  const [activeMonth, setActiveMonth] = useState(currentMonth)
  const [activeYear, setActiveYear] = useState(currentYear)

  function handleSelectDay(day: number) {
    setSelectedDay(day)
    setSelectedSlot(null) // reset slot al cambiar de día
  }

  function handleConfirm() {
    setConfirmed(true)
  }

  return (
    <AuthBackground>
      <div className="flex min-h-screen items-center justify-center p-4 py-10 overflow-y-auto">
        <div className="w-full max-w-4xl" style={{ animation: 'fadeIn 0.35s ease-out' }}>

          {/* Logo */}
          <div className="mb-6">
            <AuthBranding subtitle="Agenda tu reunión" />
          </div>

          {/* Card principal */}
          <div
            className="rounded-2xl overflow-hidden backdrop-blur-sm"
            style={{
              background: 'rgba(30,30,30,0.92)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 8px 40px -8px rgba(0,0,0,0.7)',
            }}
          >
            <div className="flex flex-col md:flex-row">

              {/* Panel izquierdo — Info del agente */}
              <div
                className="md:w-72 shrink-0 border-b border-white/[0.06] md:border-b-0 md:border-r md:border-white/[0.06]"
              >
                <AgentInfoPanel agent={MOCK_AGENT} lead={MOCK_LEAD} />
              </div>

              {/* Panel derecho — Calendario + Slots + Confirmación */}
              <div className="flex-1 flex flex-col">
                {confirmed && selectedDay && selectedSlot ? (
                  <BookingConfirmation
                    agent={MOCK_AGENT}
                    lead={MOCK_LEAD}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    month={activeMonth}
                    year={activeYear}
                  />
                ) : (
                  <>
                    {/* Calendario */}
                    <CalendarPicker
                      availableDays={MOCK_AVAILABLE_DAYS}
                      selectedDay={selectedDay}
                      onSelectDay={handleSelectDay}
                      month={currentMonth}
                      year={currentYear}
                      onMonthChange={(month, year) => {
                        setActiveMonth(month)
                        setActiveYear(year)
                        setSelectedDay(null)
                        setSelectedSlot(null)
                      }}
                    />

                    {/* Slots — aparecen solo cuando hay un día seleccionado */}
                    {selectedDay !== null && (
                      <TimeSlots
                        slots={MOCK_TIME_SLOTS}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                        selectedDay={selectedDay}
                        monthName={MONTH_NAMES[activeMonth]}
                      />
                    )}

                    {/* Botón confirmar — aparece solo cuando hay slot seleccionado */}
                    {selectedSlot !== null && (
                      <div
                        className="px-6 pb-6 md:px-8 md:pb-8"
                        style={{ animation: 'fadeIn 0.2s ease-out' }}
                      >
                        <button
                          onClick={handleConfirm}
                          className="btn-primary"
                        >
                          Confirmar reunión
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p
            className="text-center text-xs mt-4"
            style={{ color: 'rgba(240,244,255,0.25)' }}
          >
            Powered by <span style={{ color: 'rgba(158,255,0,0.6)' }}>NellaSales</span>
          </p>
        </div>
      </div>
    </AuthBackground>
  )
}
