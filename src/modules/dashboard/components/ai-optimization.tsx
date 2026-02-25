"use client";

import { Zap } from "lucide-react";

interface AIOptimizationProps {
  hoursSaved: number;
  leadsQualified: number;
  description: string;
}

export function AIOptimization({
  hoursSaved,
  leadsQualified,
  description,
}: AIOptimizationProps) {
  return (
    <div
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,180,165,0.08) 0%, rgba(158,255,0,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3
            className="text-lg font-bold"
            style={{ color: "#f0f4ff" }}
          >
            Ahorro con IA
          </h3>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(240,244,255,0.55)" }}
          >
            Optimización automática
          </p>
        </div>
        <div
          className="p-2 rounded-lg"
          style={{ background: "rgba(158,255,0,0.15)" }}
        >
          <Zap
            className="w-5 h-5"
            style={{ color: "#9EFF00" }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: "#9EFF00" }}
          >
            {hoursSaved} hrs
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(240,244,255,0.55)" }}
          >
            Tiempo ahorrado este mes
          </p>
        </div>

        <div>
          <p
            className="text-4xl font-bold"
            style={{ color: "#9EFF00" }}
          >
            {leadsQualified}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(240,244,255,0.55)" }}
          >
            Leads filtrados en el mes
          </p>
        </div>

        <p
          className="text-xs italic pt-4"
          style={{
            color: "rgba(240,244,255,0.55)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
