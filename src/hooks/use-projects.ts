'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/types/auth-types'

function getSessionHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  try {
    const stored = JSON.parse(localStorage.getItem('nella-auth-storage') || 'null')
    const session = stored?.state?.session
    if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
    if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug
  } catch {
    // localStorage not available (SSR safety)
  }
  return headers
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { headers: getSessionHeaders() })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

async function createProject(name: string): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: getSessionHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create project')
  return res.json()
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createProject(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
