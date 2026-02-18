// src/components/auth/registration-stepper.tsx
'use client'

import { Check } from 'lucide-react'

interface RegistrationStepperProps {
  currentStep: number // 1-4
  completedSteps: number[] // [1, 2] = steps 1 y 2 completados
  onStepClick: (step: number) => void
}

const STEPS = [
  { number: 1, label: 'Empresa', code: 'COMPANY' },
  { number: 2, label: 'Admin', code: 'ADMIN' },
  { number: 3, label: 'Producto', code: 'PRODUCT' },
  { number: 4, label: 'WhatsApp', code: 'WHATSAPP' },
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
    <div className="relative w-full py-6 px-4">
      {/* Technical header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
            Registration Progress
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          [{currentStep}/4] ACTIVE
        </span>
      </div>

      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle - HUD Style */}
            <button
              onClick={() => isClickable(step.number) && onStepClick(step.number)}
              disabled={!isClickable(step.number)}
              className={`
                relative z-10 flex h-12 w-12 items-center justify-center
                border-2 transition-all duration-300 font-bold text-sm
                ${
                  isCurrent(step.number)
                    ? 'border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(206,242,93,0.3)]'
                    : isCompleted(step.number)
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border/30 bg-background/50 text-muted-foreground'
                }
                ${
                  isClickable(step.number)
                    ? 'cursor-pointer hover:scale-110 hover:shadow-[0_0_30px_rgba(206,242,93,0.4)]'
                    : 'cursor-not-allowed opacity-40'
                }
                backdrop-blur-sm
              `}
              style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
            >
              {isCompleted(step.number) ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="font-mono">{step.number}</span>
              )}

              {/* Pulse effect for current step */}
              {isCurrent(step.number) && (
                <span className="absolute inset-0 animate-ping opacity-20 bg-primary"
                      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
                />
              )}
            </button>

            {/* Label - Tech Style */}
            <div className="ml-3 hidden sm:block">
              <p
                className={`
                  text-xs font-mono uppercase tracking-wide transition-colors
                  ${
                    isCurrent(step.number)
                      ? 'text-primary font-bold'
                      : isCompleted(step.number)
                      ? 'text-primary/80'
                      : 'text-muted-foreground/50'
                  }
                `}
              >
                {step.code}
              </p>
              <p
                className={`
                  text-[10px] font-medium transition-colors
                  ${
                    isCurrent(step.number) || isCompleted(step.number)
                      ? 'text-foreground/80'
                      : 'text-muted-foreground/40'
                  }
                `}
              >
                {step.label}
              </p>
            </div>

            {/* Connector Line - Tech Style */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 mx-3 hidden sm:block relative">
                <div className="h-px w-full bg-border/20" />
                <div
                  className={`
                    absolute top-0 left-0 h-px transition-all duration-500
                    ${
                      isCompleted(step.number)
                        ? 'w-full bg-gradient-to-r from-primary via-primary/60 to-primary shadow-[0_0_8px_rgba(206,242,93,0.6)]'
                        : 'w-0 bg-primary'
                    }
                  `}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile label below - Tech Style */}
      <div className="mt-4 text-center sm:hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-primary/30 bg-primary/5">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-xs font-mono text-primary uppercase tracking-wide">
            {STEPS.find(s => s.number === currentStep)?.code}
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
          STEP [{currentStep}/{STEPS.length}]
        </p>
      </div>
    </div>
  )
}
