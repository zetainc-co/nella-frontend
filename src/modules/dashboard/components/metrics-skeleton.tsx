'use client';

const PULSE_CLASS = 'rounded-xl bg-[rgba(255,255,255,0.06)] animate-pulse';

export function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className={`h-8 w-40 ${PULSE_CLASS}`} />
          <div className={`h-4 w-56 ${PULSE_CLASS}`} />
        </div>
        <div className="flex gap-3">
          <div className={`h-10 w-32 ${PULSE_CLASS}`} />
          <div className={`h-10 w-32 ${PULSE_CLASS}`} />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((cardIndex) => (
          <div
            key={cardIndex}
            className={`p-6 rounded-xl ${PULSE_CLASS}`}
            style={{ minHeight: '140px' }}
          />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '300px' }} />
        <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '300px' }} />
      </div>

      {/* Table skeleton */}
      <div className={`p-6 rounded-xl ${PULSE_CLASS}`} style={{ minHeight: '250px' }} />
    </div>
  );
}
