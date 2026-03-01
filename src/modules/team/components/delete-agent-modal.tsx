'use client'

import { AlertTriangle, X } from 'lucide-react'

interface DeleteAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  agentName: string
  isDeleting: boolean
}

export function DeleteAgentModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  isDeleting,
}: DeleteAgentModalProps) {
  if (!isOpen) return null

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
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: '#ef4444' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
              Eliminar miembro
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <X className="h-5 w-5" style={{ color: 'rgba(240,244,255,0.4)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-sm" style={{ color: 'rgba(240,244,255,0.6)' }}>
            ¿Estás seguro de que deseas eliminar a{' '}
            <span className="font-semibold" style={{ color: '#f0f4ff' }}>
              {agentName}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f4ff',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: '#ef4444',
              color: '#fff',
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
