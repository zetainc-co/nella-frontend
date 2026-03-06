'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'

// Purple palette matching the funnel
const COLORS = ['#9B7FED', '#7437DA', '#5E2DB8', '#8B4FE8', '#C7B7FC']

interface TrafficSourcesProps {
  sources: ProjectMetrics['trafficSources']
  totalLeads: number
}

export function TrafficSources({ sources, totalLeads }: TrafficSourcesProps) {
  const hasData = sources.length > 0

  const data = hasData
    ? sources.map((s, i) => ({
        name: s.source.charAt(0).toUpperCase() + s.source.slice(1),
        value: s.count,
        color: COLORS[i % COLORS.length],
        pct: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
      }))
    : [{ name: 'Sin datos', value: 1, color: 'rgba(255,255,255,0.08)', pct: 0 }]

  return (
    <div
      className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(18, 18, 18, 0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>Fuentes de Tráfico</h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>
          {hasData ? 'Distribución de origen de leads' : 'Sin datos de fuente aún'}
        </p>
      </div>

      <div className="relative flex-1 min-h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={96}
              dataKey="value"
              stroke="none"
              paddingAngle={hasData ? 2 : 0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            {hasData && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 30, 35, 0.98)',
                  border: '2px solid #9B7FED',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px rgba(155, 127, 237, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                }}
                itemStyle={{
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
                labelStyle={{
                  color: '#9B7FED',
                  fontWeight: '600',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  marginBottom: '4px',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
          <span className="text-3xl font-bold text-white">{totalLeads}</span>
          <span className="text-[10px] uppercase tracking-widest font-medium mt-1 text-gray-400">Total Leads</span>
        </div>
      </div>

      {hasData && (
        <div className="flex justify-center gap-6">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-white">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
