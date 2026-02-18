import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@/types/auth-types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
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
      }),
    }
  )
)
