"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
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
import { useAuthStore } from "@/stores/auth-store";

const SIDEBAR_W = 252;

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Contacts", href: "/contacts", icon: Users },
];

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Shared nav link ──────────────────────────────────────────── */
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
      className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150"
      style={
        active
          ? {
              background: "rgba(158,255,0,0.1)",
              border: "1px solid rgba(158,255,0,0.3)",
              padding: "10px 14px 10px 10px",
              color: "#ffffff",
              boxShadow: "0 0 10px 0 rgba(158,255,0,0.3)",
            }
          : {
              border: "1px solid transparent",
              color: "rgba(240,244,255,0.45)",
              padding: "10px 14px 10px 10px",
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
      <Icon className="size-[18px] shrink-0" />
      {label}
    </Link>
  );
}

/* ── Sidebar ──────────────────────────────────────────────────── */
function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Auto-expand if on settings route
    if (pathname.startsWith("/settings")) {
      setSettingsOpen(true);
    }
    // Check admin status
    const userRole = localStorage.getItem("user_role");
    setIsAdmin(userRole === "admin");
  }, [pathname]);
  const { user, logout } = useAuthStore();
  const initials = getInitials(user?.fullName);

  function handleLogout() {
    logout();
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost";
    const port = window.location.port ? `:${window.location.port}` : "";
    window.location.href = `http://${domain}${port}/login`;
  }

  const isSettingsActive = pathname.startsWith("/settings");

  function handleLogout() {
    // Limpiar el store de autenticación
    logout();
    
    // Limpiar otros datos del localStorage relacionados con la sesión
    localStorage.removeItem("user_role");
    
    // Mostrar mensaje de confirmación
    toast.success("Sesión cerrada", {
      description: "Has cerrado sesión correctamente",
    });
    
    // Redirigir a la página de login
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d0d0d" }}>
      {/* ─ Header ─ */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Avatar */}
        <div
          className="shrink-0 flex items-center justify-center rounded-xl font-bold"
          style={{
            width: 46,
            height: 46,
            fontSize: 15,
            background: "rgba(158,255,0,0.15)",
            border: "1px solid rgba(158,255,0,0.3)",
            color: "#9EFF00",
          }}
        >
          {initials}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <div
            className="text-[13px] font-semibold leading-tight truncate"
            style={{ color: "#f0f4ff" }}
          >
            {user?.fullName ?? "User"}
          </div>
          {user?.email && (
            <div
              className="text-[11px] truncate mt-0.5"
              style={{ color: "rgba(240,244,255,0.38)" }}
            >
              {user.email}
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg transition-colors"
            style={{ color: "rgba(240,244,255,0.35)" }}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ─ Navigation ─ */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
          );
        })}
      </nav>

      {/* ─ Footer ─ */}
      <div
        className="px-3 py-4 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <NavItem
          href="/settings"
          icon={Settings}
          label="Configuración"
          active={isSettingsActive}
          onClick={onClose}
        />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left"
          style={{
            borderLeft: "2px solid transparent",
            color: "rgba(240,244,255,0.45)",
            padding: "10px 14px 10px 10px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ef4444";
            e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(240,244,255,0.45)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="size-[18px] shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive transition-all w-full text-left"
          >
            <LogOut className="size-5" />
            Cerrar Sesión
/* ── Layout ───────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#151515", position: "relative" }}
    >
      {/* ── Background orbs (same as auth) ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-18%",
          right: "-8%",
          width: "720px",
          height: "720px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,205,190,0.22) 0%, rgba(0,175,162,0.09) 38%, rgba(0,140,130,0.03) 60%, transparent 75%)",
          filter: "blur(65px)",
          animation: "orb-breathe 7s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "-18%",
          left: `${SIDEBAR_W}px`,
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(65,60,220,0.15) 0%, rgba(45,40,175,0.06) 42%, transparent 70%)",
          filter: "blur(80px)",
          animation: "orb-breathe-slow 9s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0"
        style={{
          width: SIDEBAR_W,
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className="fixed top-0 left-0 z-50 h-full md:hidden flex flex-col transition-transform duration-200"
        style={{
          width: SIDEBAR_W,
          background: "#0d0d0d",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main ── */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Mobile top bar */}
        <div
          className="flex md:hidden items-center px-4 h-14 shrink-0"
          style={{
            background: "#0d0d0d",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: "rgba(240,244,255,0.6)" }}
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
  );
}
