// User & Session Types
export interface User {
  id: string
  email: string
  // password ELIMINADO — nunca debe llegar al cliente
  fullName: string
  phone?: string
  tenantId: string
  tenantSlug: string
  tenantName?: string
  role: 'admin' | 'agent' | 'viewer'
  emailVerified: boolean
  createdAt: string
  updatedAt?: string
}

export interface Session {
  userId: string
  tenantId: string
  tenantSlug: string
  tenantName?: string
  email: string
  fullName: string
  role: 'admin' | 'agent' | 'viewer'
  accessToken: string     // JWT 15min
  refreshToken: string    // JWT 7d
  loginAt: string
  expiresAt?: string
}

// Tenant Type
export interface Tenant {
  id: string
  slug: string
  name: string
  subdomain?: string
  status?: string
  industry?: string
  industryOther?: string
  companySize?: CompanySize
  country?: string
  offeringType?: 'product' | 'service'
  description?: string
  priceRange?: string
  idealCustomer?: string
  whatsappNumber?: string
  // whatsappToken ELIMINADO — diferido a integración Meta API
  createdAt?: string
  updatedAt?: string
}

// Registration Form Data
export interface RegistrationFormData {
  // Step 1
  companyName: string
  industry: string
  industryOther?: string
  companySize: CompanySize
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

// Company Size Type
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'

// OAuth Types
export type OAuthProvider = 'google' | 'apple'

// Auth State (used by Zustand store)
export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  tenantSubdomain: string | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  setTenantSubdomain: (subdomain: string | null) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  getAccessToken: () => string | null
}

export interface AuthValidationResult {
  isValid: boolean
  isLoading: boolean
}

// Registration Progress
export interface RegistrationProgress {
  currentStep: number
  completedSteps: number[]
  formData: Partial<RegistrationFormData>
}

// Country & Industry Types (used in registration)
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

// Component Props
export interface RegistrationStepProps {
  initialData: Partial<RegistrationFormData>
  onNext: (data: Partial<RegistrationFormData>) => void
  onBack?: () => void
}

export interface RegistrationSummaryProps {
  formData: Partial<RegistrationFormData>
  onConfirm: () => void
  onBack: () => void
  onEdit: (step: number) => void
  isCreatingWorkflow?: boolean
  workflowError?: string | null
}

export interface EmailVerificationProps {
  email: string
  onVerified: () => void
  onResendCode: () => void
}

export interface CountryPhoneSelectorProps {
  value: string
  onChange: (e164: string) => void
  error?: string
  label?: string
}

export interface CreatePasswordFormProps {
  token: string
  email: string
}

export interface LoginFormProps {
  tenantSlug?: string
}
