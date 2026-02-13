import { Sparkles } from 'lucide-react'

export function LoginHeader() {
  return (
    <div className="text-center mb-8 relative">
      {/* Top HUD line */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="inline-flex items-center gap-2 mb-3">
        <Sparkles className="size-6 text-primary animate-pulse" style={{ animationDuration: '3s' }} />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Nella <span className="text-primary">Pro</span>
        </h1>
      </div>
      <p className="text-muted-foreground text-sm font-mono tracking-wider">Revenue Operating System</p>

      {/* Bottom HUD line */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  )
}
