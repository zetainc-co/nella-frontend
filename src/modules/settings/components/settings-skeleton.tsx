"use client";

const pulseBarClass = "rounded bg-[rgba(255,255,255,0.06)] animate-pulse";

function SkeletonField({ labelWidth = "w-24" }: { labelWidth?: string }) {
  return (
    <div className="space-y-1.5">
      <div className={`h-3.5 ${labelWidth} ${pulseBarClass}`} />
      <div className={`h-11 rounded-xl bg-[rgba(255,255,255,0.06)] animate-pulse`} />
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonField labelWidth="w-24" />
      <SkeletonField labelWidth="w-28" />
      <SkeletonField labelWidth="w-20" />
      <SkeletonField labelWidth="w-24" />
    </div>
  );
}

export function OrganizationCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonField labelWidth="w-32" />
        <SkeletonField labelWidth="w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonField labelWidth="w-20" />
        <SkeletonField labelWidth="w-24" />
      </div>
      <SkeletonField labelWidth="w-28" />
    </div>
  );
}
