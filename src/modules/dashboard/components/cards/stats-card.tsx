"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CardBase } from "../base/card-base";

interface StatsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  icon?: LucideIcon;
  gradient?: boolean;
}

export function StatsCard({
  title,
  description,
  children,
  isLoading = false,
  icon: Icon,
  gradient = false,
}: StatsCardProps) {
  return (
    <CardBase
      title={title}
      description={description}
      isLoading={isLoading}
      className={gradient ? "bg-gradient-to-br from-slate-800 to-slate-900" : ""}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="size-5" />}
        <div className="flex-1">{children}</div>
      </div>
    </CardBase>
  );
}
