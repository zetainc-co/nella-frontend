"use client";

import type { Period } from "@/modules/dashboard/hooks/useMetrics";

interface DashboardHeaderProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const PERIODS: { value: Period; label: string; short: string }[] = [
  { value: "all", label: "Todos los leads", short: "All" },
  { value: "30d", label: "Últimos 30 días", short: "30d" },
  { value: "prev_month", label: "Mes anterior", short: "Prev" },
  { value: "quarter", label: "Trimestre", short: "Q" },
  { value: "year", label: "Año", short: "Year" },
];

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

      <div className="flex items-center gap-1.5 flex-wrap">
        {PERIODS.map((f) => {
          const active = period === f.value;
          return (
            <button
              key={f.value}
              onClick={() => onPeriodChange(f.value)}
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
    </div>
  );
}
