import type { RegistrationFormData } from '@/modules/auth/types/auth-types'

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
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REGISTRATION_PROGRESS)
      return saved ? JSON.parse(saved) : null
    } catch {
      // Handle corrupted localStorage data
      return null
    }
  },

  clearRegistrationProgress: () => {
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_PROGRESS)
  },
}
