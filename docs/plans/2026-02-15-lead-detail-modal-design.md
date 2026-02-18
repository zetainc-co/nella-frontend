# Diseño: Modal de Detalles de Lead (Kanban)

**Fecha:** 2026-02-15
**Versión:** 1.0
**Estado:** Aprobado
**Tipo:** Feature Enhancement

---

## 1. Resumen Ejecutivo

Este documento describe el diseño para reemplazar el panel lateral (`Sheet`) actual de detalles de lead por un modal centrado (`Dialog`) estilo Trello en el módulo Kanban.

**Motivación:**
- Replicar la experiencia familiar de Trello con modales centrados
- Mejor aprovechamiento del espacio en pantalla (600px vs 384px)
- Mantener la misma funcionalidad del panel actual

**Alcance:**
- Instalar componente `Dialog` de shadcn/ui
- Crear componente `LeadModal` que reemplace `LeadDetailsPanel`
- Actualizar `KanbanBoard` para usar el nuevo modal
- Mantener todas las acciones existentes (Ver perfil, Ir al chat, Asignar vendedor)

**Stack Técnico:**
- `@radix-ui/react-dialog` - Primitivo accesible para modales
- `shadcn/ui Dialog` - Wrapper estilizado de Radix
- Zustand store existente (sin cambios)

---

## 2. Arquitectura y Estructura de Archivos

### 2.1 Cambios en la estructura del proyecto

```diff
src/
├── components/
│   ├── ui/
│   │   ├── sheet.tsx              # Ya existe
+│   │   ├── dialog.tsx            # NUEVO - componente shadcn Dialog
│   │
│   ├── kanban/
│   │   ├── kanban-board.tsx       # MODIFICAR - cambiar Sheet por Dialog
│   │   ├── kanban-column.tsx      # Sin cambios
│   │   ├── lead-card.tsx          # Sin cambios
-│   │   ├── lead-details-panel.tsx # DEPRECAR - reemplazar por lead-modal.tsx
+│   │   ├── lead-modal.tsx        # NUEVO - modal centrado con Dialog
│   │   ├── kanban-filters.tsx     # Sin cambios
│   │   └── kanban-skeleton.tsx    # Sin cambios
```

### 2.2 Flujo de renderizado

```
KanbanBoard (Client Component)
    ↓
    ↓ Usuario hace click en LeadCard
    ↓
    ↓ setSelectedLeadId(leadId)
    ↓ isPanelOpen = true
    ↓
<LeadModal open={isPanelOpen} onClose={closePanel} />
    ↓
<Dialog>
  <DialogContent className="sm:max-w-[600px]">
    {/* Información del lead */}
  </DialogContent>
</Dialog>
```

### 2.3 Dependencias a instalar

```bash
# Instalar Dialog de shadcn (incluye @radix-ui/react-dialog)
npx shadcn@latest add dialog
```

### 2.4 Archivos a modificar

1. **NUEVO**: `src/components/ui/dialog.tsx` (generado por shadcn CLI)
2. **NUEVO**: `src/components/kanban/lead-modal.tsx` (reemplazo de lead-details-panel.tsx)
3. **MODIFICAR**: `src/components/kanban/kanban-board.tsx` (cambiar import y componente)
4. **MODIFICAR**: `src/types/kanban-types.ts` (renombrar interface a `LeadModalProps`)
5. **DEPRECAR**: `src/components/kanban/lead-details-panel.tsx` (mantener temporalmente)

---

## 3. Componentes y Estructura del Modal

### 3.1 Componente `<LeadModal />`

**Archivo:** `src/components/kanban/lead-modal.tsx`

**Props:**
```typescript
interface LeadModalProps {
  open: boolean
  onClose: () => void
}
```

**Estructura base:**
```tsx
'use client'

import { Phone, Mail, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/stores/kanban-store'
import { useKanbanConstants } from '@/hooks/kanban'
import { cn } from '@/lib/utils'
import type { LeadModalProps } from '@/types/kanban-types'

export function LeadModal({ open, onClose }: LeadModalProps) {
  const { selectedLeadId, leads } = useKanbanStore()
  const { getChannelIcon, getChannelColor, getChannelLabel, getStageLabel } = useKanbanConstants()

  const lead = leads.find(l => l.id === selectedLeadId)

  if (!lead) return null

  const ChannelIcon = getChannelIcon(lead.source_channel)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-panel custom-scrollbar p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl text-foreground">
            {lead.name || lead.phone}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Información de contacto */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contacto
            </h3>

            <div className="flex items-center gap-3 text-foreground">
              <Phone className="w-4 h-4 text-primary-neon" />
              <span>{lead.phone}</span>
            </div>

            {lead.email && (
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="w-4 h-4 text-primary-neon" />
                <span>{lead.email}</span>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3 text-foreground">
                <Building2 className="w-4 h-4 text-primary-neon" />
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
                <ChannelIcon className={cn('w-4 h-4', getChannelColor(lead.source_channel))} />
                <span className="text-sm text-foreground">
                  {getChannelLabel(lead.source_channel)}
                </span>
              </div>

              <span className="px-3 py-1 bg-primary-neon/10 text-primary-neon text-xs rounded-full">
                {getStageLabel(lead.stage)}
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
            <p className="text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
              {lead.ai_summary}
            </p>
          </div>
        </div>

        {/* Footer: Acciones */}
        <div className="p-6 pt-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              // TODO: Navegar a /contacts/[id]
              console.log('Ver perfil:', lead.id)
            }}
          >
            Ver perfil completo
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              // TODO: Navegar a /chat?lead=[id]
              console.log('Ir al chat:', lead.id)
            }}
          >
            Ir al chat
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start hover:bg-primary-neon/10 hover:text-primary-neon hover:border-primary-neon/30 transition-colors"
            onClick={() => {
              console.log('Asignar vendedor:', lead.id)
            }}
          >
            Asignar vendedor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 3.2 Layout del contenido del modal

**Distribución visual:**

```
┌─────────────────────────────────────┐
│ [X]  Juan Pérez                     │ ← DialogHeader
├─────────────────────────────────────┤
│                                     │
│ 📞 CONTACTO                         │
│   +57 300 123 4567                  │
│   juan@empresa.com                  │
│   Tech Solutions                    │
│                                     │
│ 📊 ESTADO                           │
│   Instagram  |  En Propuesta       │
│   En esta etapa: 2 horas           │
│                                     │
│ 🤖 RESUMEN IA                       │
│   Interesado en plan premium...    │
│                                     │
├─────────────────────────────────────┤
│ [Ver perfil completo]              │ ← Acciones
│ [Ir al chat]                       │
│ [Asignar vendedor]                 │
└─────────────────────────────────────┘
```

### 3.3 Diferencias clave vs Sheet actual

| Aspecto | Sheet (actual) | Dialog (nuevo) |
|---------|----------------|----------------|
| **Posición** | Lateral derecha | Centrado en pantalla |
| **Ancho** | `sm:max-w-sm` (384px) | `sm:max-w-[600px]` (600px) |
| **Mobile** | Fullscreen lateral | Fullscreen centrado |
| **Animación** | Slide desde derecha | Fade + scale desde centro |
| **Backdrop** | Oscuro 50% | Oscuro 50% (igual) |
| **Clase base** | `SheetContent` | `DialogContent` |
| **UX Reference** | Gmail side panel | Trello card modal ✅ |

---

## 4. Flujo de Datos y Estado

### 4.1 Estado compartido (Zustand Store)

**No hay cambios en el store.** El modal consume el estado existente:

```typescript
// src/stores/kanban-store.ts (ya existe, sin cambios)

interface KanbanStore {
  selectedLeadId: string | null  // ✅ Ya existe
  leads: Lead[]                  // ✅ Ya existe
  setSelectedLead: (leadId: string | null) => void  // ✅ Ya existe
}
```

### 4.2 Flujo completo de apertura/cierre

```
1. Usuario hace click en LeadCard
   → onClick={() => openPanel(lead.id)}

2. Hook useKanbanPanel actualiza el store
   → setSelectedLead(leadId)
   → setPanelOpen(true)

3. KanbanBoard re-renderiza con nuevo estado
   → <LeadModal open={isPanelOpen} onClose={closePanel} />

4. LeadModal busca el lead en el store
   → const lead = leads.find(l => l.id === selectedLeadId)
   → Renderiza Dialog con datos del lead

CIERRE:

1. Usuario hace click en backdrop, X, o ESC
   → Dialog llama onOpenChange(false)

2. onClose() se ejecuta
   → closePanel() del hook
   → setSelectedLead(null)
   → setPanelOpen(false)
```

### 4.3 Cambios en KanbanBoard

**Antes (con Sheet):**
```tsx
import { LeadDetailsPanel } from './lead-details-panel'

export function KanbanBoard() {
  // ... código existente

  return (
    <div>
      {/* ... columnas */}
      <LeadDetailsPanel open={isPanelOpen} onClose={closePanel} />
    </div>
  )
}
```

**Después (con Modal):**
```tsx
import { LeadModal } from './lead-modal'  // ✅ Cambio de import

export function KanbanBoard() {
  // ... código existente (sin cambios)

  return (
    <div>
      {/* ... columnas (sin cambios) */}
      <LeadModal open={isPanelOpen} onClose={closePanel} />  {/* ✅ Cambio de componente */}
    </div>
  )
}
```

**Cambios mínimos:** Solo el nombre del componente importado. Todo el resto del código permanece igual.

---

## 5. Manejo de Errores y Edge Cases

### 5.1 Lead no encontrado

```tsx
export function LeadModal({ open, onClose }: LeadModalProps) {
  const { selectedLeadId, leads } = useKanbanStore()
  const lead = leads.find(l => l.id === selectedLeadId)

  // ✅ Early return si no hay lead
  if (!lead) return null

  return <Dialog>...</Dialog>
}
```

**Comportamiento:** El modal no se renderiza. El backdrop se cierra automáticamente.

### 5.2 Datos opcionales del lead

**Name:**
```tsx
<DialogTitle>
  {lead.name || lead.phone}  {/* ✅ Fallback a teléfono */}
</DialogTitle>
```

**Email y Company:**
```tsx
{lead.email && (
  <div className="flex items-center gap-3">
    <Mail className="w-4 h-4 text-primary-neon" />
    <span>{lead.email}</span>
  </div>
)}
```

**Comportamiento:** Campos opcionales solo se renderizan si tienen valor.

### 5.3 Resumen IA muy largo

```tsx
<p className="text-sm text-foreground leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
  {lead.ai_summary}
</p>
```

**Comportamiento:** Scroll interno si el texto excede 128px de altura.

### 5.4 Accesibilidad

**Manejo automático por Radix Dialog:**

✅ **Focus trap**: El foco queda atrapado dentro del modal
✅ **Focus restore**: Al cerrar, el foco regresa al LeadCard que lo abrió
✅ **Keyboard navigation**: TAB para navegar, ESC para cerrar
✅ **ARIA attributes**: `role="dialog"`, `aria-labelledby`, `aria-describedby`
✅ **Screen reader**: Anuncia "Dialog abierto" al usuario

---

## 6. Diseño Visual y UX

### 6.1 Estilos del Modal (Tema Tech)

**Clase `.glass-panel` aplicada al DialogContent:**

```css
/* Ya existe en globals.css */
.glass-panel {
  background: rgba(10, 10, 10, 0.95);          /* Negro casi opaco */
  backdrop-filter: blur(20px);                  /* Glassmorphism */
  border: 1px solid rgba(206, 242, 93, 0.2);   /* Borde verde neón sutil */
  box-shadow: 0 0 40px rgba(206, 242, 93, 0.1); /* Glow verde neón */
}
```

**Colores específicos del modal:**

| Elemento | Color | Variable Tailwind |
|----------|-------|-------------------|
| Background | Negro #0A0A0A con 95% opacidad | `bg-card/95` |
| Texto principal | Blanco #FFFFFF | `text-foreground` |
| Texto secundario | Gris #888888 | `text-muted-foreground` |
| Bordes | Blanco 10% | `border-border` |
| Íconos destacados | Verde neón #CEF25D | `text-primary-neon` |
| Botones outline hover | Verde neón 10% background | `hover:bg-primary-neon/10` |

### 6.2 Animaciones de apertura/cierre

**Radix Dialog incluye animaciones por defecto:**

```tsx
// DialogContent automáticamente tiene estas clases
className="
  data-[state=open]:animate-in
  data-[state=closed]:animate-out
  data-[state=closed]:fade-out-0
  data-[state=open]:fade-in-0
  data-[state=closed]:zoom-out-95
  data-[state=open]:zoom-in-95
"
```

**Resultado visual:**
- **Abrir**: Fade in + scale desde 95% a 100% (200ms)
- **Cerrar**: Fade out + scale de 100% a 95% (200ms)
- **Backdrop**: Fade in/out simultáneo

### 6.3 Espaciado interno

```tsx
<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-panel p-0">
  <DialogHeader className="p-6 pb-4 border-b border-border">
    {/* Header: padding superior */}
  </DialogHeader>

  <div className="px-6 py-4 space-y-6">
    {/* Body: información del lead */}
  </div>

  <div className="p-6 pt-4 border-t border-border space-y-2">
    {/* Footer: botones de acción */}
  </div>
</DialogContent>
```

**Padding system:**
- Header: `p-6 pb-4` (24px horizontal, 16px inferior)
- Body: `px-6 py-4` (24px horizontal, 16px vertical)
- Footer: `p-6 pt-4` (24px horizontal, 16px superior)

### 6.4 Botones de acción

```tsx
<Button
  variant="outline"
  className="
    w-full
    justify-start
    hover:bg-primary-neon/10
    hover:text-primary-neon
    hover:border-primary-neon/30
    transition-colors
  "
>
  Ver perfil completo
</Button>
```

**Estados:**
- Normal: Borde blanco 10%, texto blanco
- Hover: Background verde neón 10%, texto verde neón, borde verde neón 30%

### 6.5 Responsive: Mobile vs Desktop

**Desktop (≥640px):**
- Modal centrado con `max-w-[600px]`
- Bordes redondeados (`rounded-lg`)
- Backdrop clickeable para cerrar

**Mobile (<640px):**
- Fullscreen (`w-full h-full`)
- Sin bordes redondeados (`rounded-none`)
- Scroll interno si el contenido es muy largo

**Implementación:**
```tsx
<DialogContent className="
  w-full h-full rounded-none
  sm:max-w-[600px] sm:rounded-lg
  max-h-[90vh] overflow-y-auto
">
```

### 6.6 Scrollbar personalizado

```css
/* Ya existe en globals.css */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(10, 10, 10, 0.3);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(206, 242, 93, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(206, 242, 93, 0.4);
  box-shadow: 0 0 10px rgba(206, 242, 93, 0.3);
}
```

---

## 7. Criterios de Aceptación

- [ ] El componente Dialog se instala correctamente con shadcn CLI
- [ ] El modal se abre al hacer click en una tarjeta del Kanban
- [ ] El modal muestra toda la información del lead (nombre, teléfono, email, empresa, canal, etapa, resumen IA)
- [ ] Los campos opcionales (email, company) solo se muestran si tienen valor
- [ ] El modal se cierra al hacer click en backdrop, botón X, o tecla ESC
- [ ] En desktop el modal está centrado con max-width de 600px
- [ ] En mobile el modal ocupa toda la pantalla
- [ ] Las animaciones de apertura/cierre son suaves (fade + scale)
- [ ] Los botones de acción tienen hover con efecto verde neón
- [ ] El scrollbar personalizado aparece si el contenido excede la altura máxima
- [ ] El foco se mantiene atrapado dentro del modal mientras está abierto
- [ ] Al cerrar, el foco regresa a la tarjeta que abrió el modal

---

## 8. Próximos Pasos (Implementación)

1. **Instalar Dialog de shadcn**
   ```bash
   npx shadcn@latest add dialog
   ```

2. **Crear LeadModal component**
   - Archivo: `src/components/kanban/lead-modal.tsx`
   - Copiar estructura de `lead-details-panel.tsx`
   - Reemplazar `Sheet*` por `Dialog*`
   - Ajustar clases CSS según diseño

3. **Actualizar KanbanBoard**
   - Cambiar import: `LeadDetailsPanel` → `LeadModal`
   - Actualizar JSX con nuevo componente

4. **Actualizar tipos TypeScript**
   - Archivo: `src/types/kanban-types.ts`
   - Renombrar `LeadDetailsPanelProps` a `LeadModalProps`

5. **Testing manual**
   - Verificar apertura/cierre en desktop y mobile
   - Probar accesibilidad con teclado
   - Validar estilos y animaciones
   - Comprobar que botones registran console.log

6. **Deprecar LeadDetailsPanel**
   - Agregar comentario `// DEPRECATED: Use LeadModal instead`
   - Mantener archivo temporalmente para rollback
   - Eliminar en PR futuro

---

## 9. Notas Técnicas

### 9.1 Por qué Dialog de shadcn

- ✅ Componente oficial bien mantenido
- ✅ Accesibilidad completa (Radix primitives)
- ✅ Consistente con otros componentes shadcn del proyecto
- ✅ Animaciones incluidas por defecto
- ✅ TypeScript nativo
- ✅ Documentación excelente

### 9.2 Optimización de rendimiento

**El modal se renderiza condicionalmente:**

```tsx
<Dialog open={isPanelOpen}>
  {/* Radix Dialog solo renderiza contenido cuando open=true */}
</Dialog>
```

**No hay overhead cuando está cerrado** porque Radix Dialog no monta `DialogContent` si `open={false}`.

### 9.3 Preparación para backend futuro

El componente está diseñado para trabajar con datos en vivo sin cambios:

```tsx
// FUTURO: Cargar lead desde API
const { data: lead, isLoading } = useQuery(['lead', selectedLeadId], ...)

if (isLoading) return <LeadModalSkeleton />
if (!lead) return null
```

Por ahora usa datos mock del store, pero la estructura es la misma.

---

*Documento de diseño aprobado - Ready para implementación*
