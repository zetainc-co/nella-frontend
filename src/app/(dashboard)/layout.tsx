"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useLogout } from "@/shared/hooks/useLogout";
import { ProtectedRoute } from "@/core/routes/ProtectedRoute";

const SIDEBAR_W = 260;

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Calendario", href: "/calendar", icon: CalendarDays },
  { name: "Contactos", href: "/contacts", icon: Users },
];

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3.5 rounded-lg text-[14.5px] font-medium transition-colors duration-150"
      style={
        active
          ? {
              background: "rgba(158,255,0,0.08)",
              border: "1px solid rgba(158,255,0,0.18)",
              padding: "11px 14px",
              color: "#f0f4ff",
            }
          : {
              border: "1px solid transparent",
              color: "rgba(255,255,255,0.55)",
              padding: "11px 14px",
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
        className="size-5 shrink-0"
        style={{ color: active ? "#9EFF00" : "rgba(255,255,255,0.4)" }}
      />
      {label}
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useLogout();
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <div className="flex flex-col h-full" style={{ background: "#1a1a1a" }}>
      {/* Company header */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-full font-bold shadow-[0_10px_20px_-5px_rgba(163,255,18,0.4)]"
          style={{
            width: 48,
            height: 48,
            fontSize: 18,
            background: "#9EFF00",
            color: "#1a1a1a",
          }}
        >
          N
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[18px] font-bold leading-tight truncate"
            style={{ color: "#f0f4ff" }}
          >
            Nella Sales
          </div>
          <div
            className="text-xs truncate mt-0.5"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Colombia
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: 'rgba(240,244,255,0.35)' }}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href || pathname.startsWith("/dashboard")
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <NavItem
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              active={active}
              onClick={onClose}
            />
          )
        })}
      </nav>

      <div className="px-3 py-4 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NavItem
          href="/settings"
          icon={Settings}
          label="Configuración"
          active={isSettingsActive}
          onClick={onClose}
        />
        <button
          onClick={logout}
          className="flex items-center gap-3.5 rounded-lg text-[14.5px] font-medium transition-colors duration-150 w-full text-left"
          style={{
            border: "1px solid transparent",
            color: "rgba(255,255,255,0.55)",
            padding: "11px 14px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut
            className="size-5 shrink-0"
            style={{ color: "rgba(255,255,255,0.4)" }}
          />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/settings");

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <ProtectedRoute>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: '#151515', position: 'relative' }}
      >
        {/* Background orbs */}
        <div aria-hidden style={{
          position: 'fixed', top: '-18%', right: '-8%',
          width: '720px', height: '720px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0,205,190,0.22) 0%, rgba(0,175,162,0.09) 38%, rgba(0,140,130,0.03) 60%, transparent 75%)',
          filter: 'blur(65px)', animation: 'orb-breathe 7s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div aria-hidden style={{
          position: 'fixed', bottom: '-18%', left: `${SIDEBAR_W}px`,
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(65,60,220,0.15) 0%, rgba(45,40,175,0.06) 42%, transparent 70%)',
          filter: 'blur(80px)', animation: 'orb-breathe-slow 9s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col shrink-0"
          style={{
            width: SIDEBAR_W,
            background: "#1a1a1a",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside
          className="fixed top-0 left-0 z-50 h-full md:hidden flex flex-col transition-transform duration-200"
          style={{
            width: SIDEBAR_W, background: '#0d0d0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </aside>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex md:hidden items-center px-4 h-14 shrink-0" style={{
            background: '#0d0d0d',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg"
              style={{ color: 'rgba(240,244,255,0.6)' }}
            >
              <Menu className="size-5" />
            </button>
            <span
              className="ml-3 text-base font-bold"
              style={{ color: "#f0f4ff" }}
            >
              Nella<span style={{ color: "#9EFF00" }}>Sales</span>
            </span>
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
