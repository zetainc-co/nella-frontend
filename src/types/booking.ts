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

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

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
// Incluye días pasados para validar que el calendario los bloquee correctamente
export const MOCK_AVAILABLE_DAYS = [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26, 27, 28]

// Slots disponibles por día
export const MOCK_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '14:00', '14:30', '15:00', '16:00', '17:00',
]
