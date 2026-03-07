import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectState } from '@/core/types/project.store.types'

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      isTransitioning: false,

      setSelectedProjectId: (id) => {
        set({ selectedProjectId: id, isTransitioning: true })
        // Small delay to allow UI to show loading state, then clear
        setTimeout(() => set({ isTransitioning: false }), 300)
      },

      setTransitioning: (value) => set({ isTransitioning: value }),
    }),
    {
      name: 'nella-selected-project',
      partialize: (state) => ({
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
)
