'use client'

import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/core/store/auth-store'
import { apiClient } from '@/core/api/api-client'
import { queryKeys } from '@/core/api/query-keys'
import { mockOrganization } from '@/lib/mock-data/settings'

export interface OrganizationData {
  name: string
  nit: string
  industry: string
  phone: string
  address: string
}

interface TenantResponse {
  id: string
  slug: string
  name: string
  phone?: string
  industry?: string
  country?: string
  company_size?: string
}

function mapTenantToOrg(tenant: TenantResponse): OrganizationData {
  return {
    name: tenant.name,
    phone: tenant.phone ?? mockOrganization.phone,
    industry: tenant.industry ?? mockOrganization.industry,
    nit: mockOrganization.nit,
    address: mockOrganization.address,
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ])
}

export function useOrganization() {
  const tenantSlug = useAuthStore((s) => s.session?.tenantSlug)

  return useQuery<OrganizationData>({
    queryKey: queryKeys.settings.organization(tenantSlug ?? ''),
    queryFn: async () => {
      try {
        const tenant = await withTimeout(
          apiClient.get<TenantResponse>(`/api/tenants/${tenantSlug}`),
          5_000
        )
        return mapTenantToOrg(tenant)
      } catch {
        toast.warning('No se pudieron cargar los datos de la empresa')
        return mockOrganization
      }
    },
    enabled: !!tenantSlug,
    staleTime: 60_000,
    retry: false,
  })
}
