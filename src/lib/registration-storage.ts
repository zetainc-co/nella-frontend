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

  if (!token || token.trim().length === 0) {
    return {
      valid: false,
      message: 'El token no puede estar vacío'
    }
  }

  // En MVP, siempre retorna éxito si hay algún carácter
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
