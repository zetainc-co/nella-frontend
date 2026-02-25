"use client";

import { Lock, Bell, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/core/store/auth-store";
import { useState } from "react";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsField,
  SettingsCTAButton,
  SettingsGhostButton,
} from "@/modules/settings/components/settings-ui";
import { ProfileCardSkeleton } from "@/modules/settings/components/settings-skeleton";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const initials = getInitials(user?.fullName);

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "viewer"
        ? "Visualizador"
        : "Agente de Ventas";

  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu información personal y preferencias"
      />

      {/* Avatar card */}
      <SettingsCard title="Foto de Perfil" tealGradient>
        <div className="flex items-center gap-4 relative z-[1]">
          <div
            className="shrink-0 flex items-center justify-center rounded-full font-bold text-xl shadow-[0_10px_20px_-5px_rgba(163,255,18,0.4)]"
            style={{
              width: 80,
              height: 80,
              background: "#9EFF00",
              color: "#0a0a0a",
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
              Actualiza tu foto de perfil
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(240,244,255,0.35)" }}
            >
              JPG, PNG o GIF. Máximo 2MB.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Personal info */}
      <SettingsCard
        title="Información Personal"
        action={<SettingsGhostButton>Editar</SettingsGhostButton>}
      >
        {!user ? (
          <ProfileCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Nombre Completo" value={user.fullName} />
            <SettingsField label="Correo Electrónico" value={user.email} />
            <SettingsField label="Cargo / Rol" value={roleLabel} />
            <SettingsField
              label="Contraseña"
              value="••••••••"
              icon={
                <Lock
                  className="size-3.5 shrink-0"
                  style={{ color: "rgba(240,244,255,0.3)" }}
                />
              }
            />
          </div>
        )}
      </SettingsCard>

      {/* Preferences */}
      <SettingsCard title="Preferencias">
        <div>
          {/* Desktop notifications */}
          <div
            className="flex items-center justify-between py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(158,255,0,0.1)" }}
              >
                <Bell className="size-4" style={{ color: "#9EFF00" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Notificaciones de escritorio
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(240,244,255,0.4)" }}
                >
                  Recibe alertas en tu navegador
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:!bg-[#9EFF00]"
            />
          </div>

          {/* Chat sounds */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(158,255,0,0.1)" }}
              >
                <Volume2 className="size-4" style={{ color: "#9EFF00" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Sonidos de chat
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(240,244,255,0.4)" }}
                >
                  Reproducir sonido al recibir mensajes
                </p>
              </div>
            </div>
            <Switch
              checked={sounds}
              onCheckedChange={setSounds}
              className="data-[state=checked]:!bg-[#9EFF00]"
            />
          </div>
        </div>
      </SettingsCard>

      {/* CTA */}
      <div className="flex justify-end">
        <SettingsCTAButton>Guardar Cambios</SettingsCTAButton>
      </div>
    </div>
  );
}
