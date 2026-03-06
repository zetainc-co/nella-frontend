export const queryKeys = {
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  contacts: {
    all: (projectId?: string | null) => projectId ? ['contacts', projectId] as const : ['contacts'] as const,
    detail: (id: number) => ['contacts', id] as const,
  },
  dashboard: {
    metrics: (projectId: string, period: string) =>
      ['dashboard', 'metrics', projectId, period] as const,
    data: (projectId: string) => ['dashboard', projectId] as const,
    projects: () => ['projects'] as const,
  },
  kanban: {
    leads: () => ['kanban', 'leads'] as const,
  },
  settings: {
    organization: (slug: string) => ['settings', 'organization', slug] as const,
  },
  calendar: {
    events: () => ['calendar', 'events'] as const,
    bookingLinks: () => ['calendar', 'booking-links'] as const,
    settings: () => ['calendar', 'settings'] as const,
  },
  workflows: {
    byTenant: (tenantId: string) => ['workflows', tenantId] as const,
  },
  dify: {
    agents: (tenantId: string) => ['dify', 'agents', tenantId] as const,
  },
  whatsapp: {
    config: () => ['whatsapp', 'config'] as const,
  },
};
