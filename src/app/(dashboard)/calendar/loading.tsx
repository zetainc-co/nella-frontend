export default function Loading() {
  return (
    <div className="flex h-full animate-pulse gap-4 p-4">
      <div className="w-64 rounded-xl bg-zinc-900/50" />
      <div className="flex-1 rounded-xl bg-zinc-900/50" />
    </div>
  )
}
