// src/components/calendario/project-filters.tsx
'use client'

import { Filter } from 'lucide-react'
import { useCalendarStore } from '@/modules/calendar/stores/calendar-store'
import { useAuthStore } from '@/core/store/auth-store'
import { PROJECT_COLORS, LAYER_CONFIG } from '@/modules/calendar/types/calendar-types'
import type { ProjectName, CalendarLayer } from '@/modules/calendar/types/calendar-types'

const ALL_PROJECTS: ProjectName[] = ['MundoStetic', 'TechCorp', 'Solventum']
const ALL_LAYERS: CalendarLayer[] = ['my-agenda', 'team-agenda', 'ai-appointments']

interface CheckboxItemProps {
  label: string
  dotColor: string
  checked: boolean
  onChange: () => void
}

function CheckboxItem({ label, dotColor, checked, onChange }: CheckboxItemProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2 group">
      <div className="flex items-center gap-3">
        <button
          role="checkbox"
          aria-checked={checked}
          onClick={onChange}
          className="size-5 rounded flex items-center justify-center border transition-all"
          style={
            checked
              ? {
                  backgroundColor: '#8C28FA',
                  borderColor: 'transparent',
                }
              : {
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'transparent',
                }
          }
        >
          {checked && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <span className="text-sm font-medium" style={{ color: '#f0f4ff' }}>
          {label}
        </span>
      </div>
      <div className="size-3 rounded-full" style={{ backgroundColor: dotColor }} />
    </label>
  )
}

export function ProjectFilters() {
  const { activeProjectFilters, activeLayerFilters, toggleProjectFilter, toggleLayerFilter } =
    useCalendarStore()
  const { user } = useAuthStore()

  const isAdmin = user?.role === 'admin'

  return (
    <div className="px-4 py-4 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4" style={{ color: 'rgba(240,244,255,0.5)' }} />
          <span className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
            Mis Proyectos
          </span>
        </div>
        <div className="space-y-1">
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

      {isAdmin && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-4" style={{ color: 'rgba(240,244,255,0.5)' }} />
            <span className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
              Filtros de Capas
            </span>
          </div>
          <div className="space-y-1">
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
      )}
    </div>
  )
}
