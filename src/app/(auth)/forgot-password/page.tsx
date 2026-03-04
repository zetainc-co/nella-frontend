import { AuthLayout } from '@/modules/auth/components/shared'
import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
