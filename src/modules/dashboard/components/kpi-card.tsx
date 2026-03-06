import type { KpiCardProps } from '@/modules/dashboard/types/dashboard-types'

export function KpiCard({
  title,
  value,
  icon: Icon,
  loading,
  accent = "#9EFF00",
}: KpiCardProps) {
  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "rgba(18, 18, 18, 0.85)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
        }}
      />

      {/* icon top-right */}
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

      {/* value */}
      {loading ? (
        <div
          className="h-9 w-24 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      ) : (
        <div
          className="text-3xl font-bold tracking-tight"
          style={{ color: "#f0f4ff" }}
        >
          {value}
        </div>
      )}

      {/* title */}
      <div
        className="text-sm font-medium"
        style={{ color: "rgba(240,244,255,0.5)" }}
      >
        {title}
      </div>
    </div>
  );
}
