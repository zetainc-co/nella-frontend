# Dashboard MVP Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the dashboard to match MVP images exactly, using real backend data + strategic mocks for unavailable metrics.

**Architecture:** Centralized data hook (`useMetricsData`) fetches real metrics from `/metrics/project/:id?period=X`, maps to component shape, injects mocks for Pipeline/ROAS/Team/Trends/AI. Reuse existing KpiCard/ConversionFunnel/TrafficSources, adapt styling to MVP (lime borders, hover states, unified color system). New components: DashboardHeader (selectors), MetricsGrid (layout), TrendChart, TeamPerformance, AIOptimization, MetricsSkeleton.

**Tech Stack:** Next.js 16 (App Router), TanStack React Query, Recharts, Tailwind CSS, Lucide icons, Zustand (auth store).

**Timeline:** 5 days (Mon-Fri), aggressive parallel execution.

---

## Day 1: Foundation (Hooks + Utilities)

### Task 1: Create mock data generator

**Files:**
- Create: `src/lib/mock-data/dashboard-metrics.ts`

**Step 1: Write mock data module**

```typescript
// src/lib/mock-data/dashboard-metrics.ts

export const MOCK_TEAM = [
  {
    id: '1',
    name: 'Carlos Méndez',
    sales: 47,
    conversionRate: 18.5,
    responseTime: '8 min',
    avatar: 'CM',
  },
  {
    id: '2',
    name: 'María García',
    sales: 42,
    conversionRate: 16.2,
    responseTime: '12 min',
    avatar: 'MG',
  },
  {
    id: '3',
    name: 'Luis Rodríguez',
    sales: 38,
    conversionRate: 15.1,
    responseTime: '15 min',
    avatar: 'LR',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    sales: 35,
    conversionRate: 14.8,
    responseTime: '10 min',
    avatar: 'AM',
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    sales: 27,
    conversionRate: 12.3,
    responseTime: '18 min',
    avatar: 'PS',
  },
];

export const MOCK_TRENDS = [
  { week: 'Sem 1', revenue: 130000, leads: 120 },
  { week: 'Sem 2', revenue: 135000, leads: 135 },
  { week: 'Sem 3', revenue: 142000, leads: 150 },
  { week: 'Sem 4', revenue: 150000, leads: 165 },
];

export const MOCK_AI_SAVINGS = {
  hourssaved: 247,
  leadsQualified: 823,
  description: 'La IA ha filtrado leads no calificados, ahorrando tiempo valioso al equipo',
};

export function calculatePipelineValue(revenue: number): number {
  return Math.round(revenue * 1.5);
}

export function calculateRoas(revenue: number): string {
  return (revenue / 20000).toFixed(1);
}
```

**Step 2: Commit**

```bash
git add src/lib/mock-data/dashboard-metrics.ts
git commit -m "feat: add mock data for dashboard metrics"
```

---

### Task 2: Create centralized metrics data hook

**Files:**
- Create: `src/modules/dashboard/hooks/useMetricsData.ts`

**Step 1: Write the hook**

```typescript
// src/modules/dashboard/hooks/useMetricsData.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/core/store/auth-store'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import {
  MOCK_TEAM,
  MOCK_TRENDS,
  MOCK_AI_SAVINGS,
  calculatePipelineValue,
  calculateRoas,
} from '@/lib/mock-data/dashboard-metrics'

export type Period = 'all' | '30d' | 'prev_month' | 'quarter' | 'year'

interface BackendMetrics {
  totalLeads: number
  activeLeads: number
  revenueMonth: number
  trafficSources: Array<{ source: string; count: number }>
  funnel: Array<{ status: string; count: number }>
}

export interface DashboardMetrics {
  // Real from API
  totalLeads: number
  activeLeads: number
  totalRevenue: number
  trafficSources: Array<{ source: string; count: number }>
  funnel: Array<{ status: string; count: number }>

  // Derived/Mock
  pipelineValue: number
  roas: string
  teamPerformance: typeof MOCK_TEAM
  trends: typeof MOCK_TRENDS
  aiSavings: typeof MOCK_AI_SAVINGS

  // Metadata
  period: Period
  projectId: string
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ])
}

export function useMetricsData(projectId: string, period: Period = '30d') {
  const searchParams = useSearchParams()
  const urlPeriod = (searchParams?.get('period') as Period) || period
  const urlProjectId = searchParams?.get('project') || projectId

  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.dashboard.metrics(urlProjectId, urlPeriod),
    queryFn: async () => {
      try {
        const response = await withTimeout(
          apiClient.get<BackendMetrics>(
            `/api/metrics/project/${urlProjectId}?period=${urlPeriod}`
          ),
          5000
        )

        const pipelineValue = calculatePipelineValue(response.revenueMonth)
        const roas = calculateRoas(response.revenueMonth)

        return {
          totalLeads: response.totalLeads,
          activeLeads: response.activeLeads,
          totalRevenue: response.revenueMonth,
          trafficSources: response.trafficSources,
          funnel: response.funnel,
          pipelineValue,
          roas,
          teamPerformance: MOCK_TEAM,
          trends: MOCK_TRENDS,
          aiSavings: MOCK_AI_SAVINGS,
          period: urlPeriod,
          projectId: urlProjectId,
        }
      } catch (error) {
        const isTimeout = error instanceof Error && error.message === 'Timeout'
        if (isTimeout) {
          toast.warning('Timeout al cargar métricas, usando datos de prueba')
        } else {
          toast.warning('Error al cargar métricas, usando datos de prueba')
        }

        // Fallback to all-mock dashboard
        return {
          totalLeads: 1247,
          activeLeads: 856,
          totalRevenue: 130800000,
          trafficSources: [
            { source: 'Instagram', count: 810 },
            { source: 'Facebook', count: 437 },
          ],
          funnel: [
            { status: 'new', count: 1247 },
            { status: 'qualified', count: 856 },
            { status: 'negotiation', count: 423 },
            { status: 'closed', count: 189 },
          ],
          pipelineValue: calculatePipelineValue(130800000),
          roas: calculateRoas(130800000),
          teamPerformance: MOCK_TEAM,
          trends: MOCK_TRENDS,
          aiSavings: MOCK_AI_SAVINGS,
          period: urlPeriod,
          projectId: urlProjectId,
        }
      }
    },
    enabled: !!urlProjectId,
    staleTime: 60000,
    retry: false,
  })
}
```

**Step 2: Add query key**

Modify `src/core/api/query-keys.ts`:

```typescript
export const queryKeys = {
  // ... existing keys
  dashboard: {
    metrics: (projectId: string, period: string) =>
      ['dashboard', 'metrics', projectId, period] as const,
    projects: () => ['projects'] as const,
  },
  // ... rest
}
```

**Step 3: Commit**

```bash
git add src/modules/dashboard/hooks/useMetricsData.ts src/core/api/query-keys.ts
git commit -m "feat: create centralized metrics data hook with real+mock fallback"
```

---

### Task 3: Create utilities for styling constants

**Files:**
- Create: `src/modules/dashboard/styles/dashboard-theme.ts`

**Step 1: Write theme constants**

```typescript
// src/modules/dashboard/styles/dashboard-theme.ts

export const DASHBOARD_COLORS = {
  primary: '#9EFF00',
  darkBg: '#1a1a1a',
  darkBg2: '#0a0a0a',
  textPrimary: '#f0f4ff',
  textSecondary: 'rgba(240,244,255,0.55)',
  textTertiary: 'rgba(240,244,255,0.6)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.07)',
  accentHover: 'rgba(158,255,0,0.08)',
  accentBorder: 'rgba(158,255,0,0.18)',
  iconMuted: 'rgba(255,255,255,0.4)',
  iconAccent: '#9EFF00',
}

export const CARD_STYLES = {
  base: {
    background: DASHBOARD_COLORS.cardBg,
    border: `1px solid ${DASHBOARD_COLORS.cardBorder}`,
  },
  hover: {
    background: DASHBOARD_COLORS.accentHover,
    border: `1px solid ${DASHBOARD_COLORS.accentBorder}`,
  },
}

export const PERIODS = [
  { label: 'Últimos 30 días', value: '30d' as const },
  { label: 'Mes anterior', value: 'prev_month' as const },
  { label: 'Trimestre', value: 'quarter' as const },
  { label: 'Año', value: 'year' as const },
  { label: 'Todo', value: 'all' as const },
]
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/styles/dashboard-theme.ts
git commit -m "feat: add dashboard theme and style constants"
```

---

## Day 2: Component Creation (Part 1)

### Task 4: Create MetricsSkeleton

**Files:**
- Create: `src/modules/dashboard/components/metrics-skeleton.tsx`

**Step 1: Write skeleton component**

```typescript
// src/modules/dashboard/components/metrics-skeleton.tsx
'use client'

const PULSE_CLASS = 'rounded-xl bg-[rgba(255,255,255,0.06)] animate-pulse'

export function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`h-8 w-40 ${PULSE_CLASS}`} />
          <div className={`h-4 w-56 ${PULSE_CLASS}`} />
        </div>
        <div className="flex gap-3">
          <div className={`h-10 w-32 ${PULSE_CLASS}`} />
          <div className={`h-10 w-32 ${PULSE_CLASS}`} />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`p-6 rounded-xl ${PULSE_CLASS}`}
            style={{ minHeight: '140px' }}
          />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '300px' }} />
        <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '300px' }} />
      </div>

      {/* Table skeleton */}
      <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '250px' }} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/metrics-skeleton.tsx
git commit -m "feat: create metrics skeleton component"
```

---

### Task 5: Adapt KpiCard to MVP styling

**Files:**
- Modify: `src/modules/dashboard/components/kpi-card.tsx`

**Step 1: Read current file to understand structure**

```bash
Read: src/modules/dashboard/components/kpi-card.tsx
```

**Step 2: Replace with MVP-styled version**

```typescript
// src/modules/dashboard/components/kpi-card.tsx
'use client'

import { ReactNode } from 'react'
import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface KpiCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  onClick?: () => void
}

export function KpiCard({ label, value, icon, trend, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-6 rounded-xl transition-all duration-200 cursor-pointer hover:shadow-lg"
      style={{
        ...CARD_STYLES.base,
      }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, CARD_STYLES.hover)
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, CARD_STYLES.base)
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-2"
            style={{ color: DASHBOARD_COLORS.textSecondary }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: DASHBOARD_COLORS.textPrimary }}
          >
            {value}
          </p>
          {trend && (
            <p
              className="text-xs font-semibold mt-2"
              style={{ color: trend.positive ? DASHBOARD_COLORS.primary : '#ef4444' }}
            >
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{ background: `${DASHBOARD_COLORS.primary}20` }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/modules/dashboard/components/kpi-card.tsx
git commit -m "style: adapt KpiCard to MVP design system"
```

---

### Task 6: Create MetricsGrid wrapper

**Files:**
- Create: `src/modules/dashboard/components/metrics-grid.tsx`

**Step 1: Write grid component**

```typescript
// src/modules/dashboard/components/metrics-grid.tsx
'use client'

import { DollarSign, TrendingUp, Users, TrendingDown } from 'lucide-react'
import { KpiCard } from './kpi-card'
import { DashboardMetrics } from '../hooks/useMetricsData'
import { DASHBOARD_COLORS } from '../styles/dashboard-theme'

interface MetricsGridProps {
  data: DashboardMetrics
}

export function MetricsGrid({ data }: MetricsGridProps) {
  const revenue = data.totalRevenue.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  const pipeline = data.pipelineValue.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Ingresos Totales"
        value={revenue}
        icon={<DollarSign className="w-5 h-5" style={{ color: DASHBOARD_COLORS.primary }} />}
        trend={{ value: '+12.5% vs mes anterior', positive: true }}
      />
      <KpiCard
        label="Valor en Pipeline"
        value={pipeline}
        icon={<TrendingUp className="w-5 h-5" style={{ color: DASHBOARD_COLORS.primary }} />}
        trend={{ value: '+8.2% vs mes anterior', positive: true }}
      />
      <KpiCard
        label="Total Leads"
        value={data.totalLeads}
        icon={<Users className="w-5 h-5" style={{ color: DASHBOARD_COLORS.primary }} />}
        trend={{ value: '+15.3% vs mes anterior', positive: true }}
      />
      <KpiCard
        label="ROAS"
        value={`${data.roas}x`}
        icon={<TrendingDown className="w-5 h-5" style={{ color: DASHBOARD_COLORS.primary }} />}
        trend={{ value: '+0.8x vs mes anterior', positive: true }}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/metrics-grid.tsx
git commit -m "feat: create metrics grid with 4 KPI cards"
```

---

### Task 7: Create DashboardHeader with selectors

**Files:**
- Create: `src/modules/dashboard/components/dashboard-header.tsx`

**Step 1: Write header component**

```typescript
// src/modules/dashboard/components/dashboard-header.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DASHBOARD_COLORS, PERIODS } from '../styles/dashboard-theme'
import type { Period } from '../hooks/useMetricsData'

interface Project {
  id: string
  name: string
}

interface DashboardHeaderProps {
  projects: Project[]
  activeProjectId: string
  activePeriod: Period
}

export function DashboardHeader({
  projects,
  activeProjectId,
  activePeriod,
}: DashboardHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('period', period)
    params.set('project', activeProjectId)
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleProjectChange = (projectId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('project', projectId)
    params.set('period', activePeriod)
    router.push(`/dashboard?${params.toString()}`)
  }

  const selectStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: DASHBOARD_COLORS.textPrimary,
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: DASHBOARD_COLORS.textPrimary }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: DASHBOARD_COLORS.textSecondary }}>
          Resumen general de tu pipeline de ventas
        </p>
      </div>

      <div className="flex gap-3">
        <Select value={activePeriod} onValueChange={handlePeriodChange}>
          <SelectTrigger
            className="w-40 h-10 rounded-lg"
            style={selectStyle}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={activeProjectId} onValueChange={handleProjectChange}>
          <SelectTrigger
            className="w-40 h-10 rounded-lg"
            style={selectStyle}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/dashboard-header.tsx
git commit -m "feat: create dashboard header with period and project selectors"
```

---

## Day 3: Component Creation (Part 2)

### Task 8: Create TrendChart component

**Files:**
- Create: `src/modules/dashboard/components/trend-chart.tsx`

**Step 1: Write trend chart**

```typescript
// src/modules/dashboard/components/trend-chart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface TrendData {
  week: string
  revenue: number
  leads: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div
      className="p-6 rounded-xl"
      style={CARD_STYLES.base}
    >
      <h3
        className="text-base font-bold mb-4"
        style={{ color: DASHBOARD_COLORS.textPrimary }}
      >
        Tendencia de Ingresos vs Leads
      </h3>
      <p
        className="text-xs mb-4"
        style={{ color: DASHBOARD_COLORS.textSecondary }}
      >
        Evolución mensual del rendimiento
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={DASHBOARD_COLORS.cardBorder}
          />
          <XAxis
            dataKey="week"
            stroke={DASHBOARD_COLORS.textSecondary}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={DASHBOARD_COLORS.textSecondary}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              background: DASHBOARD_COLORS.darkBg,
              border: `1px solid ${DASHBOARD_COLORS.cardBorder}`,
            }}
            labelStyle={{ color: DASHBOARD_COLORS.textPrimary }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={DASHBOARD_COLORS.primary}
            dot={{ fill: DASHBOARD_COLORS.primary }}
            strokeWidth={3}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/trend-chart.tsx
git commit -m "feat: create trend chart for revenue visualization"
```

---

### Task 9: Adapt ConversionFunnel to MVP styling

**Files:**
- Modify: `src/modules/dashboard/components/conversion-funnel.tsx`

**Step 1: Update to use MVP colors and layout**

```typescript
// src/modules/dashboard/components/conversion-funnel.tsx
'use client'

import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface FunnelData {
  status: string
  count: number
}

interface ConversionFunnelProps {
  data: FunnelData[]
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevos',
  qualified: 'Calificados',
  negotiation: 'Negociación',
  closed: 'Cierre',
  lost: 'Perdidos',
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div
      className="p-6 rounded-xl"
      style={CARD_STYLES.base}
    >
      <h3
        className="text-base font-bold mb-4"
        style={{ color: DASHBOARD_COLORS.textPrimary }}
      >
        El Embudo
      </h3>
      <p
        className="text-xs mb-6"
        style={{ color: DASHBOARD_COLORS.textSecondary }}
      >
        Conversión de leads a clientes
      </p>

      <div className="space-y-3">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
          return (
            <div key={item.status} className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: DASHBOARD_COLORS.textPrimary }}
                >
                  {STATUS_LABELS[item.status] || item.status}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: DASHBOARD_COLORS.primary }}
                >
                  {item.count}
                </span>
              </div>
              <div
                className="h-8 rounded-lg flex items-center justify-end pr-3"
                style={{
                  background: DASHBOARD_COLORS.primary,
                  width: `${Math.max(percentage, 10)}%`,
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: DASHBOARD_COLORS.darkBg }}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/conversion-funnel.tsx
git commit -m "style: adapt conversion funnel to MVP design"
```

---

### Task 10: Adapt TrafficSources to MVP styling

**Files:**
- Modify: `src/modules/dashboard/components/traffic-sources.tsx`

**Step 1: Update with donut chart and legend**

```typescript
// src/modules/dashboard/components/traffic-sources.tsx
'use client'

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface TrafficData {
  source: string
  count: number
}

interface TrafficSourcesProps {
  data: TrafficData[]
}

const COLORS = [DASHBOARD_COLORS.primary, '#00b8a9', '#f77f00', '#fcbf49']

export function TrafficSources({ data }: TrafficSourcesProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const dataWithPercentage = data.map((item) => ({
    name: item.source,
    value: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }))

  return (
    <div
      className="p-6 rounded-xl"
      style={CARD_STYLES.base}
    >
      <h3
        className="text-base font-bold mb-4"
        style={{ color: DASHBOARD_COLORS.textPrimary }}
      >
        Fuentes de Tráfico
      </h3>
      <p
        className="text-xs mb-6"
        style={{ color: DASHBOARD_COLORS.textSecondary }}
      >
        Distribución de origen de leads
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {dataWithPercentage.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-2">
        {dataWithPercentage.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span
              className="text-sm"
              style={{ color: DASHBOARD_COLORS.textPrimary }}
            >
              {item.name}
            </span>
            <span
              className="text-sm font-semibold ml-auto"
              style={{ color: DASHBOARD_COLORS.primary }}
            >
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/traffic-sources.tsx
git commit -m "style: adapt traffic sources to MVP design with donut chart"
```

---

## Day 4: Component Creation (Part 3)

### Task 11: Create TeamPerformance table

**Files:**
- Create: `src/modules/dashboard/components/team-performance.tsx`

**Step 1: Write team table**

```typescript
// src/modules/dashboard/components/team-performance.tsx
'use client'

import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface TeamMember {
  id: string
  name: string
  sales: number
  conversionRate: number
  responseTime: string
  avatar: string
}

interface TeamPerformanceProps {
  data: TeamMember[]
}

export function TeamPerformance({ data }: TeamPerformanceProps) {
  return (
    <div
      className="p-6 rounded-xl"
      style={CARD_STYLES.base}
    >
      <h3
        className="text-base font-bold mb-4"
        style={{ color: DASHBOARD_COLORS.textPrimary }}
      >
        Equipo de Ventas
      </h3>
      <p
        className="text-xs mb-6"
        style={{ color: DASHBOARD_COLORS.textSecondary }}
      >
        Rendimiento individual del equipo
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${DASHBOARD_COLORS.cardBorder}` }}>
              <th
                className="text-left py-3 px-4 font-semibold"
                style={{ color: DASHBOARD_COLORS.textSecondary }}
              >
                Vendedor
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: DASHBOARD_COLORS.textSecondary }}
              >
                Ventas
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: DASHBOARD_COLORS.textSecondary }}
              >
                Tasa %
              </th>
              <th
                className="text-right py-3 px-4 font-semibold"
                style={{ color: DASHBOARD_COLORS.textSecondary }}
              >
                Tiempo Respuesta
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => (
              <tr
                key={member.id}
                style={{ borderBottom: `1px solid ${DASHBOARD_COLORS.cardBorder}` }}
              >
                <td
                  className="py-3 px-4"
                  style={{ color: DASHBOARD_COLORS.textPrimary }}
                >
                  {member.name}
                </td>
                <td
                  className="py-3 px-4 text-right font-semibold"
                  style={{ color: DASHBOARD_COLORS.textPrimary }}
                >
                  {member.sales}
                </td>
                <td
                  className="py-3 px-4 text-right font-semibold"
                  style={{ color: DASHBOARD_COLORS.primary }}
                >
                  {member.conversionRate}%
                </td>
                <td
                  className="py-3 px-4 text-right"
                  style={{ color: DASHBOARD_COLORS.textSecondary }}
                >
                  {member.responseTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/team-performance.tsx
git commit -m "feat: create team performance table"
```

---

### Task 12: Create AIOptimization card

**Files:**
- Create: `src/modules/dashboard/components/ai-optimization.tsx`

**Step 1: Write AI card**

```typescript
// src/modules/dashboard/components/ai-optimization.tsx
'use client'

import { Zap } from 'lucide-react'
import { DASHBOARD_COLORS, CARD_STYLES } from '../styles/dashboard-theme'

interface AIOptimizationProps {
  hoursaved: number
  leadsQualified: number
  description: string
}

export function AIOptimization({
  hoursaved,
  leadsQualified,
  description,
}: AIOptimizationProps) {
  return (
    <div
      className="p-6 rounded-xl relative overflow-hidden"
      style={{
        ...CARD_STYLES.base,
        background: 'linear-gradient(135deg, rgba(0,180,165,0.1) 0%, rgba(158,255,0,0.05) 100%)',
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="text-base font-bold"
            style={{ color: DASHBOARD_COLORS.textPrimary }}
          >
            Ahorro con IA
          </h3>
          <p
            className="text-xs mt-1"
            style={{ color: DASHBOARD_COLORS.textSecondary }}
          >
            Optimización automática
          </p>
        </div>
        <div
          className="p-2 rounded-lg"
          style={{ background: `${DASHBOARD_COLORS.primary}20` }}
        >
          <Zap className="w-5 h-5" style={{ color: DASHBOARD_COLORS.primary }} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: DASHBOARD_COLORS.primary }}
          >
            {hoursaved} hrs
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: DASHBOARD_COLORS.textSecondary }}
          >
            Tiempo ahorrado este mes
          </p>
        </div>

        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: DASHBOARD_COLORS.primary }}
          >
            {leadsQualified}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: DASHBOARD_COLORS.textSecondary }}
          >
            Leads filtrados en el mes
          </p>
        </div>

        <p
          className="text-xs italic pt-4"
          style={{
            color: DASHBOARD_COLORS.textSecondary,
            borderTop: `1px solid ${DASHBOARD_COLORS.cardBorder}`,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/ai-optimization.tsx
git commit -m "feat: create AI optimization card"
```

---

### Task 13: Create MetricsDashboard integration component

**Files:**
- Create: `src/modules/dashboard/components/metrics-dashboard-integrated.tsx`

**Step 1: Write integration component**

```typescript
// src/modules/dashboard/components/metrics-dashboard-integrated.tsx
'use client'

import { DashboardHeader } from './dashboard-header'
import { MetricsGrid } from './metrics-grid'
import { MetricsSkeleton } from './metrics-skeleton'
import { TrendChart } from './trend-chart'
import { ConversionFunnel } from './conversion-funnel'
import { TrafficSources } from './traffic-sources'
import { TeamPerformance } from './team-performance'
import { AIOptimization } from './ai-optimization'
import { useMetricsData } from '../hooks/useMetricsData'
import { useProjects } from '../hooks/useProjects'

interface MetricsDashboardIntegratedProps {
  projectId: string
}

export function MetricsDashboardIntegrated({
  projectId,
}: MetricsDashboardIntegratedProps) {
  const { data: projects } = useProjects()
  const { data: metrics, isLoading } = useMetricsData(projectId)

  if (isLoading || !metrics) {
    return <MetricsSkeleton />
  }

  const activeProject = projects?.find((p) => p.id === metrics.projectId) || projects?.[0]

  return (
    <div className="space-y-6 pb-8">
      {/* Header with selectors */}
      <DashboardHeader
        projects={projects || []}
        activeProjectId={metrics.projectId}
        activePeriod={metrics.period}
      />

      {/* KPI Cards */}
      <MetricsGrid data={metrics} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={metrics.trends} />
        <ConversionFunnel data={metrics.funnel} />
      </div>

      {/* Traffic + AI row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSources data={metrics.trafficSources} />
        <AIOptimization
          hoursaved={metrics.aiSavings.hoursaved}
          leadsQualified={metrics.aiSavings.leadsQualified}
          description={metrics.aiSavings.description}
        />
      </div>

      {/* Team table */}
      <TeamPerformance data={metrics.teamPerformance} />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/modules/dashboard/components/metrics-dashboard-integrated.tsx
git commit -m "feat: create integrated metrics dashboard component"
```

---

## Day 5: Integration & Testing

### Task 14: Update main dashboard page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Step 1: Replace with new integrated component**

```typescript
// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjects } from '@/modules/dashboard/hooks/useProjects'
import { ProjectEmptyState } from '@/modules/dashboard/components/project-empty-state'
import { CreateProjectModal } from '@/modules/dashboard/components/create-project-modal'
import { MetricsDashboardIntegrated } from '@/modules/dashboard/components/metrics-dashboard-integrated'
import { MetricsSkeleton } from '@/modules/dashboard/components/metrics-skeleton'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: projects, isLoading } = useProjects()

  const urlProjectId = searchParams?.get('project')
  const activeProjectId = urlProjectId ?? projects?.[0]?.id ?? null

  function handleSelectProject(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  function handleProjectCreated(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  if (isLoading) {
    return <MetricsSkeleton />
  }

  const hasProjects = projects && projects.length > 0

  return (
    <div className="flex flex-1 flex-col gap-6 pt-3 min-h-screen p-4 md:p-6 lg:p-8">
      {!hasProjects ? (
        <ProjectEmptyState onCreateClick={() => setModalOpen(true)} />
      ) : activeProjectId ? (
        <MetricsDashboardIntegrated projectId={activeProjectId} />
      ) : null}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: integrate new dashboard design into main page"
```

---

### Task 15: Fix avatar initials in layout

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx` (line 96-100)

**Step 1: Replace hardcoded avatar with dynamic initials**

Find the avatar section and replace with:

```typescript
// Around line 96-100 in layout.tsx
function getInitials(name?: string | null) {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// In the JSX (line 96+):
<div
  className="shrink-0 flex items-center justify-center rounded-full font-bold text-xl shadow-[0_10px_20px_-5px_rgba(163,255,18,0.4)]"
  style={{
    width: 48,
    height: 48,
    fontSize: 18,
    background: '#9EFF00',
    color: '#1a1a1a',
  }}
>
  {getInitials(user?.fullName)}
</div>
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx
git commit -m "fix: make avatar initials dynamic from user name"
```

---

### Task 16: Build & Lint verification

**Files:**
- None (verification only)

**Step 1: Build**

```bash
cd C:\Users\forev\Local\Projects\Dev\Zeta\Nella\nella-frontend
npm run build
```

Expected: ✅ Compiled successfully

**Step 2: Lint modified files**

```bash
npx eslint \
  src/modules/dashboard/hooks/useMetricsData.ts \
  src/modules/dashboard/components/metrics-skeleton.tsx \
  src/modules/dashboard/components/kpi-card.tsx \
  src/modules/dashboard/components/metrics-grid.tsx \
  src/modules/dashboard/components/dashboard-header.tsx \
  src/modules/dashboard/components/trend-chart.tsx \
  src/modules/dashboard/components/team-performance.tsx \
  src/modules/dashboard/components/ai-optimization.tsx \
  src/modules/dashboard/components/metrics-dashboard-integrated.tsx \
  src/app/\(dashboard\)/dashboard/page.tsx
```

Expected: ✅ 0 errors

**Step 3: Commit**

```bash
git add -A
git commit -m "build: verify dashboard redesign compiles and lints without errors"
```

---

## Summary

**14 implementation tasks:**

1. ✅ Mock data generator
2. ✅ Centralized metrics hook
3. ✅ Theme/style constants
4. ✅ Metrics skeleton
5. ✅ KpiCard (adapted)
6. ✅ MetricsGrid
7. ✅ DashboardHeader
8. ✅ TrendChart
9. ✅ ConversionFunnel (adapted)
10. ✅ TrafficSources (adapted)
11. ✅ TeamPerformance
12. ✅ AIOptimization
13. ✅ MetricsDashboardIntegrated
14. ✅ Integration + Avatar fix
15. ✅ Build & Lint

**Success Criteria:**
- ✅ Dashboard matches MVP images exactly
- ✅ Real data flows from backend
- ✅ Mocks fill gaps seamlessly
- ✅ Selectors filter by period + project
- ✅ Avatar shows correct initials
- ✅ Skeleton < 2s
- ✅ 0 console errors
- ✅ 0 lint errors
- ✅ Build succeeds
- ✅ Works offline with mocks

