// src/components/calendario/modals/availability-modal.tsx
'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCalendarStore } from '@/stores/calendar-store'
import { TIME_OPTIONS } from '@/types/calendar-types'
import type { AvailabilityDay, BlockDuration, DayKey } from '@/types/calendar-types'

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

const DURATIONS: BlockDuration[] = [15, 30, 60]

export function AvailabilityModal({ open, onClose }: AvailabilityModalProps) {
  const { availability, blockDuration, setBlockDuration, updateAvailability } =
    useCalendarStore()

  const [localAvailability, setLocalAvailability] = useState<AvailabilityDay[]>(availability)
  const [localDuration, setLocalDuration] = useState<BlockDuration>(blockDuration)

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

  function handleSave() {
    setBlockDuration(localDuration)
    updateAvailability(localAvailability)
    onClose()
  }

  return (
    <Dialog key={String(open)} open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Configurar Disponibilidad
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Define tus horarios para generar escasez
          </p>
        </DialogHeader>

        <div className="mt-4 space-y-5">
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

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
