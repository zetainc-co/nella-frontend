export interface ProjectState {
  selectedProjectId: string | null
  isTransitioning: boolean
  setSelectedProjectId: (id: string | null) => void
  setTransitioning: (value: boolean) => void
}
