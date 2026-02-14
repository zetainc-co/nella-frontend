# Diseño del Sistema de Registro y Validación - Nella Revenue OS

**Fecha:** 2026-02-14
**Autor:** Claude Sonnet 4.5
**Estado:** Aprobado
**Tipo:** Feature - MVP

---

## 1. Resumen Ejecutivo

Sistema de registro multi-paso (wizard) que permite a nuevos usuarios crear una cuenta en Nella con su empresa, configurar su producto/servicio, y conectar su WhatsApp Business. El sistema incluye validación de email con código de 6 dígitos y auto-login al dashboard después de completar el registro.

**Alcance MVP:** Implementación completamente frontend con simulación de validaciones. No requiere API backend - toda la persistencia usa `localStorage`.

---

## 2. Contexto y Decisiones de Diseño

### 2.1 Decisiones Clave del Brainstorming

| Decisión | Opción Elegida | Justificación |
|----------|----------------|---------------|
| **Verificación de email** | Código fijo "000000" | Simplicidad para MVP sin backend |
| **Persistencia de datos** | localStorage | Permite testing completo sin API |
| **Flujo post-registro** | Auto-login al dashboard | Reducir fricción, mostrar valor inmediato |
| **Slug del tenant** | Auto-generado editable | Balance entre UX y flexibilidad |
| **Token WhatsApp** | Validación simulada (2s delay) | Experiencia realista para MVP |
| **Navegación wizard** | Libre con validación obligatoria | Mejor UX, permite correcciones |
| **Auto-guardado** | Silencioso en localStorage | Evita pérdida de datos |
| **Lista de países** | Solo LATAM (~20 países) | Enfoque en mercado objetivo |
| **Industrias** | Lista corta + "Otro" | Cubrir casos comunes sin abrumar |
| **Número WhatsApp** | Selector país + normalización E.164 | UX moderna, formato estándar |
| **Indicador progreso** | Stepper horizontal | Visual claro, permite navegación |
| **Resumen final** | Página completa editable | Revisión antes de confirmar |

### 2.2 Enfoque de Implementación

**Seleccionado:** Wizard Single-Page con Estado Local

**Razones:**
- Más simple de implementar para MVP
- Estado centralizado en un solo hook
- Auto-guardado natural en localStorage
- Alineado con patrón `useLoginForm` existente
- Fácil migrar a rutas separadas si se necesita después

---

## 3. Arquitectura

### 3.1 Estructura de Archivos

```
src/
├── app/
│   └── (auth)/
│       └── register/
│           └── page.tsx                    # Página principal del registro
│
├── components/
│   ├── auth/
│   │   ├── registration-wizard.tsx         # Orquestador principal (Client Component)
│   │   ├── registration-stepper.tsx        # Indicador de progreso horizontal
│   │   ├── registration-step-1.tsx         # Formulario: Datos de Empresa
│   │   ├── registration-step-2.tsx         # Formulario: Datos del Admin
│   │   ├── registration-step-3.tsx         # Formulario: Configuración de Producto
│   │   ├── registration-step-4.tsx         # Formulario: Conexión WhatsApp
│   │   ├── registration-summary.tsx        # Resumen final editable
│   │   ├── email-verification.tsx          # Pantalla de código de verificación
│   │   └── country-phone-selector.tsx      # Selector de país + número (reutilizable)
│   │
│   └── ui/
│       ├── input.tsx                       # shadcn/ui Input
│       ├── select.tsx                      # shadcn/ui Select
│       ├── button.tsx                      # shadcn/ui Button
│       ├── label.tsx                       # shadcn/ui Label
│       └── textarea.tsx                    # shadcn/ui Textarea
│
├── hooks/
│   └── useRegistrationWizard.ts            # Lógica completa del wizard
│
├── lib/
│   ├── registration-storage.ts             # Funciones para localStorage
│   ├── registration-validations.ts         # Validaciones de campos
│   └── countries-latam.ts                  # Datos de países LATAM
│
└── types/
    └── index.ts                            # Tipos de registro (extender el existente)
```

### 3.2 Dependencias Nuevas

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  }
}
```

**shadcn/ui components a instalar:**
- input
- select
- button
- label
- textarea

---

## 4. Componentes Detallados

### 4.1 RegistrationWizard (Orquestador)

**Archivo:** `components/auth/registration-wizard.tsx`
**Tipo:** Client Component (`"use client"`)

**Responsabilidades:**
- Orquestar los 6 estados del wizard: Step1 → Step2 → Step3 → Step4 → Summary → EmailVerification
- Renderizar el componente correspondiente según el paso actual
- Pasar datos y handlers a cada step component
- Mostrar el stepper de progreso
- Aplicar el mismo estilo visual (glass panel + HUD corners) de `login-card.tsx`

### 4.2 RegistrationStepper (Indicador de Progreso)

**Archivo:** `components/auth/registration-stepper.tsx`

**Props:**
```typescript
interface RegistrationStepperProps {
  currentStep: number        // 1-4
  completedSteps: number[]   // [1, 2] = steps 1 y 2 completados
  onStepClick: (step: number) => void
}
```

**Comportamiento:**
- Paso actual: resaltado con color primary
- Pasos completados: checkmark (✓) verde
- Pasos futuros: gris/disabled
- Click en pasos anteriores: permite navegar para editar

### 4.3 Steps de Formulario

#### Step 1: Datos de Empresa

**Campos:**
- Nombre de empresa (input text, required)
- Industria/sector (select, required) - con opción "Otro (especificar)"
- Campo "Otro sector" (condicional - solo si selecciona "Otro")
- Tamaño de empresa (select, required): 1-10, 11-50, 51-200, 200+
- País (select, required) - lista de ~20 países LATAM

**Schema Zod:**
```typescript
z.object({
  companyName: z.string().min(2, "Mínimo 2 caracteres"),
  industry: z.string().min(1, "Selecciona una industria"),
  industryOther: z.string().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "200+"]),
  country: z.string().min(1, "Selecciona un país")
}).refine(...)
```

#### Step 2: Datos del Admin

**Campos:**
- Nombre completo (required)
- Email corporativo (required) - validar formato + unicidad
- Teléfono (required)
- Contraseña (required) - min 8 chars, 1 mayúscula, 1 número
- Confirmar contraseña (required)

**Validaciones especiales:**
- Email único: verificar contra `localStorage.getItem('nella_registered_emails')` en `onBlur`
- Contraseñas coinciden: refine de Zod
- Indicador de fuerza de contraseña (3 niveles)

#### Step 3: Configuración de Producto

**Campos:**
- ¿Qué vendes? (radio: Producto/Servicio, required)
- Descripción breve (textarea, max 500 chars, optional)
- Rango de precio (input text, optional)
- ¿Quién es tu cliente ideal? (textarea, max 1000 chars, optional)

#### Step 4: Conexión WhatsApp

**Campos:**
- Número de WhatsApp Business (CountryPhoneSelector, required)
- Token de WhatsApp Business API (textarea, required, min 200 chars)
- Link "¿Cómo obtener mi token?"

**Simulación:**
- Al avanzar: loading 2 segundos
- Mostrar: "✓ Token validado con Meta API"
- Mostrar: "✓ Número de WhatsApp verificado"

### 4.4 CountryPhoneSelector (Reutilizable)

**Props:**
```typescript
interface CountryPhoneSelectorProps {
  value: string           // E.164 completo: "+573001234567"
  onChange: (e164: string) => void
  error?: string
}
```

**UI:**
```
┌──────────────┬────────────────────────────┐
│ 🇨🇴 +57  ▼  │ 300 123 4567              │
└──────────────┴────────────────────────────┘
```

**Funcionamiento:**
- Select de países LATAM con bandera + código
- Input para número local (solo dígitos)
- Combina ambos → formato E.164

### 4.5 RegistrationSummary

**Props:**
```typescript
interface RegistrationSummaryProps {
  data: RegistrationFormData
  tenantSlug: string
  onEdit: (step: number) => void
  onConfirm: () => void
}
```

**Contenido:**
- 4 secciones mostrando todos los datos ingresados
- Botón "Editar" por cada sección → regresa al step correspondiente
- **Slug del tenant** mostrado y editable
- Botón final: "Confirmar y Enviar Código de Verificación"

### 4.6 EmailVerification

**Props:**
```typescript
interface EmailVerificationProps {
  email: string
  onVerified: () => void
}
```

**UI:**
- Mensaje: "Código enviado a [email]"
- 6 inputs para dígitos (auto-focus en siguiente)
- Texto visible: "Código de prueba: 000000"
- Botón "Verificar Código"
- Link "Reenviar código" (simula reenvío)
- Timer: "Expira en 09:45" (countdown 10 minutos)

**Lógica:**
- Código válido: "000000" (fijo)
- Máximo 5 intentos
- Al verificar: ejecuta `onVerified()` → guarda usuario → crea sesión → redirige a `/dashboard`

---

## 5. Hook Principal: useRegistrationWizard

**Archivo:** `hooks/useRegistrationWizard.ts`

### Estado

```typescript
interface RegistrationState {
  currentStep: number                    // 1-6
  completedSteps: number[]               // Steps completados
  formData: RegistrationFormData         // Datos del formulario
  tenantSlug: string                     // Auto-generado
  verificationSent: boolean
  errors: Record<string, string>
  isValidating: boolean
}
```

### Funciones Expuestas

```typescript
{
  // Navegación
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void

  // Datos
  updateStepData: (step: number, data: Partial<RegistrationFormData>) => void

  // Validaciones
  validateStep: (step: number) => Promise<boolean>
  validateEmailUnique: (email: string) => Promise<boolean>

  // Acciones
  confirmRegistration: () => void
  verifyEmailCode: (code: string) => Promise<boolean>

  // Estado
  currentStep: number
  completedSteps: number[]
  formData: RegistrationFormData
  tenantSlug: string
  isValidating: boolean
}
```

### Auto-guardado

Cada cambio en `formData` se guarda automáticamente en:
```typescript
localStorage.setItem('nella_registration_progress', JSON.stringify({
  currentStep,
  completedSteps,
  formData,
  timestamp: Date.now()
}))
```

Al montar el componente, se restaura el progreso si existe.

---

## 6. Flujo de Datos

### 6.1 Diagrama de Flujo

```
Usuario entra a /register
        ↓
¿Existe progreso guardado?
  ↓ Sí            ↓ No
Restaurar      Iniciar Step 1
        ↓
Step 1: Datos Empresa
  → Validación Zod
  → Auto-save localStorage
  → Click "Siguiente"
        ↓
Step 2: Datos Admin
  → Validación Zod
  → Validar email único (async)
  → Indicador fuerza contraseña
  → Click "Siguiente"
        ↓
Step 3: Configuración Producto
  → Validación Zod
  → Click "Siguiente"
        ↓
Step 4: WhatsApp
  → Validación Zod + formato E.164
  → Simular validación Meta API (2s)
  → Click "Siguiente"
        ↓
Resumen Final
  → Mostrar todos los datos
  → Generar slug tenant
  → Permitir editar slug
  → Click "Confirmar"
        ↓
Guardar en localStorage:
  - nella_users
  - nella_tenants
  - nella_registered_emails
  - Limpiar nella_registration_progress
        ↓
Verificación Email
  → 6 inputs para código
  → Validar código "000000"
  → Max 5 intentos
  → Timer 10 minutos
        ↓
Crear sesión (nella_session)
        ↓
Redirigir a /dashboard
```

### 6.2 Estructura de localStorage

```typescript
// 1. Progreso del wizard (temporal)
nella_registration_progress: {
  currentStep: 2,
  completedSteps: [1],
  formData: { ... },
  timestamp: 1707905400000
}

// 2. Emails registrados (validación unicidad)
nella_registered_emails: [
  "user1@example.com",
  "user2@example.com"
]

// 3. Usuarios registrados
nella_users: [{
  id: "uuid-1",
  email: "user@example.com",
  password: "Password123",  // ⚠️ Solo MVP - producción será hash
  fullName: "Juan Pérez",
  tenantId: "uuid-tenant-1",
  tenantSlug: "mi-empresa",
  role: "admin",
  emailVerified: true,
  createdAt: "2026-02-14T10:30:00Z"
}]

// 4. Tenants
nella_tenants: [{
  id: "uuid-tenant-1",
  slug: "mi-empresa",
  name: "Mi Empresa S.A.",
  industry: "real-estate",
  country: "CO",
  whatsappNumber: "+573001234567",
  whatsappToken: "EAA...",
  createdAt: "2026-02-14T10:30:00Z"
}]

// 5. Sesión activa
nella_session: {
  userId: "uuid-1",
  tenantId: "uuid-tenant-1",
  email: "user@example.com",
  fullName: "Juan Pérez",
  role: "admin",
  loginAt: "2026-02-14T10:35:00Z"
}
```

---

## 7. Validaciones

### 7.1 Esquemas Zod por Step

**Archivo:** `lib/registration-validations.ts`

Cada step tiene su propio schema:
- `step1Schema` - Datos de empresa
- `step2Schema` - Datos del admin (incluye refine para passwords)
- `step3Schema` - Configuración producto
- `step4Schema` - WhatsApp (formato E.164)
- `registrationSchema` - Schema completo (unión de todos)

### 7.2 Validación en Tiempo Real

| Campo | Cuándo | Tipo |
|-------|--------|------|
| companyName | onBlur | Zod |
| industry | onChange | Inmediata |
| email | onBlur | Zod + Unicidad async |
| password | onBlur + onChange | Zod + Strength meter |
| confirmPassword | onChange | Comparación real-time |
| whatsappNumber | onBlur | Zod + E.164 |
| whatsappToken | onBlur + envío | Zod + Simulación Meta |

### 7.3 Validaciones Async Simuladas

**Email único:**
```typescript
async function validateEmailUnique(email: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 300)) // Simular API
  const emails = JSON.parse(localStorage.getItem('nella_registered_emails') || '[]')
  return !emails.includes(email.toLowerCase())
}
```

**Token WhatsApp:**
```typescript
async function validateWhatsAppToken(token: string) {
  await new Promise(r => setTimeout(r, 2000)) // Simular API
  // Validación básica de formato
  if (token.length < 200) return { valid: false, message: 'Token muy corto' }
  // MVP: siempre éxito
  return { valid: true, message: '✓ Token validado con Meta API' }
}
```

---

## 8. Generación de Slug del Tenant

**Función:** `generateSlug(companyName: string): string`

**Algoritmo:**
1. Convertir a minúsculas
2. Normalizar (quitar acentos)
3. Remover caracteres especiales (excepto espacios y guiones)
4. Trim y reemplazar espacios múltiples por guiones
5. Verificar unicidad en localStorage
6. Si existe, agregar sufijo numérico (-2, -3, etc.)

**Ejemplos:**
- "Mi Empresa S.A." → `mi-empresa-sa`
- "Café & Té" → `cafe-te`
- "Empresa 123" → `empresa-123`
- "Mi Empresa" (duplicado) → `mi-empresa-2`

---

## 9. Manejo de Errores

### 9.1 Estados de Error

```typescript
interface StepErrorState {
  fieldErrors: Record<string, string>  // Por campo
  globalError: string | null           // Error general del step
  isValidating: boolean                // Loading state
}
```

### 9.2 Feedback Visual

**Errores inline:**
```tsx
{fieldError && (
  <p className="mt-1 text-sm text-destructive">{fieldError}</p>
)}
```

**Errores globales (estilo HUD):**
- Usar mismo diseño que `login-card.tsx`
- Panel rojo con borde pulsante
- Texto mono con prefijo "[ ERROR ]"

**Indicadores de validación:**
- ✓ Checkmark verde cuando campo válido
- Spinner durante validaciones async
- Barra de fuerza para contraseña (3 niveles)

### 9.3 Límites y Recuperación

- **Email duplicado**: Mostrar error + link "¿Ya tienes cuenta? Inicia sesión"
- **Validación WhatsApp falla**: Botón "Reintentar" + opción "Saltar" (MVP only)
- **Verificación email**: Máximo 5 intentos, después solicitar nuevo código
- **localStorage lleno**: Capturar error, mostrar mensaje al usuario

---

## 10. UX y Accesibilidad

### 10.1 Navegación por Teclado

- **Tab**: Navegar entre campos
- **Enter**: Avanzar al siguiente step (si válido)
- **Flechas**: En selects, cambiar opción

### 10.2 Auto-focus

- Al entrar a cada step: focus en primer campo
- EmailVerification: focus en primer input de código
- Al completar un dígito: auto-focus en siguiente

### 10.3 Responsive

**Desktop (≥768px):**
- Card max-width: 900px
- Stepper horizontal
- Algunos campos en 2 columnas

**Mobile (<768px):**
- Full-width con padding
- Stepper compacto (dots)
- Todos los campos 1 columna
- Botones full-width

---

## 11. Integraciones con Sistema Actual

### 11.1 Modificaciones a Archivos Existentes

**`types/index.ts`:**
- Agregar interfaces: `User`, `Tenant`, `Session`, `RegistrationFormData`

**`hooks/useLoginForm.ts`:**
- Modificar `handleLogin` para buscar en localStorage
- Validar `emailVerified` antes de permitir login
- Crear sesión en localStorage
- Redirigir a `/dashboard`

**`app/(auth)/login/page.tsx`:**
- Agregar link "¿No tienes cuenta? Regístrate aquí"

### 11.2 Datos Estáticos

**`lib/countries-latam.ts`:**
- Array de 20 países LATAM con: code, name, dialCode, flag
- Array de 14 industrias con: value, label

---

## 12. Migración Futura a API

### 12.1 Puntos de Reemplazo

Cuando exista API real de Supabase:

**localStorage → API calls:**
```typescript
// ANTES (MVP):
localStorage.setItem('nella_users', ...)

// DESPUÉS:
await fetch('/api/auth/register', { method: 'POST', body: ... })
```

**Validación email único:**
```typescript
// ANTES:
const emails = JSON.parse(localStorage.getItem('nella_registered_emails'))

// DESPUÉS:
const res = await fetch(`/api/auth/check-email?email=${email}`)
```

**Envío código verificación:**
```typescript
// ANTES:
console.log('Código: 000000')

// DESPUÉS:
await fetch('/api/auth/send-verification-code', { ... })
```

**Validación WhatsApp:**
```typescript
// ANTES:
await sleep(2000); return { valid: true }

// DESPUÉS:
const res = await fetch('/api/whatsapp/validate-token', { ... })
```

### 12.2 API Routes Futuras

```
app/api/auth/
├── register/route.ts          # POST - Crear usuario y tenant
├── check-email/route.ts       # GET - Validar email único
├── send-verification/route.ts # POST - Enviar código
├── verify-email/route.ts      # POST - Verificar código
└── login/route.ts             # POST - Login
```

### 12.3 Seguridad en Producción

⚠️ **CRÍTICO:**
- Nunca guardar contraseñas en texto plano
- Usar `bcrypt` para hashing: `await bcrypt.hash(password, 10)`
- Tokens en variables de entorno server-side
- HTTPS obligatorio
- Rate limiting en endpoints

---

## 13. Checklist de Implementación

### Fase 1: Setup
- [ ] Instalar dependencias: react-hook-form, zod, @hookform/resolvers
- [ ] Instalar shadcn/ui components: input, select, button, label, textarea
- [ ] Crear estructura de carpetas
- [ ] Extender `types/index.ts`

### Fase 2: Componentes Base
- [ ] `countries-latam.ts` (datos estáticos)
- [ ] `registration-validations.ts` (schemas Zod)
- [ ] `registration-storage.ts` (helpers localStorage)
- [ ] `country-phone-selector.tsx` (reutilizable)

### Fase 3: Steps del Wizard
- [ ] `registration-step-1.tsx` (Datos Empresa)
- [ ] `registration-step-2.tsx` (Datos Admin)
- [ ] `registration-step-3.tsx` (Producto)
- [ ] `registration-step-4.tsx` (WhatsApp)

### Fase 4: Flujo Completo
- [ ] `registration-stepper.tsx` (indicador progreso)
- [ ] `registration-summary.tsx` (resumen final)
- [ ] `email-verification.tsx` (código 6 dígitos)
- [ ] `useRegistrationWizard.ts` (hook principal)
- [ ] `registration-wizard.tsx` (orquestador)

### Fase 5: Integración
- [ ] `app/(auth)/register/page.tsx` (página principal)
- [ ] Modificar `useLoginForm.ts` (soportar localStorage)
- [ ] Modificar `app/(auth)/login/page.tsx` (link registro)

### Fase 6: Testing Manual
- [ ] Flujo completo sin cerrar navegador
- [ ] Auto-guardado y recuperación (cerrar y volver)
- [ ] Validación de cada campo
- [ ] Email duplicado
- [ ] Navegación entre steps
- [ ] Edición desde resumen
- [ ] Verificación de email
- [ ] Auto-login y redirección
- [ ] Login posterior con credenciales creadas

---

## 14. Métricas de Éxito

**MVP considerado exitoso si:**
- ✅ Usuario puede completar registro en <5 minutos
- ✅ Auto-guardado funciona (cerrar navegador y volver)
- ✅ Validaciones muestran errores claros
- ✅ Auto-login funciona después de verificar email
- ✅ Login posterior funciona con credenciales creadas
- ✅ Responsive funciona en mobile y desktop
- ✅ No hay errores de consola

---

## 15. Notas Adicionales

### 15.1 Limitaciones del MVP

- Contraseñas en texto plano (⚠️ solo para demo)
- Código de verificación fijo ("000000")
- Validación de WhatsApp simulada
- No hay envío real de emails
- Datos persisten solo en localStorage (por navegador)

### 15.2 Próximos Pasos (Post-MVP)

1. Integrar con API de Supabase
2. Envío real de emails de verificación
3. Validación real con Meta API
4. Hashing de contraseñas con bcrypt
5. Sistema de roles granular
6. Multi-idioma (i18n)
7. Analytics de conversión del wizard

---

**Documento aprobado y listo para implementación.**
