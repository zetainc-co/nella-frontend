// src/app/(dashboard)/calendario/page.tsx
'use client'

import dynamic from 'next/dynamic'

const CalendarLayout = dynamic(
  () => import('@/modules/calendar/components/calendar-layout').then(m => ({ default: m.CalendarLayout })),
  { ssr: false }
)

export default function CalendarioPage() {
  return <CalendarLayout />
}
