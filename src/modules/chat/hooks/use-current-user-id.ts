import { jwtDecode } from 'jwt-decode'
import { useAuthStore } from '@/core/store/auth-store'

interface JwtPayload {
  sub: string // userId
  tenantId: string
  tenantSlug: string
  role: string
  type: 'access' | 'refresh'
}

/**
 * Extract current user ID from JWT access token
 * @returns userId as string (UUID) or null if not available
 */
export function useCurrentUserId(): string | null {
  const token = useAuthStore.getState().session?.accessToken

  if (!token) {
    console.warn('No access token found in auth store')
    return null
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.sub // Return UUID string directly
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}
