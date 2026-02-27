"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./dashboard-header";
import { MetricsGrid } from "./metrics-grid";
import { LeadsLineChart } from "./leads-line-chart";
import { ConversionFunnel } from "./conversion-funnel";
import { TrafficSources } from "./traffic-sources";
import { TeamPerformance } from "./team-performance";
import { AIOptimization } from "./ai-optimization";
import { useMetrics, type Period } from "@/modules/dashboard/hooks/useMetrics";
import { useFrontendMetrics } from "@/modules/dashboard/hooks/useFrontendMetrics";
import { useMetricsSocket } from "@/modules/dashboard/hooks/useMetricsSocket";
import { useProjects } from "@/modules/dashboard/hooks/useProjects";
import { DASHBOARD_DESIGN } from "@/modules/dashboard/constants/design-system";

interface MetricsDashboardProps {
  projectId: string;
}

export function MetricsDashboard({ projectId }: MetricsDashboardProps) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("all");
  const { data: projects = [] } = useProjects();
  const { data: metrics, isLoading } = useMetrics(projectId, period);
  const { teamPerformance, leadsChart, aiOptimization } = useFrontendMetrics(projectId);
  useMetricsSocket(projectId);

  // Find current project name
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  // KPI data from API (with fallback to mocks handled in useMetrics hook)
  const kpiData = useMemo(() => {
    if (metrics) {
      return {
        totalLeads: metrics.totalLeads,
        activeLeads: metrics.activeLeads,
        revenueMonth: metrics.revenueMonth,
        funnel: metrics.funnel,
      };
    }
    return {
      totalLeads: 0,
      activeLeads: 0,
      revenueMonth: 0,
      funnel: [],
    };
  }, [metrics]);

  // Growth metrics from mocks (backend doesn't provide these yet)
  const growthMetrics = useMemo(() => {
    return {
      pipelineValue: 85000000,
      roas: 3.8,
      revenueGrowth: 12.5,
      pipelineGrowth: 8.3,
      leadsGrowth: 15.2,
      roasGrowth: 2.1,
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 px-14 mb-10">
      {/* ── Header with period selector and project name ──────────────────────────── */}
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        projectName={currentProject?.name || "Proyecto"}
        onProjectCreated={(projectId) => {
          router.push(`/dashboard?project=${projectId}`);
        }}
      />

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <MetricsGrid
        data={kpiData}
        isLoading={isLoading}
        period={period}
        projectName={currentProject?.name || "Proyecto"}
        pipelineValue={growthMetrics.pipelineValue}
        roas={growthMetrics.roas}
        revenueGrowth={growthMetrics.revenueGrowth}
        pipelineGrowth={growthMetrics.pipelineGrowth}
        leadsGrowth={growthMetrics.leadsGrowth}
        roasGrowth={growthMetrics.roasGrowth}
      />

      {/* ── Charts row ───────────────────────────────────────────── */}
      <div
        className={`grid ${DASHBOARD_DESIGN} `}
        style={{ gap: `${DASHBOARD_DESIGN.spacing.grid.gap * 0.25}rem` }}
      >
        <LeadsLineChart
          monthlyData={leadsChart.map(d => ({ month: d.date, revenue: d.value }))}
          revenueMonth={kpiData.revenueMonth}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ConversionFunnel funnel={kpiData.funnel} />
          <TrafficSources
            sources={metrics?.trafficSources || []}
            totalLeads={kpiData.totalLeads}
          />
        </div>
      </div>

      {/* ── Team Performance + AI Optimization row ──────────────── */}
      <div
        className={`grid ${DASHBOARD_DESIGN.spacing.grid.cols}`}
        style={{ gap: `${DASHBOARD_DESIGN.spacing.grid.gap * 0.25}rem` }}
      >
        <TeamPerformance data={teamPerformance} />
        <AIOptimization
          hoursSaved={Math.round(teamPerformance.reduce((sum, member) => sum + parseInt(member.responseTime), 0) / teamPerformance.length)}
          leadsQualified={Math.round(kpiData.totalLeads * 0.32)}
          description="Optimización automática con IA"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
