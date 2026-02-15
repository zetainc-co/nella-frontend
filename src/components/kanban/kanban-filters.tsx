'use client'

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useKanbanConstants } from '@/hooks/kanban'
import { useKanbanStore } from '@/stores/kanban-store'
import type { SourceChannel } from '@/types/kanban-types'

export function KanbanFilters() {
  const {
    filters,
    leads,
    setSearchQuery,
    setChannelFilters,
    toggleOnlyMyLeads,
    getFilteredLeads
  } = useKanbanStore()

  const { CHANNEL_LABELS } = useKanbanConstants()
  const filteredLeads = getFilteredLeads()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-4 bg-card border border-border rounded-lg">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 focus:ring-primary-neon"
        />
      </div>

      {/* Filtro de Canal */}
      <Select
        value={filters.channels[0] || 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            setChannelFilters([])
          } else {
            setChannelFilters([value as SourceChannel])
          }
        }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos los canales" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los canales</SelectItem>
          {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Solo mis leads */}
      <div className="flex items-center gap-2">
        <Switch
          id="only-my-leads"
          checked={filters.onlyMyLeads}
          onCheckedChange={toggleOnlyMyLeads}
        />
        <Label htmlFor="only-my-leads" className="text-sm cursor-pointer">
          Solo mis leads
        </Label>
      </div>

      {/* Contador */}
      <span className="hidden lg:block text-sm text-muted-foreground whitespace-nowrap">
        Mostrando {filteredLeads.length} de {leads.length} leads
      </span>
    </div>
  )
}
