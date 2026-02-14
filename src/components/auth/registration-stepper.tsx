// src/components/auth/registration-stepper.tsx
'use client'

import { Check } from 'lucide-react'

interface RegistrationStepperProps {
  currentStep: number // 1-4
  completedSteps: number[] // [1, 2] = steps 1 y 2 completados
  onStepClick: (step: number) => void
}

const STEPS = [
  { number: 1, label: 'Empresa' },
  { number: 2, label: 'Admin' },
  { number: 3, label: 'Producto' },
  { number: 4, label: 'WhatsApp' },
]

export function RegistrationStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: RegistrationStepperProps) {
  const isCompleted = (step: number) => completedSteps.includes(step)
  const isCurrent = (step: number) => currentStep === step
  const isClickable = (step: number) => completedSteps.includes(step) || step === currentStep

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => isClickable(step.number) && onStepClick(step.number)}
              disabled={!isClickable(step.number)}
              className={`
                relative z-10 flex h-10 w-10 items-center justify-center rounded-full
                border-2 transition-all duration-300 font-semibold
                ${
                  isCurrent(step.number)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCompleted(step.number)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                }
                ${
                  isClickable(step.number)
                    ? 'cursor-pointer hover:scale-110'
                    : 'cursor-not-allowed opacity-50'
                }
              `}
            >
              {isCompleted(step.number) ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </button>

            {/* Label */}
            <div className="ml-2 hidden sm:block">
              <p
                className={`
                  text-sm font-medium transition-colors
                  ${
                    isCurrent(step.number) || isCompleted(step.number)
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {step.label}
              </p>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-4 hidden sm:block">
                <div
                  className={`
                    h-0.5 w-full transition-colors duration-300
                    ${
                      isCompleted(step.number)
                        ? 'bg-primary'
                        : 'bg-border'
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile label below */}
      <div className="mt-3 text-center sm:hidden">
        <p className="text-sm font-medium text-foreground">
          {STEPS.find(s => s.number === currentStep)?.label}
        </p>
        <p className="text-xs text-muted-foreground">
          Paso {currentStep} de {STEPS.length}
        </p>
      </div>
    </div>
  )
}
