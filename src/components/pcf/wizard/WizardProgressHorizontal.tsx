'use client'

import { Check } from 'lucide-react'
import { WizardStepConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface WizardProgressHorizontalProps<T> {
  steps: WizardStepConfig<T>[]
  currentStep: number
  style?: 'numbers' | 'icons'
  allowFreeNavigation?: boolean
  onStepClick: (step: number) => void
}

export function WizardProgressHorizontal<T>({
  steps,
  currentStep,
  style = 'numbers',
  allowFreeNavigation = false,
  onStepClick,
}: WizardProgressHorizontalProps<T>) {
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
    <div className="hidden lg:block bg-white border-b border-charcoal-100/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Desktop: Horizontal Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isFuture = stepNumber > currentStep
            const isClickable = allowFreeNavigation || stepNumber <= currentStep

            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Button */}
                <button
                  type="button"
                  onClick={() => handleStepClick(stepNumber)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center gap-3 transition-all duration-200 group',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  )}
                >
                  {/* Step Circle */}
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 relative z-10',
                        isCurrent &&
                          'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow',
                        isCompleted &&
                          'bg-gradient-to-br from-forest-500 to-forest-600 text-white',
                        isFuture && 'bg-charcoal-200 text-charcoal-500'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : style === 'icons' && Icon ? (
                        <Icon className="w-5 h-5" />
                      ) : (
                        stepNumber
                      )}
                    </div>

                    {/* Pulse animation for current step */}
                    {isCurrent && (
                      <span className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-25" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="text-left">
                    <p
                      className={cn(
                        'text-sm font-semibold transition-colors',
                        isCurrent && 'text-charcoal-900',
                        isCompleted && 'text-charcoal-700 group-hover:text-charcoal-900',
                        isFuture && 'text-charcoal-400'
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p
                        className={cn(
                          'text-xs mt-0.5 transition-colors max-w-[180px]',
                          isCurrent && 'text-charcoal-600',
                          isCompleted && 'text-charcoal-500',
                          isFuture && 'text-charcoal-400'
                        )}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </button>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 px-4">
                    <div
                      className={cn(
                        'h-0.5 w-full transition-all duration-500 ease-out',
                        stepNumber < currentStep
                          ? 'bg-gradient-to-r from-forest-400 to-forest-500'
                          : 'bg-charcoal-200'
                      )}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress Bar (shown below steps on smaller screens) */}
        <div className="mt-4 lg:hidden">
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-2">
            <span>
              Step {currentStep} of {steps.length}
            </span>
            <span className="font-medium text-charcoal-700">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

