import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState } from '@/modules/auth/types/auth-types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      tenantSubdomain: null,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      setLoading: (isLoading) => set({ isLoading }),

      setTenantSubdomain: (subdomain) =>
        set({ tenantSubdomain: subdomain }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          tenantSubdomain: null,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      getAccessToken: () => get().session?.accessToken ?? null,
    }),
    {
      name: 'nella-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        tenantSubdomain: state.tenantSubdomain,
      }),
    }
  )
)
