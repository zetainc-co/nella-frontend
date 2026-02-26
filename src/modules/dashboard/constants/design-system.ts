/**
 * Centralized design system for dashboard KPI cards and metrics
 * Single source of truth for all styling values
 * Supports: loading state, empty state, data state
 */

export const DASHBOARD_DESIGN = {
  // Color Palette
  colors: {
    // Card container styling
    card: {
      bg: "rgba(18, 18, 18, 0.95)",
      border: "rgba(255,255,255,0.14)",
      shadow: "0 8px 32px rgba(0,0,0,0.6)",
    },

    // Text hierarchy
    text: {
      primary: "#f0f4ff", // Main value text
      secondary: "rgba(240,244,255,0.55)", // Title/label
      tertiary: "rgba(240,244,255,0.5)", // Smaller text
      muted: "rgba(255,255,255,0.4)", // Disabled/skeleton background
    },

    // Accent colors per metric type
    accent: {
      lime: "#9EFF00",
      green: "#39d353",
    },
  },

  // Spacing System
  spacing: {
    card: {
      padding: 6, // p-6 in Tailwind (1.5rem) - increased for better breathing room
      gap: 4, // gap-4 in Tailwind (1rem)
      borderRadius: "1.5rem", // rounded-2xl
      topAccentHeight: "3px",
      iconSize: 5, // size-5 (1.25rem)
    },
    grid: {
      gap: 4, // gap-4 between cards (1rem)
      cols: "grid-cols-2 lg:grid-cols-4",
    },
  },

  // Loading State (Skeleton)
  loading: {
    skeleton: {
      bg: "rgba(255,255,255,0.08)",
      borderRadius: "rounded-lg",
      animate: "animate-pulse",
      height: "2.25rem", // h-9 (36px)
      width: "6rem", // w-24 (96px)
    },
  },

  // Effects & Transitions
  effects: {
    transition: "transition-all duration-300",
    hover: "hover:translate-y-[-2px]",
  },
} as const;

/**
 * Accent color mapping for different metric types
 * Used by MetricsGrid to assign correct color to each KPI
 */
export const METRIC_ACCENTS = {
  leads: DASHBOARD_DESIGN.colors.accent.green,
  activeLeads: DASHBOARD_DESIGN.colors.accent.green,
  revenue: DASHBOARD_DESIGN.colors.accent.lime,
  closedLeads: DASHBOARD_DESIGN.colors.accent.green,
  pipeline: DASHBOARD_DESIGN.colors.accent.lime,
  roas: DASHBOARD_DESIGN.colors.accent.green,
} as const;
