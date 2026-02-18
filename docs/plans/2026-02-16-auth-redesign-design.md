# Auth Module Redesign - Design Document

**Proyecto:** Nella Sales - Revenue OS
**Fecha:** 2026-02-16
**Autor:** Claude (Sonnet 4.5)
**Estado:** Aprobado para Implementación

---

## 📋 Resumen Ejecutivo

Rediseño completo del módulo de autenticación de Nella Sales, implementando:

- Nuevo diseño visual con branding "NellaSales" y efectos de glow teal/cyan
- Autenticación OAuth (Google + Apple)
- Flujo de "Olvidaste tu contraseña"
- Wizard de registro multi-paso mejorado
- Preparación para migración de localStorage a Supabase
- Arquitectura modular y escalable

---

## 🎯 Objetivos

### Funcionales
1. Implementar login con email/password + OAuth (Google, Apple)
2. Wizard de registro de 4 pasos con validación
3. Sistema de verificación de email
4. Flujo completo de recuperación de contraseña
5. Gestión de sesión con Zustand store persistente

### No Funcionales
1. UI que replica exactamente los diseños proporcionados
2. Código modular y mantenible
3. Preparado para migración a Supabase
4. Validación robusta con Zod
5. Manejo de errores consistente

---

## 🏗️ Arquitectura

### Patrón de Capas

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                         │
│  (Pages + Components)                               │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                 Logic Layer                         │
│  (Hooks + Stores)                                   │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               Service Layer                         │
│  (lib/auth/)                                        │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                 API Layer                           │
│  (app/api/auth/)                                    │
└─────────────────────────────────────────────────────┘
```

### Estructura de Archivos

Ver sección completa en "Estructura Final de Archivos" más adelante.

---

## 🎨 Diseño Visual

### Branding
- **Logo:** "NellaSales" (blanco "Nella" + lime "#CEF25D" "Sales")
- **Subtitle:** "Inicia sesión en tu cuenta" (login) / "Bienvenido a tu CRM con IA" (registro)

### Colores
```css
--background: #0D1624 (dark blue-black)
--card: #1A1F2E (card background)
--primary: #CEF25D (lime accent)
--auth-glow-teal: #14B8A6
--auth-glow-cyan: #06B6D4
```

### Efectos
- Radial gradient glow (teal/cyan)
- HUD-style corner frames en cards
- Smooth transitions y animations
- Primary button con glow shadow

---

## 📦 Componentes shadcn/ui

### Requeridos
```bash
npx shadcn@latest add button input label form card separator progress textarea select toggle badge
```

### Componentes Personalizados

#### 1. **CompanySizeChips**
- Badge-based selector
- Estados: default | selected
- Opciones: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+

#### 2. **OfferingTypeToggle**
- ToggleGroup (Producto | Servicio)
- Iconos: Package | Wrench

#### 3. **CharacterCounter**
- Textarea con contador
- Indicador de caracteres restantes

#### 4. **CountryPhoneInput**
- Select de código de país + Input número
- Flags emoji + dial codes

#### 5. **RegistrationProgress**
- Progress bar con percentage
- "Paso X de 4" indicator

---

## 🔄 Flujos de Usuario

### Login Flow
```
1. Usuario ingresa email/password
2. Validación con Zod
3. authService.login()
4. Verificar emailVerified
5. authStore.setUser() + setSession()
6. Redirect → /dashboard
```

### OAuth Flow
```
1. Click en Google/Apple
2. useOAuth.signInWith(provider)
3. Supabase OAuth redirect
4. Callback → /api/auth/oauth/callback
5. Crear/actualizar usuario en DB
6. authStore.setSession()
7. Redirect → /dashboard
```

### Registration Flow
```
1-4. Completar 4 pasos del wizard
5. Resumen y confirmación
6. authService.register()
7. Enviar email verificación
8. Step 6: Verificar código
9. Redirect → /dashboard
```

### Forgot Password Flow
```
1. Ingresar email
2. authService.requestPasswordReset()
3. Email con link de reset
4. Click link → /forgot-password/reset?token=xxx
5. Ingresar nueva contraseña
6. authService.resetPassword()
7. Redirect → /login
```

---

## 📊 Gestión de Estado

### Zustand Store (auth-store.ts)
```typescript
interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}
```

**Características:**
- Persistencia en localStorage vía `persist` middleware
- Hidratación automática en mount
- Sincronización cross-tab

### Custom Hooks

1. **useAuth** - Hook principal (getUser, logout, requireAuth)
2. **useLogin** - Login form + validación
3. **useOAuth** - OAuth providers
4. **useRegister** - Registration wizard logic
5. **useForgotPassword** - Password recovery

---

## 🔐 OAuth Configuration

### Google OAuth Setup

**1. Google Cloud Console:**
```
1. Crear proyecto "Nella Sales"
2. Habilitar Google+ API
3. Crear OAuth 2.0 Client ID
4. Redirect URIs:
   - https://[PROJECT].supabase.co/auth/v1/callback
   - http://localhost:3000/api/auth/oauth/callback
```

**2. Supabase Dashboard:**
```
Authentication → Providers → Google
- Enable: ON
- Client ID: [GOOGLE_CLIENT_ID]
- Client Secret: [GOOGLE_CLIENT_SECRET]
```

### Apple OAuth Setup (Opcional)

**1. Apple Developer:**
```
1. Crear App ID: com.nella.sales
2. Enable Sign In with Apple
3. Crear Service ID
4. Configurar Return URLs
```

**2. Supabase Dashboard:**
```
Authentication → Providers → Apple
- Enable: ON
- Configure según Apple Developer
```

---

## 🗄️ Database Schema

### Tablas

**tenants:**
```sql
- id: UUID PRIMARY KEY
- slug: TEXT UNIQUE
- name: TEXT
- industry: TEXT
- company_size: TEXT
- country: TEXT
- offering_type: 'product' | 'service'
- description: TEXT
- whatsapp_number: TEXT
- created_at: TIMESTAMPTZ
```

**users:**
```sql
- id: UUID REFERENCES auth.users
- email: TEXT UNIQUE
- full_name: TEXT
- phone: TEXT
- tenant_id: UUID REFERENCES tenants
- role: 'admin' | 'sales_agent'
- email_verified: BOOLEAN
- created_at: TIMESTAMPTZ
```

**Ver scripts completos en:** `scripts/supabase/`

---

## 🛣️ API Routes

### Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/session
GET    /api/auth/oauth/callback
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "error": "Error Type",
  "message": "Descripción del error",
  "details": { ... }
}
```

### Error Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error

---

## ✅ Validación con Zod

### Login Schema
```typescript
z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

### Registration Schemas
- **Step 1:** companyName, industry, companySize, country
- **Step 2:** fullName, email, phone, password, confirmPassword
- **Step 3:** offeringType, description, priceRange, idealCustomer
- **Step 4:** whatsappNumber, whatsappToken

**Ver esquemas completos en:** `src/lib/auth/auth-validations.ts`

---

## 🚀 Migration Strategy

### Fase 1: MVP (Actual)
- Auth con localStorage
- Modo: `NEXT_PUBLIC_AUTH_MODE=mock`

### Fase 2: Supabase
- Ejecutar scripts SQL
- Configurar OAuth providers
- Cambiar: `NEXT_PUBLIC_AUTH_MODE=supabase`

### Fase 3: Migración de Datos (Opcional)
- Script: `scripts/migrate-local-to-supabase.ts`
- Exportar usuarios de localStorage
- Importar a Supabase con `supabaseAdmin`

---

## 📝 Testing

### Unit Tests (Fase 2)
```bash
npm run test
```

**Cobertura:**
- Auth service functions
- Custom hooks
- Validation schemas
- API route handlers

### E2E Tests (Fase 2)
```bash
npm run test:e2e
```

**Escenarios:**
- Login flow completo
- Registration wizard
- OAuth login
- Forgot password
- Email verification

---

## 🚢 Deployment

### Pre-Deploy Checklist
- [ ] `npm run build` exitoso
- [ ] `npm run lint` sin errores
- [ ] Variables de entorno configuradas
- [ ] SQL scripts ejecutados en Supabase
- [ ] OAuth providers configurados

### Variables de Entorno - Producción
```bash
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://nella.sales
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### Post-Deploy Checklist
- [ ] Login funciona
- [ ] Registro funciona
- [ ] OAuth (Google/Apple) funciona
- [ ] Forgot password funciona
- [ ] Email verification funciona
- [ ] Rate limiting activo
- [ ] Logs monitoreados

---

## 📚 Referencias

### Documentación
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [Zustand](https://zustand-demo.pmnd.rs)

### Diseño
- Ver screenshots en: `docs/designs/auth-redesign/`

---

## ✨ Next Steps

1. **Implementación** (usar skill `writing-plans` para crear plan de implementación)
2. **Testing** (unit + E2E)
3. **Activación de Supabase**
4. **Configuración OAuth**
5. **Deploy a producción**

---

**Documento generado por:** Claude Sonnet 4.5
**Fecha:** 2026-02-16
**Versión:** 1.0
