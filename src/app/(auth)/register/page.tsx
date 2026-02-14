'use client'

import Link from 'next/link'
import { HudBackground, LoginHeader, TechnicalFooter } from '@/components/auth'
import { RegistrationWizard } from '@/components/auth/registration-wizard'

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden py-8">
      {/* HUD Background Elements */}
      <HudBackground />

      {/* Main Content */}
      <div className="relative w-full max-w-4xl mx-4 animate-[fadeIn_0.6s_ease-out] z-10">
        <LoginHeader />

        {/* Registration Wizard */}
        <div className="mt-8 flex justify-center">
          <RegistrationWizard />
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <TechnicalFooter />
      </div>
    </div>
  )
}
