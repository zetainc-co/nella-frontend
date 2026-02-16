// src/app/(dashboard)/workflows/credenciales/page.tsx
"use client"

import { useWorkflow } from '@/hooks/useWorkflow'
import { HudBackground } from '@/components/auth/hud-background'
import { HudCorners } from '@/components/ui/hud-corners'
import { WorkflowCredentialsManager } from '@/components/workflows/workflow-credentials-manager'
import { Button } from '@/components/ui/button'
import { Key, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CredencialesPage() {
  const { data: workflow, isLoading, error } = useWorkflow()

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden">
        <HudBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-mono">Cargando credenciales...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden">
        <HudBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="relative border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-sm max-w-md">
            <HudCorners />
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-bold">Error al cargar workflow</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {error?.message || 'No se pudo cargar la información del workflow'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HudBackground />

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
          <HudCorners />

          <div className="mb-4">
            <Link href="/workflows">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/40 bg-primary/10">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Credenciales</h1>
              <p className="text-sm text-gray-400">
                Gestión de claves y tokens de API
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Manager */}
        <WorkflowCredentialsManager
          workflowId={workflow.n8n_workflow_id}
          tenantId={workflow.tenant_id}
        />
      </div>
    </div>
  )
}
