"use client";

import { Users, UserCheck, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "./kpi-card";
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Leads"
        value={isLoading ? "—" : String(data?.totalLeads ?? 0)}
        icon={Users}
        loading={isLoading}
        accent="#9EFF00"
      />
      <KpiCard
        title="Active Leads"
        value={isLoading ? "—" : String(data?.activeLeads ?? 0)}
        icon={UserCheck}
        loading={isLoading}
        accent="#39d353"
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
  );
}
