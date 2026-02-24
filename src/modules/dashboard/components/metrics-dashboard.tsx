"use client";

import { useState } from "react";
import { Users, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { LeadsLineChart } from "./leads-line-chart";
import { ConversionFunnel } from "./conversion-funnel";
import { TrafficSources } from "./traffic-sources";
import { useMetrics, type Period } from "@/modules/dashboard/hooks/useMetrics";
import { useMetricsSocket } from "@/modules/dashboard/hooks/useMetricsSocket";

interface MetricsDashboardProps {
  projectId: string;
}

type FilterOption = {
  value: Period;
  label: string;
  short: string;
};

const FILTERS: FilterOption[] = [
  { value: "all", label: "Todos los leads", short: "All" },
  { value: "30d", label: "Últimos 30 días", short: "30d" },
  { value: "prev_month", label: "Mes anterior", short: "Prev" },
  { value: "quarter", label: "Trimestre", short: "Q" },
  { value: "year", label: "Año", short: "Year" },
];

const REVENUE_LABEL: Record<Period, string> = {
  all: "Total ingresos",
  "30d": "Ingresos (30d)",
  prev_month: "Ingresos (Mes anterior)",
  quarter: "Ingresos (Trimestre)",
  year: "Ingresos (Año)",
};

export function MetricsDashboard({ projectId }: MetricsDashboardProps) {
  const [period, setPeriod] = useState<Period>("all");

  const { data: metrics, isLoading } = useMetrics(projectId, period);
  useMetricsSocket(projectId);

  const closedLeads =
    metrics?.funnel.find((f) => f.status === "closed")?.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Time filter bar ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => {
          const active = period === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setPeriod(f.value)}
              title={f.label}
              className="text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-150"
              style={
                active
                  ? {
                      background: "rgba(158,255,0,0.15)",
                      border: "1px solid rgba(158,255,0,0.45)",
                      color: "#9EFF00",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(240,244,255,0.5)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "rgba(240,244,255,0.85)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = "rgba(240,244,255,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              <span className="hidden sm:inline">{f.label}</span>
              <span className="sm:hidden">{f.short}</span>
            </button>
          );
        })}
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Leads"
          value={isLoading ? "—" : String(metrics?.totalLeads ?? 0)}
          icon={Users}
          loading={isLoading}
          accent="#9EFF00"
        />
        <KpiCard
          title="Active Leads"
          value={isLoading ? "—" : String(metrics?.activeLeads ?? 0)}
          icon={UserCheck}
          loading={isLoading}
          accent="#39d353"
        />
        <KpiCard
          title={REVENUE_LABEL[period]}
          value={
            isLoading
              ? "—"
              : `$${(metrics?.revenueMonth ?? 0).toLocaleString()}`
          }
          icon={DollarSign}
          loading={isLoading}
          accent="#9EFF00"
        />
        <KpiCard
          title="Closed Leads"
          value={isLoading ? "—" : String(closedLeads)}
          icon={TrendingUp}
          loading={isLoading}
          accent="#39d353"
        />
      </div>

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
    </div>
  );
}
