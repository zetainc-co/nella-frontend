'use client'

import { useMemo } from 'react'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'
import { ChartCard } from './cards/chart-card'

interface LeadsLineChartProps {
  revenueMonth?: ProjectMetrics['revenueMonth']
  monthlyData?: Array<{ month: string; revenue: number }>
  isLoading?: boolean
}

export function LeadsLineChart({ revenueMonth, monthlyData, isLoading }: LeadsLineChartProps) {
  const data = useMemo(() => monthlyData || [], [monthlyData])

  return (
    <ChartCard
      title="Tendencia de Ingresos vs Leads"
      description="Evolución mensual del rendimiento"
      isLoading={isLoading}
      minHeight="280px"
      bgGradient="radial-gradient(ellipse at top right, rgba(23,32,33,0.5) 0%, rgba(21,21,23,0.3) 60%, transparent 80%)"
      titleClassName="text-base"
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9EFF00" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1a2a00" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
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
            tickFormatter={(v: number) => `$${v / 1000}K`}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(158,255,0,0.2)',
              borderRadius: '8px',
              color: '#f0f4ff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
            itemStyle={{ color: '#9EFF00' }}
            formatter={(value) => {
              const n = typeof value === 'number' ? value : 0
              return [`$${n.toLocaleString()}`, 'Revenue']
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#9EFF00"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            dot={{ fill: '#9EFF00', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#9EFF00', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
