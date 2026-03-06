'use client'

import { useProjectStore } from '@/core/store/project-store'

export function ProjectLoader() {
  const isTransitioning = useProjectStore((s) => s.isTransitioning)

  if (!isTransitioning) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(21,21,21,0.85)', backdropFilter: 'blur(4px)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(140,40,250,0.3)', borderTopColor: '#8C28FA' }}
        />
        <p className="text-sm font-medium" style={{ color: 'rgba(240,244,255,0.6)' }}>
          Cargando proyecto...
        </p>
      </div>
    </div>
  )
}
