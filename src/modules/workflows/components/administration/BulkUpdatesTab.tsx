// HU-016: UPDATES MASIVOS DE WORKFLOWS
"use client";

import { useState } from "react";
import { HudCorners } from "@/components/ui/hud-corners";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
} from "lucide-react";

export function BulkUpdatesTab() {
  const [updateType, setUpdateType] = useState("parameter");
  const [scope, setScope] = useState("all");
  const [selectedParam, setSelectedParam] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isDryRun, setIsDryRun] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);

  // Mock data de workflows activos
  const mockWorkflows = [
    {
      id: "1",
      organization: "Organización Alpha",
      name: "WhatsApp Bot Alpha",
      status: "active",
      version: "v1.2.0",
    },
    {
      id: "2",
      organization: "Organización Beta",
      name: "WhatsApp Bot Beta",
      status: "active",
      version: "v1.2.0",
    },
    {
      id: "3",
      organization: "Organización Gamma",
      name: "WhatsApp Bot Gamma",
      status: "active",
      version: "v1.1.5",
    },
    {
      id: "4",
      organization: "Organización Delta",
      name: "WhatsApp Bot Delta",
      status: "active",
      version: "v1.2.0",
    },
    {
      id: "5",
      organization: "Organización Epsilon",
      name: "WhatsApp Bot Epsilon",
      status: "active",
      version: "v1.1.5",
    },
  ];

  const selectedWorkflows = mockWorkflows.filter(
    (wf) => scope === "all" || (scope === "version" && wf.version === "v1.1.5"),
  );

  // Validación de formulario
  const isFormValid = () => {
    if (updateType === "parameter") {
      return selectedParam && newValue;
    }
    return updateType !== "";
  };

  // Simular Dry Run (HU-016: Dry-run mode para simular)
  const handleDryRun = async () => {
    setIsDryRun(true);
    setIsExecuting(true);

    // Simular análisis de impacto
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const dryRunResults = {
      affectedWorkflows: selectedWorkflows.length,
      estimatedTime: selectedWorkflows.length * 2,
      changes: selectedWorkflows.map((wf) => ({
        workflowId: wf.id,
        organization: wf.organization,
        currentValue: updateType === "parameter" ? "100" : "v1.1.5",
        newValue: updateType === "parameter" ? newValue : "v1.2.0",
        status: "pending",
      })),
    };

    setExecutionResults(dryRunResults);
    setIsExecuting(false);
    setIsDryRun(false);
  };

  // Aplicar Actualización Real (HU-016: Aplicar a todos los workflows activos)
  const handleApplyUpdate = async () => {
    setShowConfirmation(false);
    setIsExecuting(true);

    const results = {
      total: selectedWorkflows.length,
      success: 0,
      failed: 0,
      details: [] as any[],
    };

    // Simular actualización workflow por workflow
    for (let i = 0; i < selectedWorkflows.length; i++) {
      const wf = selectedWorkflows[i];

      // Simular tiempo de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Simular éxito/fallo (90% éxito, 10% fallo)
      const success = Math.random() > 0.1;

      if (success) {
        results.success++;
        results.details.push({
          workflowId: wf.id,
          organization: wf.organization,
          status: "success",
          message: "Actualización aplicada correctamente",
        });
      } else {
        results.failed++;
        results.details.push({
          workflowId: wf.id,
          organization: wf.organization,
          status: "failed",
          message: "Error: Timeout al conectar con N8n",
        });
      }

      // Actualizar progreso en tiempo real
      setExecutionResults({
        ...results,
        inProgress: true,
        current: i + 1,
      });
    }

    // HU-016: Rollback si >10% fallan
    const failureRate = (results.failed / results.total) * 100;
    if (failureRate > 10) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: true,
        rollbackReason: `${failureRate.toFixed(1)}% de workflows fallaron (límite: 10%). Iniciando rollback...`,
      });

      // Simular rollback
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: true,
        rollbackComplete: true,
        rollbackReason: `Rollback completado. ${results.success} workflows restaurados al estado anterior.`,
      });
    } else {
      setExecutionResults({
        ...results,
        inProgress: false,
        rollback: false,
      });
    }

    setIsExecuting(false);
  };

  return (
    <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
      <HudCorners />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-bold text-white">
              Actualizaciones Masivas
            </h3>
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
            <label className="text-sm text-gray-400">
              Tipo de Actualización *
            </label>
            <select
              value={updateType}
              onChange={(e) => {
                setUpdateType(e.target.value);
                setExecutionResults(null);
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
                setScope(e.target.value);
                setExecutionResults(null);
              }}
              disabled={isExecuting}
              className="w-full rounded border border-primary/20 bg-black/40 px-3 py-2 text-white backdrop-blur-sm focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="all">
                Todos los workflows activos ({mockWorkflows.length})
              </option>
              <option value="version">Solo workflows v1.1.5 (2)</option>
              <option value="specific">Workflows específicos</option>
            </select>
          </div>

          {updateType === "parameter" && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Parámetro *</label>
                <select
                  value={selectedParam}
                  onChange={(e) => {
                    setSelectedParam(e.target.value);
                    setExecutionResults(null);
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
                    setNewValue(e.target.value);
                    setExecutionResults(null);
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
            <h4 className="text-sm font-medium text-white">
              Workflows Afectados
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              {selectedWorkflows.length} workflows
            </span>
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
                  <tr
                    key={workflow.id}
                    className="text-sm text-white hover:bg-primary/5"
                  >
                    <td className="px-3 py-2">{workflow.organization}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {workflow.name}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {workflow.version}
                    </td>
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
          <div
            className={`rounded border p-4 ${
              executionResults.rollback
                ? "border-red-500/30 bg-red-500/5"
                : "border-blue-500/20 bg-blue-500/5"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">
                  {executionResults.inProgress
                    ? "Ejecución en Progreso..."
                    : executionResults.rollback
                      ? "Rollback Ejecutado"
                      : "Resultado de la Operación"}
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
                    style={{
                      width: `${(executionResults.current / executionResults.total) * 100}%`,
                    }}
                  ></div>
                </div>
              )}

              {/* Estadísticas */}
              {!executionResults.inProgress && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-lg font-bold text-white font-mono">
                      {executionResults.total ||
                        executionResults.affectedWorkflows}
                    </p>
                  </div>
                  {executionResults.success !== undefined && (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Exitosos</p>
                        <p className="text-lg font-bold text-green-500 font-mono">
                          {executionResults.success}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Fallidos</p>
                        <p className="text-lg font-bold text-red-500 font-mono">
                          {executionResults.failed}
                        </p>
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
              {executionResults.details &&
                executionResults.details.length > 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {executionResults.details.map(
                      (detail: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs"
                        >
                          {detail.status === "success" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          )}
                          <span
                            className={
                              detail.status === "success"
                                ? "text-gray-400"
                                : "text-red-400"
                            }
                          >
                            {detail.organization}: {detail.message}
                          </span>
                        </div>
                      ),
                    )}
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
                  <h3 className="text-lg font-bold text-white">
                    Confirmar Actualización
                  </h3>
                </div>
                <p className="text-sm text-gray-300">
                  Estás a punto de actualizar{" "}
                  <strong className="text-primary">
                    {selectedWorkflows.length} workflows
                  </strong>
                  . Esta operación puede tardar varios minutos.
                </p>
                <p className="text-xs text-gray-400">
                  Si más del 10% de los workflows fallan, se ejecutará un
                  rollback automático.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleApplyUpdate}>
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
