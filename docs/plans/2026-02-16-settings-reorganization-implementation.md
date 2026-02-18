# Settings Reorganization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize workflows module into a new Settings section with 8 submódulos following the approved design.

**Architecture:** Create a new `/configuracion` route group with a settings layout containing a sidebar submenu. Migrate existing workflows pages while maintaining functionality. Implement new mock pages (Profile, Organization, Team, Billing, Connections) using visual designs from reference images.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, React 19, shadcn/ui

---

## FASE 1: SETUP BASE

### Task 1: Create Settings Folder Structure

**Files:**
- Create: `src/app/(dashboard)/configuracion/layout.tsx`
- Create: `src/app/(dashboard)/configuracion/page.tsx`
- Create: `src/lib/mock-data/settings.ts`

**Step 1: Create configuracion folder**

```bash
mkdir -p src/app/\(dashboard\)/configuracion
```

Expected: Folder created successfully

**Step 2: Create mock data file**

```bash
mkdir -p src/lib/mock-data
touch src/lib/mock-data/settings.ts
```

Expected: File created

**Step 3: Write mock data**

File: `src/lib/mock-data/settings.ts`

```typescript
// src/lib/mock-data/settings.ts

export const mockUserProfile = {
  name: "Giovanny Gómez",
  email: "giovanny@nellasales.com",
  role: "Director Comercial",
  avatar: "GG",
  notifications: true,
  sounds: false
}

export const mockOrganization = {
  name: "NellaSales",
  nit: "900.123.456-7",
  industry: "Tecnología",
  phone: "+57 310 234 5678",
  address: "Calle 123 #45-67, Bogotá, Colombia"
}

export const mockConnections = [
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    description: "Conecta tu cuenta de WhatsApp Business para gestionar conversaciones",
    icon: "whatsapp",
    connected: true,
    phone: "+57 310 234 5678",
    token: "EAAbz....XYZ123",
    note: "La conexión con WhatsApp Business API requiere una cuenta verificada de Meta Business. Los mensajes se sincronizarán automáticamente con tu bandeja de entrada."
  },
  {
    id: "instagram",
    name: "Instagram Direct",
    description: "Gestiona mensajes directos desde tu cuenta de Instagram Business",
    icon: "instagram",
    connected: false
  },
  {
    id: "facebook",
    name: "Facebook Lead Ads & Costos",
    description: "Sincroniza tus formularios de clientes potenciales y calcula tu ROAS automáticamente",
    icon: "facebook",
    connected: false
  },
  {
    id: "calendar",
    name: "Sincronización de Agenda",
    description: "Permite que la IA verifique tu disponibilidad y agende citas en tiempo real",
    icon: "calendar",
    connected: false
  }
]

export const mockTeam = [
  {
    id: "1",
    name: "Giovanny Gómez",
    email: "giovanny@nellasales.com",
    role: "Administrador",
    status: "active",
    avatar: "GG"
  },
  {
    id: "2",
    name: "María García",
    email: "maria@nellasales.com",
    role: "Vendedor",
    status: "active",
    avatar: "MG"
  },
  {
    id: "3",
    name: "Carlos Méndez",
    email: "carlos@nellasales.com",
    role: "Vendedor",
    status: "pending",
    avatar: "CM"
  }
]

export const mockBilling = {
  plan: "Plan Profesional",
  price: 149000,
  currency: "COP",
  licenses: { used: 2, total: 5 },
  nextBilling: "2026-03-16",
  paymentMethod: {
    type: "visa",
    last4: "4242",
    expiresAt: "12/2027"
  }
}
```

**Step 4: Create redirect page**

File: `src/app/(dashboard)/configuracion/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/page.tsx
import { redirect } from 'next/navigation'

export default function ConfiguracionPage() {
  redirect('/configuracion/perfil')
}
```

**Step 5: Commit**

```bash
git add src/lib/mock-data/settings.ts src/app/\(dashboard\)/configuracion/page.tsx
git commit -m "feat(settings): add mock data and configuracion redirect page"
```

---

### Task 2: Create Settings Layout with Sidebar

**Files:**
- Create: `src/app/(dashboard)/configuracion/layout.tsx`

**Step 1: Create layout file**

```bash
touch src/app/\(dashboard\)/configuracion/layout.tsx
```

**Step 2: Write settings layout**

File: `src/app/(dashboard)/configuracion/layout.tsx`

```typescript
// src/app/(dashboard)/configuracion/layout.tsx
"use client"

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User,
  Building,
  Workflow,
  Link as LinkIcon,
  Users,
  CreditCard,
  Shield,
  ChevronRight
} from 'lucide-react'

const settingsNav = [
  { name: 'Mi Perfil', href: '/configuracion/perfil', icon: User },
  { name: 'Organización', href: '/configuracion/organizacion', icon: Building },
  {
    name: 'Workflows',
    href: '/configuracion/workflows',
    icon: Workflow,
    submenu: [{ name: 'Gestión', href: '/configuracion/workflows/gestion' }]
  },
  { name: 'Conexiones', href: '/configuracion/conexiones', icon: LinkIcon },
  { name: 'Equipo y Permisos', href: '/configuracion/equipo', icon: Users },
  { name: 'Facturación', href: '/configuracion/facturacion', icon: CreditCard },
  { name: 'Administración', href: '/configuracion/administracion', icon: Shield, adminOnly: true }
]

export default function ConfiguracionLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
                      const subIsActive = pathname === subitem.href
                      return (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                            subIsActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {subitem.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
```

**Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/layout.tsx
git commit -m "feat(settings): add configuracion layout with sidebar navigation"
```

---

## FASE 2: PÁGINAS MOCK

### Task 3: Create Mi Perfil Page

**Files:**
- Create: `src/app/(dashboard)/configuracion/perfil/page.tsx`

**Step 1: Create perfil folder and page**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/perfil
touch src/app/\(dashboard\)/configuracion/perfil/page.tsx
```

**Step 2: Write Mi Perfil page**

File: `src/app/(dashboard)/configuracion/perfil/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/perfil/page.tsx
"use client"

import { useState } from 'react'
import { mockUserProfile } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Volume2, Lock } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

export default function MiPerfilPage() {
  const [profile, setProfile] = useState(mockUserProfile)

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Foto de Perfil */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-4">Foto de Perfil</h2>

        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-2xl font-bold text-primary">
            {profile.avatar}
          </div>
          <div>
            <p className="text-sm text-white mb-1">Actualiza tu foto de perfil</p>
            <p className="text-xs text-gray-400">JPG, PNG o GIF. Máximo 2MB</p>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Información Personal</h2>
          <Button variant="outline" size="sm">Editar</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-400">Nombre Completo</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Correo Electrónico</Label>
            <Input
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Cargo / Rol</Label>
            <Input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Contraseña</Label>
            <div className="relative">
              <Input
                type="password"
                value="••••••••"
                disabled
                className="bg-black/20 border-primary/20 text-white"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferencias */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-6">Preferencias</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Notificaciones de escritorio</p>
                <p className="text-xs text-gray-400">Recibe alertas en tu navegador</p>
              </div>
            </div>
            <Switch
              checked={profile.notifications}
              onCheckedChange={(checked) => setProfile({ ...profile, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-white">Sonidos de chat</p>
                <p className="text-xs text-gray-400">Reproduce sonido al recibir mensajes</p>
              </div>
            </div>
            <Switch
              checked={profile.sounds}
              onCheckedChange={(checked) => setProfile({ ...profile, sounds: checked })}
            />
          </div>
        </div>
      </div>

      {/* Guardar */}
      <div className="flex justify-end">
        <Button className="bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
```

**Step 3: Verify page renders**

```bash
npm run dev
```

Navigate to: `http://localhost:3000/configuracion/perfil`
Expected: Page renders without errors

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/perfil/
git commit -m "feat(settings): add Mi Perfil page with mock data"
```

---

### Task 4: Create Organización Page

**Files:**
- Create: `src/app/(dashboard)/configuracion/organizacion/page.tsx`

**Step 1: Create organizacion folder and page**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/organizacion
touch src/app/\(dashboard\)/configuracion/organizacion/page.tsx
```

**Step 2: Write Organización page**

File: `src/app/(dashboard)/configuracion/organizacion/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/organizacion/page.tsx
"use client"

import { useState } from 'react'
import { mockOrganization } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HudCorners } from '@/components/ui/hud-corners'

export default function OrganizacionPage() {
  const [org, setOrg] = useState(mockOrganization)

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organización</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información de tu empresa
        </p>
      </div>

      {/* Datos de la Empresa */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-6">Datos de la Empresa</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Nombre de la Empresa</Label>
              <Input
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">NIT / ID Fiscal</Label>
              <Input
                value={org.nit}
                onChange={(e) => setOrg({ ...org, nit: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Industria</Label>
              <Select value={org.industry} onValueChange={(value) => setOrg({ ...org, industry: value })}>
                <SelectTrigger className="bg-black/20 border-primary/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Manufactura">Manufactura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Teléfono</Label>
              <Input
                value={org.phone}
                onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Dirección</Label>
            <Input
              value={org.address}
              onChange={(e) => setOrg({ ...org, address: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/organizacion/
git commit -m "feat(settings): add Organización page with company data form"
```

---

### Task 5: Create Equipo y Permisos Page

**Files:**
- Create: `src/app/(dashboard)/configuracion/equipo/page.tsx`

**Step 1: Create equipo folder and page**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/equipo
touch src/app/\(dashboard\)/configuracion/equipo/page.tsx
```

**Step 2: Write Equipo page**

File: `src/app/(dashboard)/configuracion/equipo/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/equipo/page.tsx
"use client"

import { mockTeam, mockBilling } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { UserPlus, Trash2 } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

export default function EquipoPage() {
  const licensePercentage = (mockBilling.licenses.used / mockBilling.licenses.total) * 100

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipo y Permisos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona quién tiene acceso a tus chats y leads
        </p>
      </div>

      {/* Licencias Usadas */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-4">Licencias Usadas</h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Estás usando <span className="text-white font-semibold">{mockBilling.licenses.used}</span> de{' '}
            <span className="text-white font-semibold">{mockBilling.licenses.total}</span> licencias disponibles
          </p>

          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-[#9EFF00] transition-all"
              style={{ width: `${licensePercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{mockBilling.licenses.used}/{mockBilling.licenses.total}</span>
            <span>{licensePercentage.toFixed(0)}% usado</span>
          </div>
        </div>
      </div>

      {/* Miembros del Equipo */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Miembros del Equipo</h2>
          <Button className="gap-2 bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
            <UserPlus className="h-4 w-4" />
            Invitar Miembro
          </Button>
        </div>

        <div className="space-y-4">
          {mockTeam.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-black/20 hover:bg-black/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-bold text-primary">
                  {member.avatar}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs font-medium text-primary">{member.role}</span>
                </div>

                <div className="flex items-center gap-2">
                  {member.status === 'active' ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-500">Activo</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-xs text-yellow-500">Pendiente</span>
                    </>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/equipo/
git commit -m "feat(settings): add Equipo y Permisos page with team members list"
```

---

### Task 6: Create Facturación Page

**Files:**
- Create: `src/app/(dashboard)/configuracion/facturacion/page.tsx`

**Step 1: Create facturacion folder and page**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/facturacion
touch src/app/\(dashboard\)/configuracion/facturacion/page.tsx
```

**Step 2: Write Facturación page**

File: `src/app/(dashboard)/configuracion/facturacion/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/facturacion/page.tsx
"use client"

import { mockBilling } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { CreditCard } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

export default function FacturacionPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu plan y métodos de pago
        </p>
      </div>

      {/* Plan Actual */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Plan Actual</h2>
          <div className="px-3 py-1 rounded-lg bg-[#9EFF00]/10 border border-[#9EFF00]/30">
            <span className="text-sm font-semibold text-[#9EFF00]">{mockBilling.plan}</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6">Tu suscripción activa</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Precio Mensual</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(mockBilling.price)}</p>
            <p className="text-xs text-gray-400">{mockBilling.currency}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">Licencias Incluidas</p>
            <p className="text-2xl font-bold text-white">{mockBilling.licenses.total}</p>
            <p className="text-xs text-gray-400">usuarios</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-gray-400">Próxima Factura</p>
            <p className="text-2xl font-bold text-white">{formatDate(mockBilling.nextBilling)}</p>
            <p className="text-xs text-gray-400">2026</p>
          </div>
        </div>

        <Button variant="outline">Cambiar Plan</Button>
      </div>

      {/* Método de Pago */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-6">Método de Pago</h2>

        <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-black/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <CreditCard className="h-6 w-6 text-blue-500" />
            </div>

            <div>
              <p className="text-sm font-medium text-white flex items-center gap-2">
                <span className="uppercase text-xs font-bold">{mockBilling.paymentMethod.type}</span>
                <span className="text-gray-400">•••• •••• •••• {mockBilling.paymentMethod.last4}</span>
              </p>
              <p className="text-xs text-gray-400">Vence {mockBilling.paymentMethod.expiresAt}</p>
            </div>
          </div>

          <Button variant="outline" size="sm">Actualizar</Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/facturacion/
git commit -m "feat(settings): add Facturación page with billing info"
```

---

## FASE 3: MIGRACIÓN DE WORKFLOWS

### Task 7: Copy Workflows to Configuracion

**Files:**
- Copy: `src/app/(dashboard)/workflows/page.tsx` → `src/app/(dashboard)/configuracion/workflows/page.tsx`

**Step 1: Create workflows folder**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/workflows
```

**Step 2: Copy workflows page**

```bash
cp src/app/\(dashboard\)/workflows/page.tsx src/app/\(dashboard\)/configuracion/workflows/page.tsx
```

**Step 3: Update links in workflows page**

File: `src/app/(dashboard)/configuracion/workflows/page.tsx`

Find and replace all instances:
- `/workflows/gestion` → `/configuracion/workflows/gestion`
- `/workflows/credenciales` → `/configuracion/conexiones`
- `/workflows/administracion` → `/configuracion/administracion`

**Step 4: Verify page works**

```bash
npm run dev
```

Navigate to: `http://localhost:3000/configuracion/workflows`
Expected: Page renders correctly with updated links

**Step 5: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/workflows/page.tsx
git commit -m "feat(settings): copy workflows page to configuracion"
```

---

### Task 8: Copy Workflows Gestión

**Files:**
- Copy: `src/app/(dashboard)/workflows/gestion/page.tsx` → `src/app/(dashboard)/configuracion/workflows/gestion/page.tsx`

**Step 1: Create gestion folder**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/workflows/gestion
```

**Step 2: Copy gestion page**

```bash
cp src/app/\(dashboard\)/workflows/gestion/page.tsx src/app/\(dashboard\)/configuracion/workflows/gestion/page.tsx
```

**Step 3: Update any internal links if needed**

Review file for any links pointing to `/workflows` and update to `/configuracion/workflows`

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/workflows/gestion/
git commit -m "feat(settings): copy workflows gestion to configuracion"
```

---

### Task 9: Create Conexiones Page (from Credenciales)

**Files:**
- Create: `src/app/(dashboard)/configuracion/conexiones/page.tsx`

**Step 1: Create conexiones folder**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/conexiones
touch src/app/\(dashboard\)/configuracion/conexiones/page.tsx
```

**Step 2: Write Conexiones page**

File: `src/app/(dashboard)/configuracion/conexiones/page.tsx`

```typescript
// src/app/(dashboard)/configuracion/conexiones/page.tsx
"use client"

import { mockConnections } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { MessageCircle, Instagram, Facebook, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

const iconMap = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  calendar: Calendar
}

const colorMap = {
  whatsapp: 'text-green-500 bg-green-500/10 border-green-500/20',
  instagram: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  facebook: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  calendar: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
}

export default function ConexionesPage() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conexiones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tus integraciones con canales de comunicación
        </p>
      </div>

      {/* Connections */}
      <div className="space-y-4">
        {mockConnections.map((connection) => {
          const Icon = iconMap[connection.icon as keyof typeof iconMap]
          const colorClass = colorMap[connection.icon as keyof typeof colorMap]

          return (
            <div
              key={connection.id}
              className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm"
            >
              <HudCorners />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{connection.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{connection.description}</p>
                  </div>
                </div>
              </div>

              {connection.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Conectado</span>
                  </div>

                  {connection.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>📱</span>
                      <span>{connection.phone}</span>
                    </div>
                  )}

                  {connection.token && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>🔑</span>
                      <span>Token: {connection.token}</span>
                    </div>
                  )}

                  {connection.note && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs text-gray-400"><span className="font-semibold text-blue-400">Nota:</span> {connection.note}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">Editar Token</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">No conectado</span>
                  </div>

                  <Button className="bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
                    {connection.id === 'calendar' ? 'Conectar con Google' : 'Conectar'}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/conexiones/
git commit -m "feat(settings): add Conexiones page with integrations cards"
```

---

### Task 10: Copy Administración

**Files:**
- Copy: `src/app/(dashboard)/workflows/administracion/page.tsx` → `src/app/(dashboard)/configuracion/administracion/page.tsx`

**Step 1: Create administracion folder**

```bash
mkdir -p src/app/\(dashboard\)/configuracion/administracion
```

**Step 2: Copy administracion page**

```bash
cp src/app/\(dashboard\)/workflows/administracion/page.tsx src/app/\(dashboard\)/configuracion/administracion/page.tsx
```

**Step 3: Update any internal links if needed**

Review file for links and update as necessary

**Step 4: Commit**

```bash
git add src/app/\(dashboard\)/configuracion/administracion/
git commit -m "feat(settings): copy administracion page to configuracion"
```

---

## FASE 4: NAVEGACIÓN

### Task 11: Update Dashboard Layout

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

**Step 1: Read current layout**

```bash
cat src/app/\(dashboard\)/layout.tsx
```

**Step 2: Update navigation arrays**

File: `src/app/(dashboard)/layout.tsx`

Remove the `workflowsSubmenu` array and the workflows section from navigation.

Update the footer section to make Configuración expandable:

```diff
- const workflowsSubmenu = [
-   { name: 'Panel de Control', href: '/workflows' },
-   { name: 'Gestión', href: '/workflows/gestion' },
-   { name: 'Credenciales', href: '/workflows/credenciales' },
-   { name: 'Administración', href: '/workflows/administracion', adminOnly: true },
- ]

+ const settingsSubmenu = [
+   { name: 'Mi Perfil', href: '/configuracion/perfil', icon: User },
+   { name: 'Organización', href: '/configuracion/organizacion', icon: Building },
+   {
+     name: 'Workflows',
+     href: '/configuracion/workflows',
+     icon: Workflow,
+     submenu: [
+       { name: 'Gestión', href: '/configuracion/workflows/gestion' }
+     ]
+   },
+   { name: 'Conexiones', href: '/configuracion/conexiones', icon: Link },
+   { name: 'Equipo y Permisos', href: '/configuracion/equipo', icon: Users },
+   { name: 'Facturación', href: '/configuracion/facturacion', icon: CreditCard },
+   { name: 'Administración', href: '/configuracion/administracion', icon: Shield, adminOnly: true },
+ ]
```

**Step 3: Add required imports**

```typescript
import {
  LayoutDashboard,
  Users,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Building,
  Workflow,
  Link,
  CreditCard,
  Shield,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
```

**Step 4: Update footer section**

Replace the settings button with an expandable submenu similar to the workflows section.

Add state for settings menu:

```typescript
const [settingsOpen, setSettingsOpen] = useState(false)
```

Auto-expand on settings routes:

```typescript
useEffect(() => {
  if (pathname.startsWith('/configuracion')) {
    setSettingsOpen(true)
  }
  // ... existing code
}, [pathname])
```

Update footer JSX:

```tsx
<div className="p-4 border-t border-border space-y-1">
  <button
    onClick={() => setSettingsOpen(!settingsOpen)}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      pathname.startsWith('/configuracion')
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
        if (item.adminOnly && !isAdmin) return null

        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon

        return (
          <div key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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

            {/* Nested submenu for Workflows */}
            {item.submenu && isActive && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((subitem) => {
                  const subIsActive = pathname === subitem.href
                  return (
                    <Link
                      key={subitem.name}
                      href={subitem.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                        subIsActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {subitem.name}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )}

  <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-destructive transition-all w-full text-left">
    <LogOut className="size-5" />
    Cerrar Sesión
  </button>
</div>
```

**Step 5: Remove old workflows section**

Remove the entire workflows button and submenu section from the nav (around lines 83-133 in the original file)

**Step 6: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 7: Test navigation**

```bash
npm run dev
```

Navigate through all settings pages and verify navigation works

**Step 8: Commit**

```bash
git add src/app/\(dashboard\)/layout.tsx
git commit -m "feat(settings): update dashboard layout with configuracion submenu"
```

---

## FASE 5: LIMPIEZA

### Task 12: Remove Old Workflows Folder

**Files:**
- Delete: `src/app/(dashboard)/workflows/`

**Step 1: Verify configuracion works**

Test all routes in `/configuracion/*` to ensure everything works correctly

**Step 2: Search for broken links**

```bash
grep -r "href=\"/workflows" src/
```

Expected: No results (or only in backup file if it exists)

**Step 3: Delete old workflows folder**

```bash
rm -rf src/app/\(dashboard\)/workflows/
```

**Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(settings): remove old workflows folder after migration"
```

---

### Task 13: Final Verification

**Step 1: Test all routes**

Visit each route and verify it works:
- `/configuracion/perfil` ✓
- `/configuracion/organizacion` ✓
- `/configuracion/workflows` ✓
- `/configuracion/workflows/gestion` ✓
- `/configuracion/conexiones` ✓
- `/configuracion/equipo` ✓
- `/configuracion/facturacion` ✓
- `/configuracion/administracion` ✓ (if admin)

**Step 2: Test navigation**

- Click through all settings submenu items
- Verify active states highlight correctly
- Verify auto-expansion works when navigating to `/configuracion/*`
- Verify workflows submenu expands when on workflows pages

**Step 3: Test responsive**

Open DevTools and test:
- Desktop (1920px) ✓
- Tablet (768px) ✓
- Mobile (375px) ✓

**Step 4: Check for console errors**

```bash
npm run dev
```

Open browser console and navigate through all pages
Expected: No errors

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(settings): complete settings reorganization with all submódulos"
```

---

## SUCCESS CRITERIA

✅ All 8 settings submódulos are accessible
✅ Workflows functionality is preserved
✅ Navigation auto-expands on settings routes
✅ Admin-only pages show ADMIN badge
✅ No TypeScript errors
✅ No console errors
✅ Build succeeds
✅ Responsive works on all viewports
✅ All mock data displays correctly

---

## ESTIMATED TIME

- Fase 1 (Setup): 20 min
- Fase 2 (Mock Pages): 40 min
- Fase 3 (Migration): 30 min
- Fase 4 (Navigation): 20 min
- Fase 5 (Cleanup): 10 min

**Total: ~2 hours**

---

## NOTES

- NO implementar APIs, solo frontend con mock data
- NO modificar lógica de workflows existente (`src/lib/workflows/*`)
- Mantener estilos consistentes con diseños de referencia
- Usar componentes de shadcn/ui donde sea posible
- Commits frecuentes después de cada tarea completada
