import { headers } from 'next/headers'
import { AuthLayout } from '@/components/auth/shared'
import { LoginForm } from '@/components/auth/login/login-form'

export default async function LoginPage() {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug') ?? undefined

  return (
    <AuthLayout>
      <LoginForm tenantSlug={tenantSlug} />
    </AuthLayout>
  )
}
