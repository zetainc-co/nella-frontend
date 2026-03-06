"use client";

import { Suspense, useState } from "react";
import { useProjects } from "@/modules/dashboard/hooks/useProjects";
import { useProjectStore } from "@/core/store/project-store";
import { ProjectEmptyState } from "@/modules/dashboard/components/project-empty-state";
import { CreateProjectModal } from "@/modules/dashboard/components/create-project-modal";
import { MetricsDashboard } from "@/modules/dashboard/components/metrics-dashboard";

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
          <div
            key={i}
            className="glass-panel rounded-2xl h-[120px] animate-pulse bg-accent/30"
          />
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();
  const activeProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  function handleProjectCreated(id: string) {
    setSelectedProjectId(id);
    setModalOpen(false);
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasProjects = projects && projects.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">
          Resumen general de tu pipeline de ventas
        </p>
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
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
