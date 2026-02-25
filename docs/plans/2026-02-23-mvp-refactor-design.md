# MVP Refactor & Architecture Alignment — Design

**Fecha:** 2026-02-23
**Rama:** feature/nella-34
**Tipo:** Refactor arquitectónico completo
**PR:** Una sola rama, entrega única

---

## Objetivo

Alinear el MVP actual con el lineamiento de arquitectura frontend (`docs/lineament/frontend_arquitectura.md`), estableciendo bases sólidas para escalar el producto. Incluye integración real de autenticación con el backend NestJS, migración completa a estructura `src/modules/`, infraestructura compartida, y cobertura de tests por rutas críticas y por módulo.

---

## Decisiones clave

| Pregunta | Decisión |
|----------|----------|
| Migración de estructura | Completa — todos los módulos a `src/modules/` |
| Auth real | Sí — conectar a NestJS `POST /auth/login` |
| Tests | Rutas críticas + mínimo por módulo (unit + e2e) |
| Módulos a migrar | Todos (Auth, Dashboard, Contacts, Kanban, Calendar, Chat, Workflows) |
| Estrategia de entrega | Un solo PR en `feature/nella-34` |
| Coordinación de devs | Los otros devs pausan hasta completar el refactor |

---

## Sección 1: Estructura de directorios objetivo

```
src/
├── app/                          # Next.js App Router — no cambia
│   ├── (auth)/login, register
│   ├── (dashboard)/dashboard, kanban, contacts, calendar, chat, settings, trending
│   └── api/                      # proxy routes — no cambian
│
├── components/
│   └── ui/                       # shadcn/ui — no cambia
│
├── core/
│   ├── api/
│   │   ├── api-client.ts         # fetch wrapper: Bearer + X-Tenant-Id automáticos
│   │   └── query-keys.ts         # queryKey factories por módulo
│   ├── routes/
│   │   └── ProtectedRoute.tsx    # verifica sesión → redirect /login
│   └── store/
│       ├── auth-store.ts
│       ├── kanban-store.ts
│       └── calendar-store.ts
│
├── shared/
│   ├── hooks/
│   │   ├── useApiError.ts        # handleError + withErrorHandling
│   │   └── useLogout.ts          # logout store + redirect + toast
│   └── components/
│       └── modal/
│
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── services/
│   │   │   └── auth-service.ts   # integración real NestJS
│   │   └── types/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useMetrics.ts
│   │   │   ├── useProjects.ts
│   │   │   └── useMetricsSocket.ts
│   │   ├── services/
│   │   └── types/
│   ├── contacts/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useContacts.ts    # fix URL bug
│   │   ├── services/
│   │   └── types/
│   ├── kanban/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   │   └── kanban-store.ts
│   │   ├── services/
│   │   └── types/
│   ├── calendar/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── calendar-api.ts
│   │   ├── stores/
│   │   └── types/
│   ├── chat/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │       └── chatwoot.ts
│   └── workflows/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── lib/                          # Solo utilidades sin módulo dueño
│   ├── utils.ts
│   ├── db.ts
│   ├── countries-latam.ts
│   ├── registration-storage.ts
│   ├── registration-validations.ts
│   ├── theme-context.tsx
│   └── mock-data/
│
└── providers/
    └── query-provider.tsx
```

**Carpetas eliminadas al completar:**
- `src/hooks/` → `modules/<name>/hooks/`
- `src/stores/` → `modules/<name>/stores/` + `core/store/`
- `src/types/` → `modules/<name>/types/`
- `src/lib/auth/` → `modules/auth/services/`
- `src/lib/workflows/` → `modules/workflows/services/`
- `src/lib/chatwoot.ts` → `modules/chat/services/`
- `src/lib/calendar-api.ts` → `modules/calendar/services/`
- `src/components/<modulo>/` → `modules/<modulo>/components/`

---

## Sección 2: Infraestructura Core

### `core/api/api-client.ts`
- Fetch wrapper centralizado
- Lee `accessToken` y `tenantSlug` desde `useAuthStore` (Zustand persist)
- Inyecta `Authorization: Bearer <token>` y `X-Tenant-Id: <slug>` automáticamente
- En respuesta 401 → llama `useLogout` y redirige a `/login`
- En respuesta no-ok → extrae `message` del body del backend; fallback a mensaje genérico
- Métodos: `get`, `post`, `patch`, `delete`

### `core/api/query-keys.ts`
```typescript
export const queryKeys = {
  auth:      { profile: () => ['auth', 'profile'] },
  contacts:  { all: () => ['contacts'], detail: (id: number) => ['contacts', id] },
  dashboard: {
    metrics:  (projectId: string, period: string) => ['metrics', projectId, period],
    projects: () => ['projects'],
  },
  kanban:    { leads: () => ['kanban', 'leads'] },
  calendar:  { events: () => ['calendar', 'events'] },
}
```

### `core/routes/ProtectedRoute.tsx`
- Lee sesión del auth store
- Sin sesión → `redirect('/login')`
- Sesión sin `tenantId` → `redirect('/login')` (sesión corrupta)
- Mientras verifica → spinner de carga
- Con sesión válida → renderiza `children`
- `app/(dashboard)/layout.tsx` queda solo con estructura visual

### `shared/hooks/useApiError.ts`
- `handleError(error, { showToast, fallbackMessage, logToConsole })`
- `withErrorHandling(operation, options)` → `{ data, error, success }`
- Mapeo de status HTTP a mensajes en **español**:
  - 400 → mensaje del backend
  - 401 → "Tu sesión expiró, inicia sesión nuevamente"
  - 403 → "No tienes permisos para realizar esta acción"
  - 404 → "El recurso solicitado no existe"
  - 500+ → "Error interno, intenta de nuevo"
  - Sin conexión → "No hay conexión con el servidor"

### `shared/hooks/useLogout.ts`
- Reemplaza los dos `handleLogout` incompatibles en `layout.tsx`
- `logout()` → limpia auth store → `toast.success("Sesión cerrada")` → `router.push('/login')`

---

## Sección 3: Módulo Auth (integración real)

### Contrato API
```
POST /api/auth/login
  Body:    { email, password }
  Headers: X-Tenant-Subdomain: <slug-del-hostname>
  Response: { accessToken, refreshToken, user, tenant }

POST /api/auth/register
  Body: RegistrationFormData
  Response: { accessToken, refreshToken, user, tenant }
```

Las API Routes de Next.js ya existen y no cambian.

### `modules/auth/services/auth-service.ts`
- Reemplaza mock completamente
- `login(email, password, tenantSubdomain)` → `POST /api/auth/login`
- `register(formData)` → `POST /api/auth/register`
- `logout()` → limpia store (sin endpoint)
- `tenantSubdomain` extraído de `window.location.hostname`; fallback `NEXT_PUBLIC_TENANT_SUBDOMAIN`

### Hooks
- `useLogin`: mutation → onSuccess: `setSession()` + `router.push('/dashboard')`; onError: `handleError` con mensaje del backend
- `useRegister`: mutation para el paso final del wizard de 4 pasos

### `core/store/auth-store.ts`
- Interface existente no cambia
- Nuevo campo: `tenantSubdomain: string | null`
- `getAccessToken()` ya existe → usado por `api-client`

### Flujo completo
```
LoginForm → useLogin().mutate()
  → POST /api/auth/login → NestJS backend
  → onSuccess: setSession({ accessToken, refreshToken, user, tenant })
  → router.push('/dashboard')
  → ProtectedRoute valida → renderiza dashboard
```

---

## Sección 4: Migración de módulos

### Dashboard
- `useMetrics` y `useProjects`: eliminar `getSessionHeaders()` con localStorage directo → usar `apiClient`
- `useMetricsSocket`: mover a `modules/dashboard/hooks/`
- Todos los componentes se mueven sin reescribir, solo actualizar imports
- Tipos `Project`, `ProjectMetrics` → `modules/dashboard/types/`

### Contacts
- **Bug fix crítico**: `fetch('/contacts')` → `apiClient.get('/api/contacts')`
- Mutations añaden `onError: handleError(...)` (actualmente errores silenciosos)
- `onSuccess` de mutations añade `toast.success` en español
- Tipos `BackendContact`, `ContactsQuery`, etc. → `modules/contacts/types/`

### Kanban
- `kanban-store.ts` → `modules/kanban/stores/`
- 5 hooks → `modules/kanban/hooks/`
- 6 componentes → `modules/kanban/components/`
- `moveLeadToStage` mantiene implementación actual (UI only) con comentario `// TODO: PATCH /api/contacts/:id`
- `useKanbanSSE` adopta `useApiError` para fallos de Socket.io

### Calendar
- `components/calendario/` → `modules/calendar/components/` (renombrando carpeta a inglés)
- `lib/calendar-api.ts` → `modules/calendar/services/`
- `hooks/useCalendarEvents.ts` → `modules/calendar/hooks/`
- `stores/calendar-store.ts` → `modules/calendar/stores/`
- Google Calendar OAuth routes no cambian

### Chat
- Módulo mínimo — solo mover archivos
- `lib/chatwoot.ts` → `modules/chat/services/chatwoot.ts`
- `hooks/useChat.ts` → `modules/chat/hooks/`
- `components/chat/` → `modules/chat/components/`
- `modules/chat/types/index.ts` creado vacío como placeholder

### Workflows
- `lib/workflows/*` → `modules/workflows/services/`
- `hooks/useWorkflow.ts`, `useWorkflowCredentials.ts` → `modules/workflows/hooks/`
- `components/workflows/` → `modules/workflows/components/`
- Servicio mantiene implementación mock con comentario:
  `// ⚡ PUNTO DE INTEGRACIÓN: reemplazar por apiClient.post/patch('/api/workflows/*')`

---

## Sección 5: Estrategia de tests

### Estructura
```
tests/
├── unit/
│   ├── core/api/api-client.test.ts
│   ├── shared/hooks/useApiError.test.ts
│   └── modules/
│       ├── auth/hooks/useLogin.test.ts
│       ├── dashboard/
│       │   ├── components/kpi-card.test.tsx     # migrar existente
│       │   └── hooks/useMetrics.test.ts
│       ├── contacts/hooks/useContacts.test.ts
│       ├── kanban/stores/kanban-store.test.ts
│       ├── calendar/hooks/useCalendarEvents.test.ts
│       └── workflows/services/workflow-service.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts                        # migrar existente
│   ├── contacts.spec.ts
│   └── kanban.spec.ts
├── mocks/
│   ├── auth.mock.ts
│   ├── contacts.mock.ts
│   └── metrics.mock.ts
├── setup/setup.ts
└── utils/render-with-providers.tsx
```

### Tests unitarios críticos (obligatorios)

| Test | Verifica |
|------|---------|
| `api-client` | Inyecta Bearer; maneja 401; extrae message del backend |
| `useApiError` | Cada status HTTP → mensaje correcto en español |
| `useLogin` | Success → setSession + redirect; Error → toast |
| `useContacts` | URL es `/api/contacts` (regresión); CRUD invalida queryKey |
| `useMetrics` | No lee localStorage; usa api-client |
| `kanban-store` | `transformContactToLead` mapea stage; `getLeadsByStage` filtra |

### Tests E2E por flujo

| Archivo | Escenarios |
|---------|-----------|
| `auth.spec.ts` | Login exitoso; credenciales incorrectas → error en español; logout |
| `dashboard.spec.ts` | Header visible; empty state o métricas |
| `contacts.spec.ts` | Tabla carga; modal de detalle abre |
| `kanban.spec.ts` | Columnas renderizan; click en lead abre panel |

### Mock strategy
- `vi.spyOn(global, 'fetch')` para tests unitarios de hooks
- `vi.mock('@/core/store/auth-store')` para aislar auth en tests
- MSW como mejora futura (no en scope de este refactor)

---

## Sección 6: Bugs críticos y secuencia de ejecución

### Bugs resueltos en la migración

| # | Archivo | Bug | Resuelto en |
|---|---------|-----|-------------|
| 1 | `app/(dashboard)/layout.tsx` | `useAuthStore` importado 2x, `handleLogout` definido 2x, JSX huérfano línea 245, `localStorage.getItem("user_role")` directo | Paso 2 |
| 2 | `hooks/useContacts.ts` | Fetch a `/contacts` sin `/api/` | Paso 5 |
| 3 | `hooks/use-metrics.ts` | Lee `nella-auth-storage` de localStorage directamente | Paso 4 |
| 4 | `hooks/use-projects.ts` | `getSessionHeaders()` duplicado con localStorage | Paso 4 |
| 5 | `hooks/useContacts.ts` | Mutations sin `onError` — errores silenciosos | Paso 5 |

### Secuencia de 11 pasos

```
PASO 1  — Tests: estructura base + migrar tests existentes
PASO 2  — Core infra: api-client, query-keys, ProtectedRoute, useApiError, useLogout
           + limpiar layout.tsx
PASO 3  — Módulo Auth: integración real NestJS
PASO 4  — Módulo Dashboard: migración + fix localStorage
PASO 5  — Módulo Contacts: migración + fix URL bug
PASO 6  — Módulo Kanban: migración completa
PASO 7  — Módulo Calendar: migración completa
PASO 8  — Módulo Chat: migración completa
PASO 9  — Módulo Workflows: migración completa
PASO 10 — Limpieza: eliminar carpetas legacy + tests e2e + build + lint
PASO 11 — PR a main
```

### Criterios de aceptación

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin warnings
- [ ] `npm test` — todos los tests pasan
- [ ] Login real funciona contra NestJS backend
- [ ] Bug `/contacts` tiene test de regresión que pasa
- [ ] `layout.tsx` sin código duplicado ni JSX huérfano
- [ ] No hay lecturas directas a `localStorage` fuera de `core/store/`
- [ ] Toda carpeta `modules/<name>/` tiene `components/`, `hooks/`, `services/`, `types/`
- [ ] `src/hooks/`, `src/stores/`, `src/types/` eliminados

---

*Documento aprobado por el equipo — 2026-02-23*
