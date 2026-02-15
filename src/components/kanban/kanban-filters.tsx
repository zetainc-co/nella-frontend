'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
          className="pl-9 focus:ring-[#CEF25D]"
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
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="tiktok">TikTok</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
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
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Mostrando {filteredLeads.length} de {leads.length} leads
      </span>
    </div>
  )
}
