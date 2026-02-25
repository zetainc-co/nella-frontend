"use client";

import type { ReactNode } from "react";
import { CardBase } from "../base/card-base";

interface TableCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
}

export function TableCard({
  title,
  description,
  children,
  isLoading = false,
}: TableCardProps) {
  return (
    <CardBase
      title={title}
      description={description}
      isLoading={isLoading}
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        {children}
      </div>
    </CardBase>
  );
}
