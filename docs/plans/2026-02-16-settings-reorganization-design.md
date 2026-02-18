# Diseño: Reorganización de Workflows a Configuración

**Fecha:** 2026-02-16
**Autor:** Claude Sonnet 4.5
**Estado:** Diseño aprobado
**Tipo:** Reorganización de estructura y UI

---

## 1. Contexto y Objetivos

### Problema Actual

El módulo de workflows está ubicado como una sección principal en la navegación del dashboard, cuando debería ser parte de la configuración del sistema. Además, falta una sección de Configuración completa que incluya perfil de usuario, datos de la organización, gestión de equipo, conexiones y facturación.

### Objetivos

1. **Reorganizar workflows** dentro de una nueva sección de Configuración
2. **Crear submódulos de configuración** siguiendo los diseños de referencia proporcionados
3. **Mantener la lógica existente** de workflows sin romper funcionalidad
4. **Implementar UI visual** para submódulos sin API (Equipo, Conexiones, Facturación)
5. **Mejorar la arquitectura** de navegación del dashboard

### Alcance

- ✅ Mover módulo de workflows a configuración
- ✅ Crear 8 submódulos de configuración
- ✅ Implementar UI visual según diseños de referencia
- ✅ Mantener lógica y funcionalidad existente de workflows
- ❌ NO implementar APIs (solo frontend/mock)
- ❌ NO modificar lógica de workflows existente

---

## 2. Arquitectura de Navegación

### Estructura del Sidebar

**Antes:**
```
Dashboard
Contactos
Kanban
Chat
├── Workflows ▾
│   ├── Panel de Control
│   ├── Gestión
│   ├── Credenciales
│   └── Administración [ADMIN]
└── [Footer]
    ├── Configuración (sin implementar)
    └── Cerrar Sesión
```

**Después:**
```
Dashboard
Contactos
Kanban
Chat
└── [Footer]
    ├── Configuración ▾
    │   ├── Mi Perfil
    │   ├── Organización
    │   ├── Workflows ▾
    │   │   └── Gestión
    │   ├── Conexiones
    │   ├── Equipo y Permisos
    │   ├── Facturación
    │   └── Administración [ADMIN]
    └── Cerrar Sesión
```

### Mapa de Rutas

| Submódulo | Ruta | Descripción | Estado |
|-----------|------|-------------|--------|
| **Mi Perfil** | `/configuracion/perfil` | Datos personales del usuario | Nuevo (mock) |
| **Organización** | `/configuracion/organizacion` | Datos de la empresa | Nuevo (mock) |
| **Workflows** | `/configuracion/workflows` | Panel de control con métricas | Migrado |
| **Gestión** | `/configuracion/workflows/gestion` | Configuración del workflow | Migrado |
| **Conexiones** | `/configuracion/conexiones` | Credenciales e integraciones | Migrado + nuevo UI |
| **Equipo y Permisos** | `/configuracion/equipo` | Gestión de miembros y roles | Nuevo (mock) |
| **Facturación** | `/configuracion/facturacion` | Plan y método de pago | Nuevo (mock) |
| **Administración** | `/configuracion/administracion` | Herramientas admin | Migrado |

---

## 3. Estructura de Archivos

### Nueva Organización

```
src/app/(dashboard)/
├── configuracion/
│   ├── layout.tsx                    # Layout con submenu lateral
│   ├── page.tsx                      # Redirige a /configuracion/perfil
│   │
│   ├── perfil/
│   │   └── page.tsx                  # Mi Perfil
│   │
│   ├── organizacion/
│   │   └── page.tsx                  # Organización
│   │
│   ├── workflows/
│   │   ├── page.tsx                  # Panel de Control
│   │   └── gestion/
│   │       └── page.tsx              # Gestión
│   │
│   ├── conexiones/
│   │   └── page.tsx                  # Conexiones
│   │
│   ├── equipo/
│   │   └── page.tsx                  # Equipo y Permisos
│   │
│   ├── facturacion/
│   │   └── page.tsx                  # Facturación
│   │
│   └── administracion/
│       └── page.tsx                  # Administración
```

### Componentes Nuevos

```
src/components/configuracion/
├── settings-sidebar.tsx              # Submenu lateral de configuración
├── settings-header.tsx               # Header compartido (título + descripción)
│
├── profile/
│   ├── profile-photo.tsx             # Avatar con upload
│   ├── profile-form.tsx              # Formulario de perfil
│   └── profile-preferences.tsx       # Toggles de preferencias
│
├── organization/
│   └── organization-form.tsx         # Formulario de organización
│
├── team/
│   ├── team-member-card.tsx          # Card de miembro
│   ├── team-invite-dialog.tsx        # Diálogo de invitación
│   └── team-license-badge.tsx        # Badge de licencias (2/5)
│
├── connections/
│   ├── connection-card.tsx           # Card de integración
│   └── connection-status-badge.tsx   # Badge Conectado/No conectado
│
└── billing/
    ├── billing-plan-card.tsx         # Card de plan actual
    └── billing-payment-card.tsx      # Card de método de pago
```

### Componentes a Mover/Reutilizar

```
src/components/workflows/
├── workflow-status-badge.tsx         # ✓ Mantener (usado en workflows)
├── workflow-credentials-manager.tsx  # → Puede reutilizarse en conexiones
└── [otros componentes]               # ✓ Mantener sin cambios
```

### Servicios y Lógica

```
src/lib/
├── workflows/                        # ✓ NO TOCAR (mantener sin cambios)
│   ├── workflow-types.ts
│   ├── workflow-storage.ts
│   ├── workflow-template.ts
│   ├── workflow-validator.ts
│   └── workflow-service.ts
│
└── mock-data/
    └── settings.ts                   # Datos mock para páginas visuales
```

---

## 4. Migración de Archivos

### Archivos a Mover

| Origen | Destino |
|--------|---------|
| `src/app/(dashboard)/workflows/page.tsx` | `src/app/(dashboard)/configuracion/workflows/page.tsx` |
| `src/app/(dashboard)/workflows/gestion/page.tsx` | `src/app/(dashboard)/configuracion/workflows/gestion/page.tsx` |
| `src/app/(dashboard)/workflows/credenciales/page.tsx` | `src/app/(dashboard)/configuracion/conexiones/page.tsx` |
| `src/app/(dashboard)/workflows/administracion/page.tsx` | `src/app/(dashboard)/configuracion/administracion/page.tsx` |

### Archivos a Eliminar

```bash
src/app/(dashboard)/workflows/        # Eliminar carpeta completa después de migrar
```

### Actualizaciones Necesarias

**1. Layout Principal (`src/app/(dashboard)/layout.tsx`):**

```diff
- const workflowsSubmenu = [
-   { name: 'Panel de Control', href: '/workflows' },
-   { name: 'Gestión', href: '/workflows/gestion' },
-   { name: 'Credenciales', href: '/workflows/credenciales' },
-   { name: 'Administración', href: '/workflows/administracion', adminOnly: true },
- ]

+ const settingsSubmenu = [
+   { name: 'Mi Perfil', href: '/configuracion/perfil', icon: User },
+   { name: 'Organización', href: '/configuracion/organizacion', icon: Building },
+   {
+     name: 'Workflows',
+     href: '/configuracion/workflows',
+     icon: Workflow,
+     submenu: [
+       { name: 'Gestión', href: '/configuracion/workflows/gestion' }
+     ]
+   },
+   { name: 'Conexiones', href: '/configuracion/conexiones', icon: Link },
+   { name: 'Equipo y Permisos', href: '/configuracion/equipo', icon: Users },
+   { name: 'Facturación', href: '/configuracion/facturacion', icon: CreditCard },
+   { name: 'Administración', href: '/configuracion/administracion', icon: Shield, adminOnly: true },
+ ]
```

**2. Links y redirecciones:**

- Buscar todos los `Link` con `href="/workflows/*"` y actualizar a `/configuracion/workflows/*`
- Agregar redirecciones en `next.config.js` si es necesario (opcional)

---

## 5. Diseño Visual y UI

### Layout de Configuración

Estructura de dos columnas:

```
┌─────────────────────────────────────────────────┐
│ [Sidebar Principal] │ [Submenu]  │ [Contenido]  │
├─────────────────────┼────────────┼──────────────┤
│                     │            │              │
│  Dashboard          │ Mi Perfil  │              │
│  Contactos          │            │   [Header]   │
│  Kanban             │Organización│              │
│  Chat               │            │              │
│                     │ Workflows ▾│   [Content]  │
│                     │  • Gestión │              │
│ ──────────────────  │            │              │
│                     │ Conexiones │              │
│ ⚙ Configuración ▾  │            │              │
│                     │ Equipo     │              │
│ 🚪 Cerrar Sesión   │            │              │
│                     │Facturación │              │
│                     │            │              │
│                     │Administr.  │              │
└─────────────────────┴────────────┴──────────────┘
```

### Paleta de Colores

Basado en las imágenes de referencia:

```css
/* Fondos */
--bg-primary: bg-background (dark)
--bg-card: bg-black/40 backdrop-blur-sm
--border-primary: border-primary/20

/* Acentos */
--accent-green: #9EFF00 (botones primarios)
--accent-blue: #3B82F6 (información)
--accent-yellow: #EAB308 (admin badge)
--accent-red: #EF4444 (eliminar/desconectar)

/* Estados */
--status-connected: text-green-500
--status-disconnected: text-gray-500
--status-active: text-green-500
--status-pending: text-yellow-500
```

### Componentes por Página

#### **Mi Perfil** (`/configuracion/perfil`)

```
┌──────────────────────────────────────────┐
│ Mi Perfil                                │
│ Gestiona tu información personal y       │
│ preferencias                             │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Foto de Perfil                      │ │
│ │                                     │ │
│ │  [GG]  Actualiza tu foto de perfil │ │
│ │        JPG, PNG o GIF. Máximo 2MB  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Información Personal     [Editar]   │ │
│ │                                     │ │
│ │ Nombre Completo    Correo           │ │
│ │ [Giovanny Gómez]   [giovanny@...]   │ │
│ │                                     │ │
│ │ Cargo/Rol          Contraseña       │ │
│ │ [Director Com...]  [••••••••]  🔒   │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Preferencias                        │ │
│ │                                     │ │
│ │ 🔔 Notificaciones de escritorio     │ │
│ │    Recibe alertas en tu navegador   │ │
│ │                              [ON ✓] │ │
│ │                                     │ │
│ │ 🔊 Sonidos de chat                  │ │
│ │    Reproduce sonido al recibir msg  │ │
│ │                              [OFF ] │ │
│ └─────────────────────────────────────┘ │
│                                          │
│                    [Guardar Cambios]     │
└──────────────────────────────────────────┘
```

#### **Organización** (`/configuracion/organizacion`)

```
┌──────────────────────────────────────────┐
│ Organización                             │
│ Información de tu empresa                │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Datos de la Empresa                 │ │
│ │                                     │ │
│ │ Nombre de la Empresa  NIT/ID Fiscal │ │
│ │ [NellaSales]          [900.123...]  │ │
│ │                                     │ │
│ │ Industria             Teléfono      │ │
│ │ [Tecnología ▾]        [+57 310...]  │ │
│ │                                     │ │
│ │ Dirección                           │ │
│ │ [Calle 123 #45-67, Bogotá, Col...] │ │
│ │                                     │ │
│ │                    [Guardar Cambios]│ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Workflows** (`/configuracion/workflows`)

```
┌──────────────────────────────────────────┐
│ [🔧] Panel de Control            [Activo]│
│      Vista general de workflows y acceso │
│      rápido                              │
├──────────────────────────────────────────┤
│                                          │
│ Métricas Principales                     │
│ ┌─────────┐ ┌─────────┐ ┌──────┐ ┌────┐│
│ │[📊]     │ │[🕐]     │ │[✓]   │ │[⚙]  ││
│ │ Estado  │ │ Última  │ │Creds │ │Ver. ││
│ │ Activo  │ │ Hace 2h │ │Valid │ │v1.0 ││
│ └─────────┘ └─────────┘ └──────┘ └────┘│
│                                          │
│ Acceso Rápido                            │
│ ┌──────────────┐  ┌──────────────┐      │
│ │ [⚙] Gestión  │  │ [🔑] Creds   │      │
│ │ Config del   │  │ Gestión de   │      │
│ │ workflow     │  │ claves       │      │
│ │ Acceder →    │  │ Acceder →    │      │
│ └──────────────┘  └──────────────┘      │
│                                          │
│ Información del Workflow Actual          │
│ ┌─────────────────────────────────────┐ │
│ │ [📊] Workflow Actual  [Ver Detalles]│ │
│ │                                     │ │
│ │ Nombre: Lead Management v2          │ │
│ │ N8n ID: wf_abc123                   │ │
│ │ Version: v1.0.0                     │ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Gestión** (`/configuracion/workflows/gestion`)

```
┌──────────────────────────────────────────┐
│ [Mantener UI actual de /workflows/      │
│  gestion sin cambios]                    │
└──────────────────────────────────────────┘
```

#### **Conexiones** (`/configuracion/conexiones`)

```
┌──────────────────────────────────────────┐
│ Conexiones                               │
│ Administra tus integraciones con canales │
│ de comunicación                          │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ [WhatsApp] WhatsApp Business API    │ │
│ │  Conecta tu cuenta de WhatsApp...   │ │
│ │                                     │ │
│ │  ✓ Conectado                        │ │
│ │  📱 +57 310 234 5678                │ │
│ │  🔑 Token: EAAbz....XYZ123          │ │
│ │                                     │ │
│ │         [Editar Token] [Desconectar]│ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ [Instagram] Instagram Direct        │ │
│ │  Gestiona mensajes directos desde   │ │
│ │  tu cuenta de Instagram Business    │ │
│ │                                     │ │
│ │  ○ No conectado                     │ │
│ │                                     │ │
│ │                          [Conectar] │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ [Facebook] Facebook Lead Ads        │ │
│ │  Sincroniza tus formularios de      │ │
│ │  clientes potenciales y calcula...  │ │
│ │                                     │ │
│ │  ○ No conectado                     │ │
│ │                                     │ │
│ │                          [Conectar] │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ [Calendar] Sincronización de Agenda│ │
│ │  Permite que la IA verifique tu     │ │
│ │  disponibilidad y agende citas...   │ │
│ │                                     │ │
│ │  ○ No conectado                     │ │
│ │                                     │ │
│ │                [Conectar con Google]│ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Equipo y Permisos** (`/configuracion/equipo`)

```
┌──────────────────────────────────────────┐
│ Equipo y Permisos                        │
│ Gestiona quién tiene acceso a tus chats │
│ y leads                                  │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Licencias Usadas                    │ │
│ │                                     │ │
│ │ Estás usando 2 de 5 licencias       │ │
│ │ disponibles                         │ │
│ │                                     │ │
│ │ [████████░░░░░░░░░░░] 2/5           │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Miembros del Equipo  [+ Invitar]    │ │
│ ├─────────────────────────────────────┤ │
│ │ Usuario        Rol          Estado  │ │
│ ├─────────────────────────────────────┤ │
│ │ [GG] Giovanny  Administrador ● Activo│
│ │ giovanny@...                [Elim.] │ │
│ │                                     │ │
│ │ [MG] María     Vendedor     ● Activo│
│ │ maria@...                   [Elim.] │ │
│ │                                     │ │
│ │ [CM] Carlos    Vendedor   ○ Pendiente│
│ │ carlos@...                  [Elim.] │ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Facturación** (`/configuracion/facturacion`)

```
┌──────────────────────────────────────────┐
│ Facturación                              │
│ Gestiona tu plan y métodos de pago       │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Plan Actual      [Plan Profesional] │ │
│ │                                     │ │
│ │ Tu suscripción activa               │ │
│ │                                     │ │
│ │ Precio Mensual  Licencias  Próxima  │ │
│ │ $149.000 COP    5 usuarios Factura  │ │
│ │                            16 Mar   │ │
│ │                                     │ │
│ │                    [Cambiar Plan]   │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Método de Pago                      │ │
│ │                                     │ │
│ │ [VISA] •••• •••• •••• 4242          │ │
│ │        Vence 12/2027                │ │
│ │                                     │ │
│ │                      [Actualizar]   │ │
│ └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### **Administración** (`/configuracion/administracion`)

```
┌──────────────────────────────────────────┐
│ [Mantener UI actual de /workflows/      │
│  administracion sin cambios]             │
└──────────────────────────────────────────┘
```

---

## 6. Datos Mock

### Archivo: `src/lib/mock-data/settings.ts`

```typescript
export const mockUserProfile = {
  name: "Giovanny Gómez",
  email: "giovanny@nellasales.com",
  role: "Director Comercial",
  avatar: "GG",
  notifications: true,
  sounds: false
}

export const mockOrganization = {
  name: "NellaSales",
  nit: "900.123.456-7",
  industry: "Tecnología",
  phone: "+57 310 234 5678",
  address: "Calle 123 #45-67, Bogotá, Colombia"
}

export const mockConnections = [
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    description: "Conecta tu cuenta de WhatsApp Business para gestionar conversaciones",
    icon: "whatsapp",
    connected: true,
    phone: "+57 310 234 5678",
    token: "EAAbz....XYZ123",
    note: "La conexión con WhatsApp Business API requiere una cuenta verificada de Meta Business. Los mensajes se sincronizarán automáticamente con tu bandeja de entrada."
  },
  {
    id: "instagram",
    name: "Instagram Direct",
    description: "Gestiona mensajes directos desde tu cuenta de Instagram Business",
    icon: "instagram",
    connected: false
  },
  {
    id: "facebook",
    name: "Facebook Lead Ads & Costos",
    description: "Sincroniza tus formularios de clientes potenciales y calcula tu ROAS automáticamente",
    icon: "facebook",
    connected: false
  },
  {
    id: "calendar",
    name: "Sincronización de Agenda",
    description: "Permite que la IA verifique tu disponibilidad y agende citas en tiempo real",
    icon: "calendar",
    connected: false
  }
]

export const mockTeam = [
  {
    id: "1",
    name: "Giovanny Gómez",
    email: "giovanny@nellasales.com",
    role: "Administrador",
    status: "active",
    avatar: "GG"
  },
  {
    id: "2",
    name: "María García",
    email: "maria@nellasales.com",
    role: "Vendedor",
    status: "active",
    avatar: "MG"
  },
  {
    id: "3",
    name: "Carlos Méndez",
    email: "carlos@nellasales.com",
    role: "Vendedor",
    status: "pending",
    avatar: "CM"
  }
]

export const mockBilling = {
  plan: "Plan Profesional",
  price: 149000,
  currency: "COP",
  licenses: { used: 2, total: 5 },
  nextBilling: "2026-03-16",
  paymentMethod: {
    type: "visa",
    last4: "4242",
    expiresAt: "12/2027"
  }
}
```

---

## 7. Consideraciones Técnicas

### Navegación y Estado

- **Auto-expansión:** El submenu de Configuración debe auto-expandirse cuando la ruta actual sea `/configuracion/*`
- **Persistencia:** Guardar estado de expansión en `localStorage` con key `settings_submenu_open`
- **Highlight activo:** Aplicar estilos de "activo" tanto al item del submenu como al item padre "Configuración"

### Permisos y Roles

- **Administración:** Solo visible si `localStorage.getItem('user_role') === 'admin'`
- **Tag ADMIN:** Badge amarillo con borde y fondo semi-transparente
- **Validación:** Agregar redirect en la página si usuario no admin intenta acceder

### Responsive

- **Desktop (>= 1024px):** Submenu lateral fijo de 260px
- **Tablet (768px - 1023px):** Submenu colapsable con botón toggle
- **Mobile (< 768px):** Submenu se convierte en tabs horizontales o dropdown en la parte superior

### Performance

- **Lazy loading:** Usar `dynamic()` de Next.js para componentes pesados
- **Skeleton loaders:** Mostrar mientras carga el workflow en `/configuracion/workflows`
- **Memoización:** Usar `useMemo` para arrays de mock data

### SEO y Metadata

Cada página debe tener metadata apropiada:

```typescript
export const metadata = {
  title: 'Mi Perfil - Configuración | Nella Pro',
  description: 'Gestiona tu información personal y preferencias'
}
```

### Migración Segura

1. **Crear nueva estructura** en `/configuracion/` sin tocar `/workflows/`
2. **Copiar (no mover)** archivos de workflows a configuración
3. **Actualizar imports** y rutas en archivos copiados
4. **Probar** que todo funciona en la nueva ubicación
5. **Eliminar** carpeta `/workflows/` antigua solo después de validar
6. **Actualizar** layout principal para usar nueva navegación

---

## 8. Plan de Implementación (Alto Nivel)

### Fase 1: Setup Base (30 min)
- Crear estructura de carpetas en `/configuracion/`
- Crear layout de configuración con submenu lateral
- Implementar datos mock en `lib/mock-data/settings.ts`

### Fase 2: Páginas Mock (1 hora)
- Implementar Mi Perfil
- Implementar Organización
- Implementar Equipo y Permisos
- Implementar Facturación

### Fase 3: Migración de Workflows (45 min)
- Copiar página de workflows a configuración
- Copiar gestión de workflows
- Adaptar UI de credenciales → conexiones
- Copiar administración

### Fase 4: Navegación (30 min)
- Actualizar sidebar principal con submenu de configuración
- Eliminar sección de workflows del sidebar
- Agregar auto-expansión y highlight activo

### Fase 5: Componentes Compartidos (30 min)
- Crear componentes reutilizables (cards, forms, badges)
- Aplicar estilos según diseños de referencia
- Validar responsive

### Fase 6: Limpieza (15 min)
- Eliminar carpeta `/workflows/` antigua
- Verificar que no hay enlaces rotos
- Probar flujo completo de navegación

**Tiempo estimado total:** ~3.5 horas

---

## 9. Criterios de Aceptación

- ✅ Configuración aparece como submenu expandible en el footer del sidebar
- ✅ Todos los submódulos son accesibles y navegables
- ✅ Mi Perfil muestra formulario funcional con datos mock
- ✅ Organización muestra datos de empresa editables (mock)
- ✅ Workflows mantiene la funcionalidad actual (métricas, gestión)
- ✅ Conexiones muestra integrations cards según diseño de referencia
- ✅ Equipo muestra licencias y miembros según diseño
- ✅ Facturación muestra plan y método de pago según diseño
- ✅ Administración solo visible para usuarios admin con badge "ADMIN"
- ✅ No hay errores de compilación ni warnings
- ✅ Navegación responsive funciona en mobile, tablet y desktop
- ✅ No se rompe funcionalidad existente de workflows

---

## 10. Riesgos y Mitigaciones

### Riesgo 1: Romper funcionalidad de workflows
**Mitigación:** Copiar (no mover) archivos inicialmente, mantener lógica sin cambios, probar exhaustivamente antes de eliminar carpeta antigua.

### Riesgo 2: Enlaces rotos en otras partes de la app
**Mitigación:** Buscar globalmente `href="/workflows` en todo el proyecto y actualizar. Agregar redirecciones temporales si es necesario.

### Riesgo 3: Navegación confusa para usuarios existentes
**Mitigación:** La ubicación en "Configuración" es más intuitiva. Agregar tooltip o nota la primera vez que el usuario acceda.

### Riesgo 4: Responsive no funciona bien en mobile
**Mitigación:** Probar en diferentes viewports, usar submenu colapsable o tabs horizontales en mobile.

---

## 11. Referencias

- Imagen #1: Estructura de navegación de Configuración
- Imagen #2: UI de submódulo Organización
- Imagen #3: UI de submódulo Equipo y Permisos
- Imagen #4: UI de submódulo Conexiones
- Imagen #5: UI de submódulo Facturación
- CLAUDE.md: Convenciones de código y arquitectura del proyecto
- docs/arquitectura.md: Decisiones técnicas del proyecto

---

**Próximo paso:** Generar plan de implementación detallado con tareas específicas para desarrollo.
