# Nella Revenue OS — Frontend

**Stack:** Next.js 16 + TypeScript + Tailwind CSS 4 + Supabase + Chatwoot
**Fecha:** Febrero 2026
**Estado:** MVP en desarrollo

---

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Desarrollo

```bash
# Levantar servidor de desarrollo
npm run dev
```

**Acceso:** http://localhost:3000

### Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

---

## 📋 Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | Next.js | 16.1.6 |
| **UI** | React | 19.2.3 |
| **Lenguaje** | TypeScript | 5.x |
| **Estilos** | Tailwind CSS | 4.x |
| **Componentes** | shadcn/ui | Latest |
| **Base de Datos** | Supabase (PostgreSQL) | Latest |
| **Chat** | Chatwoot | Latest |
| **Estado** | Zustand + TanStack Query | Latest |
| **Autenticación** | NextAuth.js v5 | Latest |
| **Formularios** | React Hook Form + Zod | Latest |
| **Drag & Drop** | @dnd-kit/core | Latest |
| **Gráficas** | Recharts | Latest |
| **Iconos** | Lucide React | 0.564.0 |

---

## 📁 Estructura del Proyecto

```
nella-marketing-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   └── login/page.tsx
│   ├── (dashboard)/              # Rutas protegidas del dashboard
│   │   ├── layout.tsx            # Layout con sidebar
│   │   ├── dashboard/page.tsx    # Métricas y KPIs
│   │   ├── kanban/page.tsx       # Vista de leads por etapa
│   │   ├── contacts/             # Gestión de contactos
│   │   │   ├── page.tsx          # Listado
│   │   │   └── [id]/page.tsx     # Perfil individual
│   │   └── chat/page.tsx         # Conversaciones WhatsApp
│   ├── api/                      # API Routes (Server-side)
│   │   ├── leads/route.ts
│   │   ├── contacts/route.ts
│   │   ├── metrics/route.ts
│   │   ├── chat/route.ts
│   │   └── webhooks/n8n/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Estilos globales
├── components/                   # Componentes React
│   ├── ui/                       # shadcn/ui base
│   ├── dashboard/                # Componentes del dashboard
│   ├── kanban/                   # Componentes del kanban
│   ├── contacts/                 # Componentes de contactos
│   └── chat/                     # Componentes del chat
├── lib/                          # Utilidades y clientes
│   ├── db.ts                     # Cliente Supabase
│   ├── chatwoot.ts               # Wrapper API Chatwoot
│   └── auth.ts                   # Configuración NextAuth
├── hooks/                        # React Hooks personalizados
│   ├── useLeads.ts
│   ├── useMetrics.ts
│   └── useChat.ts
├── types/                        # Tipos TypeScript
│   └── index.ts
└── docs/                         # Documentación
    ├── arquitectura.md           # Arquitectura técnica
    ├── modelo-datos.md           # Schema de base de datos
    └── spec/                     # Especificaciones funcionales
        ├── spec.dashboard.md
        ├── spec.kanba.md
        ├── spec.contact.md
        └── spec.chat.md
```

---

## 🎯 Módulos del Sistema

### 1. Dashboard (`/dashboard`)
Vista principal con métricas en tiempo real:
- KPI Cards (Total leads, leads activos, ingresos, tasa de cierre)
- Gráfica de ingresos por mes
- Distribución de leads por canal
- Embudo de conversión
- Actividad reciente

**Spec:** [`docs/spec/spec.dashboard.md`](docs/spec/spec.dashboard.md)

### 2. Kanban (`/kanban`)
Gestión visual de leads por etapa:
- Drag & drop entre columnas (Nuevo → Contactado → En Propuesta → Cierre)
- Actualización automática cuando la IA mueve leads
- Panel lateral con acciones rápidas
- Filtros por canal, vendedor y búsqueda

**Spec:** [`docs/spec/spec.kanba.md`](docs/spec/spec.kanba.md)

### 3. Contactos (`/contacts`)
Registro centralizado de leads:
- Listado paginado con búsqueda y filtros
- Perfil individual con historial completo
- Edición inline de datos
- Resumen generado por IA
- Línea de tiempo de actividad

**Spec:** [`docs/spec/spec.contact.md`](docs/spec/spec.contact.md)

### 4. Chat (`/chat`)
Monitoreo de conversaciones WhatsApp:
- **MVP:** Iframe embebido de Chatwoot
- **Fase 2:** UI propia con API de Chatwoot
- Intervención humana (handoff IA ↔ vendedor)
- Notificaciones en tiempo real

**Spec:** [`docs/spec/spec.chat.md`](docs/spec/spec.chat.md)

---

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Chatwoot
CHATWOOT_API_URL=https://app.chatwoot.com
CHATWOOT_API_KEY=xxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx

# n8n (opcional, para webhooks)
N8N_WEBHOOK_SECRET=xxx
```

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar migraciones del schema (ver `docs/modelo-datos.md`)
3. Habilitar Realtime en las tablas `contacts`, `conversations`, `deals`
4. Copiar las credenciales a `.env.local`

### Configuración de Chatwoot

1. Instalar Chatwoot o usar [Chatwoot Cloud](https://www.chatwoot.com/)
2. Crear inbox de WhatsApp
3. Generar API key desde Settings → Integrations
4. Copiar URL y API key a `.env.local`

---

## 📚 Documentación

### Documentación Técnica
- **Arquitectura completa**: [`docs/arquitectura.md`](docs/arquitectura.md)
- **Modelo de datos**: [`docs/modelo-datos.md`](docs/modelo-datos.md)
- **Reglas de desarrollo**: [`CLAUDE.md`](CLAUDE.md) ⭐

### Especificaciones Funcionales
- Dashboard: [`docs/spec/spec.dashboard.md`](docs/spec/spec.dashboard.md)
- Kanban: [`docs/spec/spec.kanba.md`](docs/spec/spec.kanba.md)
- Contactos: [`docs/spec/spec.contact.md`](docs/spec/spec.contact.md)
- Chat: [`docs/spec/spec.chat.md`](docs/spec/spec.chat.md)

### Recursos Externos
- [Next.js 14+ Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎨 Convenciones de Código

### Nomenclatura

```typescript
// Archivos y carpetas: kebab-case
components/dashboard/kpi-card.tsx
app/(dashboard)/contacts/page.tsx

// Componentes: PascalCase
export function KpiCard() {}

// Funciones y variables: camelCase
const fetchLeads = async () => {}
const totalLeads = 100

// Tipos e interfaces: PascalCase
interface Lead {}
type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'
```

### Server vs Client Components

```typescript
// Server Component (por defecto)
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const metrics = await getMetrics() // Fetch directo
  return <MetricsDisplay data={metrics} />
}

// Client Component (solo cuando sea necesario)
// components/kanban/kanban-board.tsx
"use client" // ⚠️ Solo si usa hooks, eventos o estado

export function KanbanBoard() {
  const [leads, setLeads] = useState([])
  return <DndContext>...</DndContext>
}
```

**Ver más en:** [`CLAUDE.md`](CLAUDE.md)

---

## 🔌 Integración con Servicios

### Flujo de Datos

```
n8n (procesa lead de WhatsApp)
        │
        ▼
PostgreSQL / Supabase
        │
        ├── Supabase Realtime (WebSocket)
        │         │
        │         ▼
        │   Next.js Frontend
        │   (actualización automática)
        │
        └── API Routes (/api/*)
                  │
                  ▼
          Server Components
          (render inicial SSR)
```

### Regla de Oro

> **n8n es la única fuente de verdad que escribe leads en la base de datos.**
> El frontend solo lee y visualiza. Las actualizaciones manuales del vendedor escriben a través de las API Routes.

---

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 3000)

# Producción
npm run build            # Construir para producción
npm start                # Iniciar servidor de producción

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run type-check       # Verificar tipos TypeScript (cuando esté configurado)

# Testing (Fase 2)
npm test                 # Tests unitarios
npm run test:e2e         # Tests E2E
```

---

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno
3. Deploy automático en cada push a `main`

### Docker (Alternativa)

```bash
# Construir imagen
docker build -t nella-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 nella-frontend
```

---

## 📅 Plan de Entrega MVP (5 Días)

| Día | Entregable | Estado |
|-----|-----------|--------|
| **Día 1** | Scaffold + autenticación + layout + Supabase | 🔄 En progreso |
| **Día 2** | Dashboard con métricas + Realtime | ⏳ Pendiente |
| **Día 3** | Kanban con drag-and-drop + actualización automática | ⏳ Pendiente |
| **Día 4** | Contactos: listado + perfil individual | ⏳ Pendiente |
| **Día 5** | Chat (iframe Chatwoot) + deploy | ⏳ Pendiente |

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Limpiar caché y reinstalar
rm -rf .next node_modules
npm install
npm run dev
```

### Error: "Supabase connection failed"
- Verificar que las variables de entorno estén en `.env.local`
- Verificar que el proyecto de Supabase esté activo
- Verificar que las credenciales sean correctas

### Error: "Chatwoot iframe no carga"
- Verificar CORS en la configuración de Chatwoot
- Verificar que la URL de Chatwoot sea correcta
- Verificar que el iframe tenga permisos en `next.config.ts`

---

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

**Importante:** Leer [`CLAUDE.md`](CLAUDE.md) antes de contribuir.

---

## 📝 Licencia

Proyecto privado — Nella Revenue OS © 2026

---

## 📞 Contacto

**Equipo de Desarrollo:** [Tu contacto aquí]
**Documentación:** Ver carpeta [`docs/`](docs/)

---

*Última actualización: Febrero 2026*
