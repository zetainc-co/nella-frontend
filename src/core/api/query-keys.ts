export const queryKeys = {
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  contacts: {
    all: () => ['contacts'] as const,
    detail: (id: number) => ['contacts', id] as const,
  },
  dashboard: {
    metrics: (projectId: string, period: string) =>
      ['metrics', projectId, period] as const,
    projects: () => ['projects'] as const,
  },
  kanban: {
    leads: () => ['kanban', 'leads'] as const,
  },
  calendar: {
    events: () => ['calendar', 'events'] as const,
    bookingLinks: () => ['calendar', 'booking-links'] as const,
    settings: () => ['calendar', 'settings'] as const,
  },
  workflows: {
    byTenant: (tenantId: string) => ['workflows', tenantId] as const,
  },
}
