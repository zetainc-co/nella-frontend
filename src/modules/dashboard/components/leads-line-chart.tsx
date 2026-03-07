'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { LeadsLineChartProps } from '@/modules/dashboard/types/dashboard-types'
import { useRevenueHistory } from '@/modules/dashboard/hooks/useRevenueHistory'

export function LeadsLineChart({ revenueMonth, projectId }: LeadsLineChartProps) {
  const { data: historyData, isLoading, error } = useRevenueHistory(projectId)

  const data = useMemo(() => {
    if (!historyData?.history || historyData.history.length === 0) {
      // Fallback to empty weeks if no history
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
      return weeks.map((week) => ({
        week,
        leads: 0,
      }))
    }

    // Use real data from backend with formatted dates
    const mapped = historyData.history.map((item) => {
      // Format date to show "DD MMM" (e.g., "23 Feb")
      const date = new Date(item.date)
      const day = date.getDate()
      const month = date.toLocaleDateString('es', { month: 'short' })

      return {
        week: `${day} ${month}`,
        leads: item.leads,
      }
    })
    return mapped
  }, [historyData])

  return (
    <div
      className="lg:col-span-2 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: 'rgba(18, 18, 18, 0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
          Tendencia de Leads
          {isLoading && <span className="ml-2 text-xs">(Cargando...)</span>}
          {error && <span className="ml-2 text-xs text-red-400">(Error al cargar)</span>}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(240,244,255,0.45)' }}>
          Evolución semanal de nuevos contactos
        </p>
      </div>

      <div className="flex-1 w-full" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B7FED" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7437DA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="rgba(240,244,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="rgba(240,244,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax + 1']}
              allowDecimals={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 30, 35, 0.98)',
                border: '2px solid #9B7FED',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(155, 127, 237, 0.3)',
              }}
              itemStyle={{ color: '#9B7FED', fontWeight: '700' }}
              formatter={(value) => {
                const n = typeof value === 'number' ? value : 0
                return [`${n} leads`, 'Total']
              }}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="#9B7FED"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorLeads)"
              dot={{ fill: '#9B7FED', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 7, fill: '#C7B7FC', strokeWidth: 2, stroke: '#9B7FED' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
