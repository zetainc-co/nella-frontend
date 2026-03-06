"use client";

import { Lock, Bell, Volume2, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/shared/components/modal/modal";
import { useAuthStore } from "@/core/store/auth-store";
import { useState, useEffect } from "react";
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsField,
  SettingsCTAButton,
  SettingsGhostButton,
} from "@/modules/settings/components/settings-ui";
import { ProfileCardSkeleton } from "@/modules/settings/components/settings-skeleton";
import {
  useUpdateProfile,
  useChangePassword,
} from "@/modules/settings/hooks/use-profile";

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#f0f4ff",
};

const labelStyle = { color: "rgba(240,244,255,0.55)" };

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const { user, session } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const displayName = user?.fullName || session?.fullName || "";
  const initials = getInitials(displayName);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (displayName) setFullName(displayName);
  }, [displayName]);
  const [sounds, setSounds] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "viewer"
        ? "Visualizador"
        : "Agente de Ventas";

  function handleEdit() {
    setFullName(displayName);
    setIsEditing(true);
  }

  function handleCancel() {
    setFullName(displayName);
    setIsEditing(false);
  }

  function handleSave() {
    if (!fullName.trim() || fullName === displayName) {
      setIsEditing(false);
      return;
    }
    updateProfile.mutate(
      { full_name: fullName.trim() },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  function openPasswordModal() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setShowPasswordModal(true);
  }

  function handleChangePassword() {
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Ingresa tu contrasena actual");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("La nueva contrasena debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contrasenas no coinciden");
      return;
    }

    changePassword.mutate(
      { current_password: currentPassword, new_password: newPassword },
      { onSuccess: () => setShowPasswordModal(false) },
    );
  }

  return (
    <div className="p-6 md:p-6 space-y-6 max-w-5xl mx-auto">
      <SettingsPageHeader
        title="Mi Perfil"
        subtitle="Gestiona tu informacion personal y preferencias"
      />

      {/* Avatar card */}
      <SettingsCard title="Foto de Perfil" tealGradient>
        <div className="flex items-center gap-4 relative z-[1]">
          <div
            className="shrink-0 flex items-center justify-center rounded-full font-bold text-xl shadow-[0_10px_20px_-5px_rgba(140,40,250,0.4)]"
            style={{
              width: 80,
              height: 80,
              background: "#8C28FA",
              color: "#ffffff",
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
              JPG, PNG o GIF. Maximo 2MB.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Personal info */}
      <SettingsCard
        title="Informacion Personal"
        action={
          !isEditing ? (
            <SettingsGhostButton onClick={handleEdit}>Editar</SettingsGhostButton>
          ) : (
            <div className="flex gap-2">
              <SettingsGhostButton onClick={handleCancel}>Cancelar</SettingsGhostButton>
              <SettingsCTAButton onClick={handleSave}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </SettingsCTAButton>
            </div>
          )
        }
      >
        {!user ? (
          <ProfileCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditing ? (
              <div className="space-y-1.5">
                <p className="text-[13px] font-semibold" style={labelStyle}>
                  Nombre Completo
                </p>
                <Input
                  className="h-11 rounded-xl"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </div>
            ) : (
              <SettingsField label="Nombre Completo" value={displayName} />
            )}
            <SettingsField label="Correo Electronico" value={user.email} />
            <SettingsField label="Cargo / Rol" value={roleLabel} />
            <div className="space-y-1.5">
              <p className="text-[13px] font-semibold" style={labelStyle}>
                Contrasena
              </p>
              <div className="flex gap-2">
                <div
                  className="h-11 rounded-xl px-3 text-sm flex items-center justify-between flex-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#f0f4ff",
                  }}
                >
                  <span>••••••••</span>
                  <Lock
                    className="size-3.5 shrink-0"
                    style={{ color: "rgba(240,244,255,0.3)" }}
                  />
                </div>
                <button
                  onClick={openPasswordModal}
                  className="h-11 px-4 rounded-xl text-sm font-medium transition-colors shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(240,244,255,0.7)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#f0f4ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(240,244,255,0.7)";
                  }}
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Preferences */}
      <SettingsCard title="Preferencias">
        <div>
          <div
            className="flex items-center justify-between py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(140,40,250,0.1)" }}
              >
                <Bell className="size-4" style={{ color: "#8C28FA" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Notificaciones de escritorio
                </p>
                <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
                  Recibe alertas en tu navegador
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              className="data-[state=checked]:!bg-[#8C28FA]"
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(140,40,250,0.1)" }}
              >
                <Volume2 className="size-4" style={{ color: "#8C28FA" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Sonidos de chat
                </p>
                <p className="text-xs" style={{ color: "rgba(240,244,255,0.4)" }}>
                  Reproducir sonido al recibir mensajes
                </p>
              </div>
            </div>
            <Switch
              checked={sounds}
              onCheckedChange={setSounds}
              className="data-[state=checked]:!bg-[#8C28FA]"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Change Password Modal */}
      <Modal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        title="Cambiar Contrasena"
        description="Ingresa tu contrasena actual y la nueva contrasena"
        size="sm"
        footer={
          <>
            <SettingsGhostButton onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </SettingsGhostButton>
            <SettingsCTAButton onClick={handleChangePassword}>
              {changePassword.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Cambiar Contrasena"
              )}
            </SettingsCTAButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-[13px] font-semibold" style={labelStyle}>
              Contrasena actual
            </p>
            <div className="relative">
              <Input
                className="h-11 rounded-xl pr-10"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contrasena actual"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[13px] font-semibold" style={labelStyle}>
              Nueva contrasena
            </p>
            <div className="relative">
              <Input
                className="h-11 rounded-xl pr-10"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 8 caracteres"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[13px] font-semibold" style={labelStyle}>
              Confirmar nueva contrasena
            </p>
            <div className="relative">
              <Input
                className="h-11 rounded-xl pr-10"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contrasena"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(240,244,255,0.4)" }}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-sm" style={{ color: "#ef4444" }}>
              {passwordError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
