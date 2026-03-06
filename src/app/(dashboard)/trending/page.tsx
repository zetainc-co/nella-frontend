'use client'

import dynamic from 'next/dynamic'

const KanbanBoard = dynamic(
  () => import('@/modules/kanban/components/kanban-board').then(m => ({ default: m.KanbanBoard })),
  { ssr: false }
)

export default function KanbanPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Tablero Kanban
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Gestiona tu pipeline de ventas con IA
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}
