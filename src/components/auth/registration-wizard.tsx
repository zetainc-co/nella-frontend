// src/components/auth/registration-wizard.tsx
"use client";

import { useRegistrationWizard } from "@/hooks/useRegistrationWizard";
import { RegistrationStep1 } from "@/components/auth/registration-step-1";
import { RegistrationStep2 } from "@/components/auth/registration-step-2";
import { RegistrationStep3 } from "@/components/auth/registration-step-3";
import { RegistrationStep4 } from "@/components/auth/registration-step-4";
import { RegistrationSummary } from "@/components/auth/registration-summary";
import { EmailVerification } from "@/components/auth/email-verification";
import { HudCorners } from "@/components/ui/hud-corners";

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
    isCreatingWorkflow,
    workflowError,
  } = useRegistrationWizard();

  return (
    <div className="w-full max-w-2xl">
      {/* Glass Panel con el contenido del step - HUD Style con rounded */}
      <div className="relative border border-border/50 bg-card/50 p-8 rounded-2xl shadow-[0_0_60px_-10px_rgba(206,242,93,0.08)] hover:shadow-[0_0_80px_-10px_rgba(206,242,93,0.12)] transition-shadow duration-500 backdrop-blur-sm max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        <HudCorners />

        {/* Progress Indicator - Solo en steps 1-4 */}
        {currentStep <= 4 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Paso {currentStep} de 4
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / 4) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full bg-[#9EFF00] transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
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
      </div>
    </div>
  );
}
