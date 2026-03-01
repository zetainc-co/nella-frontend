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
 * @returns userId as number or null if not available
 */
export function useCurrentUserId(): number | null {
  const token = useAuthStore.getState().session?.accessToken

  if (!token) {
    console.warn('No access token found in auth store')
    return null
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const userId = parseInt(decoded.sub, 10)

    if (isNaN(userId)) {
      console.error('Invalid userId in JWT:', decoded.sub)
      return null
    }

    return userId
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}
