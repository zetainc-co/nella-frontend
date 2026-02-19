'use client'

import type { ProjectMetrics } from '@/types/auth-types'

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
}

export function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const maxCount = Math.max(...funnel.map(f => f.count), 1)

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
    </div>
  )
}
