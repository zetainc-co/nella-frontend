// src/components/auth/registration-summary.tsx
'use client'

import { useState } from 'react'
import { RegistrationFormData } from '@/types'
import { generateSlug } from '@/lib/registration-storage'
import { LATAM_COUNTRIES, INDUSTRIES, COMPANY_SIZES } from '@/lib/countries-latam'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Edit2, CheckCircle2 } from 'lucide-react'

interface RegistrationSummaryProps {
  formData: Partial<RegistrationFormData>
  onConfirm: (slug: string) => void
  onBack: () => void
  onEdit: (step: number) => void
}

export function RegistrationSummary({
  formData,
  onConfirm,
  onBack,
  onEdit,
}: RegistrationSummaryProps) {
  const [tenantSlug, setTenantSlug] = useState(
    generateSlug(formData.companyName || '')
  )
  const [isEditingSlug, setIsEditingSlug] = useState(false)

  // Obtener labels de datos
  const getCountryName = (code: string) => {
    return LATAM_COUNTRIES.find(c => c.code === code)?.name || code
  }

  const getIndustryLabel = (value: string) => {
    return INDUSTRIES.find(i => i.value === value)?.label || value
  }

  const getCompanySizeLabel = (value: string) => {
    return COMPANY_SIZES.find(s => s.value === value)?.label || value
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir caracteres válidos para slug
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '') // Quitar guiones al inicio y final
      .replace(/-+/g, '-') // Múltiples guiones a uno solo

    setTenantSlug(value)
  }

  const handleConfirm = () => {
    if (!tenantSlug || tenantSlug.length < 3) {
      alert('El slug debe tener al menos 3 caracteres')
      return
    }

    onConfirm(tenantSlug)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Resumen de Registro</h2>
        <p className="text-sm text-muted-foreground">
          Verifica que toda la información sea correcta
        </p>
      </div>

      {/* Sección: Datos de Empresa */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Datos de Empresa</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Empresa:</span>
            <span className="font-medium">{formData.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industria:</span>
            <span className="font-medium">
              {formData.industry === 'other'
                ? formData.industryOther
                : getIndustryLabel(formData.industry || '')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tamaño:</span>
            <span className="font-medium">{getCompanySizeLabel(formData.companySize || '')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">País:</span>
            <span className="font-medium">{getCountryName(formData.country || '')}</span>
          </div>
        </div>
      </div>

      {/* Sección: Administrador */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Administrador</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
            className="gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre:</span>
            <span className="font-medium">{formData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teléfono:</span>
            <span className="font-medium">{formData.phone}</span>
          </div>
        </div>
      </div>

      {/* Sección: Producto */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Configuración de Producto</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
            className="gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium">
              {formData.offeringType === 'product' ? 'Producto' : 'Servicio'}
            </span>
          </div>
          {formData.description && (
            <div>
              <span className="text-muted-foreground">Descripción:</span>
              <p className="mt-1 font-medium">{formData.description}</p>
            </div>
          )}
          {formData.priceRange && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rango de precio:</span>
              <span className="font-medium">{formData.priceRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sección: WhatsApp */}
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">WhatsApp Business</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(4)}
            className="gap-1"
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Número:</span>
            <span className="font-medium">{formData.whatsappNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Token configurado y validado</span>
          </div>
        </div>
      </div>

      {/* Slug del Tenant */}
      <div className="space-y-3 rounded-lg border border-primary/50 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">URL de tu workspace</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingSlug(!isEditingSlug)}
            className="gap-1"
          >
            <Edit2 className="h-3 w-3" />
            {isEditingSlug ? 'Listo' : 'Editar'}
          </Button>
        </div>

        {isEditingSlug ? (
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Slug (solo letras minúsculas, números y guiones)</Label>
            <Input
              id="tenantSlug"
              value={tenantSlug}
              onChange={handleSlugChange}
              placeholder="mi-empresa"
              className="font-mono"
            />
          </div>
        ) : (
          <div className="rounded bg-background p-3 font-mono text-sm">
            nella.app/<span className="font-bold text-primary">{tenantSlug}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Esta será la URL de acceso a tu panel de Nella
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={handleConfirm} className="gap-2">
          Confirmar y crear cuenta
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
