export function TechnicalFooter() {
  return (
    <div className="text-center mt-8 space-y-2">
      <div className="flex items-center justify-center gap-2 text-primary/30 text-[10px] font-mono">
        <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
        <span>SECURE CONNECTION ESTABLISHED</span>
        <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
      </div>
      <p className="text-muted-foreground text-xs font-mono">
        Revenue OS v2.0 • Nella + Zeta Innovations
      </p>
      <div className="flex items-center justify-center gap-1 text-muted-foreground/40 text-[9px] font-mono">
        <span>ID:</span>
        <span className="tabular-nums">NLA-{Math.floor(Math.random() * 9000 + 1000)}</span>
        <span>•</span>
        <span className="tabular-nums">
          {new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-
          {String(new Date().getDate()).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
