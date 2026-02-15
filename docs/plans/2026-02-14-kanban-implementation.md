# Módulo Kanban - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar un tablero Kanban completo tipo Trello/Jira con drag-and-drop, filtros, y panel lateral de detalles usando datos mock.

**Architecture:** Componentes React con @dnd-kit para drag-and-drop, Zustand para estado global, shadcn/ui para UI components. Diseño responsive con tema tech (negro #0A0A0A + verde neón #CEF25D). Sin backend, solo datos mock en memoria.

**Tech Stack:** Next.js 16, TypeScript, @dnd-kit/core, @dnd-kit/sortable, Zustand, shadcn/ui, Tailwind CSS 4, Sonner

**Design Reference:** `docs/plans/2026-02-14-kanban-design.md`

---

## Task 1: Instalar Dependencias

**Files:**
- Modify: `package.json`

**Step 1: Instalar @dnd-kit y zustand**

```bash
npm install @dnd-kit/core @dnd-kit/sortable zustand
```

Expected output: Dependencies added to package.json

**Step 2: Verificar instalación**

```bash
npm list @dnd-kit/core @dnd-kit/sortable zustand
```

Expected: Ver versiones instaladas sin errores

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat|kanban|20260214|instalar dependencias dnd-kit y zustand"
```

---

## Task 2: Crear Tipos TypeScript

**Files:**
- Modify: `src/types/index.ts` (agregar tipos al final del archivo)

**Step 1: Leer archivo existente**

```bash
cat src/types/index.ts
```

**Step 2: Agregar tipos del Kanban**

Agregar al final de `src/types/index.ts`:

```typescript
// ============================================
// Kanban Module Types
// ============================================

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

export interface KanbanUser {
  id: string
  role: 'admin' | 'sales_agent'
  name: string
}
```

**Step 3: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso sin errores de tipos

**Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat|kanban|20260214|agregar tipos TypeScript del Kanban"
```

---

## Task 3: Crear Store de Zustand con Datos Mock

**Files:**
- Create: `src/lib/kanban-store.ts`

**Step 1: Crear archivo del store**

Create file: `src/lib/kanban-store.ts`

```typescript
import { create } from 'zustand'
import { toast } from 'sonner'
import type { Lead, LeadStage, KanbanFilters, KanbanUser, SourceChannel } from '@/types'

// ============================================
// Mock Data - 12 Leads
// ============================================

const MOCK_LEADS: Lead[] = [
  // Nuevo (3 leads)
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '+57 300 123 4567',
    email: 'juan@techsolutions.co',
    company: 'Tech Solutions SAS',
    stage: 'new',
    source_channel: 'instagram',
    ai_summary: 'Interesado en plan premium para su empresa. Preguntó por precios y demo del sistema.',
    assigned_to: 'user-1',
    created_at: '2026-02-14T08:30:00Z',
    time_in_stage: '2 horas'
  },
  {
    id: '2',
    name: null,
    phone: '+57 301 234 5678',
    email: null,
    company: null,
    stage: 'new',
    source_channel: 'facebook',
    ai_summary: 'Lead recién llegado desde campaña de Facebook. Primera interacción pendiente.',
    assigned_to: null,
    created_at: '2026-02-14T09:15:00Z',
    time_in_stage: '1 hora'
  },
  {
    id: '3',
    name: 'María García',
    phone: '+57 302 345 6789',
    email: 'maria.garcia@gmail.com',
    company: null,
    stage: 'new',
    source_channel: 'tiktok',
    ai_summary: 'Consultó por servicios de marketing digital. Responde muy rápido en WhatsApp.',
    assigned_to: 'user-2',
    created_at: '2026-02-14T07:00:00Z',
    time_in_stage: '3 horas'
  },

  // Contactado (4 leads)
  {
    id: '4',
    name: 'Carlos Rodríguez',
    phone: '+57 303 456 7890',
    email: 'carlos@startupxyz.co',
    company: 'StartupXYZ',
    stage: 'contacted',
    source_channel: 'whatsapp',
    ai_summary: 'IA conversando activamente. Interés en automatización de ventas. Solicitó cotización.',
    assigned_to: 'user-1',
    created_at: '2026-02-13T15:30:00Z',
    time_in_stage: '1 día'
  },
  {
    id: '5',
    name: 'Ana Martínez',
    phone: '+57 304 567 8901',
    email: 'ana.martinez@empresa.com',
    company: 'Distribuidora Nacional',
    stage: 'contacted',
    source_channel: 'instagram',
    ai_summary: 'Necesita solución para equipo de 10 vendedores. Respondió 3 veces en las últimas 6 horas.',
    assigned_to: 'user-1',
    created_at: '2026-02-13T12:00:00Z',
    time_in_stage: '1 día'
  },
  {
    id: '6',
    name: 'Luis Fernández',
    phone: '+57 305 678 9012',
    email: null,
    company: null,
    stage: 'contacted',
    source_channel: 'facebook',
    ai_summary: 'Preguntó por integración con WhatsApp Business API. Dudas sobre costo mensual.',
    assigned_to: 'user-2',
    created_at: '2026-02-14T06:00:00Z',
    time_in_stage: '4 horas'
  },
  {
    id: '7',
    name: 'Sandra López',
    phone: '+57 306 789 0123',
    email: 'sandra@tiendaonline.co',
    company: 'Tienda Online Colombia',
    stage: 'contacted',
    source_channel: 'tiktok',
    ai_summary: 'E-commerce buscando automatizar atención al cliente. Interés alto, pidió caso de éxito.',
    assigned_to: 'user-2',
    created_at: '2026-02-13T18:00:00Z',
    time_in_stage: '16 horas'
  },

  // Propuesta (3 leads)
  {
    id: '8',
    name: 'Roberto Gómez',
    phone: '+57 307 890 1234',
    email: 'roberto.gomez@agencia.co',
    company: 'Agencia Digital Pro',
    stage: 'proposal',
    source_channel: 'whatsapp',
    ai_summary: 'Propuesta enviada para plan Enterprise. Esperando aprobación del presupuesto interno.',
    assigned_to: 'user-1',
    created_at: '2026-02-12T10:00:00Z',
    time_in_stage: '2 días'
  },
  {
    id: '9',
    name: 'Patricia Ruiz',
    phone: '+57 308 901 2345',
    email: 'patricia@constructora.co',
    company: 'Constructora del Valle',
    stage: 'proposal',
    source_channel: 'instagram',
    ai_summary: 'Interesada en demo personalizado. Propuesta presentada ayer, siguiente paso: reunión.',
    assigned_to: 'user-1',
    created_at: '2026-02-11T14:30:00Z',
    time_in_stage: '3 días'
  },
  {
    id: '10',
    name: 'Diego Torres',
    phone: '+57 309 012 3456',
    email: 'diego.torres@retail.co',
    company: 'Retail Solutions',
    stage: 'proposal',
    source_channel: 'facebook',
    ai_summary: 'Comparando con competencia. IA presentó diferenciadores clave. Responde activamente.',
    assigned_to: 'user-2',
    created_at: '2026-02-13T09:00:00Z',
    time_in_stage: '1 día'
  },

  // Cierre (2 leads)
  {
    id: '11',
    name: 'Claudia Herrera',
    phone: '+57 310 123 4567',
    email: 'claudia@consultoria.co',
    company: 'Consultoría Empresarial',
    stage: 'closed',
    source_channel: 'whatsapp',
    ai_summary: 'Aceptó propuesta. Agendó llamada de onboarding para mañana. Deal confirmado.',
    assigned_to: 'user-1',
    created_at: '2026-02-10T11:00:00Z',
    time_in_stage: '4 días'
  },
  {
    id: '12',
    name: 'Fernando Castro',
    phone: '+57 311 234 5678',
    email: 'fernando@logistica.co',
    company: 'Logística Express',
    stage: 'closed',
    source_channel: 'instagram',
    ai_summary: 'Cerrado exitosamente. Firmó contrato anual. Implementación programada para próxima semana.',
    assigned_to: 'user-1',
    created_at: '2026-02-09T16:00:00Z',
    time_in_stage: '5 días'
  }
]

// ============================================
// Store Interface
// ============================================

interface KanbanStore {
  // Estado
  leads: Lead[]
  filters: KanbanFilters
  selectedLeadId: string | null
  currentUser: KanbanUser

  // Acciones
  moveLeadToStage: (leadId: string, newStage: LeadStage) => void
  setSearchQuery: (query: string) => void
  setChannelFilters: (channels: SourceChannel[]) => void
  toggleOnlyMyLeads: () => void
  setSelectedLead: (leadId: string | null) => void

  // Selectores
  getFilteredLeads: () => Lead[]
  getLeadsByStage: (stage: LeadStage) => Lead[]
}

// ============================================
// Store Implementation
// ============================================

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  // Estado inicial
  leads: MOCK_LEADS,
  filters: {
    searchQuery: '',
    channels: [],
    onlyMyLeads: false
  },
  selectedLeadId: null,
  currentUser: {
    id: 'user-1',
    role: 'admin',
    name: 'Usuario Demo'
  },

  // Acción: Mover lead a nueva etapa
  moveLeadToStage: (leadId: string, newStage: LeadStage) => {
    const lead = get().leads.find(l => l.id === leadId)
    if (!lead) return

    // Validación 1: No retroceder etapas
    const stageOrder: LeadStage[] = ['new', 'contacted', 'proposal', 'closed']
    const currentIndex = stageOrder.indexOf(lead.stage)
    const newIndex = stageOrder.indexOf(newStage)

    if (newIndex < currentIndex) {
      toast.error('No puedes retroceder un lead a una etapa anterior')
      return
    }

    // Validación 2: Solo Admin puede cerrar
    if (newStage === 'closed' && get().currentUser.role !== 'admin') {
      toast.error('Solo administradores pueden cerrar leads')
      return
    }

    // Actualizar estado
    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId
          ? { ...l, stage: newStage, time_in_stage: 'Ahora' }
          : l
      )
    }))

    const stageNames = {
      new: 'Nuevo',
      contacted: 'Contactado',
      proposal: 'Propuesta',
      closed: 'Cierre'
    }

    toast.success(`Lead movido a ${stageNames[newStage]}`)
  },

  // Acción: Actualizar búsqueda
  setSearchQuery: (query: string) => {
    set(state => ({
      filters: { ...state.filters, searchQuery: query }
    }))
  },

  // Acción: Actualizar filtro de canales
  setChannelFilters: (channels: SourceChannel[]) => {
    set(state => ({
      filters: { ...state.filters, channels }
    }))
  },

  // Acción: Toggle "Solo mis leads"
  toggleOnlyMyLeads: () => {
    set(state => ({
      filters: { ...state.filters, onlyMyLeads: !state.filters.onlyMyLeads }
    }))
  },

  // Acción: Seleccionar lead (para panel lateral)
  setSelectedLead: (leadId: string | null) => {
    set({ selectedLeadId: leadId })
  },

  // Selector: Obtener leads filtrados
  getFilteredLeads: () => {
    const { leads, filters, currentUser } = get()

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
        if (lead.assigned_to !== currentUser.id) return false
      }

      return true
    })
  },

  // Selector: Obtener leads por etapa
  getLeadsByStage: (stage: LeadStage) => {
    return get().getFilteredLeads().filter(lead => lead.stage === stage)
  }
}))
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso sin errores

**Step 3: Commit**

```bash
git add src/lib/kanban-store.ts
git commit -m "feat|kanban|20260214|crear store Zustand con 12 leads mock"
```

---

## Task 4: Crear Componente Skeleton de Loading

**Files:**
- Create: `src/components/kanban/kanban-skeleton.tsx`

**Step 1: Crear directorio si no existe**

```bash
mkdir -p src/components/kanban
```

**Step 2: Crear componente skeleton**

Create file: `src/components/kanban/kanban-skeleton.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:flex md:overflow-x-auto lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((column) => (
        <div key={column} className="space-y-3 w-full md:w-[320px] shrink-0">
          {/* Header skeleton */}
          <Skeleton className="h-10 w-full" />

          {/* Cards skeleton */}
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full opacity-50" />
        </div>
      ))}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/kanban/kanban-skeleton.tsx
git commit -m "feat|kanban|20260214|crear skeleton loader para Kanban"
```

---

## Task 5: Crear Componente LeadCard

**Files:**
- Create: `src/components/kanban/lead-card.tsx`

**Step 1: Crear componente LeadCard**

Create file: `src/components/kanban/lead-card.tsx`

```typescript
'use client'

import { useDraggable } from '@dnd-kit/core'
import { Instagram, Facebook, Music, MessageCircle, User } from 'lucide-react'
import type { Lead } from '@/types'
import { cn } from '@/lib/utils'

interface LeadCardProps {
  lead: Lead
  onClick: () => void
}

const channelIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
  whatsapp: MessageCircle
}

const channelColors = {
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  tiktok: 'text-cyan-500',
  whatsapp: 'text-green-500'
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead }
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : undefined

  const ChannelIcon = channelIcons[lead.source_channel]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card border-border rounded-lg p-4 cursor-pointer transition-all',
        'tech-glow',
        isDragging && 'opacity-50 shadow-2xl scale-105 cursor-grabbing',
        !isDragging && 'hover:shadow-lg'
      )}
    >
      {/* Header: Nombre + Canal */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-foreground line-clamp-1">
          {lead.name || lead.phone}
        </h3>
        <ChannelIcon className={cn('w-4 h-4 shrink-0 ml-2', channelColors[lead.source_channel])} />
      </div>

      {/* Resumen IA */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {lead.ai_summary}
      </p>

      {/* Footer: Tiempo + Asignado */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{lead.time_in_stage}</span>
        {lead.assigned_to && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-[#CEF25D]/20 flex items-center justify-center">
              <User className="w-3 h-3 text-[#CEF25D]" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso sin errores

**Step 3: Commit**

```bash
git add src/components/kanban/lead-card.tsx
git commit -m "feat|kanban|20260214|crear componente LeadCard con drag-and-drop"
```

---

## Task 6: Crear Componente KanbanColumn

**Files:**
- Create: `src/components/kanban/kanban-column.tsx`

**Step 1: Crear componente KanbanColumn**

Create file: `src/components/kanban/kanban-column.tsx`

```typescript
'use client'

import { useDroppable } from '@dnd-kit/core'
import { Inbox } from 'lucide-react'
import { LeadCard } from './lead-card'
import type { Lead, LeadStage } from '@/types'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  stage: LeadStage
  title: string
  leads: Lead[]
  onLeadClick: (leadId: string) => void
}

export function KanbanColumn({ stage, title, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage }
  })

  const leadsInStage = leads.filter(lead => lead.stage === stage)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-card border-border rounded-lg p-4 min-h-[600px] w-full md:w-[320px] shrink-0',
        'flex flex-col transition-all',
        isOver && 'ring-2 ring-[#CEF25D]/30 bg-[#CEF25D]/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {leadsInStage.length}
        </span>
      </div>

      {/* Leads */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {leadsInStage.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Inbox className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm">No hay leads en esta etapa</p>
          </div>
        ) : (
          leadsInStage.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/kanban/kanban-column.tsx
git commit -m "feat|kanban|20260214|crear componente KanbanColumn con drop zone"
```

---

## Task 7: Crear Componente KanbanFilters

**Files:**
- Create: `src/components/kanban/kanban-filters.tsx`

**Step 1: Crear componente KanbanFilters**

Create file: `src/components/kanban/kanban-filters.tsx`

```typescript
'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useKanbanStore } from '@/lib/kanban-store'

export function KanbanFilters() {
  const {
    filters,
    leads,
    setSearchQuery,
    setChannelFilters,
    toggleOnlyMyLeads,
    getFilteredLeads
  } = useKanbanStore()

  const filteredLeads = getFilteredLeads()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 p-4 bg-card border-border rounded-lg">
      {/* Búsqueda */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 focus:ring-[#CEF25D]"
        />
      </div>

      {/* Filtro de Canal */}
      <Select
        value={filters.channels[0] || 'all'}
        onValueChange={(value) => {
          if (value === 'all') {
            setChannelFilters([])
          } else {
            setChannelFilters([value as any])
          }
        }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Todos los canales" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los canales</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="facebook">Facebook</SelectItem>
          <SelectItem value="tiktok">TikTok</SelectItem>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
        </SelectContent>
      </Select>

      {/* Solo mis leads */}
      <div className="flex items-center gap-2">
        <Switch
          id="only-my-leads"
          checked={filters.onlyMyLeads}
          onCheckedChange={toggleOnlyMyLeads}
        />
        <Label htmlFor="only-my-leads" className="text-sm cursor-pointer">
          Solo mis leads
        </Label>
      </div>

      {/* Contador */}
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Mostrando {filteredLeads.length} de {leads.length} leads
      </span>
    </div>
  )
}
```

**Step 2: Verificar que Switch existe en shadcn/ui**

```bash
ls src/components/ui/switch.tsx
```

If not exists, install it:

```bash
npx shadcn@latest add switch
```

**Step 3: Commit**

```bash
git add src/components/kanban/kanban-filters.tsx
git commit -m "feat|kanban|20260214|crear filtros de busqueda y canales"
```

---

## Task 8: Crear Panel Lateral de Detalles

**Files:**
- Create: `src/components/kanban/lead-details-panel.tsx`

**Step 1: Instalar Sheet de shadcn/ui si no existe**

```bash
npx shadcn@latest add sheet
```

**Step 2: Crear componente LeadDetailsPanel**

Create file: `src/components/kanban/lead-details-panel.tsx`

```typescript
'use client'

import { X, Phone, Mail, Building2, Instagram, Facebook, Music, MessageCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/lib/kanban-store'
import { cn } from '@/lib/utils'
import type { SourceChannel } from '@/types'

interface LeadDetailsPanelProps {
  open: boolean
  onClose: () => void
}

const channelIcons = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music,
  whatsapp: MessageCircle
}

const channelColors = {
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  tiktok: 'text-cyan-500',
  whatsapp: 'text-green-500'
}

const stageLabels = {
  new: 'Nuevo',
  contacted: 'Contactado',
  proposal: 'En Propuesta',
  closed: 'Cierre'
}

export function LeadDetailsPanel({ open, onClose }: LeadDetailsPanelProps) {
  const { selectedLeadId, leads } = useKanbanStore()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  const ChannelIcon = channelIcons[lead.source_channel]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:w-[500px] glass-panel overflow-y-auto custom-scrollbar">
        <SheetHeader>
          <SheetTitle className="text-xl text-foreground">
            {lead.name || 'Sin nombre'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contacto
            </h3>

            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-4 h-4 text-[#CEF25D]" />
              <span>{lead.phone}</span>
            </div>

            {lead.email && (
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-4 h-4 text-[#CEF25D]" />
                <span>{lead.email}</span>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3 text-foreground">
                <Building2 className="w-4 h-4 text-[#CEF25D]" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>

          {/* Canal y Etapa */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Estado
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChannelIcon className={cn('w-4 h-4', channelColors[lead.source_channel])} />
                <span className="text-sm text-foreground capitalize">
                  {lead.source_channel}
                </span>
              </div>

              <span className="px-3 py-1 bg-[#CEF25D]/10 text-[#CEF25D] text-xs rounded-full">
                {stageLabels[lead.stage]}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              En esta etapa: {lead.time_in_stage}
            </div>
          </div>

          {/* Resumen IA */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Resumen IA
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {lead.ai_summary}
            </p>
          </div>

          {/* Acciones */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                // TODO: Navegar a /contacts/[id]
                console.log('Ver perfil:', lead.id)
              }}
            >
              Ver perfil completo
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                // TODO: Navegar a /chat?lead=[id]
                console.log('Ir al chat:', lead.id)
              }}
            >
              Ir al chat
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#CEF25D]/10 hover:text-[#CEF25D] hover:border-[#CEF25D]/30"
              onClick={() => {
                console.log('Asignar vendedor:', lead.id)
              }}
            >
              Asignar vendedor
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/kanban/lead-details-panel.tsx
git commit -m "feat|kanban|20260214|crear panel lateral con detalles del lead"
```

---

## Task 9: Crear Componente Principal KanbanBoard

**Files:**
- Create: `src/components/kanban/kanban-board.tsx`

**Step 1: Crear componente KanbanBoard**

Create file: `src/components/kanban/kanban-board.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { KanbanColumn } from './kanban-column'
import { KanbanFilters } from './kanban-filters'
import { LeadDetailsPanel } from './lead-details-panel'
import { KanbanSkeleton } from './kanban-skeleton'
import { LeadCard } from './lead-card'
import { useKanbanStore } from '@/lib/kanban-store'
import type { LeadStage } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function KanbanBoard() {
  const {
    moveLeadToStage,
    setSelectedLead,
    selectedLeadId,
    getFilteredLeads,
    leads
  } = useKanbanStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeLead, setActiveLead] = useState<any>(null)

  const filteredLeads = getFilteredLeads()

  // Simular loading inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id)
    setActiveLead(lead)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveLead(null)

    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as LeadStage

    moveLeadToStage(leadId, newStage)
  }

  const handleLeadClick = (leadId: string) => {
    setSelectedLead(leadId)
    setIsPanelOpen(true)
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedLead(null), 200)
  }

  if (isLoading) {
    return <KanbanSkeleton />
  }

  const columns = [
    { stage: 'new' as LeadStage, title: 'Nuevo' },
    { stage: 'contacted' as LeadStage, title: 'Contactado' },
    { stage: 'proposal' as LeadStage, title: 'En Propuesta' },
    { stage: 'closed' as LeadStage, title: 'Cierre' }
  ]

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <KanbanFilters />

      {/* Desktop/Tablet: Drag and Drop Kanban */}
      <div className="hidden md:block">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex md:overflow-x-auto md:snap-x md:snap-mandatory lg:grid lg:grid-cols-4 gap-4 custom-scrollbar pb-4">
            {columns.map(({ stage, title }) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                title={title}
                leads={filteredLeads}
                onLeadClick={handleLeadClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <LeadCard lead={activeLead} onClick={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile: Tabs (sin drag-and-drop) */}
      <div className="md:hidden">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            {columns.map(({ stage, title }) => {
              const count = filteredLeads.filter(l => l.stage === stage).length
              return (
                <TabsTrigger key={stage} value={stage} className="text-xs">
                  {title} ({count})
                </TabsTrigger>
              )
            })}
          </TabsList>

          {columns.map(({ stage, title }) => {
            const leadsInStage = filteredLeads.filter(l => l.stage === stage)
            return (
              <TabsContent key={stage} value={stage} className="space-y-3 mt-4">
                {leadsInStage.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay leads en esta etapa
                  </p>
                ) : (
                  leadsInStage.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => handleLeadClick(lead.id)}
                    />
                  ))
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      {/* Panel lateral */}
      <LeadDetailsPanel open={isPanelOpen} onClose={handlePanelClose} />
    </div>
  )
}
```

**Step 2: Instalar Tabs de shadcn/ui si no existe**

```bash
npx shadcn@latest add tabs
```

**Step 3: Commit**

```bash
git add src/components/kanban/kanban-board.tsx
git commit -m "feat|kanban|20260214|crear KanbanBoard con DndContext y responsive"
```

---

## Task 10: Actualizar Página del Kanban

**Files:**
- Modify: `src/app/(dashboard)/kanban/page.tsx`

**Step 1: Reemplazar contenido de la página**

Replace entire content of `src/app/(dashboard)/kanban/page.tsx`:

```typescript
import { KanbanBoard } from '@/components/kanban/kanban-board'

export default function KanbanPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pipeline de Ventas
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus leads visualmente con drag-and-drop
        </p>
      </div>

      <KanbanBoard />
    </div>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso sin errores

**Step 3: Probar en dev**

```bash
npm run dev
```

Expected: Navegar a http://localhost:3000/kanban y ver el tablero funcionando

**Step 4: Commit**

```bash
git add src/app/(dashboard)/kanban/page.tsx
git commit -m "feat|kanban|20260214|integrar KanbanBoard en la pagina del Kanban"
```

---

## Task 11: Crear Barrel Export para Componentes

**Files:**
- Create: `src/components/kanban/index.ts`

**Step 1: Crear archivo de exports**

Create file: `src/components/kanban/index.ts`

```typescript
export { KanbanBoard } from './kanban-board'
export { KanbanColumn } from './kanban-column'
export { LeadCard } from './lead-card'
export { KanbanFilters } from './kanban-filters'
export { LeadDetailsPanel } from './lead-details-panel'
export { KanbanSkeleton } from './kanban-skeleton'
```

**Step 2: Commit**

```bash
git add src/components/kanban/index.ts
git commit -m "feat|kanban|20260214|agregar barrel export para componentes Kanban"
```

---

## Task 12: Testing Manual y Ajustes Finales

**Step 1: Verificar build de producción**

```bash
npm run build
npm run start
```

Expected: Aplicación arranca sin errores en modo producción

**Step 2: Probar en diferentes breakpoints**

- Desktop (1024px+): 4 columnas visibles, drag-and-drop funciona
- Tablet (768-1023px): Scroll horizontal con snap, drag-and-drop funciona
- Mobile (<768px): Tabs, sin drag-and-drop

**Step 3: Probar funcionalidades**

- [ ] Drag-and-drop mueve leads correctamente
- [ ] Validación de "no retroceder" funciona (muestra toast error)
- [ ] Validación de "solo Admin puede cerrar" funciona
- [ ] Búsqueda filtra por nombre y teléfono en tiempo real
- [ ] Filtro de canal funciona
- [ ] Toggle "Solo mis leads" funciona
- [ ] Click en tarjeta abre panel lateral
- [ ] Panel lateral muestra información completa
- [ ] Animaciones tech-glow funcionan en hover
- [ ] Scrollbar custom se ve correctamente
- [ ] Contador "Mostrando X de Y leads" es correcto

**Step 4: Ajustes visuales si es necesario**

Si encuentras problemas visuales, ajustarlos ahora.

**Step 5: Commit final**

```bash
git add .
git commit -m "feat|kanban|20260214|completar modulo Kanban con todas las features"
```

---

## Criterios de Aceptación Final

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

## Próximos Pasos (Futuro)

1. **Integración con API real:**
   - Reemplazar `MOCK_LEADS` con fetch a `/api/leads`
   - Agregar optimistic updates con rollback
   - Implementar Supabase Realtime

2. **Features Fase 2:**
   - Asignación de vendedor funcional
   - Registro de cierre desde el panel
   - Métricas del Kanban (tasa de conversión por etapa)
   - Virtualización para +100 leads

3. **Testing:**
   - Tests unitarios con Vitest
   - Tests E2E con Playwright

---

*Plan de implementación completo - Ready para ejecución*
