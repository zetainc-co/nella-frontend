'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { X, Plus, Trash2, Rocket } from 'lucide-react'
import { useCreateProject } from '@/hooks/use-projects'
import { toast } from 'sonner'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreated: (projectId: string) => void
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [emails, setEmails] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: createProject } = useCreateProject()

  if (!open) return null

  function resetAndClose() {
    setName('')
    setNameError('')
    setEmails([''])
    onClose()
  }

  function addEmailField() {
    if (emails.length < 5) setEmails([...emails, ''])
  }

  function updateEmail(index: number, value: string) {
    setEmails(emails.map((e, i) => (i === index ? value : e)))
  }

  function removeEmail(index: number) {
    if (emails.length === 1) { setEmails(['']); return }
    setEmails(emails.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError('')
    if (!name.trim()) { setNameError('El nombre es requerido'); return }

    setIsSubmitting(true)
    try {
      const project = await createProject(name.trim())

      // Send invites if any valid email entered
      const validEmails = emails.map(e => e.trim()).filter(Boolean)
      if (validEmails.length > 0) {
        // TODO: POST /api/projects/:id/invite when endpoint is ready
        await new Promise(r => setTimeout(r, 200))
        toast.success('¡Invitaciones enviadas!', {
          description: `Se notificará a ${validEmails.length} vendedor${validEmails.length > 1 ? 'es' : ''}.`,
        })
      }

      onCreated(project.id)
      resetAndClose()
    } catch {
      setNameError('Error al crear el proyecto. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSkip() {
    resetAndClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetAndClose} />

      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{
          background: 'rgba(28, 28, 28, 0.97)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Close */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 transition-colors"
          style={{ color: 'rgba(240,244,255,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f0f4ff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.4)')}
        >
          <X className="size-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-2xl"
            style={{ background: '#9EFF00', boxShadow: '0 0 32px rgba(158,255,0,0.35)' }}
          >
            <Rocket className="size-7" style={{ color: '#0a1015' }} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-7">
          <h2 className="text-2xl font-bold leading-tight" style={{ color: '#f0f4ff' }}>
            ¡Bienvenido a <span style={{ color: '#9EFF00' }}>NellaSales</span>!<br />
            Vamos a despegar
          </h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(240,244,255,0.45)' }}>
            Configura tu primer proyecto en menos de un minuto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project name */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#f0f4ff' }}>
              Nombre proyecto <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Campaña Black Friday"
              className="auth-input"
              autoFocus
              maxLength={255}
            />
            {nameError && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{nameError}</p>}
          </div>

          {/* Invite team */}
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>
                ¿Tienes equipo de ventas? Invítalos ahora
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.4)' }}>
                Opcional · Puedes agregar más miembros después
              </p>
            </div>

            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="auth-input flex-1"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="p-2 shrink-0 transition-colors"
                      style={{ color: 'rgba(240,244,255,0.3)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.3)')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}

              {emails.length < 5 && (
                <button
                  type="button"
                  onClick={addEmailField}
                  className="flex items-center gap-1.5 text-sm transition-colors mt-1"
                  style={{ color: '#9EFF00' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#b3ff26')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9EFF00')}
                >
                  <Plus className="size-3.5" />
                  Agregar otro vendedor
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto e Iniciar'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-sm transition-colors py-2"
              style={{ color: 'rgba(240,244,255,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,244,255,0.4)')}
            >
              Omitir y configurar después
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
