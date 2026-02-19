// src/hooks/useRegistrationWizard.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegistrationFormData } from '@/types'
import {
  saveRegistrationProgress,
  loadRegistrationProgress,
  clearRegistrationProgress,
} from '@/lib/registration-storage'

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 // Steps 1-4, Summary (5), EmailVerification (6)

export function useRegistrationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState<Partial<RegistrationFormData>>({})
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
  const [workflowError, setWorkflowError] = useState<string | null>(null)

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

  // Confirmar registro (desde Summary) — llama al backend real
  const confirmRegistration = async () => {
    setIsCreatingWorkflow(true)
    setWorkflowError(null)

    try {
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

      setIsCreatingWorkflow(false)
      clearRegistrationProgress()

      // Redirect to the tenant's own login page after registration
      const tenantSlug = (result.data?.slug ?? result.slug) as string
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
      const port = window.location.port
      const portSuffix = port ? `:${port}` : ''
      window.location.href = `http://${tenantSlug}.${appDomain}${portSuffix}/login`
    } catch (error) {
      setIsCreatingWorkflow(false)
      setWorkflowError(
        error instanceof Error
          ? error.message
          : 'Error al crear la organización. Verifica tu conexión e intenta nuevamente.'
      )
    }
  }

  // completeRegistration ya no es necesaria — el backend activa el tenant directamente
  // Se mantiene por compatibilidad pero no se usa en el flujo principal
  const completeRegistration = () => {
    clearRegistrationProgress()
    router.push('/dashboard')
  }

  // Reenviar código (simulado)
  const resendVerificationCode = () => {
    console.log('Código de verificación reenviado a:', formData.email)
  }

  return {
    // Estado
    currentStep,
    completedSteps,
    formData,
    isCreatingWorkflow,
    workflowError,

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
