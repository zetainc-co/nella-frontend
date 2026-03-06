'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  email: string
  country: string
  description: string
}

export interface UpdateOrganizationDto {
  name?: string
  nit?: string
  industry?: string
  phone?: string
  address?: string
  email?: string
  country?: string
  description?: string
}

interface TenantResponse {
  id: string
  slug: string
  name: string
  email?: string
  phone?: string
  nit?: string
  address?: string
  industry?: string
  country?: string
  description?: string
  company_size?: string
}

function mapTenantToOrg(tenant: TenantResponse): OrganizationData {
  return {
    name: tenant.name ?? '',
    phone: tenant.phone ?? '',
    industry: tenant.industry ?? '',
    nit: tenant.nit ?? '',
    address: tenant.address ?? '',
    email: tenant.email ?? '',
    country: tenant.country ?? '',
    description: tenant.description ?? '',
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
        return mapTenantToOrg({} as TenantResponse)
      }
    },
    enabled: !!tenantSlug,
    staleTime: 60_000,
    retry: false,
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const tenantSlug = useAuthStore((s) => s.session?.tenantSlug)

  return useMutation({
    mutationFn: (dto: UpdateOrganizationDto) =>
      apiClient.patch<TenantResponse>('/api/tenants/organization', dto),
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.settings.organization(tenantSlug ?? ''),
        mapTenantToOrg(data),
      )
      toast.success('Organizacion actualizada exitosamente')
    },
    onError: (error: Error & { status?: number }) => {
      if (error.status === 403) {
        toast.error('No tienes permisos de administrador para editar la organizacion')
      } else {
        toast.error(error.message || 'Error al actualizar la organizacion')
      }
    },
  })
}
