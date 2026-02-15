import { KanbanBoard } from '@/components/kanban/kanban-board'

export default function KanbanPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pipeline de Ventas
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestiona tus leads visualmente con nuestro sistema de Kanban.
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}
