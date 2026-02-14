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
  placeholder: string // Ejemplo de número local
}

export interface Industry {
  value: string
  label: string
}
