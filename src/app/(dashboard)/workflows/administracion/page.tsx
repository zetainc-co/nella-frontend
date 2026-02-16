// src/app/(dashboard)/workflows/administracion/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HudBackground } from '@/components/auth/hud-background'
import { HudCorners } from '@/components/ui/hud-corners'
import { Button } from '@/components/ui/button'
import {
  Shield,
  RefreshCw,
  Users,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'

export default function AdministracionPage() {
  const [activeTab, setActiveTab] = useState<'bulk-updates' | 'migraciones'>('bulk-updates')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario es admin
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'admin') {
      router.push('/workflows')
    } else {
      setIsAdmin(true)
    }
  }, [router])

  if (!isAdmin) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HudBackground />

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="relative border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-sm">
          <HudCorners />

          <div className="mb-4">
            <Link href="/workflows">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Panel
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-yellow-500/40 bg-yellow-500/10">
                <Shield className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Administración</h1>
                <p className="text-sm text-gray-400">
                  Herramientas administrativas para gestión masiva
                </p>
              </div>
            </div>

            <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-1">
              <span className="text-xs font-mono text-yellow-500">ADMIN ONLY</span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="relative border border-yellow-500/30 bg-yellow-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-yellow-500 mb-1">Precaución</p>
              <p>
                Las operaciones en esta sección afectan múltiples workflows y organizaciones.
                Asegúrate de entender el impacto antes de ejecutar cualquier acción.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-primary/20">
          <button
            onClick={() => setActiveTab('bulk-updates')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'bulk-updates'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizaciones Masivas
          </button>
          <button
            onClick={() => setActiveTab('migraciones')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'migraciones'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users className="h-4 w-4" />
            Migraciones
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === 'bulk-updates' && <BulkUpdatesTab />}
          {activeTab === 'migraciones' && <MigracionesTab />}
        </div>
      </div>
    </div>
  )
}

// HU-016: UPDATES MASIVOS DE WORKFLOWS
function BulkUpdatesTab() {
  const [updateType, setUpdateType] = useState('parameter')
  const [scope, setScope] = useState('all')
  const [selectedParam, setSelectedParam] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isDryRun, setIsDryRun] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [executionResults, setExecutionResults] = useState<any>(null)

  // Mock data de workflows activos
  const mockWorkflows = [
    { id: '1', organization: 'Organización Alpha', name: 'WhatsApp Bot Alpha', status: 'active', version: 'v1.2.0' },
    { id: '2', organization: 'Organización Beta', name: 'WhatsApp Bot Beta', status: 'active', version: 'v1.2.0' },
    { id: '3', organization: 'Organización Gamma', name: 'WhatsApp Bot Gamma', status: 'active', version: 'v1.1.5' },
    { id: '4', organization: 'Organización Delta', name: 'WhatsApp Bot Delta', status: 'active', version: 'v1.2.0' },
    { id: '5', organization: 'Organización Epsilon', name: 'WhatsApp Bot Epsilon', status: 'active', version: 'v1.1.5' },
  ]

  const selectedWorkflows = mockWorkflows.filter(wf =>
    scope === 'all' || (scope === 'version' && wf.version === 'v1.1.5')
  )

  // Validación de formulario
  const isFormValid = () => {
    if (updateType === 'parameter') {
      return selectedParam && newValue
    }
    return updateType !== ''
  }

  // Simular Dry Run (HU-016: Dry-run mode para simular)
  const handleDryRun = async () => {
    setIsDryRun(true)
    setIsExecuting(true)

    // Simular análisis de impacto
    await new Promise(resolve => setTimeout(resolve, 1500))

    const dryRunResults = {
      affectedWorkflows: selectedWorkflows.length,
      estimatedTime: selectedWorkflows.length * 2,
      changes: selectedWorkflows.map(wf => ({
        workflowId: wf.id,
        organization: wf.organization,
        currentValue: updateType === 'parameter' ? '100' : 'v1.1.5',
        newValue: updateType === 'parameter' ? newValue : 'v1.2.0',
        status: 'pending'
      }))
    }

    setExecutionResults(dryRunResults)
    setIsExecuting(false)
    setIsDryRun(false)
  }

  // Aplicar Actualización Real (HU-016: Aplicar a todos los workflows activos)
  const handleApplyUpdate = async () => {
    setShowConfirmation(false)
    setIsExecuting(true)

    const results = {
      total: selectedWorkflows.length,
      success: 0,
      failed: 0,
      details: [] as any[]
    }

    // Simular actualización workflow por workflow
    for (let i = 0; i < selectedWorkflows.length; i++) {
      const wf = selectedWorkflows[i]

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simular éxito/fallo (90% éxito, 10% fallo)
      const success = Math.random() > 0.1

      if (success) {
        results.success++
        results.details.push({
          workflowId: wf.id,
          organization: wf.organization,
          status: 'success',
          message: 'Actualización aplicada correctamente'
        })
      } else {
        results.failed++
        results.details.push({
          workflowId: wf.id,
          organization: wf.organization,
          status: 'failed',
          message: 'Error: Timeout al conectar con N8n'
        })
      }

      // Actualizar progreso en tiempo real
      setExecutionResults({
        ...results,
        inProgress: true,
        current: i + 1
      })
    }

    // HU-016: Rollback si >10% fallan
    const failureRate = (results.failed / results.total) * 100
    if (failureRate > 10) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: true,
        rollbackReason: `${failureRate.toFixed(1)}% de workflows fallaron (límite: 10%). Iniciando rollback...`
      })

      // Simular rollback
      await new Promise(resolve => setTimeout(resolve, 2000))
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: true,
        rollbackComplete: true,
        rollbackReason: `Rollback completado. ${results.success} workflows restaurados al estado anterior.`
      })
    } else {
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: false
      })
    }

    setIsExecuting(false)
  }

  return (
    <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
      <HudCorners />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-white">Actualizaciones Masivas</h3>
            <p className="text-sm text-gray-400">
              Aplicar cambios a múltiples workflows simultáneamente
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {selectedWorkflows.length} workflows seleccionados
        </div>
      </div>

      <div className="space-y-6">
        {/* Configuración de Actualización */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Tipo de Actualización *</label>
            <select
              value={updateType}
              onChange={(e) => {
                setUpdateType(e.target.value)
                setExecutionResults(null)
              }}
              disabled={isExecuting}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="parameter">Actualizar Parámetro</option>
              <option value="prompt">Actualizar Prompt IA</option>
              <option value="node">Actualizar Nodo</option>
              <option value="version">Actualizar Template Version</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Alcance *</label>
            <select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value)
                setExecutionResults(null)
              }}
              disabled={isExecuting}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="all">Todos los workflows activos ({mockWorkflows.length})</option>
              <option value="version">Solo workflows v1.1.5 (2)</option>
              <option value="specific">Workflows específicos</option>
            </select>
          </div>

          {updateType === 'parameter' && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Parámetro *</label>
                <select
                  value={selectedParam}
                  onChange={(e) => {
                    setSelectedParam(e.target.value)
                    setExecutionResults(null)
                  }}
                  disabled={isExecuting}
                  className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  <option value="">Seleccionar parámetro...</option>
                  <option value="max_tokens">max_tokens (AI)</option>
                  <option value="temperature">temperature (AI)</option>
                  <option value="timeout">timeout (Webhook)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nuevo Valor *</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value)
                    setExecutionResults(null)
                  }}
                  disabled={isExecuting}
                  placeholder="Ej: 150"
                  className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
                />
              </div>
            </>
          )}
        </div>

        {/* Preview de Workflows Afectados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Workflows Afectados</h4>
            <span className="text-xs text-gray-400 font-mono">{selectedWorkflows.length} workflows</span>
          </div>

          <div className="rounded border border-primary/20 bg-black/20 overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full">
              <thead className="border-b border-primary/20 sticky top-0 bg-black/60 backdrop-blur-sm">
                <tr className="text-xs text-gray-400">
                  <th className="px-3 py-2 text-left">Organización</th>
                  <th className="px-3 py-2 text-left">Workflow</th>
                  <th className="px-3 py-2 text-left">Versión</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {selectedWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="text-sm text-white hover:bg-primary/5">
                    <td className="px-3 py-2">{workflow.organization}</td>
                    <td className="px-3 py-2 font-mono text-xs">{workflow.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{workflow.version}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 text-xs text-green-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        {workflow.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resultados de Dry Run o Ejecución */}
        {executionResults && (
          <div className={`rounded border p-4 ${
            executionResults.rollback
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-blue-500/20 bg-blue-500/5'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  {executionResults.inProgress ? 'Ejecución en Progreso...' :
                   executionResults.rollback ? 'Rollback Ejecutado' : 'Resultado de la Operación'}
                </h4>
                {executionResults.inProgress && (
                  <span className="text-xs text-gray-400 font-mono">
                    {executionResults.current}/{executionResults.total}
                  </span>
                )}
              </div>

              {/* Progreso */}
              {executionResults.inProgress && (
                <div className="w-full bg-black/40 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(executionResults.current / executionResults.total) * 100}%` }}
                  ></div>
                </div>
              )}

              {/* Estadísticas */}
              {!executionResults.inProgress && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-white font-mono">{executionResults.total || executionResults.affectedWorkflows}</p>
                  </div>
                  {executionResults.success !== undefined && (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Exitosos</p>
                        <p className="text-lg font-bold text-green-500 font-mono">{executionResults.success}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Fallidos</p>
                        <p className="text-lg font-bold text-red-500 font-mono">{executionResults.failed}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mensaje de Rollback */}
              {executionResults.rollback && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-400">
                    <p className="font-semibold mb-1">Rollback Automático</p>
                    <p>{executionResults.rollbackReason}</p>
                  </div>
                </div>
              )}

              {/* Detalles de la ejecución */}
              {executionResults.details && executionResults.details.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {executionResults.details.map((detail: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {detail.status === 'success' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                      <span className={detail.status === 'success' ? 'text-gray-400' : 'text-red-400'}>
                        {detail.organization}: {detail.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleDryRun}
            disabled={!isFormValid() || isExecuting}
          >
            {isDryRun ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Simular Cambios (Dry Run)
              </>
            )}
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => setShowConfirmation(true)}
            disabled={!isFormValid() || isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Aplicar Actualización
              </>
            )}
          </Button>
        </div>

        {/* Modal de Confirmación */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-md w-full mx-4 border border-yellow-500/30 bg-black/90 p-6 backdrop-blur-sm">
              <HudCorners />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Confirmar Actualización</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Estás a punto de actualizar <strong className="text-primary">{selectedWorkflows.length} workflows</strong>.
                  Esta operación puede tardar varios minutos.
                </p>
                <p className="text-xs text-gray-400">
                  Si más del 10% de los workflows fallan, se ejecutará un rollback automático.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleApplyUpdate}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// HU-017: MIGRACIÓN DE TENANTS EXISTENTES
function MigracionesTab() {
  const [sourceVersion, setSourceVersion] = useState('v1.1.5')
  const [targetVersion, setTargetVersion] = useState('v1.2.0')
  const [batchSize, setBatchSize] = useState(5)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<any>(null)

  // Mock data de estado de migración
  const [migrationStats, setMigrationStats] = useState({
    total: 12,
    migrated: 7,
    pending: 5,
    failed: 0
  })

  // Mock data de organizaciones
  const [organizations, setOrganizations] = useState([
    { id: 'org-001', name: 'Organización Alpha', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-10' },
    { id: 'org-002', name: 'Organización Beta', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-10' },
    { id: 'org-003', name: 'Organización Gamma', currentVersion: 'v1.1.5', status: 'pending', migratedAt: null },
    { id: 'org-004', name: 'Organización Delta', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-11' },
    { id: 'org-005', name: 'Organización Epsilon', currentVersion: 'v1.1.5', status: 'pending', migratedAt: null },
    { id: 'org-006', name: 'Organización Zeta', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-11' },
    { id: 'org-007', name: 'Organización Eta', currentVersion: 'v1.1.5', status: 'pending', migratedAt: null },
    { id: 'org-008', name: 'Organización Theta', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-12' },
    { id: 'org-009', name: 'Organización Iota', currentVersion: 'v1.1.5', status: 'pending', migratedAt: null },
    { id: 'org-010', name: 'Organización Kappa', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-12' },
    { id: 'org-011', name: 'Organización Lambda', currentVersion: 'v1.1.5', status: 'pending', migratedAt: null },
    { id: 'org-012', name: 'Organización Mu', currentVersion: 'v1.2.0', status: 'migrated', migratedAt: '2026-02-13' },
  ])

  // HU-017: Migrar de 5 en 5 (no todos a la vez)
  const handleStartMigration = async () => {
    setShowConfirmation(false)
    setIsMigrating(true)
    setIsPaused(false)

    const pendingOrgs = organizations.filter(org => org.status === 'pending')
    const batches = []

    // Dividir en lotes según batchSize
    for (let i = 0; i < pendingOrgs.length; i += batchSize) {
      batches.push(pendingOrgs.slice(i, i + batchSize))
    }

    setMigrationProgress({
      currentBatch: 0,
      totalBatches: batches.length,
      batchResults: [],
      completed: false
    })

    // Migrar por lotes
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (isPaused) break

      const batch = batches[batchIndex]
      const batchResults: any[] = []

      setMigrationProgress((prev: any) => ({
        ...prev,
        currentBatch: batchIndex + 1,
        processing: true
      }))

      // Procesar cada organización del lote
      for (let orgIndex = 0; orgIndex < batch.length; orgIndex++) {
        if (isPaused) break

        const org = batch[orgIndex]

        // Simular tiempo de migración
        await new Promise(resolve => setTimeout(resolve, 1000))

        // HU-017: Validar que workflows funcionan
        const validationSuccess = Math.random() > 0.05 // 95% éxito

        if (validationSuccess) {
          // Actualizar organización como migrada
          setOrganizations(prev => prev.map(o =>
            o.id === org.id
              ? { ...o, status: 'migrated', currentVersion: targetVersion, migratedAt: new Date().toISOString().split('T')[0] }
              : o
          ))

          setMigrationStats(prev => ({
            ...prev,
            migrated: prev.migrated + 1,
            pending: prev.pending - 1
          }))

          batchResults.push({
            orgId: org.id,
            orgName: org.name,
            status: 'success',
            message: 'Migración y validación exitosa'
          })
        } else {
          setMigrationStats(prev => ({
            ...prev,
            failed: prev.failed + 1,
            pending: prev.pending - 1
          }))

          batchResults.push({
            orgId: org.id,
            orgName: org.name,
            status: 'failed',
            message: 'Error en validación de workflow'
          })
        }
      }

      setMigrationProgress((prev: any) => ({
        ...prev,
        batchResults: [...(prev.batchResults || []), { batchNumber: batchIndex + 1, results: batchResults }],
        processing: false
      }))

      // Pausa entre lotes para no saturar
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    setMigrationProgress((prev: any) => ({
      ...prev,
      completed: true
    }))

    setIsMigrating(false)
  }

  return (
    <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
      <HudCorners />

      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-white">Migraciones de Organizaciones</h3>
          <p className="text-sm text-gray-400">
            Migrar organizaciones entre configuraciones de workflow
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Estadísticas de Migración */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative border border-primary/20 bg-black/20 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Organizaciones Totales</label>
              <p className="text-3xl font-bold text-white font-mono">{migrationStats.total}</p>
            </div>
          </div>

          <div className="relative border border-green-500/20 bg-green-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Migradas</label>
              <p className="text-3xl font-bold text-green-500 font-mono">{migrationStats.migrated}</p>
              <p className="text-xs text-green-400">
                {((migrationStats.migrated / migrationStats.total) * 100).toFixed(0)}% completado
              </p>
            </div>
          </div>

          <div className="relative border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Pendientes</label>
              <p className="text-3xl font-bold text-yellow-500 font-mono">{migrationStats.pending}</p>
            </div>
          </div>

          <div className="relative border border-red-500/20 bg-red-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Fallidas</label>
              <p className="text-3xl font-bold text-red-500 font-mono">{migrationStats.failed}</p>
            </div>
          </div>
        </div>

        {/* Configuración de Migración */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Versión Origen</label>
            <select
              value={sourceVersion}
              onChange={(e) => setSourceVersion(e.target.value)}
              disabled={isMigrating}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="v1.1.5">v1.1.5 (Legacy)</option>
              <option value="v1.0.0">v1.0.0 (Initial)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Versión Destino</label>
            <select
              value={targetVersion}
              onChange={(e) => setTargetVersion(e.target.value)}
              disabled={isMigrating}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="v1.2.0">v1.2.0 (Latest)</option>
              <option value="v1.1.5">v1.1.5 (Legacy)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Tamaño de Lote</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              disabled={isMigrating}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="3">3 organizaciones</option>
              <option value="5">5 organizaciones (recomendado)</option>
              <option value="10">10 organizaciones</option>
            </select>
          </div>
        </div>

        {/* Progreso de Migración */}
        {migrationProgress && (
          <div className="rounded border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  {migrationProgress.completed ? 'Migración Completada' : 'Migración en Progreso'}
                </h4>
                <span className="text-xs text-gray-400 font-mono">
                  Lote {migrationProgress.currentBatch}/{migrationProgress.totalBatches}
                </span>
              </div>

              {/* Progreso por lotes */}
              <div className="w-full bg-black/40 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(migrationProgress.currentBatch / migrationProgress.totalBatches) * 100}%` }}
                ></div>
              </div>

              {/* Resultados por lote */}
              {migrationProgress.batchResults && migrationProgress.batchResults.length > 0 && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {migrationProgress.batchResults.map((batch: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-xs font-semibold text-gray-300">Lote {batch.batchNumber}:</p>
                      {batch.results.map((result: any, resultIdx: number) => (
                        <div key={resultIdx} className="flex items-center gap-2 text-xs ml-3">
                          {result.status === 'success' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          )}
                          <span className={result.status === 'success' ? 'text-gray-400' : 'text-red-400'}>
                            {result.orgName}: {result.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de Organizaciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">Estado de Organizaciones</h4>
            <span className="text-xs text-gray-400 font-mono">{organizations.length} organizaciones</span>
          </div>

          <div className="rounded border border-primary/20 bg-black/20 overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead className="border-b border-primary/20 sticky top-0 bg-black/60 backdrop-blur-sm">
                <tr className="text-xs text-gray-400">
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Organización</th>
                  <th className="px-3 py-2 text-left">Versión Actual</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Migrada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {organizations.map((org) => (
                  <tr key={org.id} className="text-sm text-white hover:bg-primary/5">
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">{org.id}</td>
                    <td className="px-3 py-2">{org.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{org.currentVersion}</td>
                    <td className="px-3 py-2">
                      {org.status === 'migrated' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Migrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">
                      {org.migratedAt || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={migrationStats.pending === 0 || isMigrating}
          >
            <Play className="h-4 w-4" />
            Simular Migración
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => setShowConfirmation(true)}
            disabled={migrationStats.pending === 0 || isMigrating}
          >
            {isMigrating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Migrando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Iniciar Migración ({migrationStats.pending} pendientes)
              </>
            )}
          </Button>
        </div>

        {/* Modal de Confirmación */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-md w-full mx-4 border border-yellow-500/30 bg-black/90 p-6 backdrop-blur-sm">
              <HudCorners />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <h3 className="text-lg font-bold text-white">Confirmar Migración</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    Estás a punto de migrar <strong className="text-primary">{migrationStats.pending} organizaciones</strong> de <strong>{sourceVersion}</strong> a <strong>{targetVersion}</strong>.
                  </p>
                  <p>
                    La migración se realizará en lotes de <strong className="text-primary">{batchSize} organizaciones</strong> para evitar saturación del sistema.
                  </p>
                  <p className="text-xs text-gray-400">
                    Cada workflow será validado después de la migración. El workflow centralizado se mantendrá activo hasta que todas las migraciones se completen exitosamente.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleStartMigration}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
