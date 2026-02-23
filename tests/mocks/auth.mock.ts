import type { User, Session } from '@/types/auth-types'

export const mockUser: User = {
  id: 'user-1',
  email: 'admin@acme.com',
  fullName: 'Admin User',
  phone: '+573001234567',
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
  tenantName: 'Acme Corp',
  role: 'admin',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00Z',
}

export const mockSession: Session = {
  userId: 'user-1',
  tenantId: 'tenant-1',
  tenantSlug: 'acme',
  tenantName: 'Acme Corp',
  email: 'admin@acme.com',
  fullName: 'Admin User',
  role: 'admin',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  loginAt: '2026-02-23T00:00:00Z',
}
