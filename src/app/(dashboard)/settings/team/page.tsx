"use client";

import { mockTeam, mockBilling } from "@/lib/mock-data/settings";
import { UserPlus, Trash2 } from "lucide-react";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsCTAButton,
  SettingsLimeBadge,
  SettingsStatusDot,
} from "@/modules/settings/components/settings-ui";

export default function EquipoPage() {
  const licensesUsed = mockBilling.licenses.used;
  const licensesTotal = mockBilling.licenses.total;
  const licensePercentage = (licensesUsed / licensesTotal) * 100;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Equipo y Permisos"
        subtitle="Gestiona quién tiene acceso a tus chats y leads"
      />

      {/* Licencias Usadas */}
      <SettingsCard title="Licencias Usadas">
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: "rgba(240,244,255,0.4)" }}>
            Estás usando{" "}
            <span className="font-bold" style={{ color: "#f0f4ff" }}>
              {licensesUsed}
            </span>{" "}
            de {licensesTotal} licencias disponibles
          </p>

          <div className="flex flex-col items-end gap-1">
            <div
              className="relative h-2 w-40 overflow-hidden rounded-full"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="absolute h-full rounded-full bg-[#9EFF00]"
                style={{ width: `${licensePercentage}%` }}
              />
            </div>
            <span
              className="text-xs"
              style={{ color: "rgba(240,244,255,0.4)" }}
            >
              {licensesUsed}/{licensesTotal}
            </span>
          </div>
        </div>
      </SettingsCard>

      {/* Miembros del Equipo */}
      <SettingsCard
        title="Miembros del Equipo"
        action={
          <SettingsCTAButton>
            <UserPlus className="size-4" /> Invitar Miembro
          </SettingsCTAButton>
        }
      >
        <table className="w-full">
          <thead>
            <tr>
              <th
                className="pb-3 text-left text-xs font-medium"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                Usuario
              </th>
              <th
                className="pb-3 text-left text-xs font-medium"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                Rol
              </th>
              <th
                className="pb-3 text-left text-xs font-medium"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                Estado
              </th>
              <th
                className="pb-3 text-right text-xs font-medium"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTeam.map((member) => (
              <tr
                key={member.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                {/* Usuario */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        width: 36,
                        height: 36,
                        background: "#9EFF00",
                        color: "#0a0a0a",
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#f0f4ff" }}
                      >
                        {member.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(240,244,255,0.4)" }}
                      >
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="py-4">
                  <SettingsLimeBadge
                    variant={
                      member.role === "Administrador" ? "lime" : "outlined"
                    }
                  >
                    {member.role}
                  </SettingsLimeBadge>
                </td>

                {/* Estado */}
                <td className="py-4">
                  <SettingsStatusDot
                    status={member.status === "active" ? "active" : "pending"}
                  />
                </td>

                {/* Acciones */}
                <td className="py-4 text-right">
                  <button
                    className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "#ef4444" }}
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsCard>
    </div>
  );
}
