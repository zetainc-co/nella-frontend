"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Link2 as LinkIcon,
  Users,
  CreditCard,
} from "lucide-react";

type SettingsNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const settingsNav: SettingsNavItem[] = [
  { label: "Mi Perfil", href: "/settings/profile", icon: User },
  { label: "Organización", href: "/settings/organization", icon: Building2 },
  { label: "Equipo y Permisos", href: "/settings/team", icon: Users },
  { label: "Conexiones", href: "/settings/connections", icon: LinkIcon },
  { label: "Facturación", href: "/settings/billing", icon: CreditCard },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* ── Settings sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 345,
          background: "#1a1a1a",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-[24px] font-bold" style={{ color: "#f0f4ff" }}>
            Configuración
          </h2>
          <p
            className="text-xs mt-0.5 text-[14px]"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Administra tu cuenta y preferencias
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {settingsNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-[8px] text-[15px] font-semibold transition-colors duration-150"
                style={
                  active
                    ? {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "#f0f4ff",
                        padding: "9px 12px",
                      }
                    : {
                        border: "1px solid transparent",
                        color: "rgba(255,255,255,0.55)",
                        padding: "9px 12px",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon
                  className="size-[20px] shrink-0 stroke-2"
                  style={{
                    color: "rgba(255,255,255,0.80)",
                  }}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
