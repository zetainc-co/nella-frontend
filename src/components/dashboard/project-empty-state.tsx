'use client'

import { FolderOpen } from 'lucide-react'

interface ProjectEmptyStateProps {
  onCreateClick: () => void
}

export function ProjectEmptyState({ onCreateClick }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-5 rounded-2xl bg-accent/40 border border-border">
          <FolderOpen className="size-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Aún no tienes proyectos</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Crea tu primer proyecto para comenzar a rastrear leads y métricas.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="btn-primary mt-2 px-6"
          style={{ width: 'auto' }}
        >
          Crear Primer Proyecto
        </button>
      </div>
    </div>
  )
}
