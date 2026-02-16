import { LogIn } from 'lucide-react'

interface LoginCardProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  loading: boolean
  message: { type: 'success' | 'error'; text: string } | null
  handleLogin: (e: React.FormEvent) => Promise<void>
}

export function LoginCard({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  message,
  handleLogin,
}: LoginCardProps) {
  return (
    <div className="relative glass-panel rounded-2xl p-8 shadow-[0_0_60px_-10px_rgba(206,242,93,0.08)] hover:shadow-[0_0_80px_-10px_rgba(206,242,93,0.12)] transition-shadow duration-500">
      {/* HUD Corner Frames */}
      <div className="absolute top-0 left-0 w-6 h-6">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      <div className="absolute top-0 right-0 w-6 h-6">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 w-6 h-6">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      <div className="absolute bottom-0 right-0 w-6 h-6">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      {/* Form Content */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="tech-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="tech-input"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="tech-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="tech-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <LogIn className="size-4" />
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </span>
        </button>
      </form>

      {message && (
        <div
          className={`relative mt-6 p-4 rounded-lg border backdrop-blur-sm animate-[slideIn_0.3s_ease-out] ${
            message.type === 'success'
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {/* Status indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                message.type === 'success' ? 'bg-primary' : 'bg-destructive'
              }`}
            />
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="text-[10px] font-mono opacity-60 mb-1">
                {message.type === 'success' ? '[ SYSTEM ]' : '[ ERROR ]'}
              </div>
              <p className="text-sm font-mono">{message.text}</p>
            </div>
          </div>

          {/* Technical border accent */}
          <div
            className={`absolute bottom-0 left-0 h-px w-full bg-gradient-to-r ${
              message.type === 'success'
                ? 'from-transparent via-primary/50 to-transparent'
                : 'from-transparent via-destructive/50 to-transparent'
            }`}
          />
        </div>
      )}
    </div>
  )
}
