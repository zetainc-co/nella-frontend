import { headers } from 'next/headers'
import { AuthLayout } from '@/modules/auth/components/shared'
import { LoginForm } from '@/modules/auth/components/login/login-form'

export default async function LoginPage() {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? undefined

  return (
    <AuthLayout>
      <LoginForm tenantSlug={tenantSlug} />
    </AuthLayout>
  )
}
