// src/app/(dashboard)/configuracion/administracion/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HudBackground } from "@/modules/auth/components/hud-background";
import { HudCorners } from "@/components/ui/hud-corners";
import { Button } from "@/components/ui/button";
import {
  Shield,
  RefreshCw,
  Users,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { BulkUpdatesTab } from "@/modules/workflows/components/administration/BulkUpdatesTab";
import { MigracionesTab } from "@/modules/workflows/components/administration/MigracionesTab";

export default function AdministracionPage() {
  const [activeTab, setActiveTab] = useState<"bulk-updates" | "migraciones">(
    "bulk-updates",
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario es admin
    const userRole = localStorage.getItem("user_role");
    if (userRole !== "admin") {
      router.push("/settings/workflows");
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <HudBackground />

      <div className="relative z-10 container mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="relative border border-yellow-500/30 bg-yellow-500/5 p-6 backdrop-blur-sm">
          <HudCorners />

          <div className="mb-4">
            <Link href="/settings/workflows">
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
                <h1 className="text-2xl font-bold text-white">
                  Administración
                </h1>
                <p className="text-sm text-gray-400">
                  Herramientas administrativas para gestión masiva
                </p>
              </div>
            </div>

            <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-1">
              <span className="text-xs font-mono text-yellow-500">
                ADMIN ONLY
              </span>
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
                Las operaciones en esta sección afectan múltiples workflows y
                organizaciones. Asegúrate de entender el impacto antes de
                ejecutar cualquier acción.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-primary/20">
          <button
            onClick={() => setActiveTab("bulk-updates")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "bulk-updates"
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizaciones Masivas
          </button>
          <button
            onClick={() => setActiveTab("migraciones")}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "migraciones"
                ? "border-primary text-primary"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Users className="h-4 w-4" />
            Migraciones
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === "bulk-updates" && <BulkUpdatesTab />}
          {activeTab === "migraciones" && <MigracionesTab />}
        </div>
      </div>
    </div>
  );
}
