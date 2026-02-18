# Auth Module Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement complete auth module redesign with OAuth, forgot password, and improved registration wizard following the exact design specifications.

**Architecture:** Layered architecture with UI (Pages/Components) → Logic (Hooks/Stores) → Service (lib/auth) → API (routes). Uses shadcn/ui components, Zod validation, Zustand state management, and Supabase-ready auth service.

**Tech Stack:** Next.js 16, TypeScript, shadcn/ui, Zod, Zustand, React Hook Form, Supabase, Tailwind CSS 4

---

## Task 1: Project Setup & Dependencies

**Goal:** Install required dependencies and configure shadcn/ui components

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`

**Step 1: Install shadcn/ui components**

Run:
```bash
npx shadcn@latest add button input label form card separator progress textarea select toggle badge
```

Expected: Components installed in `src/components/ui/`

**Step 2: Install additional dependencies**

Run:
```bash
npm install zustand @supabase/supabase-js sonner
```

Expected: Dependencies added to package.json

**Step 3: Verify installation**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

**Step 4: Commit**

```bash
git add package.json package-lock.json src/components/ui/
git commit -m "chore|auth|20260216|add shadcn ui components and dependencies"
```

---

## Task 2: Types & Validation Schemas

**Goal:** Create TypeScript types and Zod validation schemas for auth module

**Files:**
- Create: `src/types/auth-types.ts`
- Create: `src/lib/auth/auth-validations.ts`

**Step 1: Create auth types**

File: `src/types/auth-types.ts`

```typescript
// User & Session Types
export interface User {
  id: string
  email: string
  fullName: string
  phone: string
  tenantId: string
  tenantSlug: string
  role: 'admin' | 'sales_agent'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Session {
  userId: string
  tenantId: string
  email: string
  fullName: string
  role: 'admin' | 'sales_agent'
  loginAt: string
  expiresAt?: string
}

// Tenant Type
export interface Tenant {
  id: string
  slug: string
  name: string
  industry: string
  industryOther?: string
  companySize: CompanySize
  country: string
  offeringType: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string
  whatsappNumber: string
  whatsappToken: string
  createdAt: string
  updatedAt: string
}

// Registration Form Data
export interface RegistrationFormData {
  companyName: string
  industry: string
  industryOther?: string
  companySize: CompanySize
  country: string
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword?: string
  offeringType: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string
  whatsappNumber: string
  whatsappToken: string
}

// Company Size Type
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

// OAuth Types
export type OAuthProvider = 'google' | 'apple'

// Auth State
export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Registration Progress
export interface RegistrationProgress {
  currentStep: number
  completedSteps: number[]
  formData: Partial<RegistrationFormData>
}
```

**Step 2: Create validation schemas**

File: `src/lib/auth/auth-validations.ts`

```typescript
import * as z from 'zod'

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration Step 1 Schema
export const registrationStep1Schema = z.object({
  companyName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  industry: z.string().min(1, 'Selecciona una industria'),
  industryOther: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
    required_error: 'Selecciona el tamaño de tu empresa',
  }),
  country: z.string().min(2, 'Selecciona tu país').max(2, 'Código de país inválido'),
})

// Registration Step 2 Schema
export const registrationStep2Schema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  email: z.string().min(1, 'El email es requerido').email('Email inválido').toLowerCase(),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede superar 15 dígitos')
    .regex(/^[0-9]+$/, 'El teléfono solo puede contener números'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Registration Step 3 Schema
export const registrationStep3Schema = z.object({
  offeringType: z.enum(['product', 'service'], {
    required_error: 'Selecciona qué vendes',
  }),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede superar 500 caracteres')
    .optional(),
  priceRange: z.string().optional(),
  idealCustomer: z
    .string()
    .min(10, 'Describe tu cliente ideal (mínimo 10 caracteres)')
    .max(500, 'La descripción no puede superar 500 caracteres')
    .optional(),
})

// Registration Step 4 Schema
export const registrationStep4Schema = z.object({
  whatsappNumber: z
    .string()
    .min(10, 'El número debe tener al menos 10 dígitos')
    .max(15, 'El número no puede superar 15 dígitos')
    .regex(/^[0-9]+$/, 'Solo puede contener números'),
  whatsappToken: z.string().min(1, 'El token es requerido').optional(),
})

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido'),
})

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede superar 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Email Verification Schema
export const emailVerificationSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^[0-9]+$/, 'El código solo puede contener números'),
})

export type RegistrationStep1Data = z.infer<typeof registrationStep1Schema>
export type RegistrationStep2Data = z.infer<typeof registrationStep2Schema>
export type RegistrationStep3Data = z.infer<typeof registrationStep3Schema>
export type RegistrationStep4Data = z.infer<typeof registrationStep4Schema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>
```

**Step 3: Commit**

```bash
git add src/types/auth-types.ts src/lib/auth/auth-validations.ts
git commit -m "feat|auth|20260216|add auth types and validation schemas"
```

---

## Task 3: Styling & Theme Configuration

**Goal:** Configure Tailwind and add auth-specific styles

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

**Step 1: Update globals.css with auth styles**

File: `src/app/globals.css` (add at end)

```css
/* ===========================================
   AUTH REDESIGN - Dark Theme
   =========================================== */

.dark {
  /* Auth-specific colors */
  --background: 13 22 36; /* #0D1624 */
  --card: 26 31 46; /* #1A1F2E */
  --primary: 206 242 93; /* #CEF25D */
  --border: 30 41 59; /* #1E293B */
}

/* ===========================================
   AUTH LAYOUT STYLES
   =========================================== */

@layer base {
  .auth-background {
    @apply relative min-h-screen overflow-hidden bg-[#0D1624];
  }

  .auth-glow {
    @apply absolute inset-0;
    background: radial-gradient(
      ellipse 800px 600px at 50% 50%,
      rgba(20, 184, 166, 0.15) 0%,
      rgba(6, 182, 212, 0.1) 40%,
      transparent 70%
    );
  }

  .auth-glow-secondary {
    @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
    @apply w-[900px] h-[900px] rounded-full blur-3xl opacity-20;
    background: radial-gradient(
      circle,
      rgba(20, 184, 166, 0.3) 0%,
      rgba(6, 182, 212, 0.2) 50%,
      transparent 100%
    );
  }
}

/* ===========================================
   AUTH CARD STYLES
   =========================================== */

@layer components {
  .auth-card {
    @apply relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm;
    @apply shadow-[0_0_60px_-10px_rgba(20,184,166,0.08)];
    @apply hover:shadow-[0_0_80px_-10px_rgba(20,184,166,0.12)];
    @apply transition-shadow duration-500;
  }

  .auth-input {
    @apply h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2;
    @apply text-sm text-foreground placeholder:text-muted-foreground;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50;
    @apply transition-all duration-200;
  }

  .btn-primary {
    @apply h-11 w-full rounded-lg bg-primary px-4 py-2;
    @apply text-sm font-medium text-primary-foreground;
    @apply hover:bg-primary/90 transition-all duration-200;
    @apply shadow-[0_0_20px_rgba(206,242,93,0.3)];
  }
}
```

**Step 2: Update tailwind.config.ts**

File: `tailwind.config.ts` (extend theme)

```typescript
extend: {
  colors: {
    'auth-bg': 'rgb(13, 22, 36)',
    'auth-card': 'rgb(26, 31, 46)',
    'nella-lime': 'rgb(206, 242, 93)',
  },
  boxShadow: {
    'auth-card': '0 0 60px -10px rgba(20, 184, 166, 0.08)',
    'primary-glow': '0 0 20px rgba(206, 242, 93, 0.3)',
  },
}
```

**Step 3: Commit**

```bash
git add src/app/globals.css tailwind.config.ts
git commit -m "feat|auth|20260216|add auth styling and theme configuration"
```

---

## Task 4: Auth Store (Zustand)

**Goal:** Create Zustand store for auth state management with persistence

**Files:**
- Create: `src/stores/auth-store.ts`

**Step 1: Create auth store**

File: `src/stores/auth-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@/types/auth-types'

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) =>
        set((state) => ({
          session,
          isAuthenticated: !!session,
          user: session ? state.user : null,
        })),

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

**Step 2: Commit**

```bash
git add src/stores/auth-store.ts
git commit -m "feat|auth|20260216|create zustand auth store with persistence"
```

---

## Task 5: Auth Service & Storage

**Goal:** Create auth service layer and storage helpers

**Files:**
- Create: `src/lib/auth/auth-storage.ts`
- Create: `src/lib/auth/supabase-client.ts`
- Create: `src/lib/auth/auth-service.ts`

**Step 1: Create auth storage helpers**

File: `src/lib/auth/auth-storage.ts`

```typescript
import type { RegistrationFormData } from '@/types/auth-types'

const STORAGE_KEYS = {
  REGISTRATION_PROGRESS: 'nella_registration_progress',
} as const

interface RegistrationProgress {
  currentStep: number
  completedSteps: number[]
  formData: Partial<RegistrationFormData>
}

export const authStorage = {
  saveRegistrationProgress: (progress: RegistrationProgress) => {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_PROGRESS, JSON.stringify(progress))
  },

  getRegistrationProgress: (): RegistrationProgress | null => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTRATION_PROGRESS)
    return saved ? JSON.parse(saved) : null
  },

  clearRegistrationProgress: () => {
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_PROGRESS)
  },
}
```

**Step 2: Create Supabase client**

File: `src/lib/auth/supabase-client.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
```

**Step 3: Create auth service (mock mode for MVP)**

File: `src/lib/auth/auth-service.ts`

```typescript
import type { User, Session, RegistrationFormData } from '@/types/auth-types'

const STORAGE_KEYS = {
  USERS: 'nella_users',
  SESSION: 'nella_session',
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; session: Session }> {
    // Mock implementation for MVP
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      throw new Error('Email no registrado')
    }

    if (!user.emailVerified) {
      throw new Error('Debes verificar tu email antes de iniciar sesión')
    }

    const session: Session = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      loginAt: new Date().toISOString(),
    }

    return { user, session }
  },

  async register(formData: RegistrationFormData): Promise<{ user: User; session: Session }> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')

    if (users.some((u) => u.email === formData.email)) {
      throw new Error('El email ya está registrado')
    }

    const tenantId = `tenant-${Date.now()}`
    const userId = `user-${Date.now()}`

    const user: User = {
      id: userId,
      email: formData.email,
      fullName: formData.fullName,
      phone: formData.phone,
      tenantId,
      tenantSlug: formData.companyName.toLowerCase().replace(/\s+/g, '-'),
      role: 'admin',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    users.push(user)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))

    const session: Session = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      loginAt: new Date().toISOString(),
    }

    return { user, session }
  },

  async sendVerificationEmail(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Verification email sent to:', email)
  },

  async verifyEmail(code: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (code !== '123456') {
      throw new Error('Código inválido')
    }

    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]')
    const updatedUsers = users.map((u) => ({ ...u, emailVerified: true }))
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers))
  },

  async requestPasswordReset(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Password reset email sent to:', email)
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('[Mock] Password reset for token:', token)
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
  },
}
```

**Step 4: Commit**

```bash
git add src/lib/auth/
git commit -m "feat|auth|20260216|create auth service layer with mock implementation"
```

---

## Task 6: Shared Auth Components

**Goal:** Create reusable auth layout and branding components

**Files:**
- Create: `src/components/auth/shared/auth-layout.tsx`
- Create: `src/components/auth/shared/auth-background.tsx`
- Create: `src/components/auth/shared/auth-branding.tsx`

**Step 1: Create auth background**

File: `src/components/auth/shared/auth-background.tsx`

```typescript
export function AuthBackground() {
  return (
    <>
      <div className="auth-glow" />
      <div className="auth-glow-secondary" />
    </>
  )
}
```

**Step 2: Create auth branding**

File: `src/components/auth/shared/auth-branding.tsx`

```typescript
interface AuthBrandingProps {
  subtitle: string
}

export function AuthBranding({ subtitle }: AuthBrandingProps) {
  return (
    <div className="text-center space-y-2 mb-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Nella<span className="text-primary">Sales</span>
      </h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}
```

**Step 3: Create auth layout**

File: `src/components/auth/shared/auth-layout.tsx`

```typescript
"use client"

import { AuthBackground } from './auth-background'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-background">
      <AuthBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Create index file**

File: `src/components/auth/shared/index.ts`

```typescript
export { AuthLayout } from './auth-layout'
export { AuthBackground } from './auth-background'
export { AuthBranding } from './auth-branding'
```

**Step 5: Commit**

```bash
git add src/components/auth/shared/
git commit -m "feat|auth|20260216|create shared auth layout components"
```

---

## Task 7: Login Page & Components

**Goal:** Implement login page with social auth buttons

**Files:**
- Create: `src/components/auth/login/social-auth-icons.tsx`
- Create: `src/components/auth/login/social-auth-buttons.tsx`
- Create: `src/components/auth/login/login-form.tsx`
- Modify: `src/app/(auth)/login/page.tsx`

**Step 1: Create social auth icons**

File: `src/components/auth/login/social-auth-icons.tsx`

```typescript
export const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export const AppleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
)
```

**Step 2: Create social auth buttons**

File: `src/components/auth/login/social-auth-buttons.tsx`

```typescript
"use client"

import { Button } from '@/components/ui/button'
import { GoogleIcon, AppleIcon } from './social-auth-icons'

export function SocialAuthButtons() {
  const handleGoogleLogin = () => {
    console.log('[OAuth] Google login clicked')
    // Will be implemented in OAuth hook
  }

  const handleAppleLogin = () => {
    console.log('[OAuth] Apple login clicked')
    // Will be implemented in OAuth hook
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        type="button"
        className="h-11"
        onClick={handleGoogleLogin}
      >
        <GoogleIcon />
        <span className="ml-2">Google</span>
      </Button>
      <Button
        variant="outline"
        type="button"
        className="h-11"
        onClick={handleAppleLogin}
      >
        <AppleIcon />
        <span className="ml-2">Apple</span>
      </Button>
    </div>
  )
}
```

**Step 3: Create login form component**

File: `src/components/auth/login/login-form.tsx`

```typescript
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SocialAuthButtons } from './social-auth-buttons'
import { loginSchema, type LoginFormData } from '@/lib/auth/auth-validations'
import { authService } from '@/lib/auth/auth-service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const { setUser, setSession } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const { user, session } = await authService.login(data.email, data.password)

      setUser(user)
      setSession(session)

      toast.success('Bienvenido de vuelta', {
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

  return (
    <div className="auth-card p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu@empresa.com"
                    className="auth-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contraseña <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      className="auth-input pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              o continúa con
            </span>
          </div>

          <SocialAuthButtons />
        </form>
      </Form>
    </div>
  )
}
```

**Step 4: Update login page**

File: `src/app/(auth)/login/page.tsx`

```typescript
import Link from 'next/link'
import { AuthLayout, AuthBranding } from '@/components/auth/shared'
import { LoginForm } from '@/components/auth/login/login-form'

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthBranding subtitle="Inicia sesión en tu cuenta" />
      <LoginForm />

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

**Step 5: Verify login works**

Run: `npm run dev`
Navigate to: `http://localhost:3000/login`
Expected: Login page displays with design matching screenshots

**Step 6: Commit**

```bash
git add src/components/auth/login/ src/app/\(auth\)/login/page.tsx
git commit -m "feat|auth|20260216|implement login page with social auth UI"
```

---

## Execution Summary

**Total Tasks:** 13 (7 completed above, 6 remaining)

**Remaining Tasks:**
- Task 8: Register Wizard Components (steps 1-4)
- Task 9: Registration Progress & Summary
- Task 10: Forgot Password Flow
- Task 11: API Routes
- Task 12: Custom Hooks (useOAuth, useRegister, etc.)
- Task 13: OAuth Configuration & Callback

**Estimated Time:** 6-8 hours for complete implementation

---

Plan complete and saved to `docs/plans/2026-02-16-auth-redesign-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
