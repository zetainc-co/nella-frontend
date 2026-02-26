# Design: Dashboard Component Hierarchy — Phase 2

**Date:** 2026-02-25
**Status:** Implemented
**Task:** NELLA-39
**Phase:** 2 of 3 (Dashboard MVP Redesign)

---

## Overview

Phase 2 introduces a reusable component hierarchy that eliminates 350+ lines of duplicate inline styling across 5 dashboard components. Four base components (`CardBase`, `ChartCard`, `TableCard`, `StatsCard`) replace individually styled cards with a single, composable architecture backed by the `DASHBOARD_DESIGN` constants established in Phase 1.

---

## Component Hierarchy

```
DASHBOARD_DESIGN (constants/design-system.ts)
    |
    v
CardBase (base/card-base.tsx)
    |--- title, description, children, isLoading, footer, className
    |--- Renders: top accent line, header, skeleton/content, optional footer
    |--- Sources ALL styling from DASHBOARD_DESIGN
    |
    +--- ChartCard (cards/chart-card.tsx)
    |       extends CardBase with: minHeight prop, lg:col-span-2 layout
    |       Used by: LeadsLineChart, TrafficSources
    |
    +--- TableCard (cards/table-card.tsx)
    |       extends CardBase with: overflow-x-auto wrapper, lg:col-span-2 layout
    |       Used by: TeamPerformance
    |
    +--- StatsCard (cards/stats-card.tsx)
            extends CardBase with: optional LucideIcon, gradient toggle, lg:col-span-2 layout
            Used by: AIOptimization
```

### Props Reference

| Component | Unique Props | Inherited from CardBase |
|-----------|-------------|------------------------|
| `CardBase` | `title`, `description`, `children`, `isLoading`, `footer`, `className` | -- |
| `ChartCard` | `minHeight` (default `"300px"`) | All CardBase props |
| `TableCard` | -- | All CardBase props |
| `StatsCard` | `icon?: LucideIcon`, `gradient?: boolean` | All CardBase props |

---

## Design System Integration

All card styling derives from `DASHBOARD_DESIGN` in `constants/design-system.ts`:

- **Colors**: `card.bg`, `card.border`, `card.shadow`, `text.primary`, `text.secondary`, `accent.lime`
- **Spacing**: `card.padding`, `card.gap`, `card.topAccentHeight`, `card.borderRadius`
- **Effects**: `transition` (`transition-all duration-300`), `hover` (`hover:translate-y-[-2px]`)
- **Loading**: `skeleton.bg`, `skeleton.animate`, `skeleton.height`, `skeleton.width`

No component hard-codes card container styles. Content-specific styling (chart colors, table borders) remains local to each component since it is domain-specific, not structural.

---

## Refactoring Matrix

| Before (Phase 1) | After (Phase 2) | Card Type | Lines Removed |
|-------------------|-----------------|-----------|---------------|
| `ConversionFunnel` (inline card styles) | `ConversionFunnel` wraps `CardBase` | `CardBase` | ~70 |
| `LeadsLineChart` (inline card styles) | `LeadsLineChart` wraps `ChartCard` | `ChartCard` | ~65 |
| `TrafficSources` (inline card styles) | `TrafficSources` wraps `ChartCard` | `ChartCard` | ~75 |
| `TeamPerformance` (inline card styles) | `TeamPerformance` wraps `TableCard` | `TableCard` | ~70 |
| `AIOptimization` (inline card styles) | `AIOptimization` wraps `StatsCard` | `StatsCard` | ~70 |

**Total inline styling eliminated:** ~350 lines across 5 components.

---

## File Structure

```
src/modules/dashboard/
  constants/
    design-system.ts          # DASHBOARD_DESIGN + METRIC_ACCENTS (Phase 1)
  components/
    base/
      card-base.tsx           # Foundation component
      index.ts                # Barrel export
    cards/
      chart-card.tsx          # Chart specialization
      table-card.tsx          # Table specialization
      stats-card.tsx          # Stats specialization
      index.ts                # Barrel export
    conversion-funnel.tsx     # Refactored -> CardBase
    leads-line-chart.tsx      # Refactored -> ChartCard
    traffic-sources.tsx       # Refactored -> ChartCard
    team-performance.tsx      # Refactored -> TableCard
    ai-optimization.tsx       # Refactored -> StatsCard
```

---

## Benefits

1. **Single source of truth** -- Card styling changes propagate automatically to all 5 components via `DASHBOARD_DESIGN`.
2. **Reduced duplication** -- 350+ lines of repeated inline styles replaced by composable wrappers.
3. **Consistent UX** -- Every card shares identical padding, borders, shadows, hover effects, and loading states.
4. **Foundation for component library** -- `CardBase` and its specializations are reusable beyond the dashboard module.
5. **Zero breaking changes** -- Existing data flow and component public APIs remain unchanged.

---

## Testing and Validation

| Check | Result |
|-------|--------|
| Unit tests (61 total) | All pass |
| `npm run build` | 0 errors |
| `npm run lint` | 0 new errors |
| TypeScript compilation | 0 errors |
| Browser console | 0 errors |

---

## Future Enhancements (Phase 3)

- Extract reusable chart content components (AreaChart wrapper, PieChart wrapper) to reduce Recharts boilerplate inside `LeadsLineChart` and `TrafficSources`.
- Extract reusable table content component with standardized header/row styling for `TeamPerformance` and future table-based cards.
- Evaluate `StatsCard` icon rendering -- current implementation uses inline `LucideIcon`; consider a badge variant with background for visual consistency with `KpiCard`.
- Expand `DASHBOARD_DESIGN` to cover chart-specific tokens (axis colors, tooltip styles, gradient definitions) currently hard-coded in chart components.
