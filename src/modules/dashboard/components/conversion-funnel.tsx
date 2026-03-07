'use client'

import type { ConversionFunnelProps } from '@/modules/dashboard/types/dashboard-types'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevos',
  qualified: 'Calificados',
  negotiation: 'Negociación',
  closed: 'Cierre',
  lost: 'Perdidos',
}

const BAR_COLORS = ['#7437DA', '#8B4FE8', '#A26FF0', '#B98FF6', '#C7B7FC']

export function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  // Always show these 4 main stages
  const FUNNEL_STAGES = ['new', 'qualified', 'negotiation', 'closed']

  // Create a map of status -> count from the funnel data
  const funnelMap = new Map(funnel.map(f => [f.status, f.count]))

  // Build the display data with all 4 stages (0 if not present)
  const displayData = FUNNEL_STAGES.map(status => ({
    status,
    count: funnelMap.get(status) || 0
  }))

  const maxCount = Math.max(...displayData.map(f => f.count), 1)

  return (
    <div
      className="w-full rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(18, 18, 18, 0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>El Embudo</h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>Conversión de leads a clientes</p>
      </div>

      <div className="space-y-3">
        {displayData.map((f, i) => {
          const pct = f.count > 0 ? Math.round((f.count / maxCount) * 100) : 0
          const color = BAR_COLORS[i % BAR_COLORS.length]
          const barWidth = f.count > 0 ? `${pct}%` : '60px' // Minimum width for empty bars

          return (
            <div key={f.status} className="flex items-center gap-4">
              <div className="w-28 text-sm font-medium text-right shrink-0" style={{ color: 'rgba(240,244,255,0.7)' }}>
                {STATUS_LABELS[f.status] ?? f.status}
              </div>
              <div className="flex-1 relative h-12 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div
                  className="h-full rounded-lg transition-all duration-700"
                  style={{
                    width: barWidth,
                    background: f.count > 0
                      ? `linear-gradient(to right, ${color}, ${color}CC)`
                      : 'linear-gradient(to right, rgba(116, 55, 218, 0.2), rgba(116, 55, 218, 0.1))',
                    minWidth: '60px'
                  }}
                />
              </div>
              <div className="w-8 text-md font-bold text-right shrink-0 text-white">
                {f.count}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
