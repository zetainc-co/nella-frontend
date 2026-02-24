'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthValidation } from '@/core/routes/hooks/useAuthValidation'

interface ProtectedRouteProps {
  children: React.ReactNode
  module?: string
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const router = useRouter()
  const { isValid, isLoading } = useAuthValidation()

  useEffect(() => {
    if (!isLoading && !isValid) {
      router.replace('/login')
    }
  }, [isValid, isLoading, router])

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

  if (!isValid) return null

  return <>{children}</>
}
