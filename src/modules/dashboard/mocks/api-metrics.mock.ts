import type { ProjectMetrics } from '@/modules/dashboard/types/dashboard-types'

/**
 * Mock data for API-backed metrics (used as fallback when API fails)
 * These match the backend API response structure
 */
export const MOCK_API_METRICS: ProjectMetrics = {
  totalLeads: 2715,
  activeLeads: 856,
  revenueMonth: 457000,
  funnel: [
    { status: 'new', count: 1247 },
    { status: 'qualified', count: 856 },
    { status: 'negotiation', count: 423 },
    { status: 'closed', count: 189 },
  ],
  trafficSources: [
    { source: 'Instagram', count: 1766 },
    { source: 'Facebook', count: 949 },
  ],
}

/**
 * Get mock metrics for a specific project
 * Ensures consistent data per projectId using seeded randomization
 */
export function getMockApiMetricsForProject(projectId: string): ProjectMetrics {
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

  const totalLeads = Math.round(randomRange(800, 2000, `${projectId}-leads`))
  const activeLeads = Math.round(totalLeads * randomRange(0.4, 0.7, `${projectId}-active`))

  return {
    totalLeads,
    activeLeads,
    revenueMonth: Math.round(randomRange(80000000, 200000000, `${projectId}-revenue`)),
    funnel: [
      { status: 'new', count: Math.round(totalLeads * randomRange(0.35, 0.55, `${projectId}-funnel-new`)) },
      { status: 'qualified', count: Math.round(totalLeads * randomRange(0.2, 0.4, `${projectId}-funnel-qual`)) },
      { status: 'negotiation', count: Math.round(totalLeads * randomRange(0.1, 0.3, `${projectId}-funnel-neg`)) },
      { status: 'closed', count: Math.round(totalLeads * randomRange(0.05, 0.15, `${projectId}-funnel-closed`)) },
    ],
    trafficSources: [
      { source: 'Instagram', count: Math.round(totalLeads * randomRange(0.4, 0.7, `${projectId}-traffic-ig`)) },
      { source: 'Facebook', count: Math.round(totalLeads * randomRange(0.3, 0.6, `${projectId}-traffic-fb`)) },
    ],
  }
}
