'use client'

import { useState, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'
import type { Agent } from '../types/team-types'

interface EditAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (agentId: number, data: { name?: string; role?: 'agent' | 'administrator' }) => Promise<void>
  agent: Agent | null
  isSaving: boolean
}

export function EditAgentModal({
  isOpen,
  onClose,
  onSave,
  agent,
  isSaving,
}: EditAgentModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<'agent' | 'administrator'>('agent')

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setRole(agent.role as 'agent' | 'administrator')
    }
  }, [agent])

  if (!isOpen || !agent) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(agent.id, { name, role })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg p-6"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pencil className="h-5 w-5" style={{ color: '#9EFF00' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
              Editar Miembro
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <X className="h-5 w-5" style={{ color: 'rgba(240,244,255,0.4)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre (editable) */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm"
              style={{ color: 'rgba(240,244,255,0.6)' }}
            >
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
            />
          </div>

          {/* Email (solo lectura) */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm"
              style={{ color: 'rgba(240,244,255,0.6)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              disabled
              value={agent.email}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(240,244,255,0.4)',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Rol (editable) */}
          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm"
              style={{ color: 'rgba(240,244,255,0.6)' }}
            >
              Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'agent' | 'administrator')}
              disabled={isSaving}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
            >
              <option value="agent">Agente</option>
              <option value="administrator">Administrador</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: '#9EFF00',
                color: '#0a0a0a',
              }}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
