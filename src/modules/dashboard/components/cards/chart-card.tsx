"use client";

import type { ReactNode } from "react";
import { CardBase } from "../base/card-base";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  minHeight?: string;
}

export function ChartCard({
  title,
  description,
  children,
  isLoading = false,
  minHeight = "300px",
}: ChartCardProps) {
  return (
    <CardBase
      title={title}
      description={description}
      isLoading={isLoading}
      className="lg:col-span-2"
    >
      <div style={{ minHeight }}>
        {children}
      </div>
    </CardBase>
  );
}
