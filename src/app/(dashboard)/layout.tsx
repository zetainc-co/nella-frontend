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
  ChevronDown,
  Plus,
} from "lucide-react";
import { useLogout } from "@/shared/hooks/useLogout";
import { ProtectedRoute } from "@/core/routes/ProtectedRoute";

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
  name,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  name: string;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? name : undefined}
      className={`flex items-center rounded-lg text-[14.5px] font-medium transition-colors duration-150 ${collapsed ? 'justify-center' : 'gap-3.5'}`}
      style={
        active
          ? {
              background: "rgba(140,40,250,0.08)",
              border: "1px solid rgba(140,40,250,0.18)",
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
          e.currentTarget.style.background = "#262035";
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
        style={{ color: active ? "#8C28FA" : "rgba(255,255,255,0.4)" }}
      />
      {label && label}
    </Link>
  );
}

function MainSidebar({
  collapsed,
  onToggle,
  onClose
}: {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useLogout();
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 ease-in-out"
      style={{ background: "#1a1a1a" }}
    >
      {/* Company header */}
      {collapsed ? (
        <div className="flex items-center justify-center w-full py-5">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'rgba(240,244,255,0.6)' }}
            title="Expandir sidebar"
          >
            <Menu className="size-5" />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <img
            src="/logo.png"
            alt="NellaUp"
            className="h-8 w-auto"
          />
        </div>
      )}

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
              label={collapsed ? "" : item.name}
              name={item.name}
              active={active}
              collapsed={collapsed}
              onClick={onClose}
            />
          )
        })}
      </nav>

      <div className="px-3 py-4 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <NavItem
          href="/settings"
          icon={Settings}
          label={collapsed ? "" : "Configuración"}
          name="Configuración"
          active={isSettingsActive}
          collapsed={collapsed}
          onClick={onClose}
        />
        <button
          onClick={logout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={`flex items-center rounded-lg text-[14.5px] font-medium transition-colors duration-150 w-full text-left ${collapsed ? 'justify-center' : 'gap-3.5'}`}
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
          <LogOut className="size-5 shrink-0" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useLogout();
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/settings");

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/settings')) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [pathname]);

  const SIDEBAR_W = sidebarCollapsed ? 72 : 260;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
          className="hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out"
          style={{
            width: SIDEBAR_W,
            background: "#1a1a1a",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <MainSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
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
          <MainSidebar collapsed={false} onToggle={toggleSidebar} onClose={() => setMobileOpen(false)} />
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
              Nella<span style={{ color: "#8C28FA" }}>Up</span>
            </span>
          </div>
          {/* Header */}
          <header className="shrink-0 h-16 flex items-center justify-end gap-4 px-6 hidden md:flex" style={{
            background: '#1a1a1a',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {/* Project Selector */}
            <div className="relative">
              <button
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#f0f4ff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                <span>Lara Project</span>
                <ChevronDown className="size-4" />
              </button>

              {/* Dropdown Menu */}
              {projectMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProjectMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg shadow-xl z-50"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      TUS PROYECTOS
                    </div>

                    {/* Current Project */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: '#f0f4ff' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div className="size-2 rounded-full" style={{ background: '#8C28FA' }} />
                      <span className="font-medium">Lara Project</span>
                    </button>

                    {/* Divider */}
                    <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* Create New Project */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = '#f0f4ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }}
                    >
                      <Plus className="size-4" />
                      <span>Crear nuevo proyecto</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Info & Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* User Info */}
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: '#f0f4ff' }}>
                    Usuario del Sistema
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    usuario@ejemplo.com
                  </div>
                </div>

                {/* Avatar */}
                <div
                  className="size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    background: '#8C28FA',
                    color: '#1a1a1a'
                  }}
                >
                  U
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Menu */}
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl z-50"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }}
                    >
                      <LogOut className="size-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
