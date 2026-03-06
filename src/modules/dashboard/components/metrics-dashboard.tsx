"use client";

import { Users, DollarSign, TrendingUp, Target } from "lucide-react";
import { MetricCard } from "./metric-card";
import { LeadsLineChart } from "./leads-line-chart";
import { ConversionFunnel } from "./conversion-funnel";
import { TrafficSources } from "./traffic-sources";
import { SalesTeamTable } from "./sales-team-table";
import { AiSavingsCard } from "./ai-savings-card";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import type { MetricsDashboardProps } from '@/modules/dashboard/types/dashboard-types';

export function MetricsDashboard({ projectId }: MetricsDashboardProps) {
  const { data: dashboard, isLoading } = useDashboard(projectId);
  const metrics = dashboard?.metrics;
  const salesTeam = dashboard?.salesTeam ?? [];
  const aiSavings = dashboard?.aiSavings;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Metrics Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend provides revenueMonth and changes.revenueMonth */}
        <MetricCard
          title="Ingresos Totales"
          value={isLoading ? "—" : `${(metrics?.revenueMonth ?? 0) / 1000000}`}
          unit="M COP"
          change={metrics?.changes?.revenueMonth ?? "+0%"}
          icon={DollarSign}
          iconColor="#10b981"
        />
        {/* Backend provides pipelineValue and changes.pipelineValue */}
        <MetricCard
          title="Valor en Pipeline"
          value={isLoading ? "—" : `${((metrics?.pipelineValue ?? 0) / 1000000).toFixed(1)}`}
          unit="M COP"
          change={metrics?.changes?.pipelineValue ?? "+0%"}
          icon={TrendingUp}
          iconColor="#ad7135"
        />
        {/* Backend provides totalLeads and changes.totalLeads */}
        <MetricCard
          title="Total Leads"
          value={isLoading ? "—" : String(metrics?.totalLeads ?? 0)}
          change={metrics?.changes?.totalLeads ?? "+0%"}
          icon={Users}
          iconColor="#8C28FA"
        />
        {/* Backend provides roas and changes.roas */}
        <MetricCard
          title="ROAS"
          value={isLoading ? "—" : (metrics?.roas ?? 0).toFixed(1)}
          unit="x"
          change={metrics?.changes?.roas ?? "+0x"}
          icon={Target}
          iconColor="#10b981"
        />
      </div>

      {/* ── Tendencia de Ingresos vs Leads (Full Width) ─────────── */}
      <LeadsLineChart
        revenueMonth={metrics?.revenueMonth ?? 0}
        projectId={projectId}
      />

      {/* ── El Embudo + Fuentes de Tráfico (Side by Side) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="w-full">

        <ConversionFunnel funnel={metrics?.funnel ?? []} />
        </div>
        <div className="w-full">
          <TrafficSources
            sources={metrics?.trafficSources ?? []}
            totalLeads={metrics?.totalLeads ?? 0}
          />
        </div>
      </div>

      {/* ── Equipo de Ventas + Ahorro con IA (Side by Side) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesTeamTable salesTeam={salesTeam} isLoading={isLoading} />
        <AiSavingsCard
          aiSavings={aiSavings ?? { timesSavedHours: 0, leadsFiltered: 0 }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
