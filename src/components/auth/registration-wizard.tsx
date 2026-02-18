// src/components/auth/registration-wizard.tsx
"use client";

import Link from 'next/link'
import { useRegistrationWizard } from "@/hooks/useRegistrationWizard";
import { RegistrationStep1 } from "@/components/auth/registration-step-1";
import { RegistrationStep2 } from "@/components/auth/registration-step-2";
import { RegistrationStep3 } from "@/components/auth/registration-step-3";
import { RegistrationStep4 } from "@/components/auth/registration-step-4";
import { RegistrationSummary } from "@/components/auth/registration-summary";
import { EmailVerification } from "@/components/auth/email-verification";

export function RegistrationWizard() {
  const {
    currentStep,
    formData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepData,
    confirmRegistration,
    completeRegistration,
    resendVerificationCode,
    isCreatingWorkflow,
    workflowError,
  } = useRegistrationWizard();

  return (
    <div
      className="auth-card p-8 overflow-y-auto custom-scrollbar"
      style={{ maxHeight: 'calc(100vh - 48px)' }}
    >
      {/* Branding — inside card, top */}
      <div className="text-center space-y-1.5 mb-7">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Nella<span style={{ color: '#9EFF00' }}>Sales</span>
        </h1>
        <p className="text-sm" style={{ color: 'rgba(240,244,255,0.5)' }}>
          Bienvenido a tu CRM con IA
        </p>
      </div>

      {/* Progress bar — only in steps 1-4 */}
      {currentStep <= 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'rgba(240,244,255,0.35)' }}>
              Paso {currentStep} de 4
            </span>
            <span className="text-xs" style={{ color: 'rgba(240,244,255,0.35)' }}>
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%`, background: '#9EFF00' }}
            />
          </div>
        </div>
      )}

      {/* Step 1: Datos de Empresa */}
      {currentStep === 1 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <RegistrationStep1
            initialData={formData}
            onNext={(data) => {
              updateStepData(1, data);
              goToNextStep();
            }}
          />
        </div>
      )}

      {/* Step 2: Datos del Admin */}
      {currentStep === 2 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <RegistrationStep2
            initialData={formData}
            onNext={(data) => {
              updateStepData(2, data);
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        </div>
      )}

      {/* Step 3: Configuración de Producto */}
      {currentStep === 3 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <RegistrationStep3
            initialData={formData}
            onNext={(data) => {
              updateStepData(3, data);
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        </div>
      )}

      {/* Step 4: Conexión WhatsApp */}
      {currentStep === 4 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <RegistrationStep4
            initialData={formData}
            onNext={(data) => {
              updateStepData(4, data);
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        </div>
      )}

      {/* Step 5: Resumen */}
      {currentStep === 5 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <RegistrationSummary
            formData={formData}
            onConfirm={confirmRegistration}
            onBack={goToPreviousStep}
            onEdit={(step) => goToStep(step as 1 | 2 | 3 | 4)}
            isCreatingWorkflow={isCreatingWorkflow}
            workflowError={workflowError}
          />
        </div>
      )}

      {/* Step 6: Verificación de Email */}
      {currentStep === 6 && (
        <div className="animate-[fadeIn_0.3s_ease-in-out]">
          <EmailVerification
            email={formData.email || ""}
            onVerified={completeRegistration}
            onResendCode={resendVerificationCode}
          />
        </div>
      )}

      {/* Footer link — inside card, only on steps 1-4 */}
      {currentStep <= 4 && (
        <div
          className="text-center text-sm pt-5 mt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span style={{ color: 'rgba(240,244,255,0.4)' }}>¿Ya tienes una cuenta? </span>
          <Link
            href="/login"
            className="font-medium hover:underline transition-colors"
            style={{ color: '#9EFF00' }}
          >
            Inicia sesión aquí
          </Link>
        </div>
      )}
    </div>
  );
}
