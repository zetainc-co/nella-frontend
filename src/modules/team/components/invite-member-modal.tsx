'use client'

import { useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { useCreateAgent } from '../hooks/useAgents'
import type { CreateAgentDto, InviteMemberModalProps } from '../types/team-types'

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [formData, setFormData] = useState<CreateAgentDto>({
    full_name: '',
    email: '',
    role: 'agent',
  })

  const createAgent = useCreateAgent()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createAgent.mutateAsync(formData)

    // Reset form and close
    setFormData({
      full_name: '',
      email: '',
      role: 'agent',
    })
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
            <UserPlus className="h-5 w-5" style={{ color: '#9EFF00' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
              Invitar Miembro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-white/5"
          >
            <X className="h-5 w-5" style={{ color: 'rgba(240,244,255,0.4)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
              placeholder="Ej: María García"
            />
          </div>

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
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f4ff',
              }}
              placeholder="maria@ejemplo.com"
            />
          </div>

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
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'admin' | 'agent' | 'viewer',
                })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none"
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
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#f0f4ff',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createAgent.isPending}
              className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: '#9EFF00',
                color: '#0a0a0a',
              }}
            >
              {createAgent.isPending ? 'Invitando...' : 'Invitar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
