'use client'

import Link from 'next/link'
import { HudBackground, LoginHeader, LoginCard, TechnicalFooter } from '@/components/auth'
import { useLoginForm } from '@/hooks/useLoginForm'

export default function LoginPage() {
  const loginForm = useLoginForm()

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* HUD Background Elements */}
      <HudBackground />

      {/* Main Card */}
      <div className="relative w-full max-w-md mx-4 animate-[fadeIn_0.6s_ease-out] z-10">
        <LoginHeader />
        <LoginCard {...loginForm} />

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <TechnicalFooter />
      </div>
    </div>
  )
}
