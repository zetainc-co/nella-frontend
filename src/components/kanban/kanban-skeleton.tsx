import { Skeleton } from '@/components/ui/skeleton'

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 md:flex md:overflow-x-auto lg:grid-cols-4">
      {[1, 2, 3, 4].map((column) => (
        <div key={column} className="w-full shrink-0 space-y-3 md:w-[320px]">
          {/* Header skeleton */}
          <Skeleton className="h-10 w-full" />

          {/* Cards skeleton */}
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full opacity-50" />
        </div>
      ))}
    </div>
  )
}
