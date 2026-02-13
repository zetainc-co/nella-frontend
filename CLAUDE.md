# Nella Revenue OS - Reglas de Desarrollo

**Proyecto:** Nella Marketing Frontend
**Stack:** Next.js 16 + TypeScript + Tailwind CSS 4 + Supabase + Chatwoot
**Fecha:** Febrero 2026

---

## 🎯 Principios Fundamentales

### 1. Arquitectura Next.js App Router
- **Server Components por defecto**: Todas las páginas y componentes deben ser Server Components a menos que requieran interactividad
- **Client Components solo cuando sea necesario**: Marcar con `"use client"` únicamente componentes que usen hooks, eventos o estado del navegador
- **No exponer credenciales**: Las API keys y secretos NUNCA deben llegar al navegador
- **API Routes como capa intermedia**: Todo acceso a servicios externos (n8n, Chatwoot, Supabase) pasa por `/app/api/*`

### 2. Flujo de Datos
```
n8n → PostgreSQL/Supabase → Next.js API Routes → Frontend
                    ↓
              Supabase Realtime (WebSocket)
                    ↓
              Client Components (actualizaciones en vivo)
```

### 3. Regla de Oro
> **n8n es la única fuente de verdad que escribe leads en la base de datos.**
> El frontend de Nella solo lee y visualiza. Las actualizaciones manuales del vendedor (mover un lead, editar perfil) escriben a través de las API Routes de Next.js.

---

## 📁 Estructura del Proyecto

```
nella-marketing-frontend/
├── app/
│   ├── (auth)/                    # Grupo de rutas de autenticación
│   │   └── login/page.tsx
│   ├── (dashboard)/               # Grupo de rutas protegidas
│   │   ├── layout.tsx             # Layout compartido con sidebar
│   │   ├── dashboard/page.tsx     # Métricas y KPIs
│   │   ├── kanban/page.tsx        # Vista de leads por etapa
│   │   ├── contacts/
│   │   │   ├── page.tsx           # Listado de contactos
│   │   │   └── [id]/page.tsx      # Perfil individual
│   │   └── chat/page.tsx          # Conversaciones WhatsApp
│   ├── api/                       # API Routes (Server-side)
│   │   ├── leads/route.ts
│   │   ├── contacts/route.ts
│   │   ├── metrics/route.ts
│   │   ├── chat/route.ts
│   │   └── webhooks/n8n/route.ts
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   └── globals.css                # Estilos globales
├── components/
│   ├── ui/                        # shadcn/ui base components
│   ├── dashboard/                 # Componentes del dashboard
│   ├── kanban/                    # Componentes del kanban
│   ├── contacts/                  # Componentes de contactos
│   └── chat/                      # Componentes del chat
├── lib/
│   ├── db.ts                      # Cliente Supabase
│   ├── chatwoot.ts                # Wrapper API Chatwoot
│   └── auth.ts                    # Configuración de autenticación
├── hooks/
│   ├── useLeads.ts                # React Query hooks
│   ├── useMetrics.ts
│   └── useChat.ts
├── types/
│   └── index.ts                   # Tipos TypeScript compartidos
└── docs/                          # Documentación técnica
    ├── arquitectura.md
    └── spec/                      # Especificaciones funcionales
```

---

## 🔧 Convenciones de Código

### Nomenclatura

#### Archivos y Carpetas
```typescript
// ✅ Correcto
components/dashboard/kpi-card.tsx
components/contacts/contacts-table.tsx
app/(dashboard)/contacts/page.tsx
lib/supabase-client.ts

// ❌ Incorrecto
components/dashboard/KPICard.tsx
components/contacts/ContactsTable.tsx
app/(dashboard)/Contacts/Page.tsx
lib/SupabaseClient.ts
```

#### Componentes
```typescript
// ✅ Correcto - PascalCase para componentes
export function KpiCard({ title, value }: KpiCardProps) {}
export default function DashboardPage() {}

// ❌ Incorrecto
export function kpiCard() {}
export default function dashboardPage() {}
```

#### Funciones y Variables
```typescript
// ✅ Correcto - camelCase
const fetchLeads = async () => {}
const totalLeads = 100
const isLoading = false

// ❌ Incorrecto
const FetchLeads = async () => {}
const TotalLeads = 100
const IsLoading = false
```

#### Tipos e Interfaces
```typescript
// ✅ Correcto - PascalCase con sufijo descriptivo
interface Lead {
  id: string
  name: string
  stage: LeadStage
}

type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

interface KpiCardProps {
  title: string
  value: number
}

// ❌ Incorrecto
interface lead {}
type leadStage = string
interface kpiCardProps {}
```

### Server vs Client Components

#### Server Components (por defecto)
```typescript
// app/(dashboard)/dashboard/page.tsx
// NO incluir "use client" - es Server Component por defecto

import { getMetrics } from '@/lib/db'

export default async function DashboardPage() {
  // Puedes hacer fetch directo en Server Components
  const metrics = await getMetrics()

  return (
    <div>
      <h1>Dashboard</h1>
      <MetricsDisplay data={metrics} />
    </div>
  )
}
```

#### Client Components (solo cuando sea necesario)
```typescript
// components/kanban/kanban-board.tsx
"use client" // ⚠️ Solo agregar si usa hooks, eventos o estado

import { useState } from 'react'
import { DndContext } from '@dnd-kit/core'

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads)

  // Lógica de drag-and-drop requiere interactividad
  return <DndContext>...</DndContext>
}
```

### API Routes

#### Estructura de una API Route
```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/db'

// GET /api/leads
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('client_id', 'xxx')

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validar con Zod aquí

    const supabase = createClient()
    const { data, error } = await supabase
      .from('contacts')
      .insert(body)

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
```

#### Manejo de Errores
```typescript
// ✅ Correcto - Manejo explícito de errores
try {
  const data = await fetchData()
  return NextResponse.json({ data })
} catch (error) {
  console.error('Error fetching data:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// ❌ Incorrecto - Sin manejo de errores
const data = await fetchData()
return NextResponse.json({ data })
```

---

## 🎨 Estilos y UI

### Tailwind CSS 4
```typescript
// ✅ Correcto - Clases de Tailwind ordenadas lógicamente
<div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">Total Leads</h2>
  <span className="text-2xl font-bold text-blue-600">{count}</span>
</div>

// ❌ Incorrecto - Clases desordenadas
<div className="p-4 text-gray-900 bg-white border-gray-200 shadow-sm flex rounded-lg border gap-4 items-center justify-between">
```

### shadcn/ui Components
```typescript
// ✅ Correcto - Importar desde @/components/ui
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function KpiCard({ title, value }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
```

### Responsive Design
```typescript
// ✅ Correcto - Mobile-first con breakpoints
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* KPI Cards */}
</div>

// Breakpoints de Tailwind:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

---

## 🔌 Integración con Supabase

### Cliente Supabase
```typescript
// lib/db.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Solo en server-side
  )
}
```

### Supabase Realtime
```typescript
// hooks/useLeads.ts
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/db'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    const supabase = createClient()

    // Suscripción a cambios en tiempo real
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        setLeads(prev => [...prev, payload.new as Lead])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contacts'
      }, (payload) => {
        setLeads(prev =>
          prev.map(lead =>
            lead.id === payload.new.id ? payload.new as Lead : lead
          )
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { leads }
}
```

---

## 📊 Gestión de Estado

### React Query (TanStack Query)
```typescript
// hooks/useLeads.ts
"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    }
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Lead> }) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update lead')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })
}
```

### Zustand (solo si es necesario)
```typescript
// lib/store.ts
import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}))
```

---

## 🔐 Autenticación

### NextAuth.js v5 (Auth.js)
```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validar credenciales contra Supabase
        const user = await validateUser(credentials)
        return user
      }
    })
  ]
})
```

### Protección de Rutas
```typescript
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

---

## 🧪 Testing (Fase 2)

### Tests Unitarios
```typescript
// components/dashboard/kpi-card.test.tsx
import { render, screen } from '@testing-library/react'
import { KpiCard } from './kpi-card'

describe('KpiCard', () => {
  it('renders title and value correctly', () => {
    render(<KpiCard title="Total Leads" value={150} />)
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })
})
```

---

## 📝 Comentarios y Documentación

### Comentarios en Código
```typescript
// ✅ Correcto - Comentarios útiles que explican el "por qué"
// Supabase Realtime requiere un canal único por suscripción
// para evitar memory leaks en hot-reload durante desarrollo
const channel = supabase.channel(`leads-${Date.now()}`)

// ❌ Incorrecto - Comentarios obvios que repiten el código
// Crear un canal
const channel = supabase.channel('leads')
```

### JSDoc para Funciones Complejas
```typescript
/**
 * Calcula la tasa de conversión entre etapas del embudo
 * @param leads - Array de leads con su etapa actual
 * @param fromStage - Etapa de origen
 * @param toStage - Etapa de destino
 * @returns Porcentaje de conversión (0-100)
 */
export function calculateConversionRate(
  leads: Lead[],
  fromStage: LeadStage,
  toStage: LeadStage
): number {
  const fromCount = leads.filter(l => l.stage === fromStage).length
  const toCount = leads.filter(l => l.stage === toStage).length
  return fromCount > 0 ? (toCount / fromCount) * 100 : 0
}
```

---

## 🚀 Performance

### Optimización de Imágenes
```typescript
// ✅ Correcto - Usar Next.js Image
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>

// ❌ Incorrecto - Usar <img> directamente
<img src="/avatar.jpg" alt="User avatar" />
```

### Loading States
```typescript
// ✅ Correcto - Skeleton loaders
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardLoading() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  )
}
```

### Suspense Boundaries
```typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react'
import { DashboardLoading } from './loading'

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
```

---

## 🐛 Debugging

### Logging
```typescript
// ✅ Correcto - Logs descriptivos con contexto
console.log('[useLeads] Fetching leads for client:', clientId)
console.error('[API] Failed to update lead:', { leadId, error })

// ❌ Incorrecto - Logs sin contexto
console.log('fetching')
console.error(error)
```

### Error Boundaries (Fase 2)
```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Algo salió mal</h2>
        <button onClick={reset}>Intentar de nuevo</button>
      </div>
    </div>
  )
}
```

---

## 🔒 Seguridad

### Variables de Entorno
```bash
# .env.local (NUNCA commitear)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx # Solo server-side
CHATWOOT_API_KEY=xxx # Solo server-side
NEXTAUTH_SECRET=xxx
```

### Validación de Datos
```typescript
// ✅ Correcto - Validar con Zod en API Routes
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  stage: z.enum(['new', 'contacted', 'proposal', 'closed'])
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = leadSchema.parse(body) // Lanza error si no es válido
  // ...
}
```

---

## 📦 Dependencias Clave

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "lucide-react": "^0.564.0",
    "@supabase/supabase-js": "^2.x",
    "@tanstack/react-query": "^5.x",
    "next-auth": "^5.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@dnd-kit/core": "^6.x",
    "recharts": "^2.x",
    "sonner": "^1.x"
  }
}
```

---

## 📚 Recursos de Referencia

### Documentación Técnica
- **Arquitectura**: [`docs/arquitectura.md`](docs/arquitectura.md) - Decisiones técnicas y flujo de datos
- **Especificaciones Funcionales**: [`docs/spec/`](docs/spec/)
  - [`spec.dashboard.md`](docs/spec/spec.dashboard.md) - Módulo de Dashboard
  - [`spec.kanba.md`](docs/spec/spec.kanba.md) - Módulo de Kanban
  - [`spec.contact.md`](docs/spec/spec.contact.md) - Módulo de Contactos
  - [`spec.chat.md`](docs/spec/spec.chat.md) - Módulo de Chat
- **Modelo de Datos**: [`docs/modelo-datos.md`](docs/modelo-datos.md)

### Stack Tecnológico
- [Next.js 14+ Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)

---

## ✅ Checklist de Desarrollo

### Antes de Crear un Componente
- [ ] ¿Es Server Component o Client Component?
- [ ] ¿Necesita acceso a datos? → API Route o fetch directo en Server Component
- [ ] ¿Necesita estado o interactividad? → Client Component con `"use client"`
- [ ] ¿Es reutilizable? → `components/` | ¿Es específico de un módulo? → `components/[modulo]/`

### Antes de Crear una API Route
- [ ] ¿Valida los datos de entrada con Zod?
- [ ] ¿Maneja errores correctamente?
- [ ] ¿Usa las credenciales server-side (no expuestas al cliente)?
- [ ] ¿Retorna respuestas consistentes (JSON con status codes)?

### Antes de Hacer Commit
- [ ] ¿El código compila sin errores? (`npm run build`)
- [ ] ¿Pasa el linter? (`npm run lint`)
- [ ] ¿Los nombres siguen las convenciones?
- [ ] ¿Los comentarios son útiles y no obvios?
- [ ] ¿Las variables de entorno están en `.env.local` y no en el código?

---

## 🎯 Plan de Entrega MVP (5 Días)

| Día | Entregable |
|-----|-----------|
| **Día 1** | Scaffold del proyecto, autenticación (NextAuth), layout con sidebar, conexión a Supabase |
| **Día 2** | Dashboard con métricas reales desde la DB + Supabase Realtime funcionando |
| **Día 3** | Kanban con drag-and-drop + actualización automática cuando n8n procesa un lead |
| **Día 4** | Contactos: listado paginado + perfil individual con datos reales |
| **Día 5** | Chat vía iframe Chatwoot + ajustes visuales + deploy en producción |

---

## 🚨 Deuda Técnica Conocida (MVP)

Estos puntos se resuelven en Fase 2:

- [ ] Chat usa iframe de Chatwoot (no UI propia)
- [ ] No hay panel de información del lead dentro del chat
- [ ] No hay tests unitarios ni E2E
- [ ] No hay rate limiting en API Routes
- [ ] No hay sistema de roles granular (solo Admin y Sales Agent)

---

*Documento vivo — Actualizar al cierre de cada día de desarrollo.*

