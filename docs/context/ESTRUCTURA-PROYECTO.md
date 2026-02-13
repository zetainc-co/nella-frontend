# 📁 Estructura del Proyecto — Nella Revenue OS

**Mapa completo de carpetas y archivos con explicaciones**

---

## 🗂️ Vista General

```
nella-marketing-frontend/
├── 📱 app/                    # Next.js App Router
├── 🧩 components/             # Componentes React
├── 📚 docs/                   # Documentación
├── 🎣 hooks/                  # React Hooks personalizados
├── 🔧 lib/                    # Utilidades y clientes
├── 🏷️  types/                 # Tipos TypeScript
├── 🌐 public/                 # Archivos estáticos
├── ⚙️  Archivos de config      # Configuración del proyecto
└── 📄 Documentación raíz      # README, CLAUDE.md
```

---

## 📱 app/ — Next.js App Router

### Estructura de Rutas

```
app/
├── (auth)/                           # 🔐 Grupo de rutas de autenticación
│   └── login/
│       └── page.tsx                  # Página de login
│
├── (dashboard)/                      # 🏠 Grupo de rutas protegidas
│   ├── layout.tsx                    # Layout con sidebar + navbar
│   │
│   ├── dashboard/                    # 📊 Módulo Dashboard
│   │   └── page.tsx                  # Métricas y KPIs
│   │
│   ├── kanban/                       # 📋 Módulo Kanban
│   │   └── page.tsx                  # Vista de leads por etapa
│   │
│   ├── contacts/                     # 👥 Módulo Contactos
│   │   ├── page.tsx                  # Listado de contactos
│   │   └── [id]/
│   │       └── page.tsx              # Perfil individual
│   │
│   └── chat/                         # 💬 Módulo Chat
│       └── page.tsx                  # Conversaciones WhatsApp
│
├── api/                              # 🔌 API Routes (Server-side)
│   ├── leads/
│   │   └── route.ts                  # GET, POST /api/leads
│   │
│   ├── contacts/
│   │   └── route.ts                  # GET, POST /api/contacts
│   │
│   ├── metrics/
│   │   └── route.ts                  # GET /api/metrics
│   │
│   ├── chat/
│   │   └── route.ts                  # Proxy a Chatwoot API
│   │
│   └── webhooks/
│       └── n8n/
│           └── route.ts              # POST /api/webhooks/n8n
│
├── layout.tsx                        # Root layout (HTML, body)
├── page.tsx                          # Home page (/)
├── globals.css                       # Estilos globales
└── favicon.ico                       # Favicon
```

### Explicación de Grupos de Rutas

#### `(auth)/` — Rutas de Autenticación
- **Propósito:** Páginas públicas (login, registro, recuperar contraseña)
- **Layout:** Sin sidebar, diseño centrado
- **Protección:** No requiere autenticación

#### `(dashboard)/` — Rutas Protegidas
- **Propósito:** Todas las páginas del dashboard
- **Layout:** Con sidebar y navbar (definido en `layout.tsx`)
- **Protección:** Requiere autenticación (redirect a `/login` si no está autenticado)

---

## 🧩 components/ — Componentes React

```
components/
├── ui/                               # 🎨 shadcn/ui base components
│   ├── button.tsx                    # Botón base
│   ├── card.tsx                      # Tarjeta base
│   ├── dialog.tsx                    # Modal/diálogo
│   ├── input.tsx                     # Input de texto
│   ├── skeleton.tsx                  # Loading skeleton
│   ├── table.tsx                     # Tabla base
│   └── ...                           # Otros componentes de shadcn/ui
│
├── dashboard/                        # 📊 Componentes del Dashboard
│   ├── kpi-card.tsx                  # Tarjeta de KPI
│   ├── revenue-chart.tsx             # Gráfica de ingresos
│   ├── channel-distribution.tsx      # Distribución por canal
│   ├── conversion-funnel.tsx         # Embudo de conversión
│   └── recent-activity.tsx           # Actividad reciente
│
├── kanban/                           # 📋 Componentes del Kanban
│   ├── kanban-board.tsx              # Tablero completo (Client Component)
│   ├── kanban-column.tsx             # Columna individual
│   ├── lead-card.tsx                 # Tarjeta de lead
│   └── lead-detail-panel.tsx         # Panel lateral con detalles
│
├── contacts/                         # 👥 Componentes de Contactos
│   ├── contacts-table.tsx            # Tabla de contactos
│   ├── contact-filters.tsx           # Barra de filtros
│   ├── contact-profile.tsx           # Perfil completo del lead
│   ├── contact-form.tsx              # Formulario crear/editar
│   └── conversation-history.tsx      # Historial de mensajes
│
└── chat/                             # 💬 Componentes del Chat
    ├── chat-list.tsx                 # Lista de conversaciones
    ├── chat-message.tsx              # Burbuja de mensaje
    ├── chat-input.tsx                # Input para enviar mensajes
    └── chatwoot-iframe.tsx           # Iframe de Chatwoot (MVP)
```

### Convención de Componentes

- **Archivos:** `kebab-case.tsx`
- **Componentes:** `PascalCase`
- **Server Component:** Por defecto (sin `"use client"`)
- **Client Component:** Solo si usa hooks, eventos o estado

---

## 📚 docs/ — Documentación

```
docs/
├── 📖 Documentación Principal
│   ├── README.md                     # Índice de documentación
│   ├── GUIA-INICIO.md                # ⭐ Guía de inicio rápido
│   ├── arquitectura.md               # Arquitectura técnica
│   ├── modelo-datos.md               # Schema de base de datos
│   ├── quick-reference.md            # Referencia rápida
│   ├── code-examples.md              # Ejemplos de código
│   └── ESTRUCTURA-PROYECTO.md        # Este archivo
│
├── 📋 spec/                          # Especificaciones Funcionales
│   ├── spec.dashboard.md             # Módulo Dashboard
│   ├── spec.kanba.md                 # Módulo Kanban
│   ├── spec.contact.md               # Módulo Contactos
│   └── spec.chat.md                  # Módulo Chat
│
├── 🔄 flows-n8n/                     # Flujos de n8n (JSON)
│   ├── M1.A - Gateway.json
│   ├── M1.B - Worker.json
│   ├── M2 - Orquestador.json
│   ├── M2 - Sub-Module A_ The Profiler.json
│   ├── M2 - Sub-Module B_ The Strategist.json
│   ├── M2 - Sub-Module C_ The Mirror.json
│   ├── M3 - Delivery.json
│   └── M5 - Human Bridge.json
│
├── 📅 plans/                         # Planes de desarrollo
│   └── 2026-02-13-nella-mvp-scaffolding.md
│
├── 📊 reports/                       # Reportes y estrategias
│   ├── estrategia-01.md
│   ├── estrategia-02.md
│   └── reporte-nella-renueve-os.md
│
└── general.md                        # Información general
```

### Documentos Clave

| Documento | Cuándo leerlo |
|-----------|---------------|
| [`GUIA-INICIO.md`](GUIA-INICIO.md) | **Primer día** |
| [`arquitectura.md`](arquitectura.md) | Antes de implementar features |
| [`quick-reference.md`](quick-reference.md) | Durante el desarrollo |
| [`code-examples.md`](code-examples.md) | Al implementar componentes |
| [`spec/*.md`](spec/) | Antes de cada módulo |

---

## 🎣 hooks/ — React Hooks Personalizados

```
hooks/
├── useLeads.ts                       # React Query para leads
├── useMetrics.ts                     # React Query para métricas
└── useChat.ts                        # React Query para chat
```

### Convención de Hooks

- **Archivos:** `camelCase.ts` (con prefijo `use`)
- **Hooks:** `camelCase` (ej: `useLeads`)
- **Todos son Client-side:** Usan `"use client"`

---

## 🔧 lib/ — Utilidades y Clientes

```
lib/
├── db.ts                             # Cliente Supabase
├── chatwoot.ts                       # Wrapper API Chatwoot
└── auth.ts                           # Configuración NextAuth
```

### Propósito

- **db.ts:** Funciones para conectar con Supabase
- **chatwoot.ts:** Funciones para interactuar con Chatwoot API
- **auth.ts:** Configuración de NextAuth.js v5

---

## 🏷️ types/ — Tipos TypeScript

```
types/
└── index.ts                          # Tipos compartidos globalmente
```

### Tipos Principales

```typescript
// Tipos de dominio
interface Lead { ... }
interface Contact { ... }
interface Conversation { ... }
interface Deal { ... }

// Tipos de UI
interface KpiCardProps { ... }
interface FilterOptions { ... }
```

---

## 🌐 public/ — Archivos Estáticos

```
public/
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

### Uso

```typescript
// Acceder desde componentes
<Image src="/logo.png" alt="Logo" />
```

---

## ⚙️ Archivos de Configuración

```
nella-marketing-frontend/
├── package.json                      # Dependencias y scripts
├── package-lock.json                 # Lock de dependencias
├── tsconfig.json                     # Configuración TypeScript
├── next.config.ts                    # Configuración Next.js
├── postcss.config.mjs                # Configuración PostCSS
├── eslint.config.mjs                 # Configuración ESLint
├── tailwind.config.ts                # Configuración Tailwind CSS
├── next-env.d.ts                     # Tipos de Next.js
├── .env.local                        # Variables de entorno (no commitear)
├── .env.example                      # Plantilla de variables de entorno
├── .gitignore                        # Archivos ignorados por Git
└── .cursorignore                     # Archivos ignorados por Cursor
```

### Configuraciones Clave

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Alias para imports
    }
  }
}
```

#### `next.config.ts`
```typescript
// Configuración de Next.js
// - Redirects
// - Rewrites
// - Headers
// - Image domains
```

#### `.env.local` (no commitear)
```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CHATWOOT_API_KEY=...
NEXTAUTH_SECRET=...
```

---

## 📄 Documentación Raíz

```
nella-marketing-frontend/
├── README.md                         # ⭐ Visión general del proyecto
├── CLAUDE.md                         # ⭐⭐ Reglas de desarrollo
└── LICENSE                           # Licencia (si aplica)
```

### Documentos Esenciales

| Documento | Propósito |
|-----------|-----------|
| [`README.md`](../README.md) | Visión general, setup, estructura |
| [`CLAUDE.md`](../CLAUDE.md) | **Reglas y convenciones de desarrollo** |

---

## 🎯 Flujo de Archivos por Módulo

### Dashboard (`/dashboard`)

```
Ruta: app/(dashboard)/dashboard/page.tsx
├── Componentes:
│   ├── components/dashboard/kpi-card.tsx
│   ├── components/dashboard/revenue-chart.tsx
│   ├── components/dashboard/channel-distribution.tsx
│   └── components/dashboard/conversion-funnel.tsx
├── Hooks:
│   └── hooks/useMetrics.ts
├── API:
│   └── app/api/metrics/route.ts
└── Tipos:
    └── types/index.ts (interface Metric)
```

### Kanban (`/kanban`)

```
Ruta: app/(dashboard)/kanban/page.tsx
├── Componentes:
│   ├── components/kanban/kanban-board.tsx (Client Component)
│   ├── components/kanban/kanban-column.tsx
│   ├── components/kanban/lead-card.tsx
│   └── components/kanban/lead-detail-panel.tsx
├── Hooks:
│   └── hooks/useLeads.ts
├── API:
│   └── app/api/leads/route.ts
└── Tipos:
    └── types/index.ts (interface Lead, type LeadStage)
```

### Contactos (`/contacts`)

```
Rutas:
├── app/(dashboard)/contacts/page.tsx (listado)
└── app/(dashboard)/contacts/[id]/page.tsx (perfil)

Componentes:
├── components/contacts/contacts-table.tsx
├── components/contacts/contact-filters.tsx
├── components/contacts/contact-profile.tsx
├── components/contacts/contact-form.tsx
└── components/contacts/conversation-history.tsx

Hooks:
└── hooks/useLeads.ts

API:
├── app/api/contacts/route.ts (GET, POST)
└── app/api/contacts/[id]/route.ts (GET, PATCH, DELETE)

Tipos:
└── types/index.ts (interface Contact, Conversation)
```

### Chat (`/chat`)

```
Ruta: app/(dashboard)/chat/page.tsx
├── Componentes:
│   ├── components/chat/chatwoot-iframe.tsx (MVP)
│   ├── components/chat/chat-list.tsx (Fase 2)
│   ├── components/chat/chat-message.tsx (Fase 2)
│   └── components/chat/chat-input.tsx (Fase 2)
├── Hooks:
│   └── hooks/useChat.ts
├── API:
│   └── app/api/chat/route.ts (proxy a Chatwoot)
└── Lib:
    └── lib/chatwoot.ts
```

---

## 🔍 Cómo Encontrar Archivos

### Por Funcionalidad

| Quiero... | Archivo |
|-----------|---------|
| Ver la página de dashboard | `app/(dashboard)/dashboard/page.tsx` |
| Crear un componente de UI base | `components/ui/` |
| Agregar un hook personalizado | `hooks/` |
| Crear una API route | `app/api/` |
| Definir tipos TypeScript | `types/index.ts` |
| Configurar Supabase | `lib/db.ts` |
| Leer las reglas de código | `CLAUDE.md` |

### Por Módulo

| Módulo | Carpetas principales |
|--------|---------------------|
| Dashboard | `app/(dashboard)/dashboard/`, `components/dashboard/` |
| Kanban | `app/(dashboard)/kanban/`, `components/kanban/` |
| Contactos | `app/(dashboard)/contacts/`, `components/contacts/` |
| Chat | `app/(dashboard)/chat/`, `components/chat/` |

---

## 📊 Estadísticas del Proyecto

```
📁 Carpetas principales: 8
📄 Archivos de código: ~50-100 (estimado en MVP)
📚 Archivos de documentación: 15+
🧩 Componentes: ~30-40 (estimado en MVP)
🔌 API Routes: ~10-15
🎣 Hooks personalizados: ~5-10
```

---

## 🚀 Próximos Pasos

1. **Día 1:** Scaffold completo + autenticación
2. **Día 2:** Dashboard con componentes y API Routes
3. **Día 3:** Kanban con drag-and-drop
4. **Día 4:** Contactos con listado y perfil
5. **Día 5:** Chat (iframe) + deploy

---

## 🔗 Enlaces Relacionados

- **Guía de inicio:** [`GUIA-INICIO.md`](GUIA-INICIO.md)
- **Reglas de desarrollo:** [`../CLAUDE.md`](../CLAUDE.md)
- **Arquitectura:** [`arquitectura.md`](arquitectura.md)
- **Referencia rápida:** [`quick-reference.md`](quick-reference.md)

---

*Estructura del proyecto — Actualizar al agregar nuevas carpetas o archivos importantes.*

