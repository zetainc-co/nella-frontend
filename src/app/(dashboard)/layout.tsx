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
import { useAuthStore } from "@/core/store/auth-store";
import { useProjects } from "@/modules/dashboard/hooks/useProjects";
import type { Project } from "@/modules/dashboard/types/dashboard-types";
import { CreateProjectModal } from "@/modules/dashboard/components/create-project-modal";

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { logout } = useLogout();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nella-selected-project') || null;
    }
    return null;
  });
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    if (selectedProjectId && typeof window !== 'undefined') {
      localStorage.setItem('nella-selected-project', selectedProjectId);
    }
  }, [selectedProjectId]);

  const currentProject = projects?.find((p: Project) => p.id === selectedProjectId) ?? projects?.[0];

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
        {/* Background orbs - decorative gradient lights (can be removed if not desired) */}
        {/* Orb 1 - Top Right */}
        <div aria-hidden style={{
          position: 'fixed', top: '-15%', right: '-5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(140,40,250,0.15) 0%, rgba(140,40,250,0.08) 40%, transparent 70%)',
          filter: 'blur(80px)', animation: 'orb-breathe 7s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Orb 2 - Bottom Left */}
        <div aria-hidden style={{
          position: 'fixed', bottom: '-20%', left: `${SIDEBAR_W}px`,
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(132,56,238,0.12) 0%, rgba(132,56,238,0.06) 45%, transparent 75%)',
          filter: 'blur(90px)', animation: 'orb-breathe-slow 9s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Orb 3 - Center/Top Left */}
        <div aria-hidden style={{
          position: 'fixed', top: '30%', left: '20%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.10) 0%, rgba(168,85,247,0.05) 50%, transparent 80%)',
          filter: 'blur(70px)', animation: 'orb-breathe 8s ease-in-out infinite 2s',
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
            zIndex: 5,
          }}
        >
          <MainSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-10 md:hidden"
            style={{ background: 'rgba(0,0,0,0.65)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside
          className="fixed top-0 left-0 z-10 h-full md:hidden flex flex-col transition-transform duration-200"
          style={{
            width: 260, background: '#0d0d0d',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <MainSidebar collapsed={false} onToggle={toggleSidebar} onClose={() => setMobileOpen(false)} />
        </aside>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ position: 'relative' }}>
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
          {!pathname.startsWith('/settings') && !pathname.startsWith('/calendar') && (
          <header className="shrink-0 h-16 hidden md:flex items-center justify-end gap-4 px-6" >
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
                <span>{currentProject?.name || 'Seleccionar proyecto'}</span>
                <ChevronDown className="size-4" />
              </button>

              {/* Dropdown Menu */}
              {projectMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
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

                    {/* Projects List */}
                    {projects && projects.length > 0 ? (
                      projects.map((project: Project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setProjectMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: '#f0f4ff' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {project.id === currentProject?.id && (
                            <div className="size-2 rounded-full" style={{ background: '#8C28FA' }} />
                          )}
                          {project.id !== currentProject?.id && <div className="size-2" />}
                          <span className="font-medium">{project.name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        No hay proyectos
                      </div>
                    )}

                    {/* Divider */}
                    <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* Create New Project */}
                    <button
                      onClick={() => {
                        setProjectMenuOpen(false);
                        setCreateModalOpen(true);
                      }}
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
                    {user?.fullName || 'Usuario'}
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
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </div>
              </button>
            </div>
          </header>
          )}

          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={(projectId) => {
            setSelectedProjectId(projectId);
            setCreateModalOpen(false);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
