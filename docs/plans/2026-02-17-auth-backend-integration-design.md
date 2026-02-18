# Auth Backend Integration — Design Document

**Fecha:** 2026-02-17
**Estado:** Aprobado — listo para implementación
**Repos afectados:** `nella_backend` + `nella-frontend`
**Autor:** Claude Code (DevOps Coordinator)

---

## 1. Contexto y Problema

El frontend tiene un wizard de registro de 4 pasos completamente funcional en UI, pero toda la lógica de auth es un **mock en localStorage**. El backend NestJS tiene los endpoints `POST /tenants/register` y `POST /auth/login` operativos, pero con dos problemas bloqueantes:

1. `POST /tenants/register` no tiene `@Public()` → el JwtAuthGuard global lo rechaza
2. `CreateTenantDto` solo acepta 3 campos (`companyName`, `email`, `phone`) vs los 15 campos que recolecta el wizard

**Objetivo:** Conectar el wizard existente con el backend real, eliminando todos los mocks de localStorage en el flujo de auth.

---

## 2. Decisiones de Diseño

| Decisión | Elección | Razón |
|---|---|---|
| Estructura del wizard | Mantener 4 steps + expandir backend DTO | Datos completos del tenant desde el inicio |
| Contraseña admin | Agregar `password` al `CreateTenantDto` | El usuario elige su contraseña en Step 2 |
| `fullName` del admin | Agregar al DTO | El admin se crea con nombre real |
| Identificación tenant en login | URL dinámica `/login/[tenantSlug]` | Sin subdomain en localhost, slug explícito en URL |
| Proxy de API | Next.js API Routes | Backend URL oculta al browser |
| WhatsApp Token (Step 4) | Diferido — backend genera internamente | Integración Meta API es trabajo separado |
| Step 4 frontend | Solo número WhatsApp Business + OTP mock | Simplifica onboarding, token se configura después |
| Migración de DB | TypeORM migration file | Otros desarrolladores trabajan con la misma DB |
| Roles | Solo `admin` por ahora | `sales_agent` se implementa en iteración futura |

---

## 3. Contrato de Datos

### 3.1 `CreateTenantDto` — Campos finales

```typescript
// Step 1 — Empresa
companyName:    string   required  min(2)
industry:       string   required
industryOther?: string   optional
companySize:    string   required  ('1-10'|'11-50'|'51-200'|'201-500'|'501-1000'|'1000+')
country:        string   required  ISO 2 chars (ej: 'CO', 'MX')

// Step 2 — Admin
fullName:       string   required  min(2)
email:          string   required  email format
phone?:         string   optional  E.164 format (+573001234567)
password:       string   required  min(8)

// Step 3 — Producto
offeringType:   string   required  ('product'|'service')
description?:   string   optional
priceRange?:    string   optional
idealCustomer?: string   optional

// Step 4 — WhatsApp Business
whatsappNumber: string   required  E.164 format
// whatsappToken → DIFERIDO
```

### 3.2 Distribución en DB

```
DTO → public.tenants:
  name (companyName), slug (generado), email, phone,
  schema_name, status, industry, industry_other,
  company_size, country, offering_type, description,
  price_range, ideal_customer, whatsapp_number

DTO → {tenant_schema}.users (admin):
  email, full_name (fullName), password_hash (bcrypt(password)),
  role = 'admin', is_active = true
```

### 3.3 Response `POST /tenants/register`

```json
{
  "success": true,
  "data": {
    "tenantId": "uuid",
    "name": "Mi Empresa",
    "slug": "mi-empresa",
    "subdomain": "mi-empresa.nella.com",
    "status": "active"
  }
}
```

### 3.4 Request/Response `POST /auth/login`

```
Request:
  Body:   { email, password }
  Header: X-Tenant-Id: <tenantSlug>   (dev) / subdomain automático (prod)

Response:
{
  "success": true,
  "data": {
    "accessToken":  "JWT 15min",
    "refreshToken": "JWT 7d",
    "user":   { id, email, fullName, role },
    "tenant": { id, name, slug }
  }
}
```

---

## 4. Arquitectura de Integración

```
REGISTRO:
[Wizard Step 1-4 + OTP mock + Summary]
             │ onConfirm()
             ▼
POST /api/auth/register          ← Next.js API Route
             │ proxy
             ▼
POST :3000/tenants/register      ← NestJS backend
             │ OK: { slug, tenantId }
             ▼
router.push('/login/mi-empresa')

LOGIN:
/login/[tenantSlug]
             │ submit
             ▼
POST /api/auth/login             ← Next.js API Route
{ email, password, tenantSlug }
             │ agrega X-Tenant-Id header
             ▼
POST :3000/auth/login            ← NestJS backend
             │ OK: { accessToken, refreshToken, user, tenant }
             ▼
auth-store.setSession(tokens + user)
             ▼
router.push('/dashboard')
```

---

## 5. Cambios por Archivo

### Backend (`nella_backend`)

| Archivo | Tipo de cambio |
|---|---|
| `src/tenant/tenant.controller.ts` | Agregar `@Public()` a `register()` |
| `src/tenant/dto/create-tenant.dto.ts` | Expandir con 12 campos nuevos + validaciones |
| `src/tenant/entities/tenant.entity.ts` | Agregar 9 columnas nuevas |
| `src/tenant/tenant.service.ts` | Persistir campos nuevos; `createInitialAdminUser` acepta `fullName` + `password` |
| `src/database/migrations/{ts}-AddTenantProfileFields.ts` | NUEVA migración no destructiva |

### Frontend (`nella-frontend`)

| Archivo | Tipo de cambio |
|---|---|
| `src/app/api/auth/register/route.ts` | NUEVO — proxy a backend |
| `src/app/api/auth/login/route.ts` | NUEVO — proxy con X-Tenant-Id |
| `src/app/(auth)/login/[tenantSlug]/page.tsx` | NUEVO — ruta dinámica |
| `src/components/auth/registration-step-4.tsx` | Eliminar token; agregar OTP inline |
| `src/components/auth/registration-summary.tsx` | Quitar "Token validado"; actualizar sección WhatsApp |
| `src/hooks/useRegistrationWizard.ts` | Reemplazar mock por POST real; eliminar workflowService |
| `src/stores/auth-store.ts` | Agregar `accessToken`, `refreshToken` |
| `src/types/index.ts` | Remover `password` de `User`; agregar tokens a `Session` |
| `src/lib/auth/auth-validations.ts` | Actualizar `step4Schema` — eliminar `whatsappToken` |

---

## 6. Step 4 — Diseño del Componente Actualizado

```
Estado actual:
  [CountryPhoneSelector: whatsappNumber]
  [Botón: Validar número]
  [Input password: whatsappToken]
  [Botón: Validar token con Meta API]
  [Submit: disabled hasta ambas validaciones]

Estado nuevo:
  [CountryPhoneSelector: whatsappNumber — E.164]
  [Botón: Enviar código de verificación]
  ↓ (tras click)
  [OTP 6 dígitos — reutiliza patrón EmailVerification]
  [Código dev: 000000]
  [Submit: habilitado tras OTP correcto]
```

---

## 7. Flujo E2E de Prueba (con servidores corriendo)

```bash
# Backend: localhost:3000
# Frontend: localhost:3001

1. Abrir http://localhost:3001/register
2. Completar Step 1-4 con datos reales
3. Step 4: ingresar número WhatsApp en E.164, verificar OTP "000000"
4. Summary: verificar datos, confirmar
5. → POST /api/auth/register → backend crea tenant + admin user
6. → Redirect a /login/mi-empresa
7. Login con email + password del registro
8. → POST /api/auth/login → backend valida, devuelve JWT
9. → Redirect a /dashboard
10. Verificar en backend logs que el schema del tenant fue creado
```

---

## 8. Consideraciones Técnicas

- **Migración:** ejecutar `npm run migration:run` en `nella_backend` antes de probar registro
- **E.164 validation:** tanto backend (`@Matches`) como frontend (Zod regex) validan `/^\+[1-9]\d{1,14}$/`
- **Password en tránsito:** viaja sobre HTTP (localhost). En producción requiere HTTPS
- **Token storage:** `accessToken` en Zustand persist (localStorage) — aceptable para MVP, migrar a httpOnly cookie en producción
- **Rollback de migración:** `npm run migration:revert` elimina las 9 columnas sin tocar datos existentes
- **`confirmPassword`:** solo validación UI — no se envía al backend
- **Ruta `/login` antigua:** mantener como redirect a `/login/[tenantSlug]` o eliminar según decisión

---

## 9. Deuda Técnica Post-MVP

- [ ] Integración real WhatsApp Business Token (Step 4) con Meta API
- [ ] Registro y flujo de `sales_agent` (recordatorio pendiente del usuario)
- [ ] Refresh token automático cuando `accessToken` expira (15min)
- [ ] Migrar token storage a httpOnly cookie
- [ ] Endpoint `POST /auth/verify-email` real (actualmente mock `000000`)
- [ ] Rate limiting en `/api/auth/register` y `/api/auth/login`
