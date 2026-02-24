'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useKanbanStore } from '@/modules/kanban/stores/kanban-store'

export function KanbanFilters() {
  const { filters, setSearchQuery } = useKanbanStore()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar lead..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
