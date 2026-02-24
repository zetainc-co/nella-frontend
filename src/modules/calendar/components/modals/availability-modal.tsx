// src/components/calendario/modals/availability-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/modal/modal'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { calendarFetch } from '@/lib/calendar-api'
import { useAuthStore } from '@/stores/auth-store'
import { TIME_OPTIONS } from '@/types/calendar-types'
import type { AvailabilityDay, BlockDuration, DayKey, GoogleCalendarStatus } from '@/types/calendar-types'

interface AvailabilityModalProps {
  open: boolean
  onClose: () => void
}

const DAY_LABELS: Record<DayKey, string> = {
  lun: 'Lunes',
  mar: 'Martes',
  mie: 'Miercoles',
  jue: 'Jueves',
  vie: 'Viernes',
  sab: 'Sabado',
  dom: 'Domingo',
}

const ALL_DAYS: DayKey[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']

const DEFAULT_AVAILABILITY: AvailabilityDay[] = ALL_DAYS.map(day => ({
  day,
  enabled: !['sab', 'dom'].includes(day),
  slots: !['sab', 'dom'].includes(day) ? [{ start: '09:00', end: '18:00' }] : [],
}))

const DURATIONS: BlockDuration[] = [15, 30, 60]

interface AvailabilityResponse {
  data: AvailabilityDay[]
}
interface SettingsResponse {
  data: {
    blockDurationMinutes: BlockDuration
    defaultTimezone: string
  }
}
interface GoogleStatusResponse {
  data: GoogleCalendarStatus
}

export function AvailabilityModal({ open, onClose }: AvailabilityModalProps) {
  const { session } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false)

  const [localAvailability, setLocalAvailability] = useState<AvailabilityDay[]>(DEFAULT_AVAILABILITY)
  const [localDuration, setLocalDuration] = useState<BlockDuration>(30)
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null)

  // Reset confirm state when modal closes
  useEffect(() => {
    if (!open) setIsConfirmingDisconnect(false)
  }, [open])

  // Load availability, settings and Google status when modal opens
  useEffect(() => {
    if (!open || !session?.accessToken) return

    setIsLoading(true)

    Promise.all([
      calendarFetch<AvailabilityResponse>('/calendar/availability'),
      calendarFetch<SettingsResponse>('/calendar/settings'),
      calendarFetch<GoogleStatusResponse>('/auth/google-calendar/status'),
    ])
      .then(([availRes, settingsRes, googleRes]) => {
        // Merge loaded availability with all 7 days (backend may return fewer)
        const loadedDays = availRes.data ?? []
        const merged = ALL_DAYS.map(day => {
          const found = loadedDays.find(d => d.day === day)
          return found ?? DEFAULT_AVAILABILITY.find(d => d.day === day)!
        })
        setLocalAvailability(merged)
        setLocalDuration((settingsRes.data?.blockDurationMinutes as BlockDuration) ?? 30)
        setGoogleStatus(googleRes.data ?? null)
      })
      .catch(() => {
        toast.error('Error al cargar la configuración')
      })
      .finally(() => setIsLoading(false))
  }, [open, session?.accessToken])

  function toggleDay(dayKey: DayKey) {
    setLocalAvailability(prev =>
      prev.map(d =>
        d.day === dayKey
          ? {
              ...d,
              enabled: !d.enabled,
              slots: !d.enabled && d.slots.length === 0
                ? [{ start: '09:00', end: '17:00' }]
                : d.slots,
            }
          : d
      )
    )
  }

  function addSlot(dayKey: DayKey) {
    setLocalAvailability(prev =>
      prev.map(d =>
        d.day === dayKey
          ? { ...d, slots: [...d.slots, { start: '09:00', end: '17:00' }] }
          : d
      )
    )
  }

  function removeSlot(dayKey: DayKey, index: number) {
    setLocalAvailability(prev =>
      prev.map(d =>
        d.day === dayKey
          ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
          : d
      )
    )
  }

  function updateSlot(dayKey: DayKey, index: number, field: 'start' | 'end', value: string) {
    setLocalAvailability(prev =>
      prev.map(d =>
        d.day === dayKey
          ? {
              ...d,
              slots: d.slots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              ),
            }
          : d
      )
    )
  }

  function replicateDay(dayKey: DayKey) {
    const sourceDay = localAvailability.find(d => d.day === dayKey)
    if (!sourceDay) return
    setLocalAvailability(prev =>
      prev.map(d =>
        d.day !== dayKey && d.enabled
          ? { ...d, slots: [...sourceDay.slots] }
          : d
      )
    )
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await Promise.all([
        calendarFetch('/calendar/availability', {
          method: 'PUT',
          body: { availability: localAvailability },
        }),
        calendarFetch('/calendar/settings', {
          method: 'PUT',
          body: { blockDurationMinutes: localDuration },
        }),
      ])
      toast.success('Configuración guardada')
      onClose()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar'
      toast.error('Error', { description: message })
    } finally {
      setIsSaving(false)
    }
  }

  function handleConnectGoogle() {
    console.log('[Google Calendar] click. session:', session)
    if (!session?.accessToken) {
      console.warn('[Google Calendar] No hay accessToken en el store de auth')
      toast.error('Sin sesión activa', {
        description: 'Recarga la página o vuelve a iniciar sesión.',
      })
      return
    }
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
    const url = `${backendUrl}/auth/google-calendar?token=${session.accessToken}`
    console.log('[Google Calendar] Redirigiendo a:', url)
    window.location.href = url
  }

  async function handleDisconnectGoogle() {
    setIsDisconnecting(true)
    try {
      await calendarFetch('/auth/google-calendar', { method: 'DELETE' })
      setGoogleStatus({ connected: false })
      toast.success('Google Calendar desconectado')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al desconectar'
      toast.error('Error', { description: message })
    } finally {
      setIsDisconnecting(false)
      setIsConfirmingDisconnect(false)
    }
  }

  const footerContent = (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={isSaving}>
        Cancelar
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
      >
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  )

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Configurar Disponibilidad"
      description="Define tus horarios para generar escasez"
      footer={footerContent}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Google Calendar connection */}
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Google Calendar</p>
            {googleStatus?.connected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-500" />
                    <div>
                      <p className="text-sm text-foreground">Conectado como</p>
                      <p className="text-xs text-muted-foreground">{googleStatus.email}</p>
                    </div>
                  </div>
                  {!isConfirmingDisconnect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsConfirmingDisconnect(true)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                    >
                      Desconectar
                    </Button>
                  )}
                </div>

                {isConfirmingDisconnect && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
                    <p className="text-xs text-destructive font-medium">
                      ¿Desconectar Google Calendar?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Se cancelará la sincronización y tendrás que volver a conectarlo.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsConfirmingDisconnect(false)}
                        disabled={isDisconnecting}
                        className="text-xs h-7"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDisconnectGoogle}
                        disabled={isDisconnecting}
                        className="text-xs h-7 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDisconnecting ? 'Desconectando...' : 'Sí, desconectar'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="size-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No conectado</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleConnectGoogle}
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Conectar Google Calendar
                </Button>
              </div>
            )}
          </div>

          {/* Block duration */}
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">
              Duracion de bloques de tiempo
            </p>
            <div className="flex gap-3">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setLocalDuration(d)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    localDuration === d
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-foreground hover:bg-accent/80'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          {localAvailability.map(dayConfig => (
            <div key={dayConfig.day} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={dayConfig.enabled}
                    onCheckedChange={() => toggleDay(dayConfig.day)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="font-semibold text-foreground">
                    {DAY_LABELS[dayConfig.day]}
                  </span>
                </div>
                <div className="flex gap-2">
                  {dayConfig.enabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => replicateDay(dayConfig.day)}
                      className="text-xs gap-1"
                    >
                      <Copy className="size-3" />
                      Replicar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlot(dayConfig.day)}
                    disabled={!dayConfig.enabled}
                    className="text-xs gap-1"
                  >
                    <Plus className="size-3" />
                    Agregar
                  </Button>
                </div>
              </div>

              {dayConfig.enabled && (
                <div className="space-y-2">
                  {dayConfig.slots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={slot.start}
                        onChange={e => updateSlot(dayConfig.day, idx, 'start', e.target.value)}
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>

                      <span className="text-muted-foreground text-xs">—</span>

                      <select
                        value={slot.end}
                        onChange={e => updateSlot(dayConfig.day, idx, 'end', e.target.value)}
                        className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => removeSlot(dayConfig.day, idx)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
