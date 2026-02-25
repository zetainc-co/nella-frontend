export interface Project {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProjectMetrics {
  totalLeads: number
  activeLeads: number
  revenueMonth: number
  trafficSources: { source: string; count: number }[]
  funnel: { status: string; count: number }[]
}
