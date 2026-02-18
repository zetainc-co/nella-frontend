import { AuthLayout } from '@/components/auth/shared'
import { RegistrationWizard } from '@/components/auth/registration-wizard'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegistrationWizard />
    </AuthLayout>
  )
}
