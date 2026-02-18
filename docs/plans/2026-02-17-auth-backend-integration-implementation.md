# Auth Backend Integration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Conectar el wizard de registro y el login del frontend con el backend NestJS real, eliminando todos los mocks de localStorage en el flujo de auth.

**Architecture:** Next.js API Routes actúan como proxy entre el browser y el backend NestJS en puerto 3000. El backend se expande para aceptar todos los campos del wizard de 4 pasos. El login usa rutas dinámicas `/login/[tenantSlug]` para identificar el tenant sin subdomain.

**Tech Stack:** NestJS 10 + TypeORM + class-validator (backend) · Next.js 16 App Router + Zustand + Zod + React Hook Form (frontend)

**Design doc:** `docs/plans/2026-02-17-auth-backend-integration-design.md`

---

## BLOQUE A — BACKEND (`nella_backend/`)

> Ejecutar cada tarea con el servidor parado. Levantar con `npm run start:dev` para verificar.
> Directorio de trabajo: `C:\Users\forev\Local\Projects\Dev\Zeta\Nella\nella_backend`

---

### Task A1: Fix `@Public()` en `TenantController.register()`

**Problema:** El JwtAuthGuard global bloquea `POST /tenants/register` porque le falta el decorador `@Public()`. Sin este fix nada del registro funciona.

**Files:**
- Modify: `src/tenant/tenant.controller.ts`

**Step 1: Agregar el decorador `@Public()`**

Abrir `src/tenant/tenant.controller.ts` y agregar `@Public()` antes de `@Post('register')`:

```typescript
import { Public } from '../auth/decorators/public.decorator'; // agregar import

@Controller('tenants')
export class TenantController {
  // ...

  @Public()                    // ← AGREGAR esta línea
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateTenantDto) {
```

**Step 2: Verificar que el servidor compila sin errores**

```bash
npm run build
```
Esperado: `Build completed successfully` sin errores TypeScript.

**Step 3: Probar el endpoint con curl**

```bash
curl -X POST http://localhost:3000/tenants/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","email":"test@test.com"}'
```
Esperado antes del fix: `401 Unauthorized`
Esperado después del fix: `400 Bad Request` (faltan campos del DTO) o `201` si los datos son válidos.

**Step 4: Commit**

```bash
git add src/tenant/tenant.controller.ts
git commit -m "fix|backend|20260217|Add @Public decorator to tenant register endpoint"
```

---

### Task A2: Expandir `CreateTenantDto` con todos los campos del wizard

**Files:**
- Modify: `src/tenant/dto/create-tenant.dto.ts`

**Step 1: Reemplazar el contenido completo del archivo**

```typescript
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  Matches,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class CreateTenantDto {
  // ─── Step 1: Empresa ───────────────────────────────────────────────
  @IsString()
  @MinLength(2, { message: 'El nombre de empresa debe tener al menos 2 caracteres' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'La industria es requerida' })
  industry: string;

  @IsOptional()
  @IsString()
  industryOther?: string;

  @IsString()
  @IsNotEmpty({ message: 'El tamaño de empresa es requerido' })
  companySize: string;

  @IsString()
  @Length(2, 2, { message: 'El país debe ser un código ISO de 2 caracteres (ej: CO, MX)' })
  country: string;

  // ─── Step 2: Admin ─────────────────────────────────────────────────
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  fullName: string;

  @IsEmail({}, { message: 'Formato de email inválido' })
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'El teléfono debe estar en formato E.164 (ej: +573001234567)' })
  phone?: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  // ─── Step 3: Producto ───────────────────────────────────────────────
  @IsEnum(['product', 'service'], { message: 'El tipo debe ser "product" o "service"' })
  offeringType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  priceRange?: string;

  @IsOptional()
  @IsString()
  idealCustomer?: string;

  // ─── Step 4: WhatsApp Business ──────────────────────────────────────
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'El número de WhatsApp debe estar en formato E.164' })
  whatsappNumber: string;
}
```

**Step 2: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

**Step 3: Commit**

```bash
git add src/tenant/dto/create-tenant.dto.ts
git commit -m "feat|backend|20260217|Expand CreateTenantDto with all wizard fields"
```

---

### Task A3: Actualizar `Tenant` entity con columnas nuevas

**Files:**
- Modify: `src/tenant/entities/tenant.entity.ts`

**Step 1: Agregar las 9 columnas nuevas al entity**

Abrir `src/tenant/entities/tenant.entity.ts` y agregar las columnas DESPUÉS de `phone`:

```typescript
@Entity({ schema: 'public', name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // ─── Nuevos campos de perfil ─────────────────────────────────────
  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industry_other: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  company_size: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  offering_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  price_range: string;

  @Column({ type: 'text', nullable: true })
  ideal_customer: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  whatsapp_number: string;
  // ─────────────────────────────────────────────────────────────────

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  schema_name: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

**Step 2: Verificar compilación**

```bash
npm run build
```
Esperado: sin errores.

**Step 3: Commit**

```bash
git add src/tenant/entities/tenant.entity.ts
git commit -m "feat|backend|20260217|Add profile columns to Tenant entity"
```

---

### Task A4: Crear migración TypeORM para las nuevas columnas

**Files:**
- Create: `src/database/migrations/1739750400000-AddTenantProfileFields.ts`

**Step 1: Crear el archivo de migración**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantProfileFields1739750400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tenants
        ADD COLUMN IF NOT EXISTS industry       VARCHAR(100),
        ADD COLUMN IF NOT EXISTS industry_other VARCHAR(255),
        ADD COLUMN IF NOT EXISTS company_size   VARCHAR(20),
        ADD COLUMN IF NOT EXISTS country        VARCHAR(2),
        ADD COLUMN IF NOT EXISTS offering_type  VARCHAR(20),
        ADD COLUMN IF NOT EXISTS description    TEXT,
        ADD COLUMN IF NOT EXISTS price_range    VARCHAR(100),
        ADD COLUMN IF NOT EXISTS ideal_customer TEXT,
        ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.tenants
        DROP COLUMN IF EXISTS industry,
        DROP COLUMN IF EXISTS industry_other,
        DROP COLUMN IF EXISTS company_size,
        DROP COLUMN IF EXISTS country,
        DROP COLUMN IF EXISTS offering_type,
        DROP COLUMN IF EXISTS description,
        DROP COLUMN IF EXISTS price_range,
        DROP COLUMN IF EXISTS ideal_customer,
        DROP COLUMN IF EXISTS whatsapp_number
    `);
  }
}
```

**Step 2: Ejecutar la migración**

```bash
npm run migration:run
```
Esperado:
```
query: SELECT ... FROM "migrations"
query: ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS industry ...
Migration AddTenantProfileFields1739750400000 has been executed successfully.
```

**Step 3: Verificar columnas en DB**

```bash
npm run typeorm -- query "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='tenants' ORDER BY ordinal_position" -d src/database/data-source.ts
```
Esperado: las 9 columnas nuevas aparecen en la lista.

**Step 4: Commit**

```bash
git add src/database/migrations/1739750400000-AddTenantProfileFields.ts
git commit -m "feat|backend|20260217|Add migration for tenant profile fields"
```

---

### Task A5: Actualizar `TenantService` para persistir todos los campos

**Files:**
- Modify: `src/tenant/tenant.service.ts`

**Step 1: Actualizar `createTenant()` para incluir campos nuevos**

En `createTenant()`, localizar donde se crea el objeto tenant y reemplazar:

```typescript
// ANTES:
tenant = this.tenantRepository.create({
  name: dto.companyName,
  slug,
  email: dto.email,
  phone: dto.phone,
  schema_name: schemaName,
  status: 'provisioning',
});

// DESPUÉS:
tenant = this.tenantRepository.create({
  name: dto.companyName,
  slug,
  email: dto.email,
  phone: dto.phone,
  schema_name: schemaName,
  status: 'provisioning',
  industry: dto.industry,
  industry_other: dto.industryOther,
  company_size: dto.companySize,
  country: dto.country,
  offering_type: dto.offeringType,
  description: dto.description,
  price_range: dto.priceRange,
  ideal_customer: dto.idealCustomer,
  whatsapp_number: dto.whatsappNumber,
});
```

**Step 2: Actualizar la llamada a `createInitialAdminUser()`**

Cambiar la llamada en el paso 6 del flujo de `createTenant()`:

```typescript
// ANTES:
await this.createInitialAdminUser(schemaName, dto.email);

// DESPUÉS:
await this.createInitialAdminUser(schemaName, dto.email, dto.fullName, dto.password);
```

**Step 3: Actualizar la firma y cuerpo de `createInitialAdminUser()`**

```typescript
// ANTES:
private async createInitialAdminUser(
  schemaName: string,
  email: string,
): Promise<void> {
  this.logger.log(`Creating initial admin user in ${schemaName}`);

  // Generar password temporal
  const tempPassword = nanoid(16);
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await this.dataSource.query(
    `INSERT INTO "${schemaName}".users (email, password_hash, full_name, role, is_active)
     VALUES ($1, $2, $3, $4, $5)`,
    [email, passwordHash, 'Admin', 'admin', true],
  );

  this.logger.log(`✅ Admin user created with email: ${email}`);
  this.logger.log(`⚠️  Temporary password: ${tempPassword}`);
}

// DESPUÉS:
private async createInitialAdminUser(
  schemaName: string,
  email: string,
  fullName: string,
  password: string,
): Promise<void> {
  this.logger.log(`Creating initial admin user in ${schemaName}`);

  const passwordHash = await bcrypt.hash(password, 10);

  await this.dataSource.query(
    `INSERT INTO "${schemaName}".users (email, password_hash, full_name, role, is_active)
     VALUES ($1, $2, $3, $4, $5)`,
    [email, passwordHash, fullName, 'admin', true],
  );

  this.logger.log(`✅ Admin user created: ${email} (${fullName})`);
}
```

**Step 4: Eliminar la importación de `nanoid` si ya no se usa**

Verificar si `nanoid` se usa en otro lugar del archivo. Si solo se usaba en `createInitialAdminUser`, eliminar el import:
```typescript
// Eliminar si no se usa en otro lugar:
import { nanoid } from 'nanoid';
```

**Step 5: Verificar compilación y test unitario existente**

```bash
npm run build
npm test -- --testPathPattern=tenant.service
```
Esperado: build OK. Los tests existentes pueden fallar — actualizarlos en el siguiente step si es necesario.

**Step 6: Actualizar test spec si existe**

Si `src/tenant/tenant.service.spec.ts` tiene pruebas de `createInitialAdminUser`, actualizar los mocks para reflejar la nueva firma (4 parámetros).

**Step 7: Commit**

```bash
git add src/tenant/tenant.service.ts
git commit -m "feat|backend|20260217|Persist all wizard fields in TenantService"
```

---

### Task A6: Verificación E2E del backend

**Step 1: Levantar el servidor**

```bash
npm run start:dev
```

**Step 2: Probar registro completo con curl**

```bash
curl -X POST http://localhost:3000/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Empresa Test",
    "industry": "retail",
    "companySize": "1-10",
    "country": "CO",
    "fullName": "Juan Pérez",
    "email": "juan@empresatest.com",
    "phone": "+573001234567",
    "password": "TestPass123",
    "offeringType": "service",
    "whatsappNumber": "+573009876543"
  }'
```

Esperado:
```json
{
  "success": true,
  "data": {
    "tenantId": "uuid-aqui",
    "name": "Empresa Test",
    "slug": "empresa-test",
    "subdomain": "empresa-test.nella.com",
    "status": "active"
  }
}
```

**Step 3: Probar login con el usuario recién creado**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: empresa-test" \
  -d '{"email":"juan@empresatest.com","password":"TestPass123"}'
```

Esperado:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "email": "juan@empresatest.com", "fullName": "Juan Pérez", "role": "admin" },
    "tenant": { "id": "...", "name": "Empresa Test", "slug": "empresa-test" }
  }
}
```

---

## BLOQUE B — FRONTEND (`nella-frontend/`)

> Directorio de trabajo: `C:\Users\forev\Local\Projects\Dev\Zeta\Nella\nella-frontend`
> El backend debe estar corriendo en `localhost:3000` para las pruebas.

---

### Task B1: Actualizar tipos TypeScript (`types/index.ts`)

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Reemplazar el archivo completo con tipos actualizados**

```typescript
// src/types/index.ts

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

export interface User {
  id: string
  email: string
  // password ELIMINADO — nunca debe llegar al cliente
  fullName: string
  phone?: string
  tenantId: string
  tenantSlug: string
  role: 'admin' | 'sales_agent'
  createdAt: string
  emailVerified: boolean
}

export interface Tenant {
  id: string
  slug: string
  name: string
  subdomain: string
  status: string
}

export interface Session {
  userId: string
  tenantId: string
  tenantSlug: string      // ← agregado
  email: string
  fullName: string
  role: 'admin' | 'sales_agent'
  accessToken: string     // ← agregado
  refreshToken: string    // ← agregado
  loginAt: string
}

export interface RegistrationFormData {
  // Step 1
  companyName: string
  industry: string
  industryOther?: string
  companySize: string
  country: string

  // Step 2
  fullName: string
  email: string
  phone?: string
  password: string
  confirmPassword?: string  // Solo para UI, no se envía al backend

  // Step 3
  offeringType: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string

  // Step 4
  whatsappNumber: string
  // whatsappToken ELIMINADO — diferido
}

export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
  placeholder: string
}

export interface Industry {
  value: string
  label: string
}
```

**Step 2: Verificar que no hay errores de tipo en todo el proyecto**

```bash
npx tsc --noEmit
```
Esperado: errores de tipo en archivos que usan los tipos viejos (auth-store, registration-storage, etc.) — los resolveremos en los siguientes tasks.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat|frontend|20260217|Update User/Session types for JWT auth integration"
```

---

### Task B2: Actualizar `auth-validations.ts` — eliminar `whatsappToken` de step4

**Files:**
- Modify: `src/lib/auth/auth-validations.ts`

**Step 1: Actualizar el schema del step 4**

Localizar `registrationStep4Schema` y reemplazar:

```typescript
// ANTES:
export const registrationStep4Schema = z.object({
  whatsappNumber: z
    .string()
    .min(10, 'El número debe tener al menos 10 dígitos')
    .max(15, 'El número no puede superar 15 dígitos')
    .regex(/^[0-9]+$/, 'Solo puede contener números'),
  whatsappToken: z.string().optional(),
})

// DESPUÉS:
export const registrationStep4Schema = z.object({
  whatsappNumber: z
    .string()
    .min(1, 'El número de WhatsApp es requerido')
    .regex(/^\+[1-9]\d{1,14}$/, 'Formato E.164 requerido (ej: +573001234567)'),
})
```

También actualizar el tipo exportado:
```typescript
// ANTES:
export type RegistrationStep4Data = z.infer<typeof registrationStep4Schema>

// DESPUÉS (sin cambios en el nombre, solo el tipo cambia automáticamente):
export type RegistrationStep4Data = z.infer<typeof registrationStep4Schema>
// → Ahora solo contiene { whatsappNumber: string }
```

**Step 2: Commit**

```bash
git add src/lib/auth/auth-validations.ts
git commit -m "feat|frontend|20260217|Remove whatsappToken from step4 validation schema"
```

---

### Task B3: Actualizar `auth-store.ts` para almacenar JWT tokens

**Files:**
- Modify: `src/stores/auth-store.ts`

**Step 1: Reemplazar el archivo completo**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  getAccessToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setSession: (session) =>
        set({ session, isAuthenticated: !!session }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      getAccessToken: () => get().session?.accessToken ?? null,
    }),
    {
      name: 'nella-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

**Step 2: Compilar para verificar tipos**

```bash
npx tsc --noEmit 2>&1 | head -30
```

**Step 3: Commit**

```bash
git add src/stores/auth-store.ts
git commit -m "feat|frontend|20260217|Add JWT token storage to auth-store"
```

---

### Task B4: Crear API Route `POST /api/auth/register`

**Files:**
- Create: `src/app/api/auth/register/route.ts`

**Step 1: Crear el directorio y archivo**

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/tenants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error al registrar la organización' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[API/auth/register] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' },
      { status: 503 }
    )
  }
}
```

**Step 2: Agregar `BACKEND_URL` al `.env.local` si no existe**

Verificar que `nella-frontend/.env.local` (o `.env`) contiene:
```
BACKEND_URL=http://localhost:3000
```

**Step 3: Probar la API Route**

Con el frontend corriendo (`npm run dev`):
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Via Route",
    "industry": "tech",
    "companySize": "1-10",
    "country": "CO",
    "fullName": "Test User",
    "email": "test2@route.com",
    "password": "TestPass123",
    "offeringType": "service",
    "whatsappNumber": "+573001111111"
  }'
```
Esperado: `201` con `{ success: true, data: { slug: "test-via-route", ... } }`

**Step 4: Commit**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "feat|frontend|20260217|Add API route proxy for tenant registration"
```

---

### Task B5: Crear API Route `POST /api/auth/login`

**Files:**
- Create: `src/app/api/auth/login/route.ts`

**Step 1: Crear el archivo**

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantSlug } = await request.json()

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'El workspace (tenantSlug) es requerido' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': tenantSlug,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Credenciales inválidas' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/login] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' },
      { status: 503 }
    )
  }
}
```

**Step 2: Probar la API Route**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@empresatest.com","password":"TestPass123","tenantSlug":"empresa-test"}'
```
Esperado: `200` con `{ success: true, data: { accessToken, refreshToken, user, tenant } }`

**Step 3: Commit**

```bash
git add src/app/api/auth/login/route.ts
git commit -m "feat|frontend|20260217|Add API route proxy for auth login with X-Tenant-Id"
```

---

### Task B6: Crear página dinámica `/login/[tenantSlug]`

**Files:**
- Create: `src/app/(auth)/login/[tenantSlug]/page.tsx`
- Modify: `src/components/auth/login/login-form.tsx`

**Step 1: Crear la página dinámica**

```typescript
// src/app/(auth)/login/[tenantSlug]/page.tsx
import { AuthLayout, AuthBranding } from '@/components/auth/shared'
import { LoginForm } from '@/components/auth/login/login-form'
import Link from 'next/link'

interface LoginPageProps {
  params: Promise<{ tenantSlug: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { tenantSlug } = await params

  return (
    <AuthLayout>
      <AuthBranding subtitle={`Iniciando sesión en ${tenantSlug}`} />
      <LoginForm tenantSlug={tenantSlug} />
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">¿No tienes una cuenta? </span>
        <Link href="/register" className="text-primary font-medium hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </AuthLayout>
  )
}
```

**Step 2: Actualizar `LoginForm` para aceptar y usar `tenantSlug`**

Abrir `src/components/auth/login/login-form.tsx` y hacer los siguientes cambios:

```typescript
// Agregar prop tenantSlug a la interfaz
interface LoginFormProps {
  tenantSlug: string
}

export function LoginForm({ tenantSlug }: LoginFormProps) {
  // ... estado existente ...

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // REEMPLAZAR la llamada a authService.login() con fetch real:
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          tenantSlug,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Credenciales inválidas')
      }

      const { accessToken, refreshToken, user, tenant } = result.data

      // Construir Session con tokens
      const session: Session = {
        userId: user.id,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessToken,
        refreshToken,
        loginAt: new Date().toISOString(),
      }

      setSession(session)
      setUser({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        role: user.role,
        createdAt: new Date().toISOString(),
        emailVerified: true,
      })

      toast.success('Bienvenido', {
        description: `Sesión iniciada como ${user.fullName}`,
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales inválidas',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Agregar import Session al inicio del archivo:
  // import type { Session } from '@/types'
```

**Step 3: Agregar también `setUser` al desestructurado del store**

```typescript
const { setUser, setSession } = useAuthStore()
```

**Step 4: Verificar la nueva ruta en el browser**

Navegar a `http://localhost:3001/login/empresa-test`
Esperado: la página de login se carga con el subtítulo "Iniciando sesión en empresa-test"

**Step 5: Probar login completo**

Ingresar las credenciales del tenant creado en Task A6 y verificar redirección al dashboard.

**Step 6: Commit**

```bash
git add src/app/(auth)/login/[tenantSlug]/page.tsx
git add src/components/auth/login/login-form.tsx
git commit -m "feat|frontend|20260217|Add dynamic login route with JWT integration"
```

---

### Task B7: Actualizar `RegistrationStep4` — eliminar token, agregar OTP mock

**Files:**
- Modify: `src/components/auth/registration-step-4.tsx`

**Step 1: Reemplazar el componente completo**

```typescript
// src/components/auth/registration-step-4.tsx
'use client'

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registrationStep4Schema } from '@/lib/auth/auth-validations'
import { RegistrationFormData } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CountryPhoneSelector } from '@/components/auth/country-phone-selector'
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, MessageSquare } from 'lucide-react'

interface RegistrationStep4Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack: () => void
}

const OTP_CODE_DEV = '000000'

export function RegistrationStep4({ initialData, onNext, onBack }: RegistrationStep4Props) {
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registrationStep4Schema),
    defaultValues: { whatsappNumber: initialData.whatsappNumber || '' },
  })

  const whatsappNumber = watch('whatsappNumber')

  const handleSendOtp = async () => {
    if (!whatsappNumber) return
    setIsSending(true)
    // Mock: simular envío de OTP
    await new Promise(resolve => setTimeout(resolve, 1000))
    setOtpSent(true)
    setIsSending(false)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value
    setOtpCode(newCode)
    setOtpError(null)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (newCode.every(d => d !== '') && newCode.join('').length === 6) {
      verifyOtp(newCode.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOtp = async (code: string) => {
    setIsVerifying(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    if (code === OTP_CODE_DEV) {
      setOtpVerified(true)
    } else {
      setOtpError('Código incorrecto. Código de desarrollo: 000000')
      setOtpCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
    setIsVerifying(false)
  }

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">WhatsApp Business</h3>
        <p className="text-sm text-muted-foreground">
          Ingresa el número de WhatsApp Business de tu empresa. Te enviaremos un código para verificarlo.
        </p>
      </div>

      {/* Número WhatsApp */}
      <div className="space-y-3">
        <Controller
          name="whatsappNumber"
          control={control}
          render={({ field }) => (
            <CountryPhoneSelector
              value={field.value}
              onChange={field.onChange}
              error={errors.whatsappNumber?.message}
              label="Número WhatsApp Business"
            />
          )}
        />

        {!otpSent && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSendOtp}
            disabled={isSending || !whatsappNumber || !!errors.whatsappNumber}
            className="w-full gap-2"
          >
            {isSending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando código...</>
            ) : (
              <><MessageSquare className="h-4 w-4" /> Enviar código de verificación</>
            )}
          </Button>
        )}
      </div>

      {/* OTP */}
      {otpSent && !otpVerified && (
        <div className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Código enviado a <span className="font-medium text-foreground">{whatsappNumber}</span>
          </p>
          <div className="flex justify-center gap-2">
            {otpCode.map((digit, index) => (
              <Input
                key={index}
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                disabled={isVerifying}
                className="h-12 w-10 text-center text-lg font-bold"
              />
            ))}
          </div>
          {isVerifying && (
            <div className="flex justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Verificando...</span>
            </div>
          )}
          {otpError && <p className="text-sm text-center text-destructive">{otpError}</p>}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-xs text-blue-900 dark:text-blue-100 text-center">
              Código de desarrollo: <span className="font-mono font-bold">000000</span>
            </p>
          </div>
        </div>
      )}

      {/* Verificado */}
      {otpVerified && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-900 dark:text-green-100">Número verificado</p>
            <p className="text-sm text-green-700 dark:text-green-300">{whatsappNumber}</p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" className="gap-2" disabled={!otpVerified}>
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: Verificar en browser**

Navegar al registro, llegar al Step 4, ingresar un número en E.164, hacer click en "Enviar código", ingresar `000000`, verificar que aparece el check verde y el botón "Siguiente" se habilita.

**Step 3: Commit**

```bash
git add src/components/auth/registration-step-4.tsx
git commit -m "feat|frontend|20260217|Replace WhatsApp token with OTP verification in step 4"
```

---

### Task B8: Actualizar `RegistrationSummary` — quitar referencia al token

**Files:**
- Modify: `src/components/auth/registration-summary.tsx`

**Step 1: Localizar y actualizar la sección WhatsApp del summary**

Encontrar el bloque `{/* Sección: WhatsApp */}` y reemplazar:

```typescript
// ANTES — sección WhatsApp:
<div className="space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-muted-foreground">Número:</span>
    <span className="font-medium">{formData.whatsappNumber}</span>
  </div>
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-500" />
    <span className="text-muted-foreground">Token configurado y validado</span>
  </div>
</div>

// DESPUÉS:
<div className="space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-muted-foreground">Número:</span>
    <span className="font-medium">{formData.whatsappNumber}</span>
  </div>
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-500" />
    <span className="text-muted-foreground">Número verificado</span>
  </div>
</div>
```

**Step 2: Commit**

```bash
git add src/components/auth/registration-summary.tsx
git commit -m "feat|frontend|20260217|Update summary to remove WhatsApp token reference"
```

---

### Task B9: Actualizar `useRegistrationWizard` — conectar con backend real

**Files:**
- Modify: `src/hooks/useRegistrationWizard.ts`

**Step 1: Reemplazar `confirmRegistration()` con llamada real a la API**

Abrir `src/hooks/useRegistrationWizard.ts` y reemplazar el método `confirmRegistration`:

```typescript
// Eliminar imports de localStorage mock:
// import { saveUserAndTenant, createSession, markEmailAsVerified } from '@/lib/registration-storage'
// import { workflowService } from '@/lib/workflows/workflow-service'

// Agregar import del store:
import { useAuthStore } from '@/stores/auth-store'

// Dentro de la función useRegistrationWizard, agregar:
const { setSession } = useAuthStore()

// Reemplazar confirmRegistration():
const confirmRegistration = async () => {
  setIsCreatingWorkflow(true)  // reutilizar estado de loading
  setWorkflowError(null)

  try {
    // Construir payload con todos los datos del wizard
    const payload = {
      companyName: formData.companyName,
      industry: formData.industry,
      industryOther: formData.industryOther,
      companySize: formData.companySize,
      country: formData.country,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      offeringType: formData.offeringType,
      description: formData.description,
      priceRange: formData.priceRange,
      idealCustomer: formData.idealCustomer,
      whatsappNumber: formData.whatsappNumber,
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear la organización')
    }

    const { slug } = result.data

    setIsCreatingWorkflow(false)
    clearRegistrationProgress()
    router.push(`/login/${slug}`)
  } catch (error) {
    setIsCreatingWorkflow(false)
    setWorkflowError(
      error instanceof Error
        ? error.message
        : 'Error al crear la organización. Verifica tu conexión e intenta nuevamente.'
    )
  }
}
```

**Step 2: Actualizar la firma de `confirmRegistration` en el wizard**

La firma de `confirmRegistration` ya no recibe el `slug` como parámetro (ahora lo genera el backend). Actualizar `RegistrationSummary` que llama `onConfirm(tenantSlug)`:

En `src/components/auth/registration-summary.tsx`, cambiar:
```typescript
// La prop onConfirm ya no necesita el slug
interface RegistrationSummaryProps {
  // ...
  onConfirm: () => void  // ANTES: onConfirm: (slug: string) => void
}

// En handleConfirm():
const handleConfirm = () => {
  onConfirm()  // ANTES: onConfirm(tenantSlug)
}
```

Y en `RegistrationWizard`:
```typescript
// ANTES:
onConfirm={confirmRegistration}

// DESPUÉS: misma llamada, la firma ya no requiere slug
onConfirm={confirmRegistration}
```

**Step 3: Verificar que `completeRegistration` ya no es necesaria**

Con la nueva arquitectura el registro navega directo a `/login/[slug]` sin pasar por email verification del wizard (el tenant ya está activo en el backend). El step 6 de email verification ya no es alcanzado. Comentar o mantener el método por si se necesita en el futuro.

**Step 4: Verificar en browser el flujo completo**

1. Ir a `http://localhost:3001/register`
2. Completar los 4 pasos
3. Verificar OTP en Step 4 con `000000`
4. En Summary, hacer click en "Confirmar y crear cuenta"
5. Verificar que el loading aparece
6. Verificar que redirige a `/login/[slug-de-la-empresa]`

**Step 5: Commit**

```bash
git add src/hooks/useRegistrationWizard.ts src/components/auth/registration-summary.tsx
git commit -m "feat|frontend|20260217|Connect registration wizard to backend API"
```

---

### Task B10: Verificación E2E completa

**Step 1: Asegurar que ambos servidores corren**

```bash
# Terminal 1 (backend):
cd nella_backend && npm run start:dev

# Terminal 2 (frontend):
cd nella-frontend && npm run dev
```

**Step 2: Flujo completo de registro**

1. Abrir `http://localhost:3001/register`
2. Step 1: llenar datos de empresa (`Mi Empresa Test`, `retail`, `1-10`, `CO`)
3. Step 2: llenar datos admin (`Juan Pérez`, `juan@miemp.com`, `+573001234567`, `TestPass123`)
4. Step 3: llenar producto (`service`, description opcional)
5. Step 4: ingresar `+573009999999` → click "Enviar código" → ingresar `000000` → check verde
6. Summary: revisar datos → click "Confirmar y crear cuenta"
7. ✅ Debe navegar a `/login/mi-empresa-test`

**Step 3: Flujo completo de login**

1. En `/login/mi-empresa-test`, ingresar `juan@miemp.com` / `TestPass123`
2. Click "Iniciar Sesión"
3. ✅ Debe navegar a `/dashboard`
4. Verificar en DevTools → localStorage → `nella-auth-storage` que tiene `accessToken` y `refreshToken`

**Step 4: Verificar backend logs**

En la terminal del backend verificar:
```
✅ Tenant record created: uuid
✅ Tenant schema registered: tenant_mi_empresa_test_xxxxxxxx
✅ Admin user created: juan@miemp.com (Juan Pérez)
✅ Tenant Mi Empresa Test created successfully
✅ Login successful for user: juan@miemp.com
```

**Step 5: Build de producción para verificar que no hay errores**

```bash
# Frontend:
cd nella-frontend && npm run build

# Backend:
cd nella_backend && npm run build
```
Esperado: ambos builds sin errores.

---

### Task B11: Actualizar `registration-step-2.tsx` — validación email contra backend

**Nota:** La validación de email único actualmente usa localStorage (`validateEmailUnique`). Esto ya no aplica con el backend real — el backend retornará `400` o `409` si el email ya existe. Actualizar el handler para eliminar la llamada a localStorage:

**Files:**
- Modify: `src/components/auth/registration-step-2.tsx`

**Step 1: Eliminar la llamada a `validateEmailUnique` (localStorage)**

Localizar `handleEmailBlur` y simplificar:

```typescript
// ANTES: llamaba a validateEmailUnique (localStorage)
const handleEmailBlur = async () => {
  if (!email || errors.email) return
  setIsValidatingEmail(true)
  const isUnique = await validateEmailUnique(email)
  // ...
}

// DESPUÉS: simplemente limpiar el estado, el backend validará al submit
const handleEmailBlur = () => {
  // La unicidad se valida en el backend al confirmar
  setEmailAvailable(null)
}
```

**Step 2: Commit**

```bash
git add src/components/auth/registration-step-2.tsx
git commit -m "refactor|frontend|20260217|Remove localStorage email validation, backend handles it"
```

---

## RESUMEN DE COMMITS

### Backend (nella_backend)
```
fix|backend|20260217|Add @Public decorator to tenant register endpoint
feat|backend|20260217|Expand CreateTenantDto with all wizard fields
feat|backend|20260217|Add profile columns to Tenant entity
feat|backend|20260217|Add migration for tenant profile fields
feat|backend|20260217|Persist all wizard fields in TenantService
```

### Frontend (nella-frontend)
```
feat|frontend|20260217|Update User/Session types for JWT auth integration
feat|frontend|20260217|Remove whatsappToken from step4 validation schema
feat|frontend|20260217|Add JWT token storage to auth-store
feat|frontend|20260217|Add API route proxy for tenant registration
feat|frontend|20260217|Add API route proxy for auth login with X-Tenant-Id
feat|frontend|20260217|Add dynamic login route with JWT integration
feat|frontend|20260217|Replace WhatsApp token with OTP verification in step 4
feat|frontend|20260217|Update summary to remove WhatsApp token reference
feat|frontend|20260217|Connect registration wizard to backend API
refactor|frontend|20260217|Remove localStorage email validation, backend handles it
```

---

## DEUDA TÉCNICA REGISTRADA

- [ ] Integración real WhatsApp Business Token con Meta API (Step 4)
- [ ] Registro y flujo de `sales_agent` — **RECORDATORIO PENDIENTE**
- [ ] Refresh token automático cuando `accessToken` expira (15min)
- [ ] Migrar token storage a httpOnly cookie
- [ ] Endpoint `POST /auth/verify-email` real
- [ ] Rate limiting en API Routes de auth
- [ ] Ruta `/login` antigua → redirect a `/login/[slug]` o eliminar
