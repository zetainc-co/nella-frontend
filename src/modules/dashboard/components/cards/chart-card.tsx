"use client";

import type { ReactNode } from "react";
import { CardBase } from "../base/card-base";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  minHeight?: string;
  bgGradient?: string;
  titleClassName?: string;
}

export function ChartCard({
  title,
  description,
  children,
  isLoading = false,
  minHeight = "300px",
  bgGradient,
  titleClassName,
}: ChartCardProps) {
  return (
    <CardBase
      title={title}
      description={description}
      isLoading={isLoading}
      bgGradient={bgGradient}
      titleClassName={titleClassName}
    >
      <div style={{ minHeight }}>
        {children}
      </div>
    </CardBase>
  );
}
