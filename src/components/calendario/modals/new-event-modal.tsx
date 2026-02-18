// src/components/calendario/modals/new-event-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCalendarStore } from '@/stores/calendar-store'
import { TIME_OPTIONS } from '@/types/calendar-types'
import type { ProjectName, ConfirmationStatus } from '@/types/calendar-types'

interface NewEventModalProps {
  open: boolean
  onClose: () => void
  initialDate?: string
  initialTime?: string
}

const PROJECT_OPTIONS: ProjectName[] = ['MundoStetic', 'TechCorp', 'NellaSales']
const STAGE_OPTIONS = ['new', 'contacted', 'proposal', 'closed'] as const
const STAGE_LABELS: Record<string, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  proposal: 'Propuesta',
  closed: 'Cierre',
}
const STATUS_OPTIONS: ConfirmationStatus[] = ['confirmed', 'pending', 'cancelled']
const STATUS_LABELS: Record<ConfirmationStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function incrementHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const newH = (h + 1) % 24
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function NewEventModal({ open, onClose, initialDate, initialTime }: NewEventModalProps) {
  const { addEvent } = useCalendarStore()

  const [title, setTitle] = useState('')
  const [project, setProject] = useState<ProjectName>('NellaSales')
  const [client, setClient] = useState('')
  const [date, setDate] = useState(getTodayISO())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [videoCallLink, setVideoCallLink] = useState('')
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>('pending')
  const [leadStage, setLeadStage] = useState('')
  const [hasBudget, setHasBudget] = useState<'approved' | 'pending'>('pending')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setDate(initialDate ?? getTodayISO())
      setStartTime(initialTime ?? '09:00')
      setEndTime(initialTime ? incrementHour(initialTime) : '10:00')
    }
  }, [open, initialDate, initialTime])

  function handleSubmit() {
    if (!title.trim() || !client.trim()) return

    addEvent({
      title: title.trim(),
      project,
      client: client.trim(),
      date,
      startTime,
      endTime,
      location: location || undefined,
      videoCallLink: videoCallLink || undefined,
      confirmationStatus,
      layer: 'my-agenda',
      leadStage: (leadStage || undefined) as import('@/types/calendar-types').LeadStage | undefined,
      hasBudget,
      notes: notes || undefined,
    })

    setTitle('')
    setClient('')
    setLocation('')
    setVideoCallLink('')
    setNotes('')
    setLeadStage('')
    onClose()
  }

  const inputClass =
    'bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50'
  const selectClass =
    'w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="size-5 text-purple-400" />
            </div>
            <div>
              <span className="inline-block text-xs bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full mb-1">
                NellaSales
              </span>
              <DialogTitle className="text-xl font-bold text-foreground leading-none">
                Nuevo Evento
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Título del Evento <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Reunión con cliente"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Proyecto <span className="text-destructive">*</span>
            </Label>
            <select
              value={project}
              onChange={e => setProject(e.target.value as ProjectName)}
              className={selectClass}
            >
              {PROJECT_OPTIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Nombre del cliente"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Fecha <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Hora Inicio <span className="text-destructive">*</span>
              </Label>
              <select
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className={selectClass}
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Hora Fin <span className="text-destructive">*</span>
              </Label>
              <select
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className={selectClass}
              >
                {TIME_OPTIONS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Ubicación / Plataforma
            </Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ej: Google Meet, Zoom, Presencial, etc."
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Link de Videollamada
            </Label>
            <Input
              value={videoCallLink}
              onChange={e => setVideoCallLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Estado de Confirmación
            </Label>
            <select
              value={confirmationStatus}
              onChange={e => setConfirmationStatus(e.target.value as ConfirmationStatus)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <span className="text-sm font-semibold text-foreground">Contexto del Lead</span>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Etapa del Lead</Label>
              <select
                value={leadStage}
                onChange={e => setLeadStage(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar etapa...</option>
                {STAGE_OPTIONS.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                ¿Tiene Presupuesto?
              </Label>
              <div className="flex gap-6">
                {(['approved', 'pending'] as const).map(val => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasBudget"
                      value={val}
                      checked={hasBudget === val}
                      onChange={() => setHasBudget(val)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">
                      {val === 'approved' ? 'Sí, aprobado' : 'Pendiente'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Notas Adicionales</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Información relevante sobre el lead, presupuesto, necesidades, etc."
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !client.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50"
          >
            Crear Evento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
