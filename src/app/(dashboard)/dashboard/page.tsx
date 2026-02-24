'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjects } from '@/modules/dashboard/hooks/useProjects'
import { ProjectEmptyState } from '@/modules/dashboard/components/project-empty-state'
import { CreateProjectModal } from '@/modules/dashboard/components/create-project-modal'
import { ProjectSelector } from '@/modules/dashboard/components/project-selector'
import { MetricsDashboard } from '@/modules/dashboard/components/metrics-dashboard'

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-5 lg:p-8 lg:pt-6 min-h-screen">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="h-8 w-40 bg-accent/40 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-56 bg-accent/30 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-2xl h-[120px] animate-pulse bg-accent/30" />
        ))}
      </div>
    </div>
  )
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: projects, isLoading } = useProjects()

  const urlProjectId = searchParams.get('project')
  const activeProjectId = urlProjectId ?? projects?.[0]?.id ?? null

  function handleSelectProject(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  function handleProjectCreated(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const hasProjects = projects && projects.length > 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-4 md:p-6 md:pt-5 lg:p-8 lg:pt-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">Rendimiento en tiempo real.</p>
        </div>

        {hasProjects && activeProjectId && (
          <ProjectSelector
            projects={projects}
            activeProjectId={activeProjectId}
            onSelect={handleSelectProject}
            onCreateClick={() => setModalOpen(true)}
          />
        )}
      </div>

      {/* Content */}
      {!hasProjects ? (
        <ProjectEmptyState onCreateClick={() => setModalOpen(true)} />
      ) : activeProjectId ? (
        <MetricsDashboard projectId={activeProjectId} />
      ) : null}

      {/* Modal */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
