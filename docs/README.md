# Documentación Técnica — Nella Revenue OS

**Proyecto:** Nella Marketing Frontend
**Stack:** Next.js 16 + TypeScript + Tailwind CSS 4 + Supabase + Chatwoot
**Última actualización:** Febrero 2026

---

## 📚 Índice de Documentación

### 🏗️ Arquitectura y Diseño Técnico

#### [`arquitectura.md`](arquitectura.md)
Documento maestro de arquitectura del MVP. Contiene:
- Visión general del sistema
- Estructura de carpetas
- Decisiones técnicas clave (App Router, Server Components, Realtime)
- Stack de librerías con justificación
- Flujo de datos completo
- Plan de entrega de 5 días
- Consideraciones de escalabilidad

**Cuándo leerlo:** Antes de empezar a desarrollar cualquier módulo. Es la base técnica del proyecto.

---

### 📊 Modelo de Datos

#### [`modelo-datos.md`](modelo-datos.md)
Schema de la base de datos PostgreSQL/Supabase:
- Tablas principales (`contacts`, `conversations`, `deals`, `users`)
- Relaciones entre tablas
- Índices y optimizaciones
- Campos calculados y triggers
- Políticas de Row Level Security (RLS)

**Cuándo leerlo:** Antes de implementar cualquier feature que lea o escriba en la base de datos.

---

### 📋 Especificaciones Funcionales

Las specs describen **qué** debe hacer cada módulo (no cómo implementarlo técnicamente).

#### [`spec/spec.dashboard.md`](spec/spec.dashboard.md)
**Módulo 01: Dashboard**
- KPI Cards (Total leads, leads activos, ingresos, tasa de cierre)
- Gráfica de ingresos por mes
- Distribución de leads por canal
- Embudo de conversión
- Actividad reciente en tiempo real

**Ruta:** `/dashboard`
**Tipo:** Server Component + Supabase Realtime
**Complejidad:** Media

---

#### [`spec/spec.kanba.md`](spec/spec.kanba.md)
**Módulo 02: Kanban**
- Tablero con 4 columnas (Nuevo → Contactado → En Propuesta → Cierre)
- Drag & drop manual por el vendedor
- Movimiento automático cuando la IA actualiza etapas
- Panel lateral con acciones rápidas
- Filtros por canal, vendedor y búsqueda

**Ruta:** `/kanban`
**Tipo:** Client Component (requiere drag-and-drop)
**Complejidad:** Alta

---

#### [`spec/spec.contact.md`](spec/spec.contact.md)
**Módulo 03: Contactos**
- Listado paginado con búsqueda y filtros
- Perfil individual del lead con historial completo
- Edición inline de datos
- Resumen generado por IA
- Línea de tiempo de actividad
- Registro de deals

**Rutas:** `/contacts` (listado) y `/contacts/[id]` (perfil)
**Tipo:** Server Component (listado) + Client Component (perfil con edición)
**Complejidad:** Media-Alta

---

#### [`spec/spec.chat.md`](spec/spec.chat.md)
**Módulo 04: Chat**
- **MVP (Fase 1):** Iframe embebido de Chatwoot
- **Fase 2:** UI propia consumiendo API de Chatwoot
- Monitoreo de conversaciones en tiempo real
- Intervención humana (handoff IA ↔ vendedor)
- Estados: IA Activa, Requiere Atención, Humano en Control, Resuelta
- Notificaciones push cuando se requiere atención

**Ruta:** `/chat`
**Tipo:** Client Component (iframe en MVP, UI propia en Fase 2)
**Complejidad:** Baja (MVP) / Alta (Fase 2)

---

### 🔧 Guías de Desarrollo

#### [`../CLAUDE.md`](../CLAUDE.md) ⭐ **DOCUMENTO PRINCIPAL**
Reglas y convenciones de desarrollo del proyecto. Contiene:

**Principios Fundamentales:**
- Arquitectura Next.js App Router
- Server Components vs Client Components
- Flujo de datos y regla de oro

**Convenciones de Código:**
- Nomenclatura (archivos, componentes, funciones, tipos)
- Estructura de API Routes
- Manejo de errores
- Estilos con Tailwind CSS 4
- Componentes shadcn/ui

**Integraciones:**
- Supabase (cliente y Realtime)
- Chatwoot (API wrapper)
- NextAuth.js v5 (autenticación)
- TanStack Query (data fetching)
- Zustand (estado global)

**Performance y Seguridad:**
- Optimización de imágenes
- Loading states y Suspense
- Variables de entorno
- Validación con Zod

**Checklists:**
- Antes de crear un componente
- Antes de crear una API Route
- Antes de hacer commit

**Cuándo leerlo:** Antes de escribir cualquier línea de código. Es la referencia constante durante el desarrollo.

---

### 🎓 Skills y Mejores Prácticas

#### [`SKILLS-INTEGRATION.md`](SKILLS-INTEGRATION.md)
Guía completa de integración de skills con agentes y comandos. Contiene:
- Cómo usar cada skill con cada agente
- Matriz de skills por agente
- Flujo de trabajo potenciado
- Comandos mejorados con skills

#### [`SKILLS-QUICK-REFERENCE.md`](SKILLS-QUICK-REFERENCE.md)
Referencia rápida para usar skills en el desarrollo diario:
- Cuándo usar cada skill
- Búsqueda rápida por problema
- Checklists por tipo de tarea
- Comandos útiles

**Skills Disponibles:**
- `supabase-postgres-best-practices` - 31 reglas de optimización de Postgres/Supabase
- `shadcn-ui` - Guía completa de componentes UI
- `vercel-react-best-practices` - 57 reglas de performance React/Next.js
- `vercel-composition-patterns` - Patrones de composición de componentes
- `responsive-design` - Diseño responsivo moderno
- `ui-ux-pro-max` - Sistema completo de diseño UI/UX
- `e2e-testing-patterns` - Patrones de testing E2E

---

## 🗺️ Mapa de Navegación

### Si eres nuevo en el proyecto:
1. Lee [`arquitectura.md`](arquitectura.md) para entender la visión general
2. Lee [`../CLAUDE.md`](../CLAUDE.md) para conocer las reglas de desarrollo
3. Revisa las specs de los módulos que vas a implementar
4. Consulta [`modelo-datos.md`](modelo-datos.md) cuando necesites acceder a datos

### Si vas a implementar un módulo específico:
1. Lee la spec funcional del módulo (`spec/spec.[modulo].md`)
2. Revisa el modelo de datos relacionado en [`modelo-datos.md`](modelo-datos.md)
3. Consulta [`../CLAUDE.md`](../CLAUDE.md) para las convenciones de código
4. Revisa [`arquitectura.md`](arquitectura.md) para decisiones técnicas (Realtime, API Routes, etc.)

### Si tienes dudas técnicas:
- **¿Cómo estructuro un componente?** → [`../CLAUDE.md`](../CLAUDE.md) sección "Convenciones de Código"
- **¿Server o Client Component?** → [`../CLAUDE.md`](../CLAUDE.md) sección "Server vs Client Components"
- **¿Cómo accedo a la base de datos?** → [`arquitectura.md`](arquitectura.md) sección "Conexión con Supabase"
- **¿Cómo implemento tiempo real?** → [`arquitectura.md`](arquitectura.md) sección "Tiempo Real"
- **¿Qué campos tiene la tabla X?** → [`modelo-datos.md`](modelo-datos.md)

---

## 🎯 Plan de Implementación

### Día 1: Scaffold + Autenticación + Layout
**Documentos clave:**
- [`arquitectura.md`](arquitectura.md) - Estructura de carpetas
- [`../CLAUDE.md`](../CLAUDE.md) - Convenciones de código
- [`modelo-datos.md`](modelo-datos.md) - Tabla `users`

**Entregables:**
- Proyecto Next.js configurado
- NextAuth funcionando
- Layout con sidebar
- Conexión a Supabase

---

### Día 2: Dashboard
**Documentos clave:**
- [`spec/spec.dashboard.md`](spec/spec.dashboard.md) - Spec funcional completa
- [`modelo-datos.md`](modelo-datos.md) - Tablas `contacts`, `deals`
- [`arquitectura.md`](arquitectura.md) - Supabase Realtime

**Entregables:**
- KPI Cards con datos reales
- Gráficas funcionando (Recharts)
- Actualización automática vía Realtime

---

### Día 3: Kanban
**Documentos clave:**
- [`spec/spec.kanba.md`](spec/spec.kanba.md) - Spec funcional completa
- [`modelo-datos.md`](modelo-datos.md) - Tabla `contacts` (campo `stage`)
- [`../CLAUDE.md`](../CLAUDE.md) - Client Components

**Entregables:**
- Tablero con 4 columnas
- Drag & drop funcionando (@dnd-kit)
- Actualización automática cuando n8n mueve leads

---

### Día 4: Contactos
**Documentos clave:**
- [`spec/spec.contact.md`](spec/spec.contact.md) - Spec funcional completa
- [`modelo-datos.md`](modelo-datos.md) - Tablas `contacts`, `conversations`, `deals`

**Entregables:**
- Listado paginado con filtros
- Perfil individual con historial
- Edición inline funcionando

---

### Día 5: Chat + Deploy
**Documentos clave:**
- [`spec/spec.chat.md`](spec/spec.chat.md) - Spec funcional completa
- [`arquitectura.md`](arquitectura.md) - Estrategia de integración con Chatwoot

**Entregables:**
- Iframe de Chatwoot embebido
- SSO/autenticación transparente
- Deploy en Vercel

---

## 📝 Notas Importantes

### Multi-Tenant desde el Inicio
Todas las consultas a la base de datos deben filtrar por `client_id`:

```typescript
// ✅ Correcto
const { data } = await supabase
  .from('contacts')
  .select('*')
  .eq('client_id', clientId)

// ❌ Incorrecto - No filtra por cliente
const { data } = await supabase
  .from('contacts')
  .select('*')
```

### Tiempo Real - Configuración Crítica
Habilitar Realtime en Supabase para estas tablas:
- `contacts` (eventos: INSERT, UPDATE)
- `conversations` (eventos: INSERT)
- `deals` (eventos: INSERT, UPDATE)

### Seguridad - Regla de Oro
> **Las credenciales NUNCA deben exponerse al navegador.**
> Usa `SUPABASE_SERVICE_ROLE_KEY` solo en API Routes (server-side).
> Usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el cliente con RLS habilitado.

---

## 🔗 Enlaces Rápidos

- **Documentación principal:** [`../README.md`](../README.md)
- **Reglas de desarrollo:** [`../CLAUDE.md`](../CLAUDE.md) ⭐
- **Arquitectura:** [`arquitectura.md`](arquitectura.md)
- **Modelo de datos:** [`modelo-datos.md`](modelo-datos.md)
- **Specs funcionales:** [`spec/`](spec/)

---

*Documento vivo — Actualizar al agregar nueva documentación.*

