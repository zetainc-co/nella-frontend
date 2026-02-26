"use client";

import type { Period } from "@/modules/dashboard/hooks/useMetrics";
import { PeriodSelect } from "./period-select";

interface DashboardHeaderProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

export function DashboardHeader({
  period,
  onPeriodChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "#f0f4ff" }}
        >
          Dashboard
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "rgba(240,244,255,0.55)" }}
        >
          Resumen general de tu pipeline de ventas
        </p>
      </div>

      <div className="w-full sm:w-auto">
        <PeriodSelect value={period} onChange={onPeriodChange} />
      </div>
    </div>
  );
}
