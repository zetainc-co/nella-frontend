"use client";

import { Zap } from "lucide-react";
import { StatsCard } from "./cards/stats-card";
import { DASHBOARD_DESIGN } from "@/modules/dashboard/constants/design-system";

interface AIOptimizationProps {
  hoursSaved: number;
  leadsQualified: number;
  description: string;
  isLoading?: boolean;
}

export function AIOptimization({
  hoursSaved,
  leadsQualified,
  description,
  isLoading = false,
}: AIOptimizationProps) {
  const { accent } = DASHBOARD_DESIGN.colors;
  const { text } = DASHBOARD_DESIGN.colors;

  return (
    <StatsCard
      title="Ahorro con IA"
      description="Optimización automática"
      isLoading={isLoading}
      icon={Zap}
      gradient={false}
    >
      <div className="space-y-4">
        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: accent.lime }}
          >
            {hoursSaved} hrs
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: text.secondary }}
          >
            Tiempo ahorrado este mes
          </p>
        </div>

        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: accent.lime }}
          >
            {leadsQualified}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: text.secondary }}
          >
            Leads filtrados en el mes
          </p>
        </div>

        <p
          className="text-xs italic pt-4"
          style={{
            color: text.secondary,
            borderTop: `1px solid ${DASHBOARD_DESIGN.colors.card.border}`,
          }}
        >
          {description}
        </p>
      </div>
    </StatsCard>
  );
}
