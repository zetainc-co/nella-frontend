'use client'

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

        <TechnicalFooter />
      </div>
    </div>
  )
}
