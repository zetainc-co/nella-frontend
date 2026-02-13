# Nella Revenue OS — Arquitectura MVP en Next.js
**Fecha:** Febrero 2026 | **Stack:** Next.js 14 + Supabase + Chatwoot | **Horizonte:** MVP operativo

---

## 1. Visión General

El MVP de Nella se construye sobre **Next.js 14 con App Router**, aprovechando Server Components para rendimiento máximo y Client Components solo donde hay interactividad real (kanban, chat en vivo). La conexión con la infraestructura existente (n8n + Supabase + Chatwoot) se hace a través de API Routes que actúan como capa intermediaria segura.

**Principio rector:** El frontend no habla directamente con n8n ni con Chatwoot desde el navegador. Todo pasa por las API Routes de Next.js, manteniendo las credenciales en el servidor.

---

## 2. Estructura de Carpetas

```
nella-mvp/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Sidebar + navbar compartidos
│   │   ├── dashboard/page.tsx          # Métricas y gráficas
│   │   ├── kanban/page.tsx             # Vista de leads por etapa
│   │   ├── contacts/
│   │   │   ├── page.tsx                # Listado de contactos
│   │   │   └── [id]/page.tsx           # Perfil individual del lead
│   │   └── chat/page.tsx               # Conversaciones WhatsApp
│   └── api/
│       ├── leads/route.ts              # CRUD de leads
│       ├── contacts/route.ts           # CRUD de contactos
│       ├── metrics/route.ts            # Datos para el dashboard
│       ├── chat/route.ts               # Proxy hacia Chatwoot API
│       └── webhooks/
│           └── n8n/route.ts            # Recibe eventos de n8n en tiempo real
├── components/
│   ├── ui/                             # Shadcn/ui base components
│   ├── dashboard/                      # Gráficas, KPI cards
│   ├── kanban/                         # Board, cards de leads
│   ├── contacts/                       # Tabla, perfil, formulario
│   └── chat/                           # Vista de conversaciones
├── lib/
│   ├── db.ts                           # Cliente Supabase / PostgreSQL
│   ├── chatwoot.ts                     # Wrapper de la API de Chatwoot
│   └── auth.ts                         # NextAuth o similar
└── hooks/
    ├── useLeads.ts                     # React Query hooks
    ├── useMetrics.ts
    └── useChat.ts
```

---

## 3. Decisiones Técnicas Clave

### 3.1 App Router + Server Components
Las páginas de dashboard, kanban y contactos renderizan datos directamente en el servidor. Esto significa:
- Carga inicial más rápida (menos JavaScript en el cliente)
- Las credenciales de base de datos nunca se exponen al navegador
- Solo los componentes que necesitan interactividad (drag-and-drop del kanban, chat en vivo) se marcan como `"use client"`

### 3.2 Conexión con Supabase / PostgreSQL

Dos patrones según el contexto:

| Contexto | Patrón | Motivo |
|----------|--------|--------|
| Server Components | Consulta directa a Supabase server-side | Sin exposición de credenciales |
| Client Components | Llamada a `/api/*` de Next.js | Capa de seguridad intermedia |
| Tiempo real | Supabase Realtime (WebSocket) | Actualizaciones automáticas sin polling |

### 3.3 Tiempo Real — El Punto Más Crítico

Para que el dashboard y el kanban se actualicen automáticamente cuando n8n procesa un nuevo lead, se evalúan dos estrategias:

**Opción A — Supabase Realtime (recomendada para MVP)**
Supabase escucha cambios en PostgreSQL y los emite vía WebSocket directamente al frontend. Implementación mínima, lista en horas.

```typescript
// Ejemplo: suscripción a nuevos leads en tiempo real
const channel = supabase
  .channel('leads-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'contacts'
  }, (payload) => {
    // Actualizar el estado local con el nuevo lead
    setLeads(prev => [...prev, payload.new])
  })
  .subscribe()
```

**Opción B — Webhook n8n → API Route → SSE (Fase 2)**
n8n hace POST a `/api/webhooks/n8n` cada vez que procesa un lead. Next.js emite el evento al cliente vía Server-Sent Events. Más control y granularidad, recomendado cuando el volumen de clientes crezca.

**Decisión para el MVP:** Supabase Realtime. Migrar a Webhooks + SSE en Fase 2.

### 3.4 Chat — Estrategia de Integración

La sección de chat es la más compleja porque Chatwoot vive en un servidor separado. Dos opciones:

| Opción | Implementación | Tiempo estimado | Recomendación |
|--------|---------------|-----------------|---------------|
| **Iframe embebido** | Insertar el panel de Chatwoot dentro del layout de Nella | 2-4 horas | ✅ MVP |
| **API Proxy propio** | Wrapper en `/api/chat` que consume la API de Chatwoot y renderiza UI propia | 2-3 días | Fase 2 |

**Decisión para el MVP:** Iframe de Chatwoot embebido con estilos que lo integren visualmente al layout de Nella. Migrar a UI propia en Fase 2.

---

## 4. Stack de Librerías

| Categoría | Librería | Motivo |
|-----------|----------|--------|
| UI Components | shadcn/ui + Tailwind CSS | Componentes accesibles, totalmente customizables, sin overhead |
| Gráficas | Recharts | Liviano, fácil de customizar, bien documentado |
| Kanban | @dnd-kit/core | Más moderno y accesible que react-beautiful-dnd |
| Data fetching | TanStack Query (React Query) | Caché, revalidación automática, manejo de estados de carga |
| Autenticación | NextAuth.js v5 (Auth.js) | Integración nativa con Next.js App Router |
| DB Client | Supabase JS Client | Conecta con PostgreSQL existente + Realtime incluido |
| Formularios | React Hook Form + Zod | Validación tipada en cliente y servidor |
| Estado global | Zustand | Solo si se necesita — minimal y sin boilerplate |

---

## 5. Flujo de Datos

```
n8n (procesa lead de WhatsApp)
        │
        ▼
PostgreSQL / Supabase  ◄─────────────────────────┐
        │                                         │
        ├── Supabase Realtime (WebSocket)          │
        │         │                               │
        │         ▼                               │
        │   Next.js Frontend                      │
        │   Dashboard / Kanban                    │
        │   (se actualiza automáticamente)         │
        │                                         │
        └── API Routes (/api/*)                   │
                  │                               │
                  ▼                               │
          Server Components                       │
          (render inicial SSR)                    │
                                                  │
Chatwoot ◄──── /api/chat (proxy) ────────────────┘
(conversaciones WhatsApp)
```

**Regla:** n8n es la única fuente de verdad que escribe en la base de datos. El frontend de Nella solo lee y visualiza. Las actualizaciones manuales del vendedor (mover un lead en el kanban, editar un perfil) escriben a través de las API Routes de Next.js, nunca directamente a la DB.

---

## 6. Las Cuatro Secciones del MVP

### 6.1 Dashboard
- **Tipo de render:** Server Component (datos estáticos al cargar) + Supabase Realtime (actualizaciones en vivo)
- **Datos:** Total de leads, leads activos, ingresos por mes, canales de origen (Meta/Instagram/TikTok), embudo de conversión
- **Componentes clave:** KPI Cards, LineChart (Recharts), FunnelChart, SourcePieChart

### 6.2 Kanban
- **Tipo de render:** Client Component (requiere drag-and-drop)
- **Columnas:** Nuevo → Contactado → En Propuesta → Cierre
- **Comportamiento:** La IA mueve las tarjetas automáticamente vía Supabase Realtime. El vendedor puede moverlas manualmente con drag-and-drop.
- **Cada tarjeta muestra:** Nombre, canal de origen, resumen IA de la conversación, tiempo en etapa

### 6.3 Contactos
- **Tipo de render:** Server Component (listado) + Client Component (perfil con edición)
- **Listado:** Tabla paginada con búsqueda y filtros por etapa/canal
- **Perfil individual (`/contacts/[id]`):** Nombre, empresa, rol, datos de contacto, historial de conversación, resumen IA, etapa actual

### 6.4 Chat
- **MVP:** Iframe de Chatwoot embebido
- **Fase 2:** UI propia consumiendo API de Chatwoot vía proxy
- **Funcionalidad clave:** El vendedor puede intervenir en cualquier conversación que la IA esté manejando, tomando control sin romper el flujo

---

## 7. Plan de Entrega — 5 Días

| Día | Entregable |
|-----|-----------|
| **Día 1** | Scaffold del proyecto, autenticación (NextAuth), layout con sidebar, conexión a Supabase |
| **Día 2** | Dashboard con métricas reales desde la DB + Supabase Realtime funcionando |
| **Día 3** | Kanban con drag-and-drop + actualización automática cuando n8n procesa un lead |
| **Día 4** | Contactos: listado paginado + perfil individual con datos reales |
| **Día 5** | Chat vía iframe Chatwoot + ajustes visuales + deploy en producción |

---

## 8. Consideraciones de Escalabilidad

Aunque es un MVP, estas decisiones garantizan que el sistema aguante el crecimiento:

- **Multi-tenant desde el inicio:** El schema de base de datos debe incluir un campo `client_id` en todas las tablas desde el día uno. Agregar multi-tenancy después es costoso.
- **Variables de entorno por cliente:** Cada cliente tiene sus propias credenciales de Meta API y Chatwoot. El sistema debe soportar múltiples configuraciones.
- **Rate limiting en API Routes:** Proteger los endpoints contra abuso, especialmente el webhook de n8n que recibirá tráfico constante.
- **Deploy recomendado:** Vercel para Next.js (escalado automático) + Supabase Cloud o instancia propia con Easypanel/Docker para la DB.

---

## 9. Próximos Pasos Inmediatos

1. **Revisar el schema actual de Supabase** que está alimentando n8n — asegurarse de que las tablas `contacts`, `conversations` e `inbox_queue` tienen todos los campos que el frontend necesita.
2. **Definir el contrato de datos** entre n8n y el MVP: qué campos escribe n8n, qué campos lee y escribe el frontend.
3. **Arrancar el scaffold** con `create-next-app` + shadcn/ui + Supabase client configurado.
4. **Decisión pendiente:** Evaluar si el agente de Sebastián (proyecto Link Legal) reemplaza o complementa el agente actual de n8n antes de construir la capa de datos del frontend.

---

*Documento técnico interno — Equipo Nella | Actualizar al cierre de cada día de desarrollo.*
