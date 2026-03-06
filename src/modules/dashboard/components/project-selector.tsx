'use client'

import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import type { ProjectSelectorProps } from '@/modules/dashboard/types/dashboard-types'

export function ProjectSelector({ projects, activeProjectId, onSelect, onCreateClick }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const active = projects.find((p) => p.id === activeProjectId)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <span className="max-w-[160px] truncate">{active?.name ?? 'Seleccionar proyecto'}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-56 rounded-xl glass-panel border border-border overflow-hidden z-20"
          style={{ animation: 'slideIn 0.15s ease-out' }}
        >
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-accent/60 ${
                p.id === activeProjectId ? 'text-primary font-medium' : 'text-foreground'
              }`}
            >
              {p.name}
            </button>
          ))}
          <div className="border-t border-border">
            <button
              onClick={() => { onCreateClick(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Plus className="size-4" />
              Nuevo proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
