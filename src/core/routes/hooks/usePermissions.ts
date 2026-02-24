'use client'

import { useAuthStore } from '@/core/store/auth-store'

type Module =
  | 'dashboard'
  | 'contacts'
  | 'kanban'
  | 'calendar'
  | 'chat'
  | 'workflows'
  | 'settings'
  | 'administration'

const ROLE_PERMISSIONS: Record<string, Module[]> = {
  admin: [
    'dashboard', 'contacts', 'kanban', 'calendar',
    'chat', 'workflows', 'settings', 'administration',
  ],
  agent: [
    'dashboard', 'contacts', 'kanban', 'calendar',
    'chat', 'workflows', 'settings',
  ],
  viewer: [
    'dashboard', 'contacts', 'calendar', 'settings',
  ],
}

export function usePermissions() {
  const { user } = useAuthStore()

  function hasPermission(module: string, _submodule?: string): boolean {
    if (!user?.role) return false
    const allowed = ROLE_PERMISSIONS[user.role] ?? []
    return allowed.includes(module as Module)
  }

  function hasAnyPermission(modules: string[], requireAll = false): boolean {
    if (!user?.role) return false
    if (requireAll) {
      return modules.every((m) => hasPermission(m))
    }
    return modules.some((m) => hasPermission(m))
  }

  return { hasPermission, hasAnyPermission }
}
