import { KanbanBoard } from '@/components/kanban/kanban-board'

export default function KanbanPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pipeline de Ventas
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus leads visualmente con nuestro sistema de Kanban.
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}
