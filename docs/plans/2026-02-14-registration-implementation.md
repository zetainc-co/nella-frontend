# Sistema de Registro y Validación - Plan de Implementación

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar sistema de registro multi-paso (wizard) con 4 steps, validación de email, y auto-login al dashboard, usando localStorage para persistencia (MVP sin backend).

**Architecture:** Wizard single-page controlado por hook `useRegistrationWizard`, con 6 estados (4 steps + summary + verification). Auto-guardado en localStorage, validaciones con Zod + react-hook-form, componentes reutilizables siguiendo patrón existente de auth.

**Tech Stack:** Next.js 16, TypeScript, React Hook Form 7.x, Zod 3.x, shadcn/ui, Tailwind CSS 4

**Design Doc:** `docs/plans/2026-02-14-registration-design.md`

---

## Fase 1: Setup y Dependencias

### Task 1: Instalar dependencias de formularios

**Files:**
- Modify: `package.json`

**Step 1: Instalar react-hook-form, zod y resolver**

```bash
npm install react-hook-form zod @hookform/resolvers
```

Expected: Dependencias instaladas en node_modules

**Step 2: Verificar instalación**

```bash
npm list react-hook-form zod @hookform/resolvers
```

Expected: Versiones correctas mostradas (react-hook-form@^7.x, zod@^3.x)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat|registro|20260214|instalar dependencias react-hook-form y zod

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Instalar componentes shadcn/ui

**Files:**
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/textarea.tsx`

**Step 1: Instalar componente Input**

```bash
npx shadcn@latest add input
```

Expected: Archivo creado en `src/components/ui/input.tsx`

**Step 2: Instalar componente Label**

```bash
npx shadcn@latest add label
```

Expected: Archivo creado en `src/components/ui/label.tsx`

**Step 3: Instalar componente Button**

```bash
npx shadcn@latest add button
```

Expected: Archivo creado en `src/components/ui/button.tsx`

**Step 4: Instalar componente Select**

```bash
npx shadcn@latest add select
```

Expected: Archivo creado en `src/components/ui/select.tsx`

**Step 5: Instalar componente Textarea**

```bash
npx shadcn@latest add textarea
```

Expected: Archivo creado en `src/components/ui/textarea.tsx`

**Step 6: Verificar componentes creados**

```bash
ls src/components/ui/
```

Expected: Ver input.tsx, label.tsx, button.tsx, select.tsx, textarea.tsx

**Step 7: Commit**

```bash
git add src/components/ui/
git commit -m "feat|registro|20260214|agregar componentes shadcn/ui base

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 2: Tipos y Datos Estáticos

### Task 3: Extender types con interfaces de registro

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Agregar interfaces al archivo de tipos**

```typescript
// src/types/index.ts

export interface User {
  id: string
  email: string
  password: string  // ⚠️ Solo para MVP - en producción será hash
  fullName: string
  phone: string
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
  industry: string
  industryOther?: string
  companySize: string
  country: string
  offeringType: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string
  whatsappNumber: string
  whatsappToken: string
  createdAt: string
}

export interface Session {
  userId: string
  tenantId: string
  email: string
  fullName: string
  role: 'admin' | 'sales_agent'
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
  phone: string
  password: string
  confirmPassword?: string  // Solo para UI, no se guarda

  // Step 3
  offeringType: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string

  // Step 4
  whatsappNumber: string
  whatsappToken: string
}

export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

export interface Industry {
  value: string
  label: string
}
```

**Step 2: Verificar que compila sin errores**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat|registro|20260214|agregar tipos para sistema de registro

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Crear datos de países LATAM

**Files:**
- Create: `src/lib/countries-latam.ts`

**Step 1: Crear archivo con países LATAM**

```typescript
// src/lib/countries-latam.ts

import { Country, Industry } from '@/types'

export const LATAM_COUNTRIES: Country[] = [
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'PR', name: 'Puerto Rico', dialCode: '+1-787', flag: '🇵🇷' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
]

export const INDUSTRIES: Industry[] = [
  { value: 'real-estate', label: 'Real Estate / Inmobiliaria' },
  { value: 'education', label: 'Educación' },
  { value: 'health', label: 'Salud y Wellness' },
  { value: 'marketing', label: 'Marketing y Agencias' },
  { value: 'saas', label: 'SaaS / Tecnología' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'professional-services', label: 'Servicios Profesionales' },
  { value: 'construction', label: 'Construcción' },
  { value: 'automotive', label: 'Automotriz' },
  { value: 'tourism', label: 'Turismo y Hospitalidad' },
  { value: 'insurance', label: 'Seguros' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Otro (especificar)' },
]

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '200+', label: 'Más de 200 empleados' },
]
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/lib/countries-latam.ts
git commit -m "feat|registro|20260214|agregar datos de países LATAM e industrias

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 3: Validaciones y Utilidades

### Task 5: Crear schemas de validación con Zod

**Files:**
- Create: `src/lib/registration-validations.ts`

**Step 1: Crear archivo con schemas Zod**

```typescript
// src/lib/registration-validations.ts

import { z } from 'zod'

// Step 1: Datos de Empresa
export const step1Schema = z.object({
  companyName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  industry: z.string()
    .min(1, 'Selecciona una industria'),

  industryOther: z.string().optional(),

  companySize: z.enum(['1-10', '11-50', '51-200', '200+'], {
    errorMap: () => ({ message: 'Selecciona el tamaño de tu empresa' })
  }),

  country: z.string()
    .min(1, 'Selecciona un país')
}).refine(
  (data) => {
    // Si selecciona "Otro", debe especificar
    if (data.industry === 'other' && !data.industryOther) {
      return false
    }
    return true
  },
  {
    message: 'Especifica tu industria',
    path: ['industryOther']
  }
)

// Step 2: Datos del Admin
export const step2Schema = z.object({
  fullName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),

  email: z.string()
    .email('Email inválido')
    .toLowerCase(),

  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .regex(/^[0-9+\s()-]+$/, 'Solo números y símbolos válidos'),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),

  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  }
)

// Step 3: Configuración de Producto
export const step3Schema = z.object({
  offeringType: z.enum(['product', 'service'], {
    errorMap: () => ({ message: 'Selecciona qué vendes' })
  }),

  description: z.string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),

  priceRange: z.string()
    .max(50, 'Máximo 50 caracteres')
    .optional(),

  idealCustomer: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional()
})

// Step 4: Conexión WhatsApp
export const step4Schema = z.object({
  whatsappNumber: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Formato inválido. Debe ser +[código][número]'),

  whatsappToken: z.string()
    .min(200, 'El token debe tener al menos 200 caracteres')
    .max(500, 'El token no debe exceder 500 caracteres')
})

// Schema completo
export const registrationSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape
})

// Función para calcular fuerza de contraseña
export function calculatePasswordStrength(password: string): number {
  let strength = 0

  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++ // Caracteres especiales

  return Math.min(strength, 3) // Max 3
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/lib/registration-validations.ts
git commit -m "feat|registro|20260214|agregar schemas de validación con Zod

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Crear utilidades para localStorage

**Files:**
- Create: `src/lib/registration-storage.ts`

**Step 1: Crear funciones de localStorage**

```typescript
// src/lib/registration-storage.ts

import { User, Tenant, Session, RegistrationFormData } from '@/types'

const STORAGE_KEYS = {
  PROGRESS: 'nella_registration_progress',
  USERS: 'nella_users',
  TENANTS: 'nella_tenants',
  REGISTERED_EMAILS: 'nella_registered_emails',
  SESSION: 'nella_session',
}

// Progreso del wizard
export function saveRegistrationProgress(
  currentStep: number,
  completedSteps: number[],
  formData: Partial<RegistrationFormData>
): void {
  try {
    const progress = {
      currentStep,
      completedSteps,
      formData,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
  } catch (error) {
    console.error('Error al guardar progreso:', error)
  }
}

export function loadRegistrationProgress(): {
  currentStep: number
  completedSteps: number[]
  formData: Partial<RegistrationFormData>
} | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS)
    if (!data) return null

    const progress = JSON.parse(data)

    // Verificar que no sea muy antiguo (más de 7 días)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    if (progress.timestamp < sevenDaysAgo) {
      clearRegistrationProgress()
      return null
    }

    return progress
  } catch (error) {
    console.error('Error al cargar progreso:', error)
    return null
  }
}

export function clearRegistrationProgress(): void {
  localStorage.removeItem(STORAGE_KEYS.PROGRESS)
}

// Email único
export async function validateEmailUnique(email: string): Promise<boolean> {
  // Simular delay de API call
  await new Promise(resolve => setTimeout(resolve, 300))

  const registeredEmails = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.REGISTERED_EMAILS) || '[]'
  )

  return !registeredEmails.includes(email.toLowerCase())
}

export function addRegisteredEmail(email: string): void {
  const emails = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.REGISTERED_EMAILS) || '[]'
  )

  if (!emails.includes(email.toLowerCase())) {
    emails.push(email.toLowerCase())
    localStorage.setItem(STORAGE_KEYS.REGISTERED_EMAILS, JSON.stringify(emails))
  }
}

// Slug del tenant
export function generateSlug(companyName: string): string {
  let slug = companyName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')  // Solo letras, números, espacios, guiones
    .trim()
    .replace(/\s+/g, '-')          // Espacios a guiones
    .replace(/-+/g, '-')           // Múltiples guiones a uno solo

  // Verificar unicidad
  const tenants: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]')
  const exists = tenants.some(t => t.slug === slug)

  if (exists) {
    let counter = 2
    while (tenants.some(t => t.slug === `${slug}-${counter}`)) {
      counter++
    }
    slug = `${slug}-${counter}`
  }

  return slug
}

// Validación WhatsApp (simulada)
export async function validateWhatsAppToken(
  token: string,
  phoneNumber: string
): Promise<{ valid: boolean; message: string }> {
  // Simular llamada a Meta API (2 segundos)
  await new Promise(resolve => setTimeout(resolve, 2000))

  if (token.length < 200) {
    return {
      valid: false,
      message: 'El token es demasiado corto'
    }
  }

  // En MVP, siempre retorna éxito
  return {
    valid: true,
    message: '✓ Token validado correctamente con Meta API'
  }
}

export async function validateWhatsAppNumber(
  phoneNumber: string
): Promise<{ valid: boolean; message: string }> {
  // Simular llamada a Meta API (1 segundo)
  await new Promise(resolve => setTimeout(resolve, 1000))

  // En MVP, siempre retorna éxito
  return {
    valid: true,
    message: '✓ Número de WhatsApp verificado'
  }
}

// Guardar usuario y tenant
export function saveUserAndTenant(
  userData: Omit<User, 'id' | 'createdAt'>,
  tenantData: Omit<Tenant, 'id' | 'createdAt'>
): { userId: string; tenantId: string } {
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const user: User = {
    ...userData,
    id: userId,
    tenantId,
    createdAt: new Date().toISOString(),
  }

  const tenant: Tenant = {
    ...tenantData,
    id: tenantId,
    createdAt: new Date().toISOString(),
  }

  // Guardar usuario
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
  users.push(user)
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

  // Guardar tenant
  const tenants: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]')
  tenants.push(tenant)
  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants))

  // Agregar email a lista de registrados
  addRegisteredEmail(user.email)

  return { userId, tenantId }
}

// Crear sesión
export function createSession(user: User): void {
  const session: Session = {
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    loginAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
}

// Marcar email como verificado
export function markEmailAsVerified(userId: string): void {
  const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
  const userIndex = users.findIndex(u => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex].emailVerified = true
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/lib/registration-storage.ts
git commit -m "feat|registro|20260214|agregar utilidades para localStorage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 4: Componentes Reutilizables

### Task 7: Crear CountryPhoneSelector

**Files:**
- Create: `src/components/auth/country-phone-selector.tsx`

**Step 1: Crear componente CountryPhoneSelector**

```typescript
// src/components/auth/country-phone-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { LATAM_COUNTRIES } from '@/lib/countries-latam'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CountryPhoneSelectorProps {
  value: string // E.164 completo: "+573001234567"
  onChange: (e164: string) => void
  error?: string
}

export function CountryPhoneSelector({
  value,
  onChange,
  error,
}: CountryPhoneSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(LATAM_COUNTRIES[4]) // Colombia por defecto
  const [localNumber, setLocalNumber] = useState('')

  // Parsear el valor inicial
  useEffect(() => {
    if (value) {
      const country = LATAM_COUNTRIES.find(c => value.startsWith(c.dialCode))
      if (country) {
        setSelectedCountry(country)
        setLocalNumber(value.slice(country.dialCode.length))
      }
    }
  }, [])

  // Combinar y notificar cambios
  useEffect(() => {
    const e164 = `${selectedCountry.dialCode}${localNumber.replace(/\D/g, '')}`
    onChange(e164)
  }, [selectedCountry, localNumber, onChange])

  const handleCountryChange = (countryCode: string) => {
    const country = LATAM_COUNTRIES.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos
    const digits = e.target.value.replace(/\D/g, '')
    setLocalNumber(digits)
  }

  return (
    <div className="space-y-2">
      <Label>Número de WhatsApp Business</Label>

      <div className="flex gap-2">
        {/* Selector de país */}
        <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LATAM_COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {country.dialCode}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Input del número local */}
        <Input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="300 123 4567"
          className="flex-1"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Formato E.164: {selectedCountry.dialCode}{localNumber || '...'}
      </p>
    </div>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/components/auth/country-phone-selector.tsx
git commit -m "feat|registro|20260214|agregar CountryPhoneSelector reutilizable

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Crear RegistrationStepper

**Files:**
- Create: `src/components/auth/registration-stepper.tsx`

**Step 1: Crear componente RegistrationStepper**

```typescript
// src/components/auth/registration-stepper.tsx
'use client'

import { Check } from 'lucide-react'

interface RegistrationStepperProps {
  currentStep: number // 1-4
  completedSteps: number[] // [1, 2] = steps 1 y 2 completados
  onStepClick: (step: number) => void
}

const STEPS = [
  { number: 1, label: 'Empresa' },
  { number: 2, label: 'Admin' },
  { number: 3, label: 'Producto' },
  { number: 4, label: 'WhatsApp' },
]

export function RegistrationStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: RegistrationStepperProps) {
  const isCompleted = (step: number) => completedSteps.includes(step)
  const isCurrent = (step: number) => currentStep === step
  const isClickable = (step: number) => completedSteps.includes(step) || step === currentStep

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => isClickable(step.number) && onStepClick(step.number)}
              disabled={!isClickable(step.number)}
              className={`
                relative z-10 flex h-10 w-10 items-center justify-center rounded-full
                border-2 transition-all duration-300 font-semibold
                ${
                  isCurrent(step.number)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCompleted(step.number)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }
                ${
                  isClickable(step.number)
                    ? 'cursor-pointer hover:scale-110'
                    : 'cursor-not-allowed opacity-50'
                }
              `}
            >
              {isCompleted(step.number) ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </button>

            {/* Label */}
            <div className="ml-2 hidden sm:block">
              <p
                className={`
                  text-sm font-medium transition-colors
                  ${
                    isCurrent(step.number) || isCompleted(step.number)
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-4 hidden sm:block">
                <div
                  className={`
                    h-0.5 w-full transition-colors duration-300
                    ${
                      isCompleted(step.number)
                        ? 'bg-primary'
                        : 'bg-border'
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile label below */}
      <div className="mt-3 text-center sm:hidden">
        <p className="text-sm font-medium text-foreground">
          {STEPS.find(s => s.number === currentStep)?.label}
        </p>
        <p className="text-xs text-muted-foreground">
          Paso {currentStep} de {STEPS.length}
        </p>
      </div>
    </div>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/components/auth/registration-stepper.tsx
git commit -m "feat|registro|20260214|agregar RegistrationStepper con navegación

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 5: Steps del Wizard

### Task 9: Crear RegistrationStep1 (Datos de Empresa)

**Files:**
- Create: `src/components/auth/registration-step-1.tsx`

**Step 1: Crear componente Step 1**

```typescript
// src/components/auth/registration-step-1.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { step1Schema } from '@/lib/registration-validations'
import { LATAM_COUNTRIES, INDUSTRIES, COMPANY_SIZES } from '@/lib/countries-latam'
import { RegistrationFormData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface RegistrationStep1Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
}

export function RegistrationStep1({
  initialData,
  onNext,
}: RegistrationStep1Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      companyName: initialData.companyName || '',
      industry: initialData.industry || '',
      industryOther: initialData.industryOther || '',
      companySize: initialData.companySize || '',
      country: initialData.country || '',
    },
  })

  const industry = watch('industry')
  const showOtherIndustry = industry === 'other'

  const onSubmit = handleSubmit((data) => {
    onNext(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre de Empresa */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Nombre de la empresa <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            {...register('companyName')}
            placeholder="Mi Empresa S.A."
            className={errors.companyName ? 'border-destructive' : ''}
          />
          {errors.companyName && (
            <p className="text-sm text-destructive">{errors.companyName.message}</p>
          )}
        </div>

        {/* Industria */}
        <div className="space-y-2">
          <Label htmlFor="industry">
            Industria / Sector <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('industry')}
            onValueChange={(value) => setValue('industry', value)}
          >
            <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecciona tu industria" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((ind) => (
                <SelectItem key={ind.value} value={ind.value}>
                  {ind.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive">{errors.industry.message}</p>
          )}
        </div>

        {/* Campo "Otro" condicional */}
        {showOtherIndustry && (
          <div className="space-y-2">
            <Label htmlFor="industryOther">
              Especifica tu industria <span className="text-destructive">*</span>
            </Label>
            <Input
              id="industryOther"
              {...register('industryOther')}
              placeholder="Ej: Consultoría financiera"
              className={errors.industryOther ? 'border-destructive' : ''}
            />
            {errors.industryOther && (
              <p className="text-sm text-destructive">{errors.industryOther.message}</p>
            )}
          </div>
        )}

        {/* Tamaño de Empresa */}
        <div className="space-y-2">
          <Label htmlFor="companySize">
            Tamaño de la empresa <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('companySize')}
            onValueChange={(value) => setValue('companySize', value)}
          >
            <SelectTrigger className={errors.companySize ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecciona el tamaño" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companySize && (
            <p className="text-sm text-destructive">{errors.companySize.message}</p>
          )}
        </div>

        {/* País */}
        <div className="space-y-2">
          <Label htmlFor="country">
            País <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('country')}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecciona tu país" />
            </SelectTrigger>
            <SelectContent>
              {LATAM_COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Botón Siguiente */}
      <div className="flex justify-end pt-4">
        <Button type="submit" className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/components/auth/registration-step-1.tsx
git commit -m "feat|registro|20260214|agregar Step 1 - Datos de Empresa

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 10: Crear RegistrationStep2 (Datos del Admin)

**Files:**
- Create: `src/components/auth/registration-step-2.tsx`

**Step 1: Crear componente Step 2**

```typescript
// src/components/auth/registration-step-2.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { step2Schema } from '@/lib/registration-validations'
import { validateEmailUnique } from '@/lib/registration-storage'
import { calculatePasswordStrength } from '@/lib/registration-validations'
import { RegistrationFormData } from '@/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'

interface RegistrationStep2Props {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack: () => void
}

export function RegistrationStep2({
  initialData,
  onNext,
  onBack,
}: RegistrationStep2Props) {
  const [isValidatingEmail, setIsValidatingEmail] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: initialData.fullName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      password: initialData.password || '',
      confirmPassword: initialData.password || '',
    },
  })

  const password = watch('password')
  const email = watch('email')

  // Calcular fuerza de contraseña
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  // Validar email único al perder foco
  const handleEmailBlur = async () => {
    if (!email || errors.email) return

    setIsValidatingEmail(true)
    setEmailAvailable(null)

    try {
      const isUnique = await validateEmailUnique(email)
      setEmailAvailable(isUnique)

      if (!isUnique) {
        setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado',
        })
      } else {
        clearErrors('email')
      }
    } catch (error) {
      console.error('Error validando email:', error)
    } finally {
      setIsValidatingEmail(false)
    }
  }

  const onSubmit = handleSubmit((data) => {
    // Remover confirmPassword antes de guardar
    const { confirmPassword, ...dataToSave } = data
    onNext(dataToSave)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombre completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Juan Pérez"
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email corporativo <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              {...register('email')}
              onBlur={handleEmailBlur}
              placeholder="juan@miempresa.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {isValidatingEmail && (
              <div className="absolute right-3 top-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isValidatingEmail && emailAvailable === true && (
              <div className="absolute right-3 top-3">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Teléfono <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+57 300 123 4567"
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Contraseña <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}

          {/* Indicador de fuerza */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 1 ? 'bg-destructive' : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-muted'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded transition-colors ${
                    passwordStrength >= 3 ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {passwordStrength === 1 && 'Débil'}
                {passwordStrength === 2 && 'Media'}
                {passwordStrength === 3 && 'Fuerte'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirmar contraseña <span className="text-destructive">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="••••••••"
            className={errors.confirmPassword ? 'border-destructive' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button type="submit" className="gap-2">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
```

**Step 2: Verificar que compila**

```bash
npm run build
```

Expected: Build exitoso

**Step 3: Commit**

```bash
git add src/components/auth/registration-step-2.tsx
git commit -m "feat|registro|20260214|agregar Step 2 - Datos del Admin con validación

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 11: Crear RegistrationStep3 (Configuración de Producto)

**Files:**
- Create: `src/components/auth/registration-step-3.tsx`

**Step 1: Crear componente Step 3**

Crear archivo con formulario de configuración de producto (offeringType, description, priceRange, idealCustomer)

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/auth/registration-step-3.tsx
git commit -m "feat|registro|20260214|agregar Step 3 - Configuración de Producto

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 12: Crear RegistrationStep4 (Conexión WhatsApp)

**Files:**
- Create: `src/components/auth/registration-step-4.tsx`

**Step 1: Crear componente Step 4**

Crear archivo con CountryPhoneSelector y campo de token con validación simulada

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/auth/registration-step-4.tsx
git commit -m "feat|registro|20260214|agregar Step 4 - Conexión WhatsApp

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 13: Crear RegistrationSummary

**Files:**
- Create: `src/components/auth/registration-summary.tsx`

**Step 1: Crear componente de resumen**

Crear archivo con resumen editable de todos los datos, slug del tenant editable, y botón confirmar

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/auth/registration-summary.tsx
git commit -m "feat|registro|20260214|agregar resumen final con slug editable

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 14: Crear EmailVerification

**Files:**
- Create: `src/components/auth/email-verification.tsx`

**Step 1: Crear componente de verificación**

Crear archivo con 6 inputs de código, validación del código "000000", timer de 10 minutos, y máximo 5 intentos

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/auth/email-verification.tsx
git commit -m "feat|registro|20260214|agregar verificación de email con código

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 6: Hook Principal y Orquestador

### Task 15: Crear useRegistrationWizard

**Files:**
- Create: `src/hooks/useRegistrationWizard.ts`

**Step 1: Crear hook principal**

Crear hook con estado del wizard (currentStep, completedSteps, formData), auto-guardado en localStorage, y funciones de navegación y validación

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/hooks/useRegistrationWizard.ts
git commit -m "feat|registro|20260214|agregar hook principal useRegistrationWizard

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 16: Crear RegistrationWizard (Orquestador)

**Files:**
- Create: `src/components/auth/registration-wizard.tsx`

**Step 1: Crear orquestador**

Crear componente que usa useRegistrationWizard y renderiza el step correspondiente (Step1-4, Summary, EmailVerification) con stepper y glass panel

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/auth/registration-wizard.tsx
git commit -m "feat|registro|20260214|agregar orquestador RegistrationWizard

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 7: Página y Routing

### Task 17: Crear página /register

**Files:**
- Create: `src/app/(auth)/register/page.tsx`

**Step 1: Crear página de registro**

Crear página que usa el mismo layout de login (HudBackground, LoginHeader, TechnicalFooter) con RegistrationWizard

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Verificar en navegador**

```bash
npm run dev
```

Abrir http://localhost:3000/register y verificar que se muestra el wizard

**Step 4: Commit**

```bash
git add src/app/(auth)/register/
git commit -m "feat|registro|20260214|agregar página de registro

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 8: Integraciones

### Task 18: Modificar useLoginForm para localStorage

**Files:**
- Modify: `src/hooks/useLoginForm.ts`

**Step 1: Actualizar función handleLogin**

Modificar para buscar usuario en localStorage, validar emailVerified, crear sesión, y redirigir a dashboard

**Step 2: Verificar compilación**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/hooks/useLoginForm.ts
git commit -m "feat|registro|20260214|integrar login con localStorage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 19: Agregar link de registro en login

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

**Step 1: Agregar link "Regístrate aquí"**

Agregar debajo del LoginCard un link a /register con texto "¿No tienes cuenta? Regístrate aquí"

**Step 2: Verificar en navegador**

Abrir http://localhost:3000/login y verificar que aparece el link y redirige a /register

**Step 3: Commit**

```bash
git add src/app/(auth)/login/page.tsx
git commit -m "feat|registro|20260214|agregar link de registro en login

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Fase 9: Testing Manual

### Task 20: Testing del flujo completo

**Testing Checklist:**

**Test 1: Flujo completo sin interrupciones**
1. Abrir http://localhost:3000/register
2. Llenar Step 1 (Datos Empresa) - verificar validaciones
3. Click "Siguiente" - verificar que avanza a Step 2
4. Llenar Step 2 (Admin) - verificar validación de email único
5. Click "Siguiente" - verificar Step 3
6. Llenar Step 3 (Producto) - todos los campos opcionales
7. Click "Siguiente" - verificar Step 4
8. Llenar Step 4 (WhatsApp) - verificar loading de 2s
9. Ver mensajes "✓ Token validado" y "✓ Número verificado"
10. Click "Siguiente" - verificar resumen
11. Verificar que el slug se genera correctamente
12. Editar slug manualmente
13. Click "Confirmar" - verificar pantalla de verificación
14. Ingresar código "000000"
15. Verificar redirección a /dashboard
16. Verificar que hay sesión en localStorage

**Test 2: Auto-guardado y recuperación**
1. Iniciar registro, llenar Step 1 y Step 2
2. Cerrar el navegador completamente
3. Volver a abrir http://localhost:3000/register
4. Verificar que recupera el progreso en Step 2
5. Continuar y completar el registro

**Test 3: Validaciones**
1. Intentar avanzar sin llenar campos requeridos - debe mostrar errores
2. Ingresar email inválido - debe mostrar error de formato
3. Ingresar email ya registrado - debe mostrar "Email ya registrado"
4. Contraseña sin mayúscula - debe mostrar error
5. Contraseñas no coinciden - debe mostrar error
6. Token de WhatsApp muy corto - debe mostrar error

**Test 4: Navegación entre steps**
1. Completar Steps 1, 2, 3
2. Click en Step 1 del stepper - debe volver a Step 1
3. Editar datos - deben persistir
4. Avanzar nuevamente - debe mantener los datos

**Test 5: Verificación de email**
1. Llegar a pantalla de verificación
2. Ingresar código incorrecto 3 veces
3. Verificar mensaje de intentos restantes
4. Ingresar código correcto "000000"
5. Verificar auto-login exitoso

**Test 6: Login con credenciales creadas**
1. Completar un registro
2. Cerrar sesión (limpiar nella_session de localStorage)
3. Ir a /login
4. Ingresar email y contraseña del registro
5. Verificar login exitoso

**Test 7: Email duplicado**
1. Completar un registro con email "test@example.com"
2. Iniciar nuevo registro
3. En Step 2, ingresar mismo email "test@example.com"
4. Perder foco del campo email
5. Verificar mensaje "Este email ya está registrado"
6. No debe permitir avanzar

**Test 8: Responsive**
1. Abrir en desktop (>768px) - verificar stepper horizontal
2. Abrir en mobile (<768px) - verificar stepper compacto
3. Verificar que todos los campos son accesibles
4. Verificar botones full-width en mobile

**Resultado esperado:** ✅ Todos los tests pasan

---

## Resumen del Plan

**Total de Tasks:** 20
**Tiempo estimado:** 8-10 horas
**Complejidad:** Media

**Orden de ejecución sugerido:**
1. Fase 1: Setup (Tasks 1-2) - 30 min
2. Fase 2: Tipos y Datos (Tasks 3-4) - 30 min
3. Fase 3: Validaciones (Tasks 5-6) - 1 hora
4. Fase 4: Componentes Base (Tasks 7-8) - 1.5 horas
5. Fase 5: Steps del Wizard (Tasks 9-14) - 3 horas
6. Fase 6: Hook y Orquestador (Tasks 15-16) - 2 horas
7. Fase 7: Página (Task 17) - 30 min
8. Fase 8: Integraciones (Tasks 18-19) - 30 min
9. Fase 9: Testing (Task 20) - 1 hora

**Archivos creados:** 17
**Archivos modificados:** 3
**Total de líneas de código:** ~2500

---

## Próximos Pasos Después de Este Plan

Una vez completada la implementación:

1. **Documentar en README** - Agregar sección sobre el sistema de registro
2. **Screenshots** - Capturar pantallas de cada step para docs
3. **Migración futura** - Cuando exista API, reemplazar localStorage por llamadas a `/api/auth/*`
4. **Mejoras post-MVP**:
   - Tests unitarios con Vitest
   - Tests E2E con Playwright
   - Envío real de emails
   - Validación real con Meta API
   - Hashing de contraseñas con bcrypt

---

**Plan completo. Listo para ejecución.**
