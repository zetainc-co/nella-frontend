// src/app/(dashboard)/configuracion/layout.tsx
"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building,
  //Workflow,
  Link as LinkIcon,
  Users,
  CreditCard,
  Shield,
  ChevronRight,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  adminOnly?: boolean;
  submenu?: { name: string; href: string }[];
};

const settingsNav: NavItem[] = [
  { name: "Mi Perfil", href: "/configuracion/perfil", icon: User },
  { name: "Organización", href: "/configuracion/organizacion", icon: Building },
  //{
  //name: 'Workflows',
  //href: '/configuracion/workflows',
  //icon: Workflow,
  //submenu: [{ name: 'Gestión', href: '/configuracion/workflows/gestion' }]
  //},
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

export default function ConfiguracionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <aside className="w-[260px] border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Configuración</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administra tu cuenta y preferencias
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {settingsNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {item.name}
                  {item.adminOnly && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-mono border border-yellow-500/30">
                      ADMIN
                    </span>
                  )}
                  {item.submenu && <ChevronRight className="size-4 ml-auto" />}
                </Link>

                {/* Submenu */}
                {item.submenu && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.submenu.map((subitem) => {
                      const subIsActive = pathname === subitem.href;
                      return (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
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
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
