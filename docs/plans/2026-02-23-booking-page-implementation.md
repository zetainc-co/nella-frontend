# Booking Page (Nella-37) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Crear una página pública de agendamiento estilo Calendly en `/book/[token]` que muestra el calendario de disponibilidad de un agente de ventas y permite al lead confirmar una reunión.

**Architecture:** Ruta pública `app/(public)/book/[token]/page.tsx` sin autenticación. El layout reutiliza `AuthBackground` del sistema de auth existente. Todos los datos son mockup estático (no hay llamadas API en el MVP). El estado interactivo (día seleccionado, slot, confirmación) vive en un Client Component raíz.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4, Lucide React, TypeScript. Sin dependencias nuevas.

---

## Contexto del Proyecto

- **Background oscuro:** `#151515` con orbs animados teal/purple — usar `AuthBackground` de `@/components/auth/shared`
- **Color primario neon:** `#9EFF00` (variable `--color-primary-neon` en globals.css)
- **Cards glassmórficas:** `rgba(30,30,30,0.92)` + `backdrop-blur` + borde `rgba(255,255,255,0.07)`
- **Texto primario:** `#f0f4ff` | **Texto muted:** `rgba(240,244,255,0.45)`
- **Animaciones:** `fadeIn` y `slideIn` ya definidas en `src/app/globals.css`
- **Clases de botón:** `.btn-primary` ya en `globals.css`
- **Logo:** `AuthBranding` de `@/components/auth/shared` (muestra "Nella**Sales**")
- **Iconos:** Lucide React (ya instalado)

---

## Task 1: Crear la ruta pública y tipos

**Files:**
- Create: `src/app/(public)/book/[token]/page.tsx`
- Create: `src/types/booking.ts`

**Step 1: Crear los tipos de booking**

Crear `src/types/booking.ts` con este contenido exacto:

```typescript
export interface BookingAgent {
  name: string
  role: string
  initials: string
  duration: number // minutos
  platform: string
}

export interface BookingLead {
  name: string
}

export interface BookingSlot {
  time: string
  available: boolean
}

export interface BookingState {
  selectedDay: number | null
  selectedSlot: string | null
  confirmed: boolean
}

// Mock data — en Fase 2 se resuelve desde el token contra la DB
export const MOCK_AGENT: BookingAgent = {
  name: 'Juan Pérez',
  role: 'Especialista de Ventas',
  initials: 'JP',
  duration: 30,
  platform: 'Google Meet',
}

export const MOCK_LEAD: BookingLead = {
  name: 'Carlos',
}

// Días del mes con disponibilidad (números del 1-28/31)
export const MOCK_AVAILABLE_DAYS = [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26]

// Slots disponibles por día
export const MOCK_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '14:00', '14:30', '15:00', '16:00', '17:00',
]
```

**Step 2: Crear la página de entrada (Server Component)**

Crear `src/app/(public)/book/[token]/page.tsx` con este contenido:

```typescript
import { BookingLayout } from '@/components/booking/booking-layout'

interface BookingPageProps {
  params: Promise<{ token: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  // En MVP: el token se ignora. En Fase 2: resolver contra DB para cargar datos reales.
  const { token } = await params

  return <BookingLayout token={token} />
}

export const metadata = {
  title: 'Agendar Reunión — NellaSales',
  description: 'Elige el horario que mejor te funcione para tu reunión.',
}
```

**Step 3: Commit**

```bash
git add src/types/booking.ts src/app/(public)/book/[token]/page.tsx
git commit -m "feat|nella-37|20260223|Add booking page route and types"
```

---

## Task 2: Panel izquierdo — AgentInfoPanel

**Files:**
- Create: `src/components/booking/agent-info-panel.tsx`

**Step 1: Crear el componente**

Crear `src/components/booking/agent-info-panel.tsx`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/components/booking/agent-info-panel.tsx
git commit -m "feat|nella-37|20260223|Add AgentInfoPanel component"
```

---

## Task 3: Calendario interactivo — CalendarPicker

**Files:**
- Create: `src/components/booking/calendar-picker.tsx`

**Step 1: Crear el componente**

Este es el componente más complejo. Maneja navegación de mes, pintar días disponibles, y selección.

Crear `src/components/booking/calendar-picker.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarPickerProps {
  availableDays: number[]
  selectedDay: number | null
  onSelectDay: (day: number) => void
  month?: number  // 0-indexed (0 = enero)
  year?: number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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
}: CalendarPickerProps) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

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
```

**Step 2: Commit**

```bash
git add src/components/booking/calendar-picker.tsx
git commit -m "feat|nella-37|20260223|Add CalendarPicker component"
```

---

## Task 4: Grid de slots — TimeSlots

**Files:**
- Create: `src/components/booking/time-slots.tsx`

**Step 1: Crear el componente**

Crear `src/components/booking/time-slots.tsx`:

```typescript
interface TimeSlotsProps {
  slots: string[]
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
  selectedDay: number
  monthName: string
}

export function TimeSlots({ slots, selectedSlot, onSelectSlot, selectedDay, monthName }: TimeSlotsProps) {
  return (
    <div
      className="flex flex-col gap-4 px-6 pb-6 md:px-8 md:pb-8"
      style={{ animation: 'slideIn 0.2s ease-out' }}
    >
      {/* Título del día seleccionado */}
      <div>
        <p className="text-sm font-medium" style={{ color: 'rgba(240,244,255,0.55)' }}>
          Horarios disponibles
        </p>
        <p className="text-base font-semibold mt-0.5" style={{ color: '#f0f4ff' }}>
          {selectedDay} de {monthName}
        </p>
      </div>

      {/* Grid de slots */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map(slot => {
          const isSelected = selectedSlot === slot
          return (
            <button
              key={slot}
              onClick={() => onSelectSlot(slot)}
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
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/booking/time-slots.tsx
git commit -m "feat|nella-37|20260223|Add TimeSlots component"
```

---

## Task 5: Pantalla de confirmación — BookingConfirmation

**Files:**
- Create: `src/components/booking/booking-confirmation.tsx`

**Step 1: Crear el componente**

Crear `src/components/booking/booking-confirmation.tsx`:

```typescript
import { CheckCircle2, CalendarDays, Clock, Video } from 'lucide-react'
import { BookingAgent, BookingLead } from '@/types/booking'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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
          <CalendarDays size={16} style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {selectedDay} de {MONTH_NAMES[month]} de {year}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Clock size={16} style={{ color: '#9EFF00' }} />
          <span className="text-sm" style={{ color: '#f0f4ff' }}>
            {selectedSlot} — {agent.duration} minutos
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Video size={16} style={{ color: '#9EFF00' }} />
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
```

**Step 2: Commit**

```bash
git add src/components/booking/booking-confirmation.tsx
git commit -m "feat|nella-37|20260223|Add BookingConfirmation component"
```

---

## Task 6: Layout principal — BookingLayout

**Files:**
- Create: `src/components/booking/booking-layout.tsx`

Este es el componente raíz que orquesta todo. Es un Client Component que maneja el estado global de la sesión de booking.

**Step 1: Crear el componente**

Crear `src/components/booking/booking-layout.tsx`:

```typescript
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
} from '@/types/booking'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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

  function handleSelectDay(day: number) {
    setSelectedDay(day)
    setSelectedSlot(null) // reset slot al cambiar de día
  }

  function handleConfirm() {
    setConfirmed(true)
  }

  return (
    <AuthBackground>
      <div className="flex min-h-screen items-center justify-center p-4 py-10">
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
                className="md:w-72 shrink-0"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  // En desktop, borde a la derecha en vez de abajo
                }}
              >
                <style jsx>{`
                  @media (min-width: 768px) {
                    .agent-panel-border {
                      border-bottom: none !important;
                      border-right: 1px solid rgba(255,255,255,0.06) !important;
                    }
                  }
                `}</style>
                <div className="agent-panel-border" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <AgentInfoPanel agent={MOCK_AGENT} lead={MOCK_LEAD} />
                </div>
              </div>

              {/* Panel derecho — Calendario + Slots + Confirmación */}
              <div className="flex-1 flex flex-col">
                {confirmed && selectedDay && selectedSlot ? (
                  <BookingConfirmation
                    agent={MOCK_AGENT}
                    lead={MOCK_LEAD}
                    selectedDay={selectedDay}
                    selectedSlot={selectedSlot}
                    month={currentMonth}
                    year={currentYear}
                  />
                ) : (
                  <>
                    {/* Calendario */}
                    <CalendarPicker
                      availableDays={MOCK_AVAILABLE_DAYS}
                      selectedDay={selectedDay}
                      onSelectDay={handleSelectDay}
                    />

                    {/* Slots — aparecen solo cuando hay un día seleccionado */}
                    {selectedDay !== null && (
                      <TimeSlots
                        slots={MOCK_TIME_SLOTS}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                        selectedDay={selectedDay}
                        monthName={MONTH_NAMES[currentMonth]}
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
```

> **Nota sobre el borde responsive:** El `<style jsx>` requiere `styled-jsx` (que Next.js incluye por defecto). Si da error, reemplazar la lógica del borde por Tailwind: añadir `className="md:border-r md:border-white/[0.06] border-b border-white/[0.06] md:border-b-0"` al div del panel izquierdo.

**Step 2: Commit**

```bash
git add src/components/booking/booking-layout.tsx
git commit -m "feat|nella-37|20260223|Add BookingLayout main component"
```

---

## Task 7: Crear el barrel export de booking

**Files:**
- Create: `src/components/booking/index.ts`

**Step 1: Crear el barrel**

Crear `src/components/booking/index.ts`:

```typescript
export { BookingLayout } from './booking-layout'
export { AgentInfoPanel } from './agent-info-panel'
export { CalendarPicker } from './calendar-picker'
export { TimeSlots } from './time-slots'
export { BookingConfirmation } from './booking-confirmation'
```

**Step 2: Commit**

```bash
git add src/components/booking/index.ts
git commit -m "feat|nella-37|20260223|Add booking components barrel export"
```

---

## Task 8: Verificación y ajustes

**Step 1: Arrancar el servidor de desarrollo**

```bash
npm run dev
```

**Step 2: Navegar a la página**

Abrir en el navegador: `http://localhost:3000/book/test-token-123`

**Step 3: Verificar el flujo completo**

Checklist visual:
- [ ] Fondo oscuro `#151515` con orbs teal/purple animados
- [ ] Logo "Nella**Sales**" en la parte superior
- [ ] Card glassmórfica visible con 2 columnas (desktop) o 1 columna (mobile)
- [ ] Panel izquierdo: avatar neon, nombre agente, detalles, saludo "¡Hola, Carlos!"
- [ ] Calendario: navegación de mes funciona, días disponibles con punto neon
- [ ] Click en día disponible: aparecen slots con animación `slideIn`
- [ ] Día seleccionado: resaltado en neon
- [ ] Click en slot: se marca en neon verde (`#9EFF00` fondo)
- [ ] Botón "Confirmar reunión" aparece con `fadeIn`
- [ ] Click en confirmar: pantalla de confirmación con ícono ✓ y detalles
- [ ] Responsive: en mobile se ve en 1 columna sin romperse

**Step 4: Verificar sin errores de TypeScript y linter**

```bash
npm run build
npm run lint
```

Esperado: 0 errores.

**Step 5: Commit final de ajustes si los hay**

```bash
git add -p  # staging interactivo para solo incluir los ajustes necesarios
git commit -m "fix|nella-37|20260223|Fix booking page visual adjustments"
```

---

## Notas de Implementación

### Sobre `styled-jsx` en BookingLayout
Si Next.js da error con `<style jsx>`, reemplazar el borde responsive así:
```tsx
// Reemplazar el div del panel izquierdo con:
<div className="md:w-72 shrink-0 border-b border-white/[0.06] md:border-b-0 md:border-r md:border-white/[0.06]">
  <AgentInfoPanel agent={MOCK_AGENT} lead={MOCK_LEAD} />
</div>
```

### Sobre el grupo de rutas `(public)`
Next.js App Router soporta múltiples grupos de rutas en paralelo. El grupo `(public)` es solo organizacional y no añade ningún segmento a la URL. La ruta final es `/book/[token]`.

### Evolución en Fase 2
- Reemplazar `MOCK_AGENT` y `MOCK_LEAD` por una llamada a `/api/book/[token]` que resuelva contra Supabase
- Añadir integración con WhatsApp (n8n) al confirmar
- Guardar la cita en una tabla `appointments` en Supabase
- Bloquear el slot confirmado para no mostrarlo a otros leads

---

*Plan generado el 2026-02-23. Implementar task by task.*
