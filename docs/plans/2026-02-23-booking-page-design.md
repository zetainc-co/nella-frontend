# Booking Page — Página de Agendamiento Pública
**Fecha:** 2026-02-23 | **Feature:** Nella-37 | **Estado:** Diseño aprobado

---

## Resumen

Página pública de agendamiento estilo Calendly que permite a un lead separar una reunión con su agente de ventas asignado. Accesible mediante un link único con token (`/book/[token]`), sin requerir login.

---

## Decisiones de Diseño

| Dimensión | Decisión |
|-----------|----------|
| Acceso | Link único por lead (token en URL) |
| Identificación | Datos del lead precargados desde el token (mockup) |
| Agentes | Un solo agente asignado al lead (no hay selección) |
| Post-confirmación | Pantalla de éxito inline (sin integración WhatsApp en MVP) |
| Datos | Mockup hardcodeado para MVP |

---

## Ruta y Estructura de Archivos

```
app/
└── (public)/
    └── book/
        └── [token]/
            └── page.tsx                    ← Server Component (extrae token, pasa props)

components/
└── booking/
    ├── booking-layout.tsx                  ← Layout 2 columnas (Client Component)
    ├── agent-info-panel.tsx                ← Panel izquierdo (info agente + lead)
    ├── calendar-picker.tsx                 ← Calendario interactivo (Client Component)
    ├── time-slots.tsx                      ← Grid de slots de tiempo
    └── booking-confirmation.tsx            ← Pantalla de éxito post-confirmación
```

**Nota:** El grupo `(public)` no tiene layout especial — es solo para organización de rutas. No requiere autenticación.

---

## Diseño Visual

### Fondo y Atmósfera
- Reutiliza `AuthBackground` (mismo componente que login/registro)
- Fondo `#151515` + orbs animados: teal top-right, purple bottom-left
- Logo "Nella**Sales**" en la parte superior (mismo estilo del sidebar mobile)

### Card Principal
- Glassmórfica: `rgba(30,30,30,0.92)` + `backdrop-blur`
- Borde: `1px solid rgba(255,255,255,0.07)`
- Border radius: `rounded-2xl`
- Layout: 2 columnas en desktop, 1 columna en mobile (agente arriba, calendario abajo)

### Panel Izquierdo — Info
- **Avatar agente:** círculo con iniciales, fondo `rgba(158,255,0,0.15)`, borde `rgba(158,255,0,0.3)`, texto `#9EFF00`
- **Nombre agente:** `#f0f4ff`, font-semibold
- **Cargo:** `rgba(240,244,255,0.45)`, text-sm
- **Separador:** `1px solid rgba(255,255,255,0.08)`
- **Detalles (duración, plataforma):** iconos Lucide (`Clock`, `Video`) + texto `rgba(240,244,255,0.6)`
- **Saludo personalizado:** `"Hola, [nombre]!"` en `#9EFF00`, descripción en muted

### Panel Derecho — Calendario
- **Navegación mes:** `< Febrero 2026 >` con chevrons, fondo `rgba(255,255,255,0.05)`
- **Grid días:** 7 columnas, cabeceras Lu/Ma/Mi/Ju/Vi/Sa/Do en `rgba(240,244,255,0.4)`
- **Días disponibles:** número blanco + punto `#9EFF00` debajo
- **Días sin slots:** número en `rgba(240,244,255,0.2)`, cursor disabled
- **Hover día:** `rgba(158,255,0,0.08)` + borde `rgba(158,255,0,0.2)`
- **Día seleccionado:** `rgba(158,255,0,0.15)` + borde `rgba(158,255,0,0.4)` + box-shadow glow sutil

### Slots de Tiempo (aparecen al seleccionar un día)
- Animación: `slideIn` (ya definida en globals.css)
- Grid: 3 columnas, gap-2
- **Slot disponible:** borde `rgba(255,255,255,0.08)`, texto `rgba(240,244,255,0.7)`, hover: borde neon + fondo `rgba(158,255,0,0.08)`
- **Slot seleccionado:** fondo `#9EFF00`, texto `#0a1015`, font-semibold
- **Botón confirmar:** `btn-primary` (ya en globals.css), aparece con `fadeIn` al seleccionar un slot

### Pantalla de Confirmación
- Transición fade-out/fade-in de la sección derecha
- Ícono de check: `CheckCircle2` de Lucide, color `#9EFF00`, tamaño grande con glow
- Detalles: fecha, hora, agente, duración
- Mensaje: `"¡Tu reunión está agendada, [nombre]! Te esperamos."`
- Botón secundario: cerrar/volver (glass style)

---

## Datos Mockup

```typescript
// Mock agent data
const mockAgent = {
  name: "Juan Pérez",
  role: "Especialista de Ventas",
  initials: "JP",
  duration: 30, // minutos
  platform: "Google Meet",
}

// Mock lead data (normalmente vendría del token)
const mockLead = {
  name: "Carlos",
}

// Mock availability: available days in current month
const mockAvailableDays = [3, 4, 5, 10, 11, 12, 17, 18, 19, 24, 25, 26] // días del mes

// Mock time slots per day
const mockSlots = ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "16:00", "17:00"]
```

---

## Flujo de Interacción

```
1. Usuario llega a /book/[token]
   └── Renderiza layout con info del agente + calendario del mes actual

2. Usuario hace click en un día disponible
   └── Aparecen los slots del día (animación slideIn)
   └── Día queda resaltado en neon

3. Usuario selecciona un slot de tiempo
   └── Slot se marca con fondo neon
   └── Aparece botón "Confirmar reunión" (animación fadeIn)

4. Usuario confirma
   └── Sección derecha hace fade a pantalla de confirmación
   └── Muestra: ✓ ícono + detalles de la cita + mensaje de éxito
```

---

## Responsive

| Breakpoint | Layout |
|-----------|--------|
| `< md` (mobile) | 1 columna: info agente arriba, calendario abajo |
| `≥ md` | 2 columnas: info izq (280px fijo), calendario derecha (flex-1) |
| `≥ lg` | Igual a md pero con más padding interno |

---

## Componentes de Terceros

- **Lucide React:** `Clock`, `Video`, `ChevronLeft`, `ChevronRight`, `CheckCircle2`, `CalendarDays`
- **No requiere** ninguna librería nueva de calendario (implementación manual con grid CSS)

---

## Notas de Implementación

- La página es un **Client Component** en su mayoría (estado para día seleccionado, slot seleccionado, confirmado)
- El `page.tsx` puede ser Server Component solo para extraer el `token` de los params
- No hay llamadas API en el MVP — todo es mockup estático
- El token en la URL se puede ignorar en el MVP; en Fase 2 se resuelve contra la DB para cargar datos reales del lead

---

*Diseño aprobado el 2026-02-23. Implementar con datos mockup para MVP.*
