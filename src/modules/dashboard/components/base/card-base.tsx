import type { ReactNode } from "react";
import { DASHBOARD_DESIGN } from "@/modules/dashboard/constants/design-system";

interface CardBaseProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function CardBase({
  title,
  description,
  children,
  isLoading = false,
  footer,
  className = "",
}: CardBaseProps) {
  const { card, text } = DASHBOARD_DESIGN.colors;
  const { padding, gap, topAccentHeight } = DASHBOARD_DESIGN.spacing.card;
  const { transition, hover } = DASHBOARD_DESIGN.effects;
  const skeleton = DASHBOARD_DESIGN.loading.skeleton;

  return (
    <div
      className={`relative rounded-2xl flex flex-col overflow-hidden ${transition} ${hover} ${className}`}
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
          background: `linear-gradient(90deg, transparent, ${DASHBOARD_DESIGN.colors.accent.lime}40, transparent)`,
        }}
      />

      {/* Header: Title + Description */}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold" style={{ color: text.primary }}>
          {title}
        </h3>
        {description && (
          <p
            className="text-xs"
            style={{ color: text.secondary }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Content: Loading or Children */}
      {isLoading ? (
        <div
          className={`${skeleton.borderRadius} ${skeleton.animate}`}
          style={{
            height: skeleton.height,
            width: skeleton.width,
            background: skeleton.bg,
          }}
        />
      ) : (
        <div className="flex-1">{children}</div>
      )}

      {/* Footer (optional) */}
      {footer && (
        <div
          className="text-xs"
          style={{ color: text.tertiary }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
