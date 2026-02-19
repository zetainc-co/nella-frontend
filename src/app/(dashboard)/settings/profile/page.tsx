"use client";

import { Lock, Bell, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Shared field row ── */
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <p
        className="text-xs font-medium"
        style={{ color: "rgba(240,244,255,0.45)" }}
      >
        {label}
      </p>
      <div
        className="px-3 py-2.5 rounded-xl text-sm"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: value ? "#f0f4ff" : "rgba(240,244,255,0.25)",
          minHeight: 40,
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/* ── Card container ── */
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "#f0f4ff" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const initials = getInitials(user?.fullName);

  const [notifications, setNotifications] = useState(false);
  const [sounds, setSounds] = useState(false);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#f0f4ff" }}>
          Mi Perfil
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "rgba(240,244,255,0.4)" }}
        >
          Tus datos personales y preferencias
        </p>
      </div>

      {/* Avatar card */}
      <Card title="Profile picture">
        <div className="flex items-center gap-4">
          {/* Initials avatar */}
          <div
            className="shrink-0 flex items-center justify-center rounded-2xl font-bold text-xl"
            style={{
              width: 72,
              height: 72,
              background: "rgba(158,255,0,0.15)",
              border: "1.5px solid rgba(158,255,0,0.35)",
              color: "#9EFF00",
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
              {user?.fullName ?? "—"}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(240,244,255,0.4)" }}
            >
              {user?.role === "admin"
                ? "Administrator"
                : user?.role === "viewer"
                  ? "Viewer"
                  : "Sales Agent"}
            </p>
            {user?.tenantName && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(240,244,255,0.3)" }}
              >
                {user.tenantName}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card title="Personal information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name" value={user?.fullName} />
          <Field label="Email" value={user?.email} />
          <Field
            label="Role"
            value={
              user?.role === "admin"
                ? "Administrator"
                : user?.role === "viewer"
                  ? "Viewer"
                  : user?.role === "agent"
                    ? "Sales Agent"
                    : undefined
            }
          />
          <div className="space-y-1.5">
            <p
              className="text-xs font-medium"
              style={{ color: "rgba(240,244,255,0.45)" }}
            >
              Password
            </p>
            <div
              className="px-3 py-2.5 rounded-xl text-sm flex items-center justify-between"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(240,244,255,0.35)",
                minHeight: 40,
              }}
            >
              <span>••••••••</span>
              <Lock className="size-3.5 shrink-0" />
            </div>
          </div>
        </div>
        {/* Fields not yet in backend / optional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Field label="Phone" value={user?.phone} />
          <Field
            label="Organization"
            value={user?.tenantName ?? user?.tenantSlug}
          />
        </div>
      </Card>

      {/* Preferences */}
      <Card title="Preferences">
        <div className="space-y-5">
          {/* Desktop notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(158,255,0,0.1)" }}
              >
                <Bell className="size-4" style={{ color: "#9EFF00" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Desktop notifications
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(240,244,255,0.4)" }}
                >
                  Receive alerts in your browser
                </p>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Chat sounds */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg size-9"
                style={{ background: "rgba(158,255,0,0.1)" }}
              >
                <Volume2 className="size-4" style={{ color: "#9EFF00" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#f0f4ff" }}>
                  Chat sounds
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(240,244,255,0.4)" }}
                >
                  Play sound when you receive messages
                </p>
              </div>
            </div>
            <Switch checked={sounds} onCheckedChange={setSounds} />
          </div>
        </div>
      </Card>
    </div>
  );
}
