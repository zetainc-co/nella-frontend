# Diseño del Sistema de Gestión de Workflows Multi-Tenant - Nella Revenue OS

**Fecha:** 2026-02-15
**Autor:** Claude Sonnet 4.5
**Estado:** Aprobado
**Tipo:** Feature - MVP

---

## 1. Resumen Ejecutivo

Sistema de gestión de workflows multi-tenant que permite a los administradores de cada tenant visualizar, configurar y gestionar su workflow de automatización de WhatsApp con N8n. El sistema incluye creación automática de workflows al registrar un nuevo tenant, gestión de credenciales, edición de configuración de IA, y exportación de templates.

**Alcance MVP:**
- Módulo completo de Workflow Management en `/dashboard/workflows`
- CRUD de workflows con mock de N8n API
- Gestión de credenciales segura
- Corrección del diseño del wizard de registro (patrón HUD)
- Integración automática: crear workflow al completar registro

**Enfoque Arquitectónico:** Multi-Capa con Mock Estratificado
- Facilita migración futura al API real
- Separación clara de responsabilidades
- Mock realista con delays y validaciones

---

## 2. Contexto y Decisiones de Diseño

### 2.1 Historias de Usuario Implementadas

| HU | Título | Implementación |
|----|--------|----------------|
| **HU-011** | Exportar workflow base como template | Tab Overview → Botón "Exportar Template" |
| **HU-012** | Tabla de metadatos de workflows por tenant | localStorage mock de tabla `tenant_workflow_configs` |
| **HU-013** | Servicio de gestión de workflows | `workflow-service.ts` (mock de N8n API) |
| **HU-014** | Creación automática al registrar tenant | Integrado en `useRegistrationWizard.ts` |
| **HU-015** | Gestión de credenciales por tenant | Tab Credenciales → Formulario seguro |
| **HU-016** | Updates masivos de workflows | ❌ Descartada temporalmente |
| **HU-017** | Migración de tenants existentes | ❌ Descartada temporalmente |

### 2.2 Decisiones Clave

| Decisión | Opción Elegida | Justificación |
|----------|----------------|---------------|
| **Usuario objetivo** | Admin de tenant individual | UI simplificada, cada usuario ve solo su workflow |
| **Features MVP** | Ver config + Editar + Credenciales + Exportar | Core essentials, HU-16/17 son admin de plataforma |
| **Integración con registro** | Automática y transparente | Mejor UX, usuario no necesita configurar nada |
| **Template base** | Usar flujos de `docs/flows-n8n/` | Aprovechar workflows reales existentes |
| **Layout UI** | Dashboard único con tabs | Patrón moderno, fácil navegación |
| **Arquitectura** | Multi-Capa con Mock Estratificado | Facilita migración al API, separación de concerns |
| **Estado global** | React Query | Sigue patrón existente del proyecto |
| **Diseño visual** | Patrón HUD/Tech del login | Consistencia visual en todo el sistema |

---

## 3. Arquitectura de Alto Nivel

### 3.1 Estructura de Archivos

```
src/
├── app/
│   └── (dashboard)/
│       └── workflows/
│           └── page.tsx                           # Página principal con tabs
│
├── components/
│   ├── ui/
│   │   └── hud-corners.tsx                        # Componente reutilizable HUD
│   └── workflows/
│       ├── workflow-tabs.tsx                      # Container con sistema de tabs
│       ├── workflow-overview.tsx                  # Tab 1: Vista general
│       ├── workflow-config-editor.tsx             # Tab 2: Editor de parámetros
│       ├── workflow-credentials-manager.tsx       # Tab 3: Gestión de credenciales
│       ├── workflow-template-viewer.tsx           # Modal: Visor de JSON
│       ├── workflow-status-badge.tsx              # Badge: Active/Inactive
│       ├── workflow-node-visualizer.tsx           # Visualización de nodos
│       ├── workflow-parameter-form.tsx            # Formulario de parámetros
│       └── workflow-error-boundary.tsx            # Error boundary
│
├── lib/
│   └── workflows/
│       ├── workflow-service.ts                    # Mock de N8n API ⚡ PUNTO DE INTEGRACIÓN
│       ├── workflow-storage.ts                    # localStorage wrapper
│       ├── workflow-template.ts                   # Carga y procesa templates
│       ├── workflow-validator.ts                  # Validaciones de config
│       └── workflow-types.ts                      # Tipos TypeScript
│
├── hooks/
│   ├── useWorkflow.ts                             # Hook principal (React Query)
│   └── useWorkflowCredentials.ts                  # Hook para credenciales
│
└── types/
    └── index.ts                                   # Extender tipos existentes
```

### 3.2 Flujo de Datos (Capa por Capa)

```
┌─────────────────────────────────────────────────────┐
│ UI Layer: Components (workflows/*.tsx)              │
│  - Presentación pura                                 │
│  - Consume hooks                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Hook Layer: useWorkflow.ts (React Query)            │
│  - Estado global del workflow                        │
│  - Caché y sincronización                            │
│  - Llamadas a workflow-service                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Service Layer: workflow-service.ts                  │
│  - Mock de N8n API (delays, errores simulados)       │
│  ⚡ PUNTO DE INTEGRACIÓN con API real                │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Storage Layer: workflow-storage.ts + localStorage   │
│  - Estructura que replica tabla tenant_workflow_configs│
│  - Persistencia local                                │
└─────────────────────────────────────────────────────┘
```

### 3.3 Modelo de Datos

**localStorage key: `nella_workflow_configs`**

```typescript
interface TenantWorkflowConfig {
  id: string                          // UUID
  tenant_id: string                   // Referencia al tenant
  n8n_workflow_id: string             // ID del workflow en N8n
  workflow_name: string               // "WhatsApp Automation - Acme Corp"
  status: 'active' | 'inactive'
  template_version: string            // "v1.0.0"
  config: {
    ai_model: string                  // "gpt-4", "claude-3-opus", etc.
    prompts: {
      profiler: string                // Prompt del módulo Profiler
      strategist: string              // Prompt del módulo Strategist
      mirror: string                  // Prompt del módulo Mirror
    }
    business_settings: {
      response_delay: number          // Segundos de delay
      max_retries: number             // Intentos máximos
      office_hours: {
        enabled: boolean
        start: string                 // "09:00"
        end: string                   // "18:00"
        timezone: string              // "America/Bogota"
      }
    }
  }
  credentials: {
    whatsapp_token: string            // Encriptado (base64 en MVP)
    openai_api_key?: string           // Opcional
    anthropic_api_key?: string        // Opcional
  }
  created_at: string                  // ISO 8601
  updated_at: string
  last_executed_at?: string
  execution_count: number
}
```

---

## 4. Componentes Detallados

### 4.1 Página Principal: `workflows/page.tsx`

**Tipo:** Server Component
**Ruta:** `/dashboard/workflows`

**Estructura:**
- Header con título + badge de estado
- WorkflowTabs (Client Component)
- Wrapped en WorkflowErrorBoundary

### 4.2 Container de Tabs: `workflow-tabs.tsx`

**Tipo:** Client Component
**Patrón visual:** Glass panels + HUD corners

**Tabs:**
1. **Overview** - Vista general, métricas, exportar template
2. **Configuración** - Editor de prompts y settings
3. **Credenciales** - Gestión segura de tokens/API keys

**Estados:**
- Loading: Skeleton con animación
- Error: Mensaje HUD style + botón refetch
- Empty: Mensaje "No workflow found"
- Success: Renderiza tab activo

### 4.3 Tab 1: Vista General (`workflow-overview.tsx`)

**Contenido:**
- Nombre del workflow + status badge
- Botón "Exportar Template" (HU-011)
- 3 Metric cards estilo HUD:
  - Ejecuciones totales
  - Última ejecución
  - Versión del template
- Visualización de nodos del workflow
- Info técnica colapsable

### 4.4 Tab 2: Editor de Configuración (`workflow-config-editor.tsx`)

**Secciones:**

1. **Modelo de IA**
   - Select: GPT-4, GPT-4 Turbo, Claude 3 Opus, Claude 3 Sonnet

2. **Prompts del Sistema**
   - Textarea para Profiler (análisis de cliente)
   - Textarea para Strategist (estrategia de venta)
   - Textarea para Mirror (respuestas conversacionales)

3. **Configuración de Negocio**
   - Response delay (0-60 segundos)
   - Max retries (1-10)
   - Office hours (checkbox + time inputs)

**Features:**
- Validación en tiempo real
- Detección de cambios sin guardar
- Optimistic updates
- Toast notifications

### 4.5 Tab 3: Gestor de Credenciales (`workflow-credentials-manager.tsx`)

**Credenciales gestionadas:**
- WhatsApp Business Token (requerido)
- OpenAI API Key (opcional)
- Anthropic API Key (opcional)

**Features:**
- Toggle show/hide para cada credencial
- Validación de formato
- Botón "Validar Token" (mock de validación con Meta/OpenAI/Anthropic)
- Warning de seguridad (localStorage en MVP, Supabase Vault en prod)

### 4.6 Componentes Auxiliares

**`workflow-status-badge.tsx`**
- Badge con pulso animado
- Verde: Active | Gris: Inactive

**`workflow-node-visualizer.tsx`**
- Muestra nodos del workflow en secuencia
- Cards con nombre + tipo de nodo
- Flechas de conexión

**`workflow-error-boundary.tsx`**
- Captura errores de renderizado
- UI de fallback estilo HUD
- Botón reload + detalles técnicos colapsables

**`hud-corners.tsx`**
- Componente reutilizable
- 4 esquinas con gradientes primary
- Usado en login, registro, y workflows

---

## 5. Flujo de Datos y Hooks

### 5.1 Hook Principal: `useWorkflow.ts`

**Responsabilidades:**
- Obtener workflow del tenant actual
- Caché con React Query (5 minutos)
- Retry logic inteligente

**Query Key:** `['workflow', tenantId]`

**Optimizaciones:**
- Stale time: 5 minutos
- Retry: hasta 2 veces (excepto errores de tenant not found)
- Retry delay: backoff exponencial

### 5.2 Hook de Actualización: `useWorkflowUpdate()`

**Mutation con Optimistic Updates:**

```typescript
onMutate: Actualizar UI inmediatamente (optimistic)
mutationFn: Validar + Guardar
onError: Rollback al estado anterior
onSuccess: Invalidar caché + refetch
```

### 5.3 Hook de Credenciales: `useWorkflowCredentials.ts`

**Features:**
- Obtener credenciales (con desencriptación)
- Actualizar credenciales (con encriptación)
- Validar credencial específica (mock con delay)

### 5.4 Servicio Mock: `workflow-service.ts`

**⚡ PUNTO DE INTEGRACIÓN FUTURA**

Métodos implementados:

| Método | Propósito | Mock Delay |
|--------|-----------|------------|
| `getWorkflowByTenant()` | Obtener workflow del tenant | 500-800ms |
| `createWorkflowForTenant()` | Crear workflow al registrar tenant | 1200ms |
| `updateWorkflowConfig()` | Actualizar configuración | 600ms |
| `getCredentials()` | Obtener credenciales | 400ms |
| `updateCredentials()` | Actualizar credenciales | 700ms |
| `validateCredential()` | Validar token con API externa | 1500ms |
| `getBaseTemplate()` | Obtener template base | 500ms |

**Migración al API real:**
```typescript
// ANTES (MVP):
const workflow = await workflowStorage.getByTenantId(tenantId)

// DESPUÉS (Producción):
const res = await fetch(`/api/workflows?tenant_id=${tenantId}`)
const workflow = await res.json()
```

### 5.5 Storage Layer: `workflow-storage.ts`

**Wrapper de localStorage que replica estructura de DB:**

Métodos:
- `getById(id)` - Obtener workflow por ID
- `getByTenantId(tenantId)` - Obtener workflow del tenant
- `save(workflow)` - Guardar nuevo workflow
- `update(id, workflow)` - Actualizar workflow existente
- `delete(id)` - Eliminar workflow
- `incrementExecutionCount(id)` - Incrementar contador
- `clear()` - Limpiar todo (testing)

### 5.6 Template Manager: `workflow-template.ts`

**Responsabilidades:**
- Cargar template base desde `docs/flows-n8n/`
- En MVP: JSON embebido (M1.B - Worker simplificado)
- En producción: fetch desde `/api/workflows/template`

**Template incluye:**
- workflow_json: JSON completo del workflow N8n
- editable_params: Lista de parámetros que el tenant puede editar
- default_prompts: Prompts por defecto para Profiler, Strategist, Mirror

---

## 6. Error Handling y Validaciones

### 6.1 Validador: `workflow-validator.ts`

**Validaciones de Configuración:**

| Campo | Validación | Acción |
|-------|------------|--------|
| `ai_model` | Debe ser modelo válido | Error bloquea guardado |
| `prompts.*` | Mínimo 10 caracteres | Error bloquea guardado |
| `prompts.*` | Máximo 5000 caracteres | Warning permite guardar |
| `response_delay` | Entre 0-60 segundos | Error bloquea guardado |
| `max_retries` | Entre 1-10 | Error bloquea guardado |
| `office_hours` | Formato HH:MM válido | Error bloquea guardado |
| `office_hours` | Inicio < Fin | Error bloquea guardado |

**Validaciones de Credenciales:**

| Credencial | Validación | Tipo |
|------------|------------|------|
| `whatsapp_token` | Requerido | Error |
| `whatsapp_token` | Empieza con "EAA" | Warning |
| `whatsapp_token` | Mínimo 100 chars | Warning |
| `openai_api_key` | Empieza con "sk-" | Warning |
| `anthropic_api_key` | Empieza con "sk-ant-" | Warning |

### 6.2 Estrategia de Error Handling

**1. Error Boundary (React)**
- Captura errores de renderizado
- UI de fallback estilo HUD
- Botón reload + stack trace colapsable

**2. React Query Error States**
- Retry logic: hasta 2 intentos
- Retry delay: backoff exponencial
- Error en UI: mensaje + botón refetch

**3. Validaciones**
- En tiempo real (mientras escribe)
- Antes de guardar (validación completa)
- Errores: bloquean guardado
- Warnings: permiten guardar con advertencia

**4. Toast Notifications**
- Success: verde con descripción
- Error: rojo con mensaje de ayuda
- Warning: amarillo con info adicional

**5. Loading States**
- Skeletons mientras carga datos
- Buttons disabled durante mutaciones
- Spinners en validaciones async

---

## 7. Integración con Wizard de Registro

### 7.1 Modificaciones en `useRegistrationWizard.ts`

**Función `completeRegistration()` actualizada:**

```typescript
async function completeRegistration() {
  // 1. Crear usuario y tenant (existente)
  const user = { ... }
  const tenant = { ... }

  // Guardar en localStorage
  saveUserAndTenant(user, tenant)

  // 2. NUEVO: Crear workflow automáticamente (HU-014)
  const workflow = await workflowService.createWorkflowForTenant({
    tenant_id: tenant.id,
    whatsapp_number: formData.whatsappNumber,
    whatsapp_token: formData.whatsappToken
  })

  console.log('✅ Workflow creado:', workflow.n8n_workflow_id)

  // 3. Crear sesión (auto-login)
  createSession(user)

  // 4. Limpiar progreso del wizard
  clearRegistrationProgress()

  // 5. Redirigir al dashboard
  router.push('/dashboard')
}
```

### 7.2 Mejoras de Diseño en el Wizard

**Aplicar patrón HUD/Tech del login:**

**Cambios en `registration-wizard.tsx`:**
- Glass panel: `glass-panel rounded-2xl p-8`
- Shadow con glow: `shadow-[0_0_60px_-10px_rgba(206,242,93,0.08)]`
- HUD corners: componente `<HudCorners />`
- Animaciones: `animate-[fadeIn_0.3s_ease-in-out]`

**Cambios en `registration-stepper.tsx`:**
- Círculos con efecto de pulso en step actual
- Línea de progreso animada
- Checkmarks en steps completados
- Glow effect en hover (clickables)

**Cambios en `registration-step-4.tsx`:**
- Validación con feedback HUD style
- Loading state durante validación del token
- Success messages: "✓ Token validado con Meta API"
- Error handling con estilo tech

**Cambios en `email-verification.tsx`:**
- Nuevo estado: `isCreatingWorkflow`
- Pantalla de loading con progreso:
  - ✅ Cuenta de usuario creada
  - ✅ Empresa registrada
  - 🔄 Creando workflow de WhatsApp...
- Mensaje final antes de redirigir

### 7.3 Componente Reutilizable: `hud-corners.tsx`

**Extraído como componente UI compartido:**

```typescript
// src/components/ui/hud-corners.tsx
export function HudCorners()
```

**Usado en:**
- `login-card.tsx`
- `registration-wizard.tsx`
- `workflow-tabs.tsx`

### 7.4 Estilos Globales Actualizados

**Agregados a `globals.css`:**

```css
/* Glass Panel Effect */
.glass-panel {
  @apply bg-card/50 backdrop-blur-sm border border-border/50;
}

/* Tech animations */
@keyframes fadeIn { ... }
@keyframes slideIn { ... }
@keyframes pulse-glow { ... }

/* Registration inputs */
.registration-input { ... }

/* Custom scrollbar */
.custom-scrollbar { ... }
```

---

## 8. Flujo Completo de Creación de Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ Usuario completa registro (Step 6 - Email Verification)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ completeRegistration() en useRegistrationWizard             │
│  1. Crear user + tenant en localStorage                     │
│  2. workflowService.createWorkflowForTenant()                │
│  3. Crear sesión (auto-login)                               │
│  4. Limpiar progreso                                         │
│  5. Redirigir a /dashboard                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ workflowService.createWorkflowForTenant()                   │
│  - Obtener template base                                    │
│  - Generar n8n_workflow_id único                            │
│  - Crear TenantWorkflowConfig con config default            │
│  - Validar con workflowValidator                            │
│  - Guardar en workflowStorage (localStorage)                │
│  - Simular creación en N8n (console.log)                    │
│  - Retornar workflow creado                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ localStorage actualizado                                     │
│  nella_workflow_configs: [{ tenant_id, n8n_workflow_id, ... }]│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Usuario redirigido a /dashboard                             │
│  - Dashboard carga                                           │
│  - Usuario ve su workflow ya asignado en sidebar            │
│  - Puede ir a /dashboard/workflows y ver su configuración   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Migración Futura al API Real

### 9.1 Punto de Integración: `workflow-service.ts`

**Solo este archivo necesita cambios:**

```typescript
// ANTES (MVP):
class WorkflowService {
  async getWorkflowByTenant(tenantId: string) {
    await this.simulateNetworkDelay()
    const workflow = await workflowStorage.getByTenantId(tenantId)
    return workflow
  }
}

// DESPUÉS (Producción):
class WorkflowService {
  async getWorkflowByTenant(tenantId: string) {
    const res = await fetch(`/api/workflows?tenant_id=${tenantId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
    if (!res.ok) throw new Error('Failed to fetch workflow')
    return await res.json()
  }
}
```

### 9.2 API Routes Futuras

```
app/api/workflows/
├── route.ts                    # GET /api/workflows?tenant_id=xxx
├── [id]/
│   ├── route.ts                # GET, PATCH /api/workflows/:id
│   ├── config/route.ts         # PATCH /api/workflows/:id/config
│   └── credentials/route.ts    # GET, PATCH /api/workflows/:id/credentials
├── template/route.ts           # GET /api/workflows/template
└── validate/route.ts           # POST /api/workflows/validate
```

### 9.3 Cambios en Supabase

**Tabla `tenant_workflow_configs`:**

```sql
CREATE TABLE tenant_workflow_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  n8n_workflow_id TEXT NOT NULL UNIQUE,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  template_version TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX idx_tenant_workflow_configs_tenant_id ON tenant_workflow_configs(tenant_id);
CREATE INDEX idx_tenant_workflow_configs_n8n_id ON tenant_workflow_configs(n8n_workflow_id);

-- RLS
ALTER TABLE tenant_workflow_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's workflow"
  ON tenant_workflow_configs FOR SELECT
  USING (tenant_id = (SELECT tenants.id FROM tenants WHERE tenants.id = auth.uid()));
```

**Credenciales en Supabase Vault:**

```typescript
// Guardar credencial encriptada
await supabase.rpc('vault.create_secret', {
  secret: whatsapp_token,
  name: `whatsapp-token-${tenant_id}`
})

// Obtener credencial
const { data } = await supabase.rpc('vault.get_secret', {
  name: `whatsapp-token-${tenant_id}`
})
```

---

## 10. Checklist de Implementación

### Fase 1: Setup Base (1-2 horas)
- [ ] Crear estructura de carpetas `/workflows`
- [ ] Verificar dependencias: `@tanstack/react-query`, `sonner`
- [ ] Crear `workflow-types.ts`

### Fase 2: Capa de Datos (2-3 horas)
- [ ] `workflow-storage.ts` (localStorage wrapper)
- [ ] `workflow-template.ts` (template loader)
- [ ] `workflow-validator.ts` (validaciones)
- [ ] `workflow-service.ts` (mock de N8n API)

### Fase 3: Hooks (1-2 horas)
- [ ] `useWorkflow.ts` (hook principal)
- [ ] `useWorkflowCredentials.ts` (credenciales)

### Fase 4: Componentes UI (4-6 horas)
- [ ] `hud-corners.tsx` (reutilizable)
- [ ] `workflow-tabs.tsx` (container)
- [ ] `workflow-overview.tsx` (Tab 1)
- [ ] `workflow-config-editor.tsx` (Tab 2)
- [ ] `workflow-credentials-manager.tsx` (Tab 3)
- [ ] `workflow-status-badge.tsx`
- [ ] `workflow-node-visualizer.tsx`
- [ ] `workflow-error-boundary.tsx`

### Fase 5: Página Principal (1 hora)
- [ ] `app/(dashboard)/workflows/page.tsx`
- [ ] Agregar link en sidebar: "Workflows"

### Fase 6: Integración con Registro (2-3 horas)
- [ ] Actualizar `useRegistrationWizard.ts`
- [ ] Mejorar diseño de `registration-wizard.tsx`
- [ ] Actualizar `registration-stepper.tsx` (estilo HUD)
- [ ] Mejorar `registration-step-4.tsx` (validación visual)
- [ ] Actualizar `email-verification.tsx` (pantalla de creación)

### Fase 7: Estilos Globales (30 min)
- [ ] Agregar clases tech a `globals.css`
- [ ] `.glass-panel`, animaciones, scrollbar custom

### Fase 8: Testing Manual (2-3 horas)
- [ ] Flujo completo: registro → workflow creado
- [ ] Navegación entre tabs
- [ ] Edición de configuración + guardado
- [ ] Gestión de credenciales
- [ ] Exportación de template
- [ ] Error handling (forzar errores)
- [ ] Validaciones (campos inválidos)
- [ ] Responsive (mobile/tablet/desktop)

---

## 11. Estimación de Esfuerzo

| Fase | Estimación | Prioridad |
|------|------------|-----------|
| Setup Base | 1-2 horas | Alta |
| Capa de Datos | 2-3 horas | Alta |
| Hooks | 1-2 horas | Alta |
| Componentes UI | 4-6 horas | Alta |
| Página Principal | 1 hora | Alta |
| Integración con Registro | 2-3 horas | Alta |
| Estilos Globales | 30 min | Media |
| Testing Manual | 2-3 horas | Alta |
| **TOTAL** | **14-20 horas** | **~2-3 días** |

---

## 12. Dependencias y Riesgos

### 12.1 Dependencias Técnicas

| Dependencia | Estado | Notas |
|-------------|--------|-------|
| React Query | ✅ Ya instalado | Usado en hooks existentes |
| Sonner (toasts) | ✅ Ya instalado | Según CLAUDE.md |
| shadcn/ui | ✅ Ya instalado | Button, Input, Select, Label, Textarea |
| localStorage | ✅ Nativo | Funciona en todos los navegadores modernos |

### 12.2 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| localStorage límite de 5-10MB | Media | Medio | Validar tamaño antes de guardar, limpiar datos antiguos |
| Workflow template muy grande | Baja | Bajo | Simplificar template para MVP |
| Validaciones muy lentas | Baja | Bajo | Ajustar delays de mock si es necesario |
| Inconsistencia visual con login | Baja | Medio | Extraer HudCorners como componente reutilizable ✅ |

### 12.3 Limitaciones del MVP

⚠️ **Reconocidas y aceptadas:**

- Credenciales en base64 (no es seguro en producción)
- Validación de tokens simulada (no valida contra APIs reales)
- No hay rate limiting
- No hay paginación (un solo workflow por tenant)
- No hay sistema de roles granular dentro del tenant
- No hay logs de auditoría de cambios
- No hay versionado de configuración
- No hay rollback de configuración

**Estas limitaciones se resolverán en la integración con el API real.**

---

## 13. Criterios de Éxito

**MVP considerado exitoso si:**

✅ Usuario puede registrarse y automáticamente tiene un workflow asignado
✅ Usuario puede ver la configuración de su workflow en `/dashboard/workflows`
✅ Usuario puede editar prompts y configuraciones de negocio
✅ Usuario puede actualizar credenciales de WhatsApp/OpenAI/Anthropic
✅ Usuario puede exportar el template base como JSON
✅ Las validaciones funcionan correctamente (errores bloquean, warnings advierten)
✅ Los cambios se guardan y persisten (localStorage)
✅ El diseño visual es consistente con el login (HUD/Tech style)
✅ No hay errores de consola
✅ El wizard de registro tiene el mismo patrón visual que el login
✅ La experiencia es fluida y responsive

---

## 14. Notas Adicionales

### 14.1 Patrones de Código a Seguir

**Seguir convenciones de CLAUDE.md:**
- Archivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Server Components por defecto
- Client Components solo con `"use client"`

**Estilo visual:**
- Glass panels: `glass-panel rounded-2xl p-8`
- HUD corners: `<HudCorners />`
- Primary color: `#CEF25D` (lime green)
- Animaciones: `fadeIn`, `slideIn`
- Shadows con glow: `shadow-[0_0_60px_-10px_rgba(206,242,93,0.08)]`

### 14.2 Testing Sugerido

**Casos de prueba manuales:**

1. **Registro de nuevo usuario**
   - Completar wizard paso a paso
   - Verificar email con código "000000"
   - Confirmar que se crea workflow automáticamente
   - Verificar redirección al dashboard

2. **Navegación en /workflows**
   - Tab Overview: ver métricas
   - Tab Configuración: editar prompts
   - Tab Credenciales: actualizar tokens
   - Exportar template: descargar JSON

3. **Edición de configuración**
   - Cambiar modelo de IA
   - Editar prompt del Profiler
   - Modificar response delay
   - Habilitar office hours
   - Guardar cambios
   - Refrescar página → confirmar persistencia

4. **Validaciones**
   - Prompt muy corto → error
   - Prompt muy largo → warning
   - Delay fuera de rango → error
   - Token inválido → warning

5. **Error handling**
   - Simular error de red (desconectar wifi)
   - Forzar error en validación
   - Verificar que error boundary captura

---

**Documento aprobado y listo para implementación.**
**Próximo paso:** Crear plan de implementación detallado con `writing-plans` skill.
