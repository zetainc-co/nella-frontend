export default function Loading() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="h-10 w-48 rounded bg-zinc-800" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-32 rounded-xl bg-zinc-900/50" />
        ))}
      </div>
    </div>
  )
}
