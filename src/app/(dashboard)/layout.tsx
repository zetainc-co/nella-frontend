"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  CalendarDays,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Building,
  Workflow,
  Link as LinkIcon,
  CreditCard,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Contactos", href: "/contacts", icon: Users },
  { name: "Kanban", href: "/kanban", icon: Layers },
  { name: "Chat", href: "/chat", icon: MessageSquare },
];

type SettingsItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  adminOnly?: boolean;
  submenu?: { name: string; href: string }[];
};

const settingsSubmenu: SettingsItem[] = [
  { name: "Mi Perfil", href: "/configuracion/perfil", icon: User },
  { name: "Organización", href: "/configuracion/organizacion", icon: Building },
  //{ name: "Workflows", href: "/configuracion/workflows", icon: Workflow },
  { name: "Conexiones", href: "/configuracion/conexiones", icon: LinkIcon },
  { name: "Equipo y Permisos", href: "/configuracion/equipo", icon: Users },
  { name: "Facturación", href: "/configuracion/facturacion", icon: CreditCard },
  {
    name: "Administración",
    href: "/configuracion/administracion",
    icon: Shield,
    adminOnly: true,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Auto-expand if on configuracion route
    if (pathname.startsWith("/configuracion")) {
      setSettingsOpen(true);
    }
    // Check admin status
    const userRole = localStorage.getItem("user_role");
    setIsAdmin(userRole === "admin");
  }, [pathname]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nella <span className="text-primary">Pro</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Revenue OS</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/configuracion")
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="size-5" />
              Configuración
            </div>
            {settingsOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

          {/* Submenu */}
          {settingsOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
              {settingsSubmenu.map((item) => {
                if (item.adminOnly && !isAdmin) return null;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.name}
                      {item.adminOnly && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-mono">
                          ADMIN
                        </span>
                      )}
                    </Link>

                    {/* Nested submenu */}
                    {item.submenu && isActive && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subitem: any) => {
                          const subIsActive = pathname === subitem.href;
                          return (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                                subIsActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                            >
                              {subitem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive transition-all w-full text-left">
            <LogOut className="size-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
