'use client'

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useKanbanStore } from '@/stores/kanban-store'

export function KanbanFilters() {
  const {
    filters,
    leads,
    salesAgents,
    setSearchQuery,
    setAssignedToFilter,
    getFilteredLeads
  } = useKanbanStore()

  const filteredLeads = getFilteredLeads()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      {/* Búsqueda */}
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

      {/* Filtro de Vendedor */}
      <Select
        value={filters.assignedTo || 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            setAssignedToFilter(null)
          } else {
            setAssignedToFilter(value)
          }
        }}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Vendedor: Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Vendedor: Todos</SelectItem>
          {salesAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
