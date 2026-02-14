// src/components/auth/registration-wizard.tsx
'use client'

import { useRegistrationWizard } from '@/hooks/useRegistrationWizard'
import { RegistrationStepper } from '@/components/auth/registration-stepper'
import { RegistrationStep1 } from '@/components/auth/registration-step-1'
import { RegistrationStep2 } from '@/components/auth/registration-step-2'
import { RegistrationStep3 } from '@/components/auth/registration-step-3'
import { RegistrationStep4 } from '@/components/auth/registration-step-4'
import { RegistrationSummary } from '@/components/auth/registration-summary'
import { EmailVerification } from '@/components/auth/email-verification'

export function RegistrationWizard() {
  const {
    currentStep,
    completedSteps,
    formData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepData,
    confirmRegistration,
    completeRegistration,
    resendVerificationCode,
  } = useRegistrationWizard()

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Stepper - Solo mostrar en steps 1-4 */}
      {currentStep <= 4 && (
        <RegistrationStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={(step) => goToStep(step as 1 | 2 | 3 | 4)}
        />
      )}

      {/* Glass Panel con el contenido del step */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-8 shadow-lg backdrop-blur-sm">
        {/* Step 1: Datos de Empresa */}
        {currentStep === 1 && (
          <RegistrationStep1
            initialData={formData}
            onNext={(data) => {
              updateStepData(1, data)
              goToNextStep()
            }}
          />
        )}

        {/* Step 2: Datos del Admin */}
        {currentStep === 2 && (
          <RegistrationStep2
            initialData={formData}
            onNext={(data) => {
              updateStepData(2, data)
              goToNextStep()
            }}
            onBack={goToPreviousStep}
          />
        )}

        {/* Step 3: Configuración de Producto */}
        {currentStep === 3 && (
          <RegistrationStep3
            initialData={formData}
            onNext={(data) => {
              updateStepData(3, data)
              goToNextStep()
            }}
            onBack={goToPreviousStep}
          />
        )}

        {/* Step 4: Conexión WhatsApp */}
        {currentStep === 4 && (
          <RegistrationStep4
            initialData={formData}
            onNext={(data) => {
              updateStepData(4, data)
              goToNextStep()
            }}
            onBack={goToPreviousStep}
          />
        )}

        {/* Step 5: Resumen */}
        {currentStep === 5 && (
          <RegistrationSummary
            formData={formData}
            onConfirm={confirmRegistration}
            onBack={goToPreviousStep}
            onEdit={(step) => goToStep(step as 1 | 2 | 3 | 4)}
          />
        )}

        {/* Step 6: Verificación de Email */}
        {currentStep === 6 && (
          <EmailVerification
            email={formData.email || ''}
            onVerified={completeRegistration}
            onResendCode={resendVerificationCode}
          />
        )}
      </div>

      {/* Indicador de progreso (solo en steps 1-4) */}
      {currentStep <= 4 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Paso {currentStep} de 4
          </p>
          <div className="mx-auto mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
