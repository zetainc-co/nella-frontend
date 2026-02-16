// src/app/(dashboard)/workflows/page.tsx
"use client"

import { useWorkflow, useWorkflowTemplate } from '@/hooks/useWorkflow'
import { HudBackground } from '@/components/auth/hud-background'
import { HudCorners } from '@/components/ui/hud-corners'
import { WorkflowStatusBadge } from '@/components/workflows/workflow-status-badge'
import { WorkflowCredentialsManager } from '@/components/workflows/workflow-credentials-manager'
import { Button } from '@/components/ui/button'
import {
  Settings,
  Workflow,
  Calendar,
  Hash,
  Activity,
  Download,
  Loader2,
  AlertCircle,
  Package,
  Code,
  CheckCircle2,
  Clock,
  Cpu
} from 'lucide-react'

export default function WorkflowsPage() {
  const { data: workflow, isLoading, error } = useWorkflow()
  const { data: template, downloadTemplate, isDownloading } = useWorkflowTemplate()

  if (isLoading) {
    return <WorkflowLoadingState />
  }

  if (error || !workflow) {
    return <WorkflowErrorState error={error} />
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* HUD Background Elements */}
      <HudBackground />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
          <HudCorners />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/40 bg-primary/10">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestión de Workflows</h1>
                <p className="text-sm text-gray-400">
                  Configuración y credenciales del workflow de automatización
                </p>
              </div>
            </div>

            <WorkflowStatusBadge status={workflow.status} />
          </div>
        </div>

        {/* Workflow Overview Card */}
        <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
          <HudCorners />

          <div className="mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-white">Información del Workflow</h3>
              <p className="text-sm text-gray-400">
                Detalles de configuración y estado actual
              </p>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Workflow Name */}
            <InfoCard
              icon={<Workflow className="h-5 w-5 text-primary" />}
              label="Nombre del Workflow"
              value={workflow.workflow_name}
              mono={false}
            />

            {/* N8n Workflow ID */}
            <InfoCard
              icon={<Hash className="h-5 w-5 text-primary" />}
              label="N8n Workflow ID"
              value={workflow.n8n_workflow_id}
              mono
            />

            {/* Template Version */}
            <InfoCard
              icon={<Package className="h-5 w-5 text-primary" />}
              label="Versión del Template"
              value={workflow.template_version}
              mono
            />

            {/* Created Date */}
            <InfoCard
              icon={<Calendar className="h-5 w-5 text-primary" />}
              label="Fecha de Creación"
              value={new Date(workflow.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              mono={false}
            />

            {/* Last Updated */}
            <InfoCard
              icon={<Clock className="h-5 w-5 text-primary" />}
              label="Última Actualización"
              value={new Date(workflow.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              mono={false}
            />

            {/* Execution Count */}
            <InfoCard
              icon={<Cpu className="h-5 w-5 text-primary" />}
              label="Ejecuciones Totales"
              value={workflow.execution_count.toLocaleString('es-ES')}
              mono
            />
          </div>

          {/* AI Model & Settings */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-primary/20 pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Code className="h-4 w-4" />
                Modelo de IA
              </div>
              <p className="font-mono text-lg font-semibold text-white">
                {workflow.config.ai_model}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Settings className="h-4 w-4" />
                Configuración
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Delay de Respuesta:</span>
                  <span className="font-mono text-white">
                    {workflow.config.business_settings.response_delay}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Reintentos:</span>
                  <span className="font-mono text-white">
                    {workflow.config.business_settings.max_retries}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Horario de Oficina:</span>
                  <span className="font-mono text-white">
                    {workflow.config.business_settings.office_hours.enabled
                      ? `${workflow.config.business_settings.office_hours.start} - ${workflow.config.business_settings.office_hours.end}`
                      : 'Deshabilitado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Execution */}
          {workflow.last_executed_at && (
            <div className="mt-4 flex items-center gap-2 rounded border border-green-500/20 bg-green-500/5 p-3">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-400">
                Última ejecución:{' '}
                <span className="text-white">
                  {new Date(workflow.last_executed_at).toLocaleString('es-ES')}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Template Information Card */}
        {template && (
          <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
            <HudCorners />

            <div className="mb-6 flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-white">Template Base</h3>
                <p className="text-sm text-gray-400">
                  Información del template utilizado para generar el workflow
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm text-gray-400">Nombre</span>
                  <p className="font-semibold text-white">{template.name}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-400">Versión</span>
                  <p className="font-mono font-semibold text-white">{template.version}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-400">Descripción</span>
                <p className="text-white">{template.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-gray-400">Parámetros Editables</span>
                <div className="flex flex-wrap gap-2">
                  {template.editable_params.map((param) => (
                    <span
                      key={param}
                      className="rounded border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-primary/20 pt-4">
                <Button
                  onClick={() => downloadTemplate(template.version)}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full md:w-auto"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Descargando...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Template JSON
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Manager */}
        <WorkflowCredentialsManager
          workflowId={workflow.id}
          tenantId={workflow.tenant_id}
        />
      </div>
    </div>
  )
}

// Info Card Component
interface InfoCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  mono?: boolean
}

function InfoCard({ icon, label, value, mono = true }: InfoCardProps) {
  return (
    <div className="space-y-2 rounded border border-primary/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon}
        {label}
      </div>
      <p className={`text-lg font-semibold text-white ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  )
}

// Loading State Component
function WorkflowLoadingState() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HudBackground />

      <div className="relative z-10 flex h-screen items-center justify-center">
        <div className="relative border border-primary/20 bg-black/40 p-8 backdrop-blur-sm">
          <HudCorners />

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-primary/20" />
            </div>
            <div className="text-center">
              <h3 className="font-mono text-lg font-semibold text-white">
                Cargando Workflow...
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Obteniendo configuración del sistema
              </p>
            </div>

            {/* Technical Loading Stats */}
            <div className="mt-4 space-y-1 font-mono text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 animate-pulse rounded-full bg-primary" />
                FETCHING_WORKFLOW_CONFIG
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.2s' }} />
                LOADING_CREDENTIALS
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 animate-pulse rounded-full bg-primary" style={{ animationDelay: '0.4s' }} />
                VALIDATING_TENANT_ACCESS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error State Component
function WorkflowErrorState({ error }: { error: Error | null }) {
  const isNotFound = error?.message.includes('not found') || error?.message.includes('tenant')

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HudBackground />

      <div className="relative z-10 flex h-screen items-center justify-center">
        <div className="relative max-w-md border border-red-500/20 bg-black/40 p-8 backdrop-blur-sm">
          <HudCorners />

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <div>
              <h3 className="font-mono text-xl font-semibold text-white">
                {isNotFound ? 'Workflow No Encontrado' : 'Error al Cargar'}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {isNotFound
                  ? 'No se encontró un workflow configurado para este tenant.'
                  : 'Ocurrió un error al intentar cargar la configuración del workflow.'}
              </p>
            </div>

            {error && (
              <div className="w-full rounded border border-red-500/20 bg-red-500/5 p-3">
                <p className="font-mono text-xs text-red-400">{error.message}</p>
              </div>
            )}

            {isNotFound && (
              <div className="mt-4 w-full space-y-3 rounded border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-gray-300">
                  Necesitas crear un workflow antes de poder gestionarlo.
                </p>
                <Button className="w-full" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  Crear Workflow (Próximamente)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
