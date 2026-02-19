'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ProjectMetrics } from '@/types/auth-types'

// Two-tone lime palette matching reference
const COLORS = ['#9EFF00', '#39d353', '#5a9900', '#2a6e00', '#1a4500']

interface TrafficSourcesProps {
  sources: ProjectMetrics['trafficSources']
  totalLeads: number
}

export function TrafficSources({ sources, totalLeads }: TrafficSourcesProps) {
  const data = sources.map((s, i) => ({
    name: s.source,
    value: s.count,
    color: COLORS[i % COLORS.length],
    pct: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
  }))

  if (!data.length) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col"
        style={{
          background: 'rgba(18,18,18,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#f0f4ff' }}>Fuentes de Tráfico</h3>
        <p className="text-sm" style={{ color: 'rgba(240,244,255,0.45)' }}>Sin datos de fuente aún.</p>
      </div>
    )
  }

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
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>Distribución de origen de leads</p>
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
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(158,255,0,0.2)',
                borderRadius: '8px',
                color: '#f0f4ff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold" style={{ color: '#f0f4ff' }}>{totalLeads}</span>
          <span className="text-[10px] uppercase tracking-widest font-medium mt-1" style={{ color: 'rgba(240,244,255,0.4)' }}>Total Leads</span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span style={{ color: 'rgba(240,244,255,0.6)' }}>{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: item.color }}>{item.pct}%</span>
              <span className="font-medium" style={{ color: '#f0f4ff' }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
