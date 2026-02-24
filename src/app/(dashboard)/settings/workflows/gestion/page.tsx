// src/app/(dashboard)/configuracion/workflows/gestion/page.tsx
"use client"

import { useState } from 'react'
import { useWorkflow } from '@/modules/workflows/hooks/useWorkflow'
import { WorkflowStatusBadge } from '@/modules/workflows/components/workflow-status-badge'
import { Button } from '@/components/ui/button'
import {
  Workflow,
  Hash,
  Activity,
  Package,
  Calendar,
  Settings,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Power,
  PowerOff,
  Edit,
  Trash2,
  RotateCw,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'

// HU-013: SERVICIO DE GESTIÓN DE WORKFLOWS
export default function GestionPage() {
  const { data: workflow, isLoading, error } = useWorkflow()
  const [isActivating, setIsActivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditConfig, setShowEditConfig] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [showLogs, setShowLogs] = useState(false)

  // HU-013: Método - Activar workflow
  const handleToggleActivation = async () => {
    setIsActivating(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsActivating(false)
    // En producción: actualizar estado del workflow
  }

  // HU-013: Método - Eliminar workflow
  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    setIsDeleting(true)
    // Simular eliminación
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsDeleting(false)
    // En producción: redirigir al panel después de eliminar
  }

  // Simular carga de logs
  const handleLoadLogs = async () => {
    setShowLogs(true)
    // Mock de logs de ejecución
    const mockLogs = [
      {
        id: '1',
        timestamp: '2026-02-16 14:30:25',
        type: 'success',
        message: 'Workflow ejecutado exitosamente',
        duration: '2.3s',
        triggers: 3
      },
      {
        id: '2',
        timestamp: '2026-02-16 13:15:10',
        type: 'success',
        message: 'Workflow ejecutado exitosamente',
        duration: '1.8s',
        triggers: 5
      },
      {
        id: '3',
        timestamp: '2026-02-16 12:00:05',
        type: 'error',
        message: 'Error: Timeout al conectar con WhatsApp API',
        duration: '5.0s',
        triggers: 1
      },
      {
        id: '4',
        timestamp: '2026-02-16 10:45:30',
        type: 'success',
        message: 'Workflow ejecutado exitosamente',
        duration: '2.1s',
        triggers: 2
      },
      {
        id: '5',
        timestamp: '2026-02-16 09:30:15',
        type: 'warning',
        message: 'Advertencia: Rate limit próximo al límite',
        duration: '3.2s',
        triggers: 8
      }
    ]
    setLogs(mockLogs)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-mono">Cargando workflow...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !workflow) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="auth-card p-6 max-w-md">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="font-bold">Error al cargar workflow</h3>
                <p className="text-sm text-muted-foreground mt-1">
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
    <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="auth-card p-6">
          

          <div className="flex items-center justify-between mb-4">
            <Link href="/configuracion/workflows">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </Button>
            </Link>
            <WorkflowStatusBadge status={workflow.status} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-primary/40 bg-primary/10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestión de Workflow</h1>
                <p className="text-sm text-muted-foreground">
                  Configuración y administración del workflow individual
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleActivation}
                disabled={isActivating}
                className="gap-2"
              >
                {isActivating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : workflow.status === 'active' ? (
                  <>
                    <PowerOff className="h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" />
                    Activar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="gap-2 text-red-500 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Info Card */}
        <div className="auth-card p-6">
          

          <div className="mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Información del Workflow</h3>
              <p className="text-sm text-muted-foreground">
                Detalles de configuración y estado actual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Workflow Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Workflow className="h-4 w-4" />
                <span className="text-sm">Nombre del Workflow</span>
              </div>
              <p className="text-foreground font-medium">{workflow.workflow_name}</p>
            </div>

            {/* N8n ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-sm">N8n Workflow ID</span>
              </div>
              <p className="text-foreground font-mono">{workflow.n8n_workflow_id}</p>
            </div>

            {/* Template Version */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span className="text-sm">Versión del Template</span>
              </div>
              <p className="text-foreground font-mono">{workflow.template_version}</p>
            </div>

            {/* Created At */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Fecha de Creación</span>
              </div>
              <p className="text-foreground">
                {new Date(workflow.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Updated At */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Última Actualización</span>
              </div>
              <p className="text-foreground">
                {new Date(workflow.updated_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="auth-card p-6">
          

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Configuración</h3>
                <p className="text-sm text-muted-foreground">
                  Parámetros del workflow
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditConfig(!showEditConfig)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {showEditConfig ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {showEditConfig ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {workflow.config && Object.entries(workflow.config).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm text-muted-foreground">{key}</label>
                    <input
                      type="text"
                      defaultValue={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      className="w-full rounded border border-border bg-card px-3 py-2 text-foreground font-mono text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {workflow.config && Object.entries(workflow.config).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <p className="text-foreground font-mono text-sm">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution Logs */}
        <div className="auth-card p-6">
          

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-foreground">Logs de Ejecución</h3>
                <p className="text-sm text-muted-foreground">
                  Historial de ejecuciones del workflow
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadLogs}
              disabled={showLogs}
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              {showLogs ? 'Logs Cargados' : 'Cargar Logs'}
            </Button>
          </div>

          {showLogs && logs.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded border ${
                    log.type === 'success'
                      ? 'border-green-500/20 bg-green-500/5'
                      : log.type === 'error'
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-yellow-500/20 bg-yellow-500/5'
                  }`}
                >
                  {log.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
                  {log.type === 'error' && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                  {log.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Duración: {log.duration}</span>
                        <span>Triggers: {log.triggers}</span>
                      </div>
                    </div>
                    <p className={`text-sm ${
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Haz clic en "Cargar Logs" para ver el historial de ejecuciones</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="auth-card max-w-md w-full mx-4 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-bold text-foreground">Eliminar Workflow</h3>
                </div>
                <p className="text-sm text-foreground">
                  ¿Estás seguro de que deseas eliminar el workflow <strong className="text-primary">{workflow.workflow_name}</strong>?
                </p>
                <p className="text-xs text-muted-foreground">
                  Esta acción es irreversible. El workflow será eliminado de N8n y todos los datos asociados se perderán.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
