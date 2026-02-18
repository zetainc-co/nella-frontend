// src/lib/registration-storage.ts

import { RegistrationFormData } from '@/types'

const STORAGE_KEYS = {
  PROGRESS: 'nella_registration_progress',
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

// Slug del tenant (para preview en UI — el backend genera el slug real)
export function generateSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
