export interface Project {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProjectMetrics {
  // Existing fields
  totalLeads: number
  activeLeads: number
  revenueMonth: number
  trafficSources: { source: string; count: number }[]
  funnel: { status: string; count: number }[]

  // New fields - backend should provide these
  pipelineValue: number // Total value in pipeline (sum of all active deals)
  roas: number // Return on Ad Spend (revenue / ad spend)

  // Changes vs previous period (percentage)
  changes: {
    totalLeads: string // e.g., "+15.3%"
    activeLeads: string // e.g., "+8.2%"
    revenueMonth: string // e.g., "+12.5%"
    pipelineValue: string // e.g., "+8.2%"
    roas: string // e.g., "+0.8x"
  }
}

export interface SalesTeamMember {
  userId: string
  name: string
  sales: number
  conversionRate: number
  avgResponseTime: number
}

export interface AiSavings {
  timesSavedHours: number
  leadsFiltered: number
}

export interface DashboardData {
  metrics: ProjectMetrics
  salesTeam: SalesTeamMember[]
  aiSavings: AiSavings
}

// ── Component Props ─────────────────────────────────────────

export interface KpiCardProps {
  title: string
  value: string
  icon: import('lucide-react').LucideIcon
  loading?: boolean
  accent?: string
}

export interface ProjectSelectorProps {
  projects: Project[]
  activeProjectId: string
  onSelect: (id: string) => void
  onCreateClick: () => void
}

export interface ProjectEmptyStateProps {
  onCreateClick: () => void
}

export interface FeatureIconProps {
  icon: import('lucide-react').LucideIcon
  label: string
}

export interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  change: string
  icon: import('lucide-react').LucideIcon
  iconColor?: string
  glowColor?: string
}

export interface AiSavingsCardProps {
  aiSavings: AiSavings
  isLoading?: boolean
}

export interface ConversionFunnelProps {
  funnel: ProjectMetrics['funnel']
}

export interface SalesTeamTableProps {
  salesTeam: SalesTeamMember[]
  isLoading?: boolean
}

export interface TrafficSourcesProps {
  sources: ProjectMetrics['trafficSources']
  totalLeads: number
}

export interface LeadsLineChartProps {
  revenueMonth: ProjectMetrics['revenueMonth']
  projectId: string
}

export interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreated: (projectId: string) => void
}

export interface MetricsDashboardProps {
  projectId: string
}
