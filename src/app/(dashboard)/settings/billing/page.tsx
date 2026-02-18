// src/app/(dashboard)/configuracion/facturacion/page.tsx
"use client"

import { mockBilling } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'

export default function FacturacionPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu plan y métodos de pago
        </p>
      </div>

      {/* Plan Actual */}
      <div className="auth-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Plan Actual</h2>
          <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-sm font-semibold text-primary">{mockBilling.plan}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">Tu suscripción activa</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Precio Mensual</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(mockBilling.price)}</p>
            <p className="text-xs text-muted-foreground">{mockBilling.currency}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Licencias Incluidas</p>
            <p className="text-2xl font-bold text-foreground">{mockBilling.licenses.total}</p>
            <p className="text-xs text-muted-foreground">usuarios</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Próxima Factura</p>
            <p className="text-2xl font-bold text-foreground">{formatDate(mockBilling.nextBilling)}</p>
            <p className="text-xs text-muted-foreground">2026</p>
          </div>
        </div>

        <Button variant="outline">Cambiar Plan</Button>
      </div>

      {/* Método de Pago */}
      <div className="auth-card p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Método de Pago</h2>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>

            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="uppercase text-xs font-bold">{mockBilling.paymentMethod.type}</span>
                <span className="text-muted-foreground">•••• •••• •••• {mockBilling.paymentMethod.last4}</span>
              </p>
              <p className="text-xs text-muted-foreground">Vence {mockBilling.paymentMethod.expiresAt}</p>
            </div>
          </div>

          <Button variant="outline" size="sm">Actualizar</Button>
        </div>
      </div>
    </div>
  )
}
