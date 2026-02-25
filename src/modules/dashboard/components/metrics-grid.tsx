"use client";

import { Users, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "./kpi-card";
import {
  DASHBOARD_DESIGN,
  METRIC_ACCENTS,
} from "@/modules/dashboard/constants/design-system";
import type { Period } from "@/modules/dashboard/hooks/useMetrics";

interface MetricsData {
  totalLeads: number;
  activeLeads: number;
  revenueMonth: number;
  funnel: Array<{ status: string; count: number }>;
}

interface MetricsGridProps {
  data: MetricsData | null | undefined;
  isLoading: boolean;
  period: Period;
}

const REVENUE_LABEL: Record<Period, string> = {
  all: "Total ingresos",
  "30d": "Ingresos (30d)",
  prev_month: "Ingresos (Mes anterior)",
  quarter: "Ingresos (Trimestre)",
  year: "Ingresos (Año)",
};

export function MetricsGrid({
  data,
  isLoading,
  period,
}: MetricsGridProps) {
  const closedLeads =
    data?.funnel.find((f) => f.status === "closed")?.count ?? 0;
  const { cols, gap } = DASHBOARD_DESIGN.spacing.grid;

  return (
    <div
      className={`grid ${cols}`}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      <KpiCard
        title="Total Leads"
        value={isLoading ? "—" : String(data?.totalLeads ?? 0)}
        icon={Users}
        loading={isLoading}
        accent={METRIC_ACCENTS.leads}
      />
      <KpiCard
        title="Active Leads"
        value={isLoading ? "—" : String(data?.activeLeads ?? 0)}
        icon={UserCheck}
        loading={isLoading}
        accent={METRIC_ACCENTS.activeLeads}
      />
      <KpiCard
        title={REVENUE_LABEL[period]}
        value={
          isLoading
            ? "—"
            : `$${(data?.revenueMonth ?? 0).toLocaleString()}`
        }
        icon={DollarSign}
        loading={isLoading}
        accent={METRIC_ACCENTS.revenue}
      />
      <KpiCard
        title="Closed Leads"
        value={isLoading ? "—" : String(closedLeads)}
        icon={TrendingUp}
        loading={isLoading}
        accent={METRIC_ACCENTS.closedLeads}
      />
    </div>
  );
}
