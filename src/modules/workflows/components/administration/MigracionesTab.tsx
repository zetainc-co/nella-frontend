// HU-017: MIGRACIÓN DE TENANTS EXISTENTES
"use client";

import { useState } from "react";
import { HudCorners } from "@/components/ui/hud-corners";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
} from "lucide-react";

export function MigracionesTab() {
  const [sourceVersion, setSourceVersion] = useState("v1.1.5");
  const [targetVersion, setTargetVersion] = useState("v1.2.0");
  const [batchSize, setBatchSize] = useState(5);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<any>(null);

  // Mock data de estado de migración
  const [migrationStats, setMigrationStats] = useState({
    total: 12,
    migrated: 7,
    pending: 5,
    failed: 0,
  });

  // Mock data de organizaciones
  const [organizations, setOrganizations] = useState([
    {
      id: "org-001",
      name: "Organización Alpha",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-10",
    },
    {
      id: "org-002",
      name: "Organización Beta",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-10",
    },
    {
      id: "org-003",
      name: "Organización Gamma",
      currentVersion: "v1.1.5",
      status: "pending",
      migratedAt: null,
    },
    {
      id: "org-004",
      name: "Organización Delta",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-11",
    },
    {
      id: "org-005",
      name: "Organización Epsilon",
      currentVersion: "v1.1.5",
      status: "pending",
      migratedAt: null,
    },
    {
      id: "org-006",
      name: "Organización Zeta",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-11",
    },
    {
      id: "org-007",
      name: "Organización Eta",
      currentVersion: "v1.1.5",
      status: "pending",
      migratedAt: null,
    },
    {
      id: "org-008",
      name: "Organización Theta",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-12",
    },
    {
      id: "org-009",
      name: "Organización Iota",
      currentVersion: "v1.1.5",
      status: "pending",
      migratedAt: null,
    },
    {
      id: "org-010",
      name: "Organización Kappa",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-12",
    },
    {
      id: "org-011",
      name: "Organización Lambda",
      currentVersion: "v1.1.5",
      status: "pending",
      migratedAt: null,
    },
    {
      id: "org-012",
      name: "Organización Mu",
      currentVersion: "v1.2.0",
      status: "migrated",
      migratedAt: "2026-02-13",
    },
  ]);

  // HU-017: Migrar de 5 en 5 (no todos a la vez)
  const handleStartMigration = async () => {
    setShowConfirmation(false);
    setIsMigrating(true);
    setIsPaused(false);

    const pendingOrgs = organizations.filter((org) => org.status === "pending");
    const batches = [];

    // Dividir en lotes según batchSize
    for (let i = 0; i < pendingOrgs.length; i += batchSize) {
      batches.push(pendingOrgs.slice(i, i + batchSize));
    }

    setMigrationProgress({
      currentBatch: 0,
      totalBatches: batches.length,
      batchResults: [],
      completed: false,
    });

    // Migrar por lotes
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      if (isPaused) break;

      const batch = batches[batchIndex];
      const batchResults: any[] = [];

      setMigrationProgress((prev: any) => ({
        ...prev,
        currentBatch: batchIndex + 1,
        processing: true,
      }));

      // Procesar cada organización del lote
      for (let orgIndex = 0; orgIndex < batch.length; orgIndex++) {
        if (isPaused) break;

        const org = batch[orgIndex];

        // Simular tiempo de migración
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // HU-017: Validar que workflows funcionan
        const validationSuccess = Math.random() > 0.05; // 95% éxito

        if (validationSuccess) {
          // Actualizar organización como migrada
          setOrganizations((prev) =>
            prev.map((o) =>
              o.id === org.id
                ? {
                    ...o,
                    status: "migrated",
                    currentVersion: targetVersion,
                    migratedAt: new Date().toISOString().split("T")[0],
                  }
                : o,
            ),
          );

          setMigrationStats((prev) => ({
            ...prev,
            migrated: prev.migrated + 1,
            pending: prev.pending - 1,
          }));

          batchResults.push({
            orgId: org.id,
            orgName: org.name,
            status: "success",
            message: "Migración y validación exitosa",
          });
        } else {
          setMigrationStats((prev) => ({
            ...prev,
            failed: prev.failed + 1,
            pending: prev.pending - 1,
          }));

          batchResults.push({
            orgId: org.id,
            orgName: org.name,
            status: "failed",
            message: "Error en validación de workflow",
          });
        }
      }

      setMigrationProgress((prev: any) => ({
        ...prev,
        batchResults: [
          ...(prev.batchResults || []),
          { batchNumber: batchIndex + 1, results: batchResults },
        ],
        processing: false,
      }));

      // Pausa entre lotes para no saturar
      if (batchIndex < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setMigrationProgress((prev: any) => ({
      ...prev,
      completed: true,
    }));

    setIsMigrating(false);
  };

  return (
    <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
      <HudCorners />

      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-white">
            Migraciones de Organizaciones
          </h3>
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
              <label className="text-sm text-gray-400">
                Organizaciones Totales
              </label>
              <p className="text-3xl font-bold text-white font-mono">
                {migrationStats.total}
              </p>
            </div>
          </div>

          <div className="relative border border-green-500/20 bg-green-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Migradas</label>
              <p className="text-3xl font-bold text-green-500 font-mono">
                {migrationStats.migrated}
              </p>
              <p className="text-xs text-green-400">
                {(
                  (migrationStats.migrated / migrationStats.total) *
                  100
                ).toFixed(0)}
                % completado
              </p>
            </div>
          </div>

          <div className="relative border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Pendientes</label>
              <p className="text-3xl font-bold text-yellow-500 font-mono">
                {migrationStats.pending}
              </p>
            </div>
          </div>

          <div className="relative border border-red-500/20 bg-red-500/5 p-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Fallidas</label>
              <p className="text-3xl font-bold text-red-500 font-mono">
                {migrationStats.failed}
              </p>
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
                  {migrationProgress.completed
                    ? "Migración Completada"
                    : "Migración en Progreso"}
                </h4>
                <span className="text-xs text-gray-400 font-mono">
                  Lote {migrationProgress.currentBatch}/
                  {migrationProgress.totalBatches}
                </span>
              </div>

              {/* Progreso por lotes */}
              <div className="w-full bg-black/40 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(migrationProgress.currentBatch / migrationProgress.totalBatches) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Resultados por lote */}
              {migrationProgress.batchResults &&
                migrationProgress.batchResults.length > 0 && (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {migrationProgress.batchResults.map(
                      (batch: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <p className="text-xs font-semibold text-gray-300">
                            Lote {batch.batchNumber}:
                          </p>
                          {batch.results.map(
                            (result: any, resultIdx: number) => (
                              <div
                                key={resultIdx}
                                className="flex items-center gap-2 text-xs ml-3"
                              >
                                {result.status === "success" ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                                )}
                                <span
                                  className={
                                    result.status === "success"
                                      ? "text-gray-400"
                                      : "text-red-400"
                                  }
                                >
                                  {result.orgName}: {result.message}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Lista de Organizaciones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white">
              Estado de Organizaciones
            </h4>
            <span className="text-xs text-gray-400 font-mono">
              {organizations.length} organizaciones
            </span>
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
                  <tr
                    key={org.id}
                    className="text-sm text-white hover:bg-primary/5"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">
                      {org.id}
                    </td>
                    <td className="px-3 py-2">{org.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {org.currentVersion}
                    </td>
                    <td className="px-3 py-2">
                      {org.status === "migrated" ? (
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
                      {org.migratedAt || "-"}
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
                  <h3 className="text-lg font-bold text-white">
                    Confirmar Migración
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    Estás a punto de migrar{" "}
                    <strong className="text-primary">
                      {migrationStats.pending} organizaciones
                    </strong>{" "}
                    de <strong>{sourceVersion}</strong> a{" "}
                    <strong>{targetVersion}</strong>.
                  </p>
                  <p>
                    La migración se realizará en lotes de{" "}
                    <strong className="text-primary">
                      {batchSize} organizaciones
                    </strong>{" "}
                    para evitar saturación del sistema.
                  </p>
                  <p className="text-xs text-gray-400">
                    Cada workflow será validado después de la migración. El
                    workflow centralizado se mantendrá activo hasta que todas
                    las migraciones se completen exitosamente.
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
                  <Button className="flex-1" onClick={handleStartMigration}>
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
