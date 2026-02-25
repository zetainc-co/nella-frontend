import type { ProjectMetrics, Project } from '@/modules/auth/types/auth-types'

export const mockProject: Project = {
  id: 'proj-1',
  name: 'Campaña Q1',
  owner_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-23T00:00:00Z',
}

export const mockMetrics: ProjectMetrics = {
  totalLeads: 142,
  activeLeads: 38,
  revenueMonth: 12500000,
  trafficSources: [{ source: 'WhatsApp', count: 98 }],
  funnel: [
    { status: 'new', count: 50 },
    { status: 'contacted', count: 35 },
    { status: 'proposal', count: 20 },
    { status: 'closed', count: 37 },
  ],
}
