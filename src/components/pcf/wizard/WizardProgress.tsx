'use client'

import { Check, ChevronRight } from 'lucide-react'
import { WizardStepConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface WizardProgressProps<T> {
  steps: WizardStepConfig<T>[]
  currentStep: number
  style?: 'numbers' | 'icons'
  allowFreeNavigation?: boolean
  onStepClick: (step: number) => void
}

export function WizardProgress<T>({
  steps,
  currentStep,
  style = 'numbers',
  allowFreeNavigation = false,
  onStepClick,
}: WizardProgressProps<T>) {
  const handleStepClick = (stepNumber: number) => {
    if (allowFreeNavigation) {
      onStepClick(stepNumber)
    } else {
      if (stepNumber <= currentStep) {
        onStepClick(stepNumber)
      }
    }
  }

  return (
    <nav className="space-y-2">
      {/* Header */}
      <div className="px-4 py-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
          Progress
        </p>
        <div className="mt-2 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-charcoal-500 mt-2">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isFuture = stepNumber > currentStep
          const isClickable = allowFreeNavigation || stepNumber <= currentStep

          const Icon = step.icon

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(stepNumber)}
              disabled={!isClickable && !allowFreeNavigation}
              className={cn(
                'w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200',
                isCurrent && 'bg-gradient-to-r from-gold-50 to-gold-100/50 shadow-sm',
                isCompleted && 'hover:bg-charcoal-50',
                isFuture && !allowFreeNavigation && 'opacity-50 cursor-not-allowed',
                isFuture && allowFreeNavigation && 'hover:bg-charcoal-50 cursor-pointer',
                isClickable && !isCurrent && 'hover:bg-charcoal-50 cursor-pointer'
              )}
            >
              {/* Step Number/Icon Circle */}
              <div
                className={cn(
                  'relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  isCurrent && 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow',
                  isCompleted && 'bg-gradient-to-br from-forest-500 to-forest-600 text-white',
                  isFuture && 'bg-charcoal-100 text-charcoal-400'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : style === 'icons' && Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
                
                {/* Pulse animation for current step */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-xl bg-gold-400 animate-ping opacity-25" />
                )}
              </div>

              {/* Step Label & Description */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold truncate transition-colors',
                    isCurrent && 'text-charcoal-900',
                    isCompleted && 'text-charcoal-700',
                    isFuture && 'text-charcoal-400'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p
                    className={cn(
                      'text-xs truncate mt-0.5 transition-colors',
                      isCurrent && 'text-charcoal-600',
                      isCompleted && 'text-charcoal-500',
                      isFuture && 'text-charcoal-400'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              <div
                className={cn(
                  'shrink-0 transition-all duration-200',
                  isCurrent && 'opacity-100',
                  !isCurrent && 'opacity-0 group-hover:opacity-100'
                )}
              >
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-forest-600" />
                  </div>
                ) : isCurrent ? (
                  <ChevronRight className="w-5 h-5 text-gold-500" />
                ) : null}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-8 top-14 w-0.5 h-4 transition-colors duration-300',
                    stepNumber < currentStep ? 'bg-forest-300' : 'bg-charcoal-200'
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 px-4 py-4 bg-charcoal-50 rounded-xl">
        <p className="text-xs text-charcoal-600 leading-relaxed">
          <span className="font-semibold text-charcoal-700">Need help?</span>
          <br />
          Click any completed step to go back and edit your responses.
        </p>
      </div>
    </nav>
  )
}
