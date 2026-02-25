# Design: Dashboard Nella - MVP Redesign (Complete)

**Date:** 2026-02-25
**Status:** Approved
**Urgency:** This week (urgent)

---

## Vision

Replicate the MVP dashboard shown in reference images exactly, using real data from the backend where available, and mocks for gaps (Pipeline Value, ROAS, Team Performance, AI Savings, Trend Chart).

---

## Scope

✅ Redesign complete dashboard (header, cards, charts, tables)
✅ Cohesive style system (lime borders, hover states, colors)
✅ Period selectors (30d, prev_month, quarter, year, all)
✅ Project selector dropdown
✅ Dynamic avatar initials
✅ Reusable, standardized components
✅ Performance optimization (skeleton < 2s)

❌ New backend endpoints (team, ROAS, trends)
❌ Data editing/updating
❌ Report export

---

## Architecture

### Components (Create/Adapt)

| Component | Path | Action | Purpose |
|---|---|---|---|
| `DashboardHeader` | `components/dashboard-header.tsx` | CREATE | Period + Project selectors (MVP styled) |
| `MetricsGrid` | `components/metrics-grid.tsx` | CREATE | 4 KPI cards grid (real+mocks) |
| `KpiCard` | `components/kpi-card.tsx` | ADAPT | MVP styling (lime border, hover, icon) |
| `TrendChart` | `components/trend-chart.tsx` | CREATE | Line chart Revenue vs Leads (mock) |
| `ConversionFunnel` | `components/conversion-funnel.tsx` | ADAPT | Horizontal bars, lime colors |
| `TrafficSources` | `components/traffic-sources.tsx` | ADAPT | Donut chart + legend with % |
| `TeamPerformance` | `components/team-performance.tsx` | CREATE | Vendor table (mock data) |
| `AIOptimization` | `components/ai-optimization.tsx` | CREATE | "Ahorro con IA" card (mock) |
| `MetricsSkeleton` | `components/metrics-skeleton.tsx` | CREATE | Optimized skeleton loading |
| `useMetricsData` | `hooks/useMetricsData.ts` | CREATE | Centralized hook (real + mocks) |
| `dashboard/page.tsx` | `dashboard/page.tsx` | ADAPT | Layout integration |

---

## Data Flow

```
Backend Metrics API (/metrics/project/:id?period=X)
│
├─ Real: totalLeads, activeLeads, revenueMonth, trafficSources[], funnel[]
│
└─ useMetricsData Hook
   ├─ Real data mapping
   ├─ Mock derivation:
   │  ├─ Pipeline Value = revenueMonth × 1.5
   │  ├─ ROAS = revenueMonth / 20000
   │  ├─ Team Performance (5 vendors mock)
   │  ├─ Trend Chart (4 weeks mock)
   │  └─ AI Savings (247 hrs, 823 leads)
   │
   └─ Component consumption
```

---

## Style System

**Colors & Styling (MVP-based):**

| Element | Value |
|---|---|
| Primary | `#9EFF00` (Lime) |
| Background | `#1a1a1a`, `#0a0a0a` |
| Card BG | `rgba(255,255,255,0.03)` |
| Card Border | `1px solid rgba(255,255,255,0.07)` |
| Hover | `rgba(158,255,0,0.08)` border `rgba(158,255,0,0.18)` |
| Text Primary | `#f0f4ff` |
| Text Secondary | `rgba(240,244,255,0.55)` |
| Rounded | `rounded-xl` |
| Gap/Padding | Tailwind base 16px |

**Dropdowns (Period & Project):**
- Same styling as MVP selectors
- Dark background, lime accents, hover states

---

## Data Mapping: Real vs Mock

| Metric | Source | Logic |
|---|---|---|
| Total Leads | Real | `totalLeads` from API |
| Active Leads | Real | `activeLeads` from API |
| Total Revenue | Real | `revenueMonth` from API |
| Pipeline Value | Mock | `revenueMonth × 1.5` |
| ROAS | Mock | `(revenueMonth / 20000).toFixed(1)` |
| Traffic Sources | Real | `trafficSources[]` from API |
| Funnel | Real | `funnel[]` from API (Nuevo/Calif/Negoc/Cierre) |
| Trend Chart | Mock | 4 weeks of data |
| Team Performance | Mock | 5 vendors with Sales/Rate%/Response |
| AI Savings | Mock | 247 hrs, 823 leads |

---

## Performance

- **Skeleton:** < 1s (optimized pulse bars)
- **Timeout:** 5s backend → fallback mocks + warning toast
- **Lazy Loading:** Charts with Suspense boundaries
- **Stale Time:** 60s (TanStack Query)
- **Avatar:** Dynamic initials from `fullName` (first letter + last name initial)

---

## Period & Project Selectors

**Period Options:**
- "Últimos 30 días" (30d)
- "Mes anterior" (prev_month)
- "Trimestre" (quarter)
- "Año" (year)
- "Todo" (all)
- Default: "Últimos 30 días"

**Project Selector:**
- Dropdown list
- Default: first project
- URL param: `?project=X`
- Header integration

---

## Implementation Notes

- Reuse existing components where possible (KpiCard, ConversionFunnel, TrafficSources)
- Create hook-based data layer (`useMetricsData`) for centralized real+mock logic
- Use TanStack Query for API calls + caching
- Standardize all dropdowns with MVP styling
- Optimize skeleton loading (< 2s target)
- Test with and without backend (mock fallback)

---

## Success Criteria

1. ✅ Dashboard matches MVP images exactly (styling, layout, spacing)
2. ✅ Real data flows from backend (Leads, Revenue, Traffic, Funnel)
3. ✅ Mocks fill gaps (Pipeline, ROAS, Team, Trends, AI Savings)
4. ✅ Selectors work (period + project filtering)
5. ✅ Avatar shows correct initials
6. ✅ Skeleton loads in < 2s
7. ✅ No console errors
8. ✅ Zero lint errors in modified files
9. ✅ Build succeeds (`npm run build`)
10. ✅ Works offline (mocks when API down)
