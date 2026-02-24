'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/core/store/auth-store'

export function useLogout() {
  const router = useRouter()
  const storeLogout = useAuthStore((s) => s.logout)

  function logout() {
    storeLogout()
    localStorage.removeItem('user_role')
    toast.success('Sesión cerrada', {
      description: 'Has cerrado sesión correctamente',
    })
    router.push('/login')
  }

  return { logout }
}
