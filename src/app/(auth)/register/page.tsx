import { AuthLayout } from '@/modules/auth/components/shared'
import { RegistrationWizard } from '@/modules/auth/components/registration-wizard'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegistrationWizard />
    </AuthLayout>
  )
}
