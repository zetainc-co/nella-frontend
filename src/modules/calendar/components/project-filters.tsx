// src/components/calendario/project-filters.tsx
'use client'

import { Filter } from 'lucide-react'
import { useCalendarStore } from '@/modules/calendar/stores/calendar-store'
import { PROJECT_COLORS, LAYER_CONFIG } from '@/modules/calendar/types/calendar-types'
import type { ProjectName, CalendarLayer } from '@/modules/calendar/types/calendar-types'

const ALL_PROJECTS: ProjectName[] = ['MundoStetic', 'TechCorp', 'NellaSales']
const ALL_LAYERS: CalendarLayer[] = ['my-agenda', 'team-agenda', 'ai-appointments']

interface CheckboxItemProps {
  label: string
  dotColor: string
  checked: boolean
  onChange: () => void
}

function CheckboxItem({ label, dotColor, checked, onChange }: CheckboxItemProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1 group">
      <div className="flex items-center gap-2">
        <button
          role="checkbox"
          aria-checked={checked}
          onClick={onChange}
          className={`size-4 rounded flex items-center justify-center border transition-colors ${
            checked ? 'border-transparent' : 'border-border bg-transparent'
          }`}
          style={checked ? { backgroundColor: dotColor } : {}}
        >
          {checked && (
            <svg className="size-2.5 text-white" fill="none" viewBox="0 0 12 12">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="size-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
    </label>
  )
}

export function ProjectFilters() {
  const { activeProjectFilters, activeLayerFilters, toggleProjectFilter, toggleLayerFilter } =
    useCalendarStore()

  return (
    <div className="px-3 py-2 space-y-4">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Mis Proyectos</span>
        </div>
        <div className="space-y-0.5">
          {ALL_PROJECTS.map(project => (
            <CheckboxItem
              key={project}
              label={project}
              dotColor={PROJECT_COLORS[project].border}
              checked={activeProjectFilters.includes(project)}
              onChange={() => toggleProjectFilter(project)}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filtros de Capas</span>
        </div>
        <div className="space-y-0.5">
          {ALL_LAYERS.map(layer => (
            <CheckboxItem
              key={layer}
              label={LAYER_CONFIG[layer].label}
              dotColor={LAYER_CONFIG[layer].dot}
              checked={activeLayerFilters.includes(layer)}
              onChange={() => toggleLayerFilter(layer)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
