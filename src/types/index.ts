// src/types/index.ts
// Re-exports from auth-types for convenience
export type { User, Session, Tenant, RegistrationFormData, CompanySize } from './auth-types'

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
