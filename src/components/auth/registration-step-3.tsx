// src/components/auth/registration-step-3.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step3Schema } from '@/lib/registration-validations'
import { RegistrationFormData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface RegistrationStep3Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack: () => void
}

export function RegistrationStep3({
  initialData,
  onNext,
  onBack,
}: RegistrationStep3Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      offeringType: initialData.offeringType as 'product' | 'service' | undefined,
      description: initialData.description || '',
      priceRange: initialData.priceRange || '',
      idealCustomer: initialData.idealCustomer || '',
    },
  })

  const offeringType = watch('offeringType')

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Tipo de Oferta */}
        <div className="space-y-2">
          <Label>
            ¿Qué vendes? <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setValue('offeringType', 'product')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
                offeringType === 'product'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Producto</div>
              <div className="text-sm text-muted-foreground">
                Artículos físicos o digitales
              </div>
            </button>
            <button
              type="button"
              onClick={() => setValue('offeringType', 'service')}
              className={`flex-1 rounded-lg border-2 p-4 text-left transition-all ${
                offeringType === 'service'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Servicio</div>
              <div className="text-sm text-muted-foreground">
                Consultoría, asesoría, trabajo
              </div>
            </button>
          </div>
          {errors.offeringType && (
            <p className="text-sm text-destructive">{errors.offeringType.message}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Descripción de lo que ofreces <span className="text-muted-foreground">(Opcional)</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Ej: Cursos de marketing digital, consultoría SEO..."
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Máximo 500 caracteres
          </p>
        </div>

        {/* Rango de Precio */}
        <div className="space-y-2">
          <Label htmlFor="priceRange">
            Rango de precio <span className="text-muted-foreground">(Opcional)</span>
          </Label>
          <Input
            id="priceRange"
            {...register('priceRange')}
            placeholder="Ej: $50 - $500 USD, $100.000 - $1M COP"
            className={errors.priceRange ? 'border-destructive' : ''}
          />
          {errors.priceRange && (
            <p className="text-sm text-destructive">{errors.priceRange.message}</p>
          )}
        </div>

        {/* Cliente Ideal */}
        <div className="space-y-2">
          <Label htmlFor="idealCustomer">
            Describe tu cliente ideal <span className="text-muted-foreground">(Opcional)</span>
          </Label>
          <Textarea
            id="idealCustomer"
            {...register('idealCustomer')}
            placeholder="Ej: Empresas B2B de 10-50 empleados en LATAM interesadas en automatización..."
            rows={4}
            className={errors.idealCustomer ? 'border-destructive' : ''}
          />
          {errors.idealCustomer && (
            <p className="text-sm text-destructive">{errors.idealCustomer.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Esto nos ayuda a optimizar tu embudo de ventas. Máximo 1000 caracteres.
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
