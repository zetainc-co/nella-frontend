import { AuthBackground } from './auth-background'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-background auth-scope">
      <AuthBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[480px]" style={{ animation: 'fadeIn 0.35s ease-out' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
