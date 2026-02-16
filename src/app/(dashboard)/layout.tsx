"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contactos', href: '/contacts', icon: Users },
  { name: 'Kanban', href: '/kanban', icon: Layers },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const handleOpenChatwoot = () => {
    const chatwootUrl = process.env.NEXT_PUBLIC_CHATWOOT_URL || 'http://localhost:3001'

    // Validate URL to prevent XSS
    try {
      const url = new URL(chatwootUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        console.error('Invalid Chatwoot URL protocol:', url.protocol)
        return
      }
    } catch (error) {
      console.error('Invalid Chatwoot URL:', error)
      return
    }

    // TODO: SSO Implementation
    // Cuando se implemente SSO con Chatwoot:
    // 1. Llamar a /api/chatwoot/auth para generar token SSO
    // 2. Agregar el token como query param: `${chatwootUrl}/app/login?sso_token=${token}`
    // 3. Documentación: https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup#identity-validation

    window.open(chatwootUrl, '_blank', 'noopener,noreferrer')
  }

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
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          {/* CRM Button */}
          <button
            onClick={handleOpenChatwoot}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all w-full text-left"
          >
            <ExternalLink className="size-5" />
            Ir al CRM
          </button>

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
