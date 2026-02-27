/**
 * Mock data for frontend-only metrics (no API endpoint)
 * Team performance, AI optimization, line charts, etc.
 * These will be replaced when backend endpoints are implemented
 */

export interface TeamMember {
  id: string
  name: string
  sales: number
  conversionRate: number
  responseTime: string
  avatar: string
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface AIOptimizationMetric {
  title: string
  description: string
  improvement: number
  status: 'optimal' | 'good' | 'needs-attention'
}

function seededRandom(seed: string): number {
  const hash = seed
    .split('')
    .reduce((acc, char) => {
      acc = (acc << 5) - acc + char.charCodeAt(0)
      return acc & 0xffffffff
    }, 0)
  return Math.abs(hash % 1000) / 1000
}

function randomRange(min: number, max: number, seed: string): number {
  const rand = seededRandom(seed)
  return min + rand * (max - min)
}

export function getTeamPerformanceMockData(projectId: string): TeamMember[] {
  return [
    {
      id: '1',
      name: 'María García',
      sales: Math.round(randomRange(10000000, 40000000, `${projectId}-sales-1`)),
      conversionRate: parseFloat(randomRange(15, 35, `${projectId}-conv-1`).toFixed(1)),
      responseTime: `${Math.round(randomRange(30, 120, `${projectId}-resp-1`))}m`,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
    {
      id: '2',
      name: 'Juan López',
      sales: Math.round(randomRange(15000000, 35000000, `${projectId}-sales-2`)),
      conversionRate: parseFloat(randomRange(18, 40, `${projectId}-conv-2`).toFixed(1)),
      responseTime: `${Math.round(randomRange(20, 100, `${projectId}-resp-2`))}m`,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    },
    {
      id: '3',
      name: 'Sophie Chen',
      sales: Math.round(randomRange(20000000, 45000000, `${projectId}-sales-3`)),
      conversionRate: parseFloat(randomRange(25, 45, `${projectId}-conv-3`).toFixed(1)),
      responseTime: `${Math.round(randomRange(15, 90, `${projectId}-resp-3`))}m`,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    },
  ]
}

export function getLeadsChartMockData(projectId: string): ChartDataPoint[] {
  const data: ChartDataPoint[] = []
  const baseDate = new Date('2025-02-01')

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(randomRange(50, 150, `${projectId}-chart-${i}`)),
    })
  }

  return data
}

export function getAIOptimizationMockData(): AIOptimizationMetric[] {
  return [
    {
      title: 'Respuesta Automática',
      description: 'Responder automáticamente a preguntas frecuentes',
      improvement: 45,
      status: 'optimal',
    },
    {
      title: 'Calificación de Leads',
      description: 'Priorizar leads con mayor probabilidad de conversión',
      improvement: 32,
      status: 'good',
    },
    {
      title: 'Seguimiento Inteligente',
      description: 'Recordatorios automáticos para seguimiento de leads',
      improvement: 28,
      status: 'good',
    },
  ]
}
