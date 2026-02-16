import Link from 'next/link'
import { AuthLayout, AuthBranding } from '@/components/auth/shared'
import { RegistrationWizard } from '@/components/auth/registration-wizard'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <AuthBranding subtitle="Crea tu cuenta de Nella Pro" />
      <RegistrationWizard />

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
        <Link href="/login" className="text-primary font-medium hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </AuthLayout>
  )
}
