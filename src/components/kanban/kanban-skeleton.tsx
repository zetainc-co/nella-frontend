import { Skeleton } from '@/components/ui/skeleton'

export function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtros Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-card border border-border rounded-lg">
        {/* Búsqueda */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Select de canal */}
        <Skeleton className="h-10 w-full sm:w-[180px]" />

        {/* Switch "Solo mis leads" */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Contador */}
        <Skeleton className="hidden lg:block h-4 w-32" />
      </div>

      {/* Columnas Kanban Skeleton - Desktop/Tablet */}
      <div className="hidden md:block">
        <div className="flex overflow-x-auto snap-x snap-mandatory 2xl:grid 2xl:grid-cols-4 gap-4 pb-4">
          {[1, 2, 3, 4].map((column) => (
            <div
              key={column}
              className="bg-card border rounded-lg p-4 mt-1 h-[600px] w-full md:w-[280px] lg:w-[350px] 2xl:w-auto shrink-0 flex flex-col"
            >
              {/* Header de columna */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>

              {/* Cards de leads */}
              <div className="flex-1 space-y-3">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="bg-card border rounded-lg p-3"
                    style={{ opacity: 1 - card * 0.2 }}
                  >
                    {/* Header de card: icono + nombre + tiempo */}
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {/* Resumen AI */}
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Mobile Skeleton */}
      <div className="md:hidden">
        {/* Tabs header */}
        <div className="w-full grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map((tab) => (
            <Skeleton key={tab} className="h-10 rounded-md" />
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="bg-card border rounded-lg p-3"
              style={{ opacity: 1 - card * 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
