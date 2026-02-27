import type { Project } from '@/modules/dashboard/types/dashboard-types'

/**
 * Mock projects for fallback when backend is unavailable
 * Used when backend cannot be reached
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Proyecto Demo',
    owner_id: 'user-1',
    created_at: new Date('2025-02-01').toISOString(),
    updated_at: new Date('2025-02-25').toISOString(),
  },
  {
    id: '2',
    name: 'Campaña Q1 2025',
    owner_id: 'user-1',
    created_at: new Date('2025-02-10').toISOString(),
    updated_at: new Date('2025-02-26').toISOString(),
  },
]

/**
 * Get mock projects - used as fallback
 */
export function getMockProjects(): Project[] {
  return MOCK_PROJECTS
}
