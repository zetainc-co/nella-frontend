'use client'

import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'
import { CardBase } from './base/card-base'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevos',
  qualified: 'Calificados',
  negotiation: 'Negociación',
  closed: 'Cierre',
  lost: 'Perdidos',
}

// Gradient from bright lime to darker green as funnel narrows
const BAR_COLORS = ['#9EFF00', '#7acc00', '#5a9900', '#3d6600', '#2a4700']

interface ConversionFunnelProps {
  funnel: ProjectMetrics['funnel']
  isLoading?: boolean
}

export function ConversionFunnel({ funnel, isLoading = false }: ConversionFunnelProps) {
  const maxCount = Math.max(...funnel.map(f => f.count), 1)

  return (
    <CardBase
      title="El Embudo"
      description="Conversión de leads a clientes"
      isLoading={isLoading}
    >
      <div className="space-y-3">
        {funnel.map((f, i) => {
          const pct = Math.round((f.count / maxCount) * 100)
          const color = BAR_COLORS[i % BAR_COLORS.length]
          return (
            <div key={f.status} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-right shrink-0" style={{ color: 'rgba(240,244,255,0.7)' }}>
                {STATUS_LABELS[f.status] ?? f.status}
              </div>
              <div className="flex-1 relative h-12 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-lg flex items-center px-4 transition-all duration-700"
                  style={{ width: `${pct}%`, background: color, minWidth: '60px' }}
                >
                  <span className="text-sm font-bold" style={{ color: '#000' }}>{f.count}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </CardBase>
  )
}
