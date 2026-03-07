'use client'

import { Plus, Trash2, Rocket, X } from 'lucide-react'
import { useCreateProjectForm } from '@/modules/dashboard/hooks/useCreateProjectForm'
import type { CreateProjectModalProps } from '@/modules/dashboard/types/dashboard-types'

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const {
    name,
    setName,
    nameError,
    emailEntries,
    isSubmitting,
    resetAndClose,
    addEmailField,
    updateEmail,
    removeEmail,
    handleSubmit,
    handleSkip,
  } = useCreateProjectForm(onClose, onCreated)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1f1e29] rounded-2xl border border-gray-700">
        {/* Close button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header with Icon */}
        <div className="px-8 pt-8 pb-6">
          {/* Icon - Rounded square */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#8B5CF6] rounded-2xl p-4">
              <Rocket className="size-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-tight text-white mb-2">
              ¡Bienvenido a Nell<span className="text-[#a78bfa]">up</span>!<br />
              Vamos a despegar
            </h2>
            <p className="text-sm text-gray-400">
              Configura tu primer proyecto en menos de un minuto
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
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
            {emailEntries.map((entry) => (
              <div key={entry.id} className="flex gap-2 items-center">
                <input
                  type="email"
                  value={entry.value}
                  onChange={(e) => updateEmail(entry.id, e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="auth-input flex-1"
                />
                {emailEntries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmail(entry.id)}
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

            {emailEntries.length < 5 && (
              <button
                type="button"
                onClick={addEmailField}
                className="flex items-center gap-1.5 text-sm transition-colors mt-1"
                style={{ color: '#a78bfa' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c4b5fd')}
                onMouseLeave={e => (e.currentTarget.style.color = '#a78bfa')}
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
            className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isSubmitting || !name.trim() ? '#7c3aed' : '#8B5CF6',
            }}
            disabled={isSubmitting || !name.trim()}
            onMouseEnter={(e) => {
              if (!isSubmitting && name.trim()) {
                e.currentTarget.style.background = '#7c3aed'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && name.trim()) {
                e.currentTarget.style.background = '#8B5CF6'
              }
            }}
          >
            {isSubmitting ? 'Creando...' : 'Crear Proyecto e Iniciar'}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-sm transition-colors py-2 text-gray-500 hover:text-gray-300"
          >
            Omitir y configurar después
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}
