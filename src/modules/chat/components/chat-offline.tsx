import { WifiOff, RefreshCw } from 'lucide-react'

interface ChatOfflineProps {
  onRetry: () => void
  isRetrying: boolean
}

export function ChatOffline({ onRetry, isRetrying }: ChatOfflineProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center h-full gap-6 p-8">
      <div className="glass-panel tech-glow rounded-2xl p-12 flex flex-col items-center gap-6 max-w-md w-full text-center">
        <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
          <WifiOff className="size-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Chat temporalmente fuera de línea
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No se pudo conectar con el servidor de mensajería.
            Verifica que Chatwoot esté activo o intenta de nuevo en unos momentos.
          </p>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`size-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Reconectando...' : 'Reintentar conexión'}
        </button>
      </div>
    </div>
  )
}
