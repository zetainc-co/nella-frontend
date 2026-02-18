"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Link as LinkIcon,
  Users,
  CreditCard,
  Shield,
} from "lucide-react";

type SettingsNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

const settingsNav: SettingsNavItem[] = [
  { label: "Mi Perfil", href: "/settings/profile", icon: User },
  { label: "Organización", href: "/settings/organization", icon: Building2 },
  { label: "Conexiones", href: "/settings/connections", icon: LinkIcon },
  { label: "Equipo & Permisos", href: "/settings/team", icon: Users },
  { label: "Facturación", href: "/settings/billing", icon: CreditCard },
  {
    label: "Administración",
    href: "/settings/administration",
    icon: Shield,
    badge: "ADMIN",
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* ── Settings sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 overflow-y-auto"
        style={{
          width: 224,
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-[15px] font-bold" style={{ color: "#f0f4ff" }}>
            Configuración
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgba(240,244,255,0.38)" }}
          >
            Cuenta y preferencias
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {settingsNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
                style={
                  active
                    ? {
                        background: "rgba(158,255,0,0.1)",
                        borderLeft: "2px solid #9EFF00",
                        color: "#9EFF00",
                        padding: "9px 12px 9px 10px",
                      }
                    : {
                        borderLeft: "2px solid transparent",
                        color: "rgba(240,244,255,0.45)",
                        padding: "9px 12px 9px 10px",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(240,244,255,0.85)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(240,244,255,0.45)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon className="size-[17px] shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
                    style={{
                      background: "rgba(234,179,8,0.1)",
                      border: "1px solid rgba(234,179,8,0.3)",
                      color: "#eab308",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
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
