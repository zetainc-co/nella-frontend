"use client";

import React, { useState } from "react";

/* ── Page Header ── */
export function SettingsPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h1
        className="text-[32px] font-bold leading-tight"
        style={{ color: "#f0f4ff" }}
      >
        {title}
      </h1>
      <p className="text-md mt-1" style={{ color: "rgba(240,244,255,0.6)" }}>
        {subtitle}
      </p>
    </div>
  );
}

/* ── Dark Card ── */
export function SettingsCard({
  title,
  action,
  children,
  tealGradient,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tealGradient?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-10 space-y-4 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {tealGradient && (
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: 220,
            height: 160,
            background:
              "radial-gradient(ellipse at top right, rgba(0,210,190,0.18) 0%, rgba(0,180,165,0.06) 30%, transparent 70%)",
          }}
        />
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: "#f0f4ff" }}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Read-only Field ── */
export function SettingsField({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p
        className="text-[13px] font-semibold"
        style={{ color: "rgba(240,244,255,0.55)" }}
      >
        {label}
      </p>
      <div
        className="h-11 rounded-xl px-3 text-sm flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: value ? "#f0f4ff" : "rgba(240,244,255,0.25)",
        }}
      >
        <span>{value || "—"}</span>
        {icon}
      </div>
    </div>
  );
}

/* ── Lime CTA Button ── */
export function SettingsCTAButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#9EFF00] text-black text-sm font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all ${className}`}
      style={{
        boxShadow: "0 8px 20px -4px rgba(158,255,0,0.35)",
      }}
    >
      {children}
    </button>
  );
}

/* ── Ghost Button ── */
const ghostDefaultStyles = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(240,244,255,0.7)",
};

const ghostDefaultHoverStyles = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#f0f4ff",
};

const ghostDangerStyles = {
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.15)",
  color: "#ef4444",
};

const ghostDangerHoverStyles = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.15)",
  color: "#ef4444",
};

export function SettingsGhostButton({
  children,
  onClick,
  fullWidth,
  icon,
  variant = "default",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    variant === "danger" ? ghostDangerStyles : ghostDefaultStyles;
  const hoverStyles =
    variant === "danger" ? ghostDangerHoverStyles : ghostDefaultHoverStyles;
  const currentStyles = isHovered && !disabled ? hoverStyles : baseStyles;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={`text-sm px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed${fullWidth ? " w-full" : ""}`}
      style={currentStyles}
    >
      {icon}
      {children}
    </button>
  );
}

/* ── Lime Badge ── */
export function SettingsLimeBadge({
  children,
  variant = "lime",
}: {
  children: React.ReactNode;
  variant?: "lime" | "outlined";
}) {
  const isLime = variant === "lime";

  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center"
      style={{
        background: isLime ? "rgba(158,255,0,0.1)" : "transparent",
        border: isLime
          ? "1px solid rgba(158,255,0,0.2)"
          : "1px solid rgba(255,255,255,0.12)",
        color: isLime ? "#9EFF00" : "rgba(240,244,255,0.5)",
      }}
    >
      {children}
    </span>
  );
}

/* ── Status Dot ── */
const statusConfig = {
  active: {
    dotColor: "#22c55e",
    label: "Activo",
    textColor: "#22c55e",
  },
  pending: {
    dotColor: "#eab308",
    label: "Pendiente",
    textColor: "#eab308",
  },
  disconnected: {
    dotColor: "rgba(240,244,255,0.3)",
    label: "No conectado",
    textColor: "rgba(240,244,255,0.3)",
  },
};

export function SettingsStatusDot({
  status,
}: {
  status: "active" | "pending" | "disconnected";
}) {
  const config = statusConfig[status];

  return (
    <span className="flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: config.dotColor }}
      />
      <span className="text-xs font-medium" style={{ color: config.textColor }}>
        {config.label}
      </span>
    </span>
  );
}
