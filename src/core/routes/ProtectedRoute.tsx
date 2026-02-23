'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, session, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !session?.tenantId)) {
      router.replace('/login')
    }
  }, [isAuthenticated, session, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'rgba(158,255,0,0.3)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!isAuthenticated || !session?.tenantId) return null

  return <>{children}</>
}
