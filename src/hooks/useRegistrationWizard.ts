// src/hooks/useRegistrationWizard.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegistrationFormData, User } from '@/types'
import {
  saveRegistrationProgress,
  loadRegistrationProgress,
  clearRegistrationProgress,
  saveUserAndTenant,
  createSession,
  markEmailAsVerified,
} from '@/lib/registration-storage'

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 // Steps 1-4, Summary (5), EmailVerification (6)

export function useRegistrationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({})
  const [tenantSlug, setTenantSlug] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  // Cargar progreso guardado al montar
  useEffect(() => {
    const savedProgress = loadRegistrationProgress()

    if (savedProgress) {
      setCurrentStep(savedProgress.currentStep as WizardStep)
      setCompletedSteps(savedProgress.completedSteps)
      setFormData(savedProgress.formData)
    }
  }, [])

  // Auto-guardar progreso cuando cambia
  useEffect(() => {
    if (currentStep < 6) {
      // No guardar en step 6 (verificación)
      saveRegistrationProgress(currentStep, completedSteps, formData)
    }
  }, [currentStep, completedSteps, formData])

  // Actualizar datos de un step
  const updateStepData = (stepNumber: number, data: Partial<RegistrationFormData>) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)

    // Marcar step como completado
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber])
    }
  }

  // Ir al siguiente step
  const goToNextStep = (data?: Partial<RegistrationFormData>) => {
    if (data) {
      updateStepData(currentStep, data)
    }

    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as WizardStep)
    }
  }

  // Ir al step anterior
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep)
    }
  }

  // Ir a un step específico (solo si está completado o es el actual)
  const goToStep = (step: WizardStep) => {
    if (completedSteps.includes(step) || step === currentStep) {
      setCurrentStep(step)
    }
  }

  // Confirmar registro (desde Summary)
  const confirmRegistration = (slug: string) => {
    setTenantSlug(slug)

    // Crear usuario y tenant en localStorage
    const { userId: newUserId, tenantId } = saveUserAndTenant(
      {
        email: formData.email!,
        password: formData.password!,
        fullName: formData.fullName!,
        phone: formData.phone!,
        tenantId: '', // Will be set by saveUserAndTenant
        tenantSlug: slug,
        role: 'admin',
        emailVerified: false,
      },
      {
        slug,
        name: formData.companyName!,
        industry: formData.industry!,
        industryOther: formData.industryOther,
        companySize: formData.companySize!,
        country: formData.country!,
        offeringType: formData.offeringType!,
        description: formData.description,
        priceRange: formData.priceRange,
        idealCustomer: formData.idealCustomer,
        whatsappNumber: formData.whatsappNumber!,
        whatsappToken: formData.whatsappToken!,
      }
    )

    setUserId(newUserId)

    // Ir a step de verificación
    goToNextStep()
  }

  // Verificar email y completar registro
  const completeRegistration = () => {
    if (!userId) return

    // Marcar email como verificado
    markEmailAsVerified(userId)

    // Obtener usuario actualizado
    const users: User[] = JSON.parse(localStorage.getItem('nella_users') || '[]')
    const user = users.find(u => u.id === userId)

    if (user) {
      // Crear sesión
      createSession(user)

      // Limpiar progreso del wizard
      clearRegistrationProgress()

      // Redirigir al dashboard
      router.push('/dashboard')
    }
  }

  // Reenviar código (simulado)
  const resendVerificationCode = () => {
    console.log('Código de verificación reenviado a:', formData.email)
    // En producción: llamar a API para reenviar email
  }

  return {
    // Estado
    currentStep,
    completedSteps,
    formData,
    tenantSlug,

    // Navegación
    goToNextStep,
    goToPreviousStep,
    goToStep,

    // Acciones
    updateStepData,
    confirmRegistration,
    completeRegistration,
    resendVerificationCode,
  }
}
