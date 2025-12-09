'use client'

import { Check } from 'lucide-react'
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
      // Allow clicking any step
      onStepClick(stepNumber)
    } else {
      // Only allow clicking completed or current step
      if (stepNumber <= currentStep) {
        onStepClick(stepNumber)
      }
    }
  }

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isFuture = stepNumber > currentStep
        const isClickable = allowFreeNavigation || stepNumber <= currentStep

        const Icon = step.icon

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <button
              type="button"
              onClick={() => handleStepClick(stepNumber)}
              disabled={!isClickable && !allowFreeNavigation}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                isCurrent && 'bg-hublot-900 text-white shadow-lg',
                isCompleted && 'bg-hublot-700 text-white cursor-pointer',
                isFuture && !allowFreeNavigation && 'bg-charcoal-200 text-charcoal-500 cursor-not-allowed',
                isFuture && allowFreeNavigation && 'bg-charcoal-200 text-charcoal-500 cursor-pointer hover:bg-charcoal-300'
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : style === 'icons' && Icon ? (
                <Icon className="w-5 h-5" />
              ) : (
                stepNumber
              )}
            </button>

            {/* Step Label (visible on larger screens) */}
            <span
              className={cn(
                'ml-2 text-sm font-medium hidden sm:block max-w-[100px] truncate',
                isCurrent ? 'text-charcoal-900' : 'text-charcoal-500'
              )}
            >
              {step.label}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 sm:w-16 h-0.5 mx-2 sm:mx-4 transition-colors',
                  isCompleted ? 'bg-hublot-700' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
