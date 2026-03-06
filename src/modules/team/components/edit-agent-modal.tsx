'use client'

import { useState, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'
import type { Agent } from '../types/team-types'

interface EditAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (agentId: string, data: { full_name?: string; role?: 'admin' | 'agent' | 'viewer'; is_active?: boolean }) => Promise<void>
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
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'admin' | 'agent' | 'viewer'>('agent')

  useEffect(() => {
    if (agent) {
      setFullName(agent.full_name || agent.email)
      setRole(agent.role)
    }
  }, [agent])

  if (!isOpen || !agent) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(agent.id, { full_name: fullName, role })
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
            <Pencil className="h-5 w-5" style={{ color: '#7C3AED' }} />
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              onChange={(e) => setRole(e.target.value as 'admin' | 'agent' | 'viewer')}
              disabled={isSaving}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
            >
              <option value="agent">Agente</option>
              <option value="admin">Administrador</option>
              <option value="viewer">Viewer</option>
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
                background: '#7C3AED',
                color: '#ffffff',
                boxShadow: '0 8px 20px -4px rgba(124,58,237,0.4)',
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
