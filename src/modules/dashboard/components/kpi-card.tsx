import type { LucideIcon } from "lucide-react";
import { DASHBOARD_DESIGN } from "@/modules/dashboard/constants/design-system";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  accent = DASHBOARD_DESIGN.colors.accent.lime,
}: KpiCardProps) {
  const { card, text } = DASHBOARD_DESIGN.colors;
  const { padding, gap, topAccentHeight } = DASHBOARD_DESIGN.spacing.card;
  const { transition, hover } = DASHBOARD_DESIGN.effects;
  const skeleton = DASHBOARD_DESIGN.loading.skeleton;

  return (
    <div
      className={`relative rounded-2xl flex flex-col overflow-hidden ${transition} ${hover}`}
      style={{
        padding: `${padding * 0.25}rem`,
        gap: `${gap * 0.25}rem`,
        background: card.bg,
        border: `1px solid ${card.border}`,
        boxShadow: card.shadow,
      }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 rounded-t-2xl"
        style={{
          height: topAccentHeight,
          background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
        }}
      />

      {/* Icon in top-right */}
      <div className="flex items-start justify-between">
        <div />
        <div
          className="p-2 rounded-xl"
          style={{
            background: `${accent}15`,
            border: `1px solid ${accent}25`,
          }}
        >
          <Icon className="size-5" style={{ color: accent }} />
        </div>
      </div>

      {/* Value: Loading skeleton or display */}
      {loading ? (
        <div
          className={`${skeleton.borderRadius} ${skeleton.animate}`}
          style={{
            height: skeleton.height,
            width: skeleton.width,
            background: skeleton.bg,
          }}
        />
      ) : (
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: text.primary }}
        >
          {value}
        </div>
      )}

      {/* Title/Label */}
      <div
        className="text-sm font-medium"
        style={{ color: text.secondary }}
      >
        {title}
      </div>
    </div>
  );
}
