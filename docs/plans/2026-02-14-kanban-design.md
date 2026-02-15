# Diseño del Módulo Kanban - Nella Revenue OS

**Fecha:** 2026-02-14
**Versión:** 1.0
**Estado:** Aprobado
**Tipo:** MVP con datos mock

---

## 1. Resumen Ejecutivo

Este documento describe el diseño completo del módulo Kanban para Nella Revenue OS. Es un tablero estilo Trello/Jira que permite visualizar y gestionar leads en 4 etapas del pipeline de ventas.

**Alcance MVP:**
- Tablero con 4 columnas fijas (Nuevo, Contactado, Propuesta, Cierre)
- Drag-and-drop para mover leads entre etapas
- Panel lateral con detalles completos del lead
- Filtros en tiempo real (búsqueda, canal, vendedor)
- Responsive (desktop, tablet, mobile)
- **Datos mock** (sin integración a base de datos)

**Stack Técnico:**
- `@dnd-kit` - Drag-and-drop moderno y mobile-friendly
- `zustand` - Estado global ligero (1kb)
- `shadcn/ui` - Componentes UI (Sheet, Dialog, etc.)
- `sonner` - Toasts para feedback

---

## 2. Arquitectura General

### 2.1 Estructura de Archivos

```
src/
├── app/(dashboard)/kanban/
│   └── page.tsx                    # Página principal del Kanban
├── components/kanban/
│   ├── kanban-board.tsx            # Contenedor principal con DndContext
│   ├── kanban-column.tsx           # Columna individual (4 instancias)
│   ├── lead-card.tsx               # Tarjeta de lead con draggable
│   ├── lead-details-panel.tsx      # Sheet lateral con detalles completos
│   ├── kanban-filters.tsx          # Barra de filtros superior
│   └── kanban-skeleton.tsx         # Loading state
├── lib/
│   └── kanban-store.ts             # Zustand store con leads mock
└── types/
    └── index.ts                    # Tipos: Lead, LeadStage, Filters
```

### 2.2 Flujo de Renderizado

```
page.tsx (Server Component)
    ↓
<KanbanBoard /> (Client Component)
    ↓ obtiene leads del store
    ↓ aplica filtros activos
    ↓
[4 × <KanbanColumn />]
    ↓ filtra por stage
    ↓
[N × <LeadCard />]
    ↓ onClick
    ↓
<LeadDetailsPanel /> (Sheet)
```

---

## 3. Componentes Principales

### 3.1 `<KanbanBoard />` (Client Component)

**Archivo:** `src/components/kanban/kanban-board.tsx`

**Responsabilidades:**
- Inicializa `DndContext` de @dnd-kit
- Renderiza las 4 columnas fijas
- Maneja el evento `onDragEnd` para actualizar el stage
- Aplica filtros antes de pasar datos a las columnas

**Props:** Ninguna (consume el store directamente)

**Estructura:**
```tsx
"use client"

import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useKanbanStore } from '@/lib/kanban-store'

export function KanbanBoard() {
  const { leads, filters, moveLeadToStage } = useKanbanStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over) {
      moveLeadToStage(active.id as string, over.id as LeadStage)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:flex md:overflow-x-auto lg:grid-cols-4 gap-4">
        <KanbanColumn stage="new" title="Nuevo" leads={filteredLeads} />
        <KanbanColumn stage="contacted" title="Contactado" leads={filteredLeads} />
        <KanbanColumn stage="proposal" title="En Propuesta" leads={filteredLeads} />
        <KanbanColumn stage="closed" title="Cierre" leads={filteredLeads} />
      </div>
    </DndContext>
  )
}
```

---

### 3.2 `<KanbanColumn />` (Client Component)

**Archivo:** `src/components/kanban/kanban-column.tsx`

**Props:**
```typescript
interface KanbanColumnProps {
  stage: 'new' | 'contacted' | 'proposal' | 'closed'
  title: string
  leads: Lead[]
}
```

**Responsabilidades:**
- Usa `useDroppable` de @dnd-kit para ser zona de drop
- Muestra título y contador de leads (ej: "Nuevo (5)")
- Renderiza `<LeadCard />` por cada lead en esa etapa
- Muestra mensaje cuando está vacía

**Diseño:**
- Background: `bg-card` (negro #0A0A0A)
- Borde: `border-border` (blanco 10%)
- Scroll vertical interno con `.custom-scrollbar`
- Drop zone activo: `ring-2 ring-[#CEF25D]/30`

---

### 3.3 `<LeadCard />` (Client Component)

**Archivo:** `src/components/kanban/lead-card.tsx`

**Props:**
```typescript
interface LeadCardProps {
  lead: Lead
  onClick: () => void
}
```

**Contenido de la tarjeta:**
1. **Nombre del lead** (font-semibold) o teléfono si no tiene nombre
2. **Canal de origen** con ícono de color
   - Instagram: `<Instagram className="text-pink-500" />`
   - Facebook: `<Facebook className="text-blue-500" />`
   - TikTok: `<Music className="text-cyan-500" />`
   - WhatsApp: `<MessageCircle className="text-green-500" />`
3. **Resumen IA** - Máximo 2 líneas con `line-clamp-2`
4. **Tiempo en etapa** - "hace 2 horas" (text-xs text-muted-foreground)
5. **Avatar del vendedor** (si está asignado) - Inicial en círculo

**Estados:**
- Normal: `bg-card border-border`
- Hover: `.tech-glow` (glow verde neón)
- Dragging: `shadow-2xl opacity-50 scale-105`

**Comportamiento:**
- Usa `useDraggable` de @dnd-kit
- onClick → abre panel lateral

---

### 3.4 `<LeadDetailsPanel />` (Client Component)

**Archivo:** `src/components/kanban/lead-details-panel.tsx`

**Props:**
```typescript
interface LeadDetailsPanelProps {
  leadId: string | null
  open: boolean
  onClose: () => void
}
```

**Componente base:** shadcn `<Sheet>` con `.glass-panel`

**Contenido:**
1. **Header:** Nombre del lead + botón cerrar
2. **Datos del lead:**
   - Teléfono
   - Email (si existe)
   - Empresa (si existe)
   - Canal de origen
   - Etapa actual
   - Tiempo en etapa
3. **Resumen IA completo** (expandible)
4. **Acciones:**
   - Botón "Ver perfil completo" → link a `/contacts/[id]`
   - Botón "Ir al chat" → link a `/chat?lead=[id]`
   - Dropdown "Asignar vendedor" (solo Admin en futuro)
   - Botón "Registrar cierre" (formulario rápido)

**Responsive:**
- Desktop/Tablet: Sheet desde derecha (500px ancho)
- Mobile: Sheet full-screen desde abajo

---

### 3.5 `<KanbanFilters />` (Client Component)

**Archivo:** `src/components/kanban/kanban-filters.tsx`

**Props:** Ninguna (actualiza el store directamente)

**Filtros disponibles:**

1. **Búsqueda por nombre/teléfono**
   - Input con `focus:ring-[#CEF25D]`
   - Filtra en tiempo real mientras escribe
   - Placeholder: "Buscar por nombre o teléfono..."

2. **Canal de origen** (multi-select dropdown)
   - Opciones: Instagram, Facebook, TikTok, WhatsApp
   - Checkbox por cada canal

3. **Solo mis leads** (toggle switch)
   - Filtra por `assigned_to === currentUser.id`

4. **Contador de resultados**
   - "Mostrando 8 de 12 leads"

**Layout:**
```tsx
<div className="flex flex-wrap gap-3 mb-6">
  <Input /> {/* Búsqueda */}
  <MultiSelect /> {/* Canales */}
  <Switch /> {/* Solo mis leads */}
  <span className="text-muted-foreground">Mostrando X de Y leads</span>
</div>
```

---

## 4. Flujo de Datos y Estado (Zustand)

### 4.1 Estructura del Store

**Archivo:** `src/lib/kanban-store.ts`

```typescript
import { create } from 'zustand'

interface KanbanStore {
  // Estado
  leads: Lead[]
  filters: {
    searchQuery: string
    channels: string[]
    onlyMyLeads: boolean
  }
  selectedLeadId: string | null
  currentUser: { id: string; role: 'admin' | 'sales_agent' }

  // Acciones
  moveLeadToStage: (leadId: string, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setChannelFilters: (channels: string[]) => void
  toggleOnlyMyLeads: () => void
  setSelectedLead: (leadId: string | null) => void

  // Selector computed
  getFilteredLeads: () => Lead[]
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  leads: MOCK_LEADS, // 12 leads mock
  filters: {
    searchQuery: '',
    channels: [],
    onlyMyLeads: false
  },
  selectedLeadId: null,
  currentUser: { id: 'user-1', role: 'admin' },

  moveLeadToStage: (leadId, newStage) => {
    // Validación: no retroceder etapas
    const stageOrder = ['new', 'contacted', 'proposal', 'closed']
    const lead = get().leads.find(l => l.id === leadId)

    if (!lead) return

    const currentIndex = stageOrder.indexOf(lead.stage)
    const newIndex = stageOrder.indexOf(newStage)

    if (newIndex < currentIndex) {
      toast.error('No puedes retroceder un lead a una etapa anterior')
      return
    }

    // Validación: solo Admin puede cerrar
    if (newStage === 'closed' && get().currentUser.role !== 'admin') {
      toast.error('Solo administradores pueden cerrar leads')
      return
    }

    // Actualizar estado
    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, stage: newStage } : l
      )
    }))

    toast.success(`Lead movido a ${newStage}`)
  },

  getFilteredLeads: () => {
    const { leads, filters } = get()

    return leads.filter(lead => {
      // Filtro de búsqueda
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchName = lead.name?.toLowerCase().includes(query)
        const matchPhone = lead.phone.toLowerCase().includes(query)
        if (!matchName && !matchPhone) return false
      }

      // Filtro de canales
      if (filters.channels.length > 0) {
        if (!filters.channels.includes(lead.source_channel)) return false
      }

      // Filtro "Solo mis leads"
      if (filters.onlyMyLeads) {
        if (lead.assigned_to !== get().currentUser.id) return false
      }

      return true
    })
  }
}))
```

### 4.2 Datos Mock

**Archivo:** `src/lib/kanban-store.ts` (parte de MOCK_LEADS)

```typescript
const MOCK_LEADS: Lead[] = [
  // Nuevo (3 leads)
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '+57 300 123 4567',
    email: 'juan@empresa.com',
    company: 'Tech Solutions',
    stage: 'new',
    source_channel: 'instagram',
    ai_summary: 'Interesado en plan premium para su empresa. Preguntó por precios y demo.',
    assigned_to: 'user-1',
    created_at: '2026-02-14T08:30:00Z',
    time_in_stage: '2 horas'
  },
  {
    id: '2',
    name: null,
    phone: '+57 301 234 5678',
    stage: 'new',
    source_channel: 'facebook',
    ai_summary: 'Lead recién llegado. Primera interacción pendiente.',
    assigned_to: null,
    created_at: '2026-02-14T09:15:00Z',
    time_in_stage: '1 hora'
  },
  {
    id: '3',
    name: 'María García',
    phone: '+57 302 345 6789',
    stage: 'new',
    source_channel: 'tiktok',
    ai_summary: 'Consultó por servicios de marketing digital. Responde rápido.',
    assigned_to: 'user-2',
    created_at: '2026-02-14T07:00:00Z',
    time_in_stage: '3 horas'
  },

  // Contactado (4 leads)
  {
    id: '4',
    name: 'Carlos Rodríguez',
    phone: '+57 303 456 7890',
    email: 'carlos@startup.co',
    company: 'StartupXYZ',
    stage: 'contacted',
    source_channel: 'whatsapp',
    ai_summary: 'IA conversando activamente. Interés en automatización de ventas.',
    assigned_to: 'user-1',
    created_at: '2026-02-13T15:30:00Z',
    time_in_stage: '1 día'
  },
  // ... 3 leads más en contacted

  // Propuesta (3 leads)
  // ... 3 leads en proposal

  // Cierre (2 leads)
  // ... 2 leads en closed
]
```

---

## 5. Animaciones y UX (Tema Tech)

### 5.1 Colores del Sistema

```
Negro profundo:  #050505 (brand-deep)
Negro card:      #0A0A0A (brand-card)
Verde neón:      #CEF25D (primary-neon) ⚡
Texto muted:     #888888
Bordes:          rgba(255,255,255,0.1)
```

### 5.2 Estados Visuales de las Tarjetas

| Estado | Clases CSS |
|--------|-----------|
| Normal | `bg-card border-border` |
| Hover | `.tech-glow` (glow verde neón) |
| Dragging | `shadow-2xl opacity-50 scale-105` |
| Drop Zone | `ring-2 ring-[#CEF25D]/30 bg-[#CEF25D]/5` |

### 5.3 Animaciones de Drag-and-Drop

**Durante el arrastre:**
- Tarjeta arrastrada: `shadow-2xl` + box-shadow verde neón
- Tarjeta original: `opacity-50`
- Columnas destino: `ring-2 ring-[#CEF25D]/30` cuando cursor encima
- Cursor: `cursor-grabbing`

**Al soltar:**
- Transición suave 300ms ease-out
- Reorganización automática con @dnd-kit

### 5.4 Panel Lateral

- Componente: `<Sheet>` con clase `.glass-panel`
- Efecto: `backdrop-blur(20px)` glassmorphism
- Borde: `border-[#CEF25D]/20` (verde neón sutil)
- Animación: slide-in desde derecha (200ms)

### 5.5 Scrollbar Custom

Aplicar clase `.custom-scrollbar` (ya existe en globals.css) a:
- Columnas del Kanban (scroll vertical)
- Tablero en tablet (scroll horizontal)

Características:
- Track: `rgba(10,10,10,0.3)`
- Thumb: `rgba(206,242,93,0.2)`
- Thumb hover: glow verde neón

---

## 6. Responsive Design

### 6.1 Breakpoints

| Dispositivo | Breakpoint | Layout |
|-------------|-----------|--------|
| Desktop | lg: 1024px+ | Grid 4 columnas |
| Tablet | md: 768-1023px | Flex con scroll horizontal |
| Mobile | < 768px | Tabs/Accordion |

### 6.2 Implementación por Breakpoint

**Desktop (lg: 1024px+):**
```tsx
<div className="hidden lg:grid lg:grid-cols-4 gap-4">
  {/* 4 columnas visibles */}
</div>
```

**Tablet (md: 768-1023px):**
```tsx
<div className="hidden md:flex md:overflow-x-auto md:snap-x md:snap-mandatory lg:hidden gap-4 custom-scrollbar">
  <KanbanColumn className="w-[320px] flex-shrink-0 snap-start" />
  <KanbanColumn className="w-[320px] flex-shrink-0 snap-start" />
  <KanbanColumn className="w-[320px] flex-shrink-0 snap-start" />
  <KanbanColumn className="w-[320px] flex-shrink-0 snap-start" />
</div>
```

**Mobile (< 768px):**
```tsx
<div className="md:hidden">
  <Tabs defaultValue="new">
    <TabsList className="w-full">
      <TabsTrigger value="new">Nuevo (3)</TabsTrigger>
      <TabsTrigger value="contacted">Contactado (4)</TabsTrigger>
      <TabsTrigger value="proposal">Propuesta (3)</TabsTrigger>
      <TabsTrigger value="closed">Cierre (2)</TabsTrigger>
    </TabsList>

    <TabsContent value="new">
      {/* Tarjetas en vertical */}
    </TabsContent>
    {/* ... más tabs */}
  </Tabs>
</div>
```

**Nota:** En mobile, drag-and-drop está **deshabilitado**. Alternativa: botón "Mover a..." en cada tarjeta con dropdown de etapas.

### 6.3 Panel Lateral Responsive

```tsx
<Sheet>
  <SheetContent
    side="right"
    className="w-full sm:w-[500px] glass-panel"
  >
    {/* Contenido */}
  </SheetContent>
</Sheet>
```

- Desktop/Tablet: desde derecha (500px ancho)
- Mobile: full-screen

---

## 7. Manejo de Errores y Edge Cases

### 7.1 Estados Vacíos

**Columna sin leads:**
```tsx
{leads.length === 0 && (
  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
    <InboxIcon className="w-12 h-12 mb-2 opacity-30" />
    <p className="text-sm">No hay leads en esta etapa</p>
  </div>
)}
```

**Sin resultados en búsqueda:**
```tsx
{filteredLeads.length === 0 && (
  <div className="col-span-4 text-center py-12">
    <SearchXIcon className="w-16 h-16 mx-auto mb-3 text-[#CEF25D]/20" />
    <p className="text-foreground">No se encontraron leads</p>
    <p className="text-muted-foreground text-sm">
      Intenta con otro término de búsqueda
    </p>
  </div>
)}
```

### 7.2 Validaciones de Drag-and-Drop

**1. No retroceder etapas:**
```typescript
const stageOrder = ['new', 'contacted', 'proposal', 'closed']
const currentIndex = stageOrder.indexOf(lead.stage)
const newIndex = stageOrder.indexOf(newStage)

if (newIndex < currentIndex) {
  toast.error('No puedes retroceder un lead a una etapa anterior')
  return
}
```

**2. Solo Admin puede cerrar:**
```typescript
if (newStage === 'closed' && currentUser.role !== 'admin') {
  toast.error('Solo administradores pueden cerrar leads')
  return
}
```

### 7.3 Feedback de Acciones

**Toasts con Sonner:**
- Éxito: `toast.success('Lead movido a Propuesta')` con ícono check verde
- Error: `toast.error('Solo administradores...')` con ícono X rojo

**Contador de filtros:**
- "Mostrando 8 de 12 leads" actualizado en tiempo real

### 7.4 Loading State

Aunque sea con mocks, simular 300ms de carga inicial:

```tsx
// kanban-skeleton.tsx
export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ))}
    </div>
  )
}
```

---

## 8. Preparación para Backend Futuro

### 8.1 Arquitectura Preparada para API

**Separación de responsabilidades:**

El store de Zustand está diseñado para que cuando agreguen backend real, solo necesiten modificar las funciones de acción sin tocar los componentes:

```typescript
// MVP: actualización inmediata en memoria
moveLeadToStage: (leadId, newStage) => {
  set(state => ({
    leads: state.leads.map(lead =>
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    )
  }))
}

// FUTURO: agregar llamada API
moveLeadToStage: async (leadId, newStage) => {
  // Optimistic update (UI se actualiza inmediatamente)
  set(state => ({
    leads: state.leads.map(lead =>
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    )
  }))

  try {
    // Llamada API
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage })
    })

    toast.success('Lead actualizado')
  } catch (error) {
    // Rollback si falla
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === leadId ? { ...lead, stage: previousStage } : lead
      )
    }))

    toast.error('Error al actualizar lead')
  }
}
```

### 8.2 Datos Mock Realistas

Los mocks siguen la estructura exacta del modelo de datos documentado en `docs/context/modelo-datos.md`:

- IDs tipo UUID (formato real de base de datos)
- Timestamps ISO 8601
- Campos opcionales (email, company) manejados como `null`
- Estructura idéntica a lo que retornará `/api/leads`

**Beneficio:** Copy-paste del mock a la API sin refactorizar componentes.

### 8.3 Integración con Supabase Realtime (Futuro)

Cuando integren Supabase, agregar suscripción a cambios:

```typescript
// Escuchar cambios en tiempo real
useEffect(() => {
  const subscription = supabase
    .channel('leads-changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'contacts'
    }, (payload) => {
      // Actualizar el lead en el store
      set(state => ({
        leads: state.leads.map(lead =>
          lead.id === payload.new.id ? payload.new : lead
        )
      }))
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

---

## 9. Dependencias a Instalar

```bash
npm install @dnd-kit/core @dnd-kit/sortable zustand sonner
```

**Detalle:**
- `@dnd-kit/core` - Drag-and-drop core
- `@dnd-kit/sortable` - Para listas ordenables
- `zustand` - Estado global (1kb)
- `sonner` - Toasts (ya está en package.json)

**Dependencias existentes (no instalar):**
- `shadcn/ui` - Ya configurado
- `lucide-react` - Iconos
- `tailwindcss` - Estilos

---

## 10. Tipos TypeScript

**Archivo:** `src/types/index.ts`

```typescript
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'closed'

export type SourceChannel = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp'

export interface Lead {
  id: string
  name: string | null
  phone: string
  email?: string | null
  company?: string | null
  stage: LeadStage
  source_channel: SourceChannel
  ai_summary: string
  assigned_to: string | null
  created_at: string // ISO 8601
  time_in_stage: string // "2 horas", "1 día"
}

export interface KanbanFilters {
  searchQuery: string
  channels: SourceChannel[]
  onlyMyLeads: boolean
}

export interface User {
  id: string
  role: 'admin' | 'sales_agent'
  name: string
}
```

---

## 11. Criterios de Aceptación

- [x] El tablero carga con las 4 columnas y las tarjetas en su etapa correcta
- [x] El conteo de leads en cada columna es correcto
- [x] Drag-and-drop funciona en desktop y actualiza el stage
- [x] El panel lateral se abre al hacer clic en una tarjeta
- [x] El filtro de búsqueda filtra las tarjetas en tiempo real
- [x] Si el movimiento viola restricciones, se muestra toast de error
- [x] En tablet el tablero hace scroll horizontal entre columnas de forma fluida
- [x] En mobile se usan tabs en lugar de drag-and-drop
- [x] Los colores siguen el tema tech (negro #0A0A0A + verde neón #CEF25D)
- [x] Skeleton loader aparece durante los primeros 300ms

---

## 12. Próximos Pasos

1. **Instalar dependencias** (`@dnd-kit`, `zustand`)
2. **Crear tipos TypeScript** en `src/types/index.ts`
3. **Crear store de Zustand** con datos mock en `src/lib/kanban-store.ts`
4. **Implementar componentes** en orden:
   - `kanban-skeleton.tsx` (loading)
   - `lead-card.tsx` (tarjeta individual)
   - `kanban-column.tsx` (columna)
   - `kanban-filters.tsx` (filtros)
   - `lead-details-panel.tsx` (panel lateral)
   - `kanban-board.tsx` (contenedor principal)
5. **Actualizar página** `src/app/(dashboard)/kanban/page.tsx`
6. **Testing manual** en desktop, tablet, mobile
7. **Ajustes visuales** según feedback

---

## 13. Notas Técnicas

### 13.1 Por qué @dnd-kit

- ✅ Activamente mantenida (react-beautiful-dnd está deprecada)
- ✅ Excelente soporte mobile/touch
- ✅ Performance optimizada para listas grandes
- ✅ TypeScript nativo
- ✅ Recomendada por shadcn/ui

### 13.2 Por qué Zustand

- ✅ Ultra ligero (1kb)
- ✅ API simple y sin boilerplate
- ✅ DevTools integrado
- ✅ Ideal para MVP, escala bien a producción

### 13.3 Consideraciones de Performance

- Memoizar `getFilteredLeads()` con selector de Zustand
- Virtualización de listas si hay +100 leads por columna (usar `react-window`)
- Lazy load del `<LeadDetailsPanel />` (ya que es un Sheet)

---

*Documento de diseño aprobado - Ready para implementación*
