"use client"

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  Workflow,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contactos', href: '/contacts', icon: Users },
  { name: 'Kanban', href: '/kanban', icon: Layers },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
]

const workflowsSubmenu = [
  { name: 'Panel de Control', href: '/workflows' },
  { name: 'Gestión', href: '/workflows/gestion' },
  { name: 'Credenciales', href: '/workflows/credenciales' },
  { name: 'Administración', href: '/workflows/administracion', adminOnly: true },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [workflowsOpen, setWorkflowsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Auto-expand if on workflows route
    if (pathname.startsWith('/workflows')) {
      setWorkflowsOpen(true)
    }
    // Check admin status
    const userRole = localStorage.getItem('user_role')
    setIsAdmin(userRole === 'admin')
  }, [pathname])

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
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon className="size-5" />
                {item.name}
              </Link>
            )
          })}

          {/* Workflows with Submenu */}
          <div>
            <button
              onClick={() => setWorkflowsOpen(!workflowsOpen)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname.startsWith('/workflows')
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Workflow className="size-5" />
                Workflows
              </div>
              {workflowsOpen ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>

            {/* Submenu */}
            {workflowsOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                {workflowsSubmenu.map((item) => {
                  // Skip admin-only items if not admin
                  if (item.adminOnly && !isAdmin) return null

                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {item.name}
                      {item.adminOnly && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-mono">
                          ADMIN
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full text-left">
            <Settings className="size-5" />
            Configuración
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive transition-all w-full text-left">
            <LogOut className="size-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
