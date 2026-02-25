"use client";

import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { MetricsGrid } from "./metrics-grid";
import { LeadsLineChart } from "./leads-line-chart";
import { ConversionFunnel } from "./conversion-funnel";
import { TrafficSources } from "./traffic-sources";
import { TeamPerformance } from "./team-performance";
import { AIOptimization } from "./ai-optimization";
import { useMetrics, type Period } from "@/modules/dashboard/hooks/useMetrics";
import { useMetricsSocket } from "@/modules/dashboard/hooks/useMetricsSocket";
import { mockTeam, mockAiSavings } from "@/lib/mock-data/dashboard-metrics";

interface MetricsDashboardProps {
  projectId: string;
}

export function MetricsDashboard({ projectId }: MetricsDashboardProps) {
  const [period, setPeriod] = useState<Period>("all");

  const { data: metrics, isLoading } = useMetrics(projectId, period);
  useMetricsSocket(projectId);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header with period selector ──────────────────────────── */}
      <DashboardHeader period={period} onPeriodChange={setPeriod} />

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <MetricsGrid data={metrics} isLoading={isLoading} period={period} />

      {/* ── Charts row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics ? (
          <LeadsLineChart revenueMonth={metrics.revenueMonth} />
        ) : (
          <div
            className="lg:col-span-2 rounded-2xl h-[360px] animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        )}
        {metrics ? (
          <TrafficSources
            sources={metrics.trafficSources}
            totalLeads={metrics.totalLeads}
          />
        ) : (
          <div
            className="rounded-2xl h-[360px] animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        )}
      </div>

      {/* ── Funnel ───────────────────────────────────────────────── */}
      {metrics ? (
        <ConversionFunnel funnel={metrics.funnel} />
      ) : (
        <div
          className="rounded-2xl h-[300px] animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      )}

      {/* ── Team Performance + AI Optimization row ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics ? (
          <TeamPerformance data={mockTeam} />
        ) : (
          <div
            className="rounded-2xl h-[350px] animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        )}
        {metrics ? (
          <AIOptimization
            hoursSaved={mockAiSavings.hoursSaved}
            leadsQualified={mockAiSavings.leadsQualified}
            description={mockAiSavings.description}
          />
        ) : (
          <div
            className="rounded-2xl h-[350px] animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        )}
      </div>
    </div>
  );
}
