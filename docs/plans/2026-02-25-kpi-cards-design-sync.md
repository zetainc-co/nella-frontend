# KPI Cards Design Synchronization - Phase 1

**Date:** 2026-02-25
**Task ID:** NELLA-39
**Objective:** Synchronize KPI card styling to be 1:1 identical across loading → empty → data states

---

## Design Overview

### Architecture

Create centralized design system (`design-system.ts`) containing:
- **Color Palette:** Card backgrounds, text hierarchy, accent colors (lime/green)
- **Spacing System:** Card padding/gap, grid layout, border radius
- **Loading State:** Skeleton styling (bg, animation)
- **Effects:** Transitions, hover states

### Components Affected

1. **KpiCard** - Use design constants instead of inline styles
2. **MetricsGrid** - Use design constants for grid layout, accent mapping
3. **MetricsDashboard** - No changes (integration point)

### Data Flow

```
MetricsDashboard
  ├── useMetrics() → isLoading, data
  ├── MetricsGrid
  │   └── KpiCard × 4
  │       ├── Loading: animate-pulse skeleton
  │       ├── Empty: value="0", normal style
  │       └── Data: value=real, normal style
```

---

## Design Decisions

### Why Centralized Constants?

- **Single Source of Truth:** All KPI card styles defined in one place
- **Maintainability:** Future changes apply everywhere automatically
- **Scalability:** Foundation for Phase 2 (reusable component library)
- **Consistency:** Loading state, empty state, and data state all use same values

### Color & Spacing Choices

- **Card BG:** `rgba(18, 18, 18, 0.85)` - matches dashboard dark theme
- **Text Primary:** `#f0f4ff` - high contrast, accessible
- **Accent:** Lime `#9EFF00`, Green `#39d353` - visual hierarchy per metric type
- **Padding:** `p-5` / `1.25rem` - breathing room matching screenshots
- **Gap:** `gap-4` / `1rem` - consistent spacing between elements

### Loading State Handling

- Skeleton uses `animate-pulse` with `rgba(255,255,255,0.08)` background
- Same card container as data state (no layout shift)
- Height: 36px (h-9) to match value text height

---

## Implementation Tasks

### Task 1: Create `design-system.ts`
- [ ] Define DASHBOARD_DESIGN constant with all values
- [ ] Define METRIC_ACCENTS mapping
- [ ] Export for use in components

### Task 2: Refactor `kpi-card.tsx`
- [ ] Import design constants
- [ ] Replace inline style values with constants
- [ ] Ensure loading state uses skeleton styling
- [ ] Verify 1:1 match with screenshot styling

### Task 3: Refactor `metrics-grid.tsx`
- [ ] Import design constants and accent map
- [ ] Apply grid spacing from constants
- [ ] Map accents correctly to each KPI
- [ ] Validate grid layout matches screenshot

### Task 4: Validation
- [ ] Build & lint success
- [ ] Tests pass
- [ ] Visual comparison: loading state matches screenshots
- [ ] Visual comparison: empty state (0 values) matches screenshots
- [ ] Visual comparison: with data matches screenshots

---

## Success Criteria

✅ KPI cards are 1:1 identical across all three states (loading, empty, data)
✅ All inline styles moved to design-system.ts
✅ No visual regressions
✅ Build passes, tests pass, lint passes
✅ Ready for Phase 2 refactor

---

## Notes

- Design system will be expanded in Phase 2 to include gráficos, tablas, etc.
- Phase 2 will extract reusable components (CardContainer, MetricCard, etc.)
- All changes maintain existing data flow from useMetrics hook
