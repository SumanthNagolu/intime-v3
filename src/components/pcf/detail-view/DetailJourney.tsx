'use client'

import { Check } from 'lucide-react'
import { JourneyStepConfig } from '@/configs/entities/types'
import { cn } from '@/lib/utils'

interface DetailJourneyProps<T> {
  steps: JourneyStepConfig[]
  entity: T
  statusField: keyof T
  onStepClick?: (stepId: string) => void
}

export function DetailJourney<T extends Record<string, unknown>>({
  steps,
  entity,
  statusField,
  onStepClick,
}: DetailJourneyProps<T>) {
  const currentStatus = entity[statusField] as string

  const getStepState = (step: JourneyStepConfig) => {
    if (step.completedStatuses.includes(currentStatus)) return 'completed'
    if (step.activeStatuses.includes(currentStatus)) return 'active'
    return 'future'
  }

  return (
    <div className="px-6 py-4 border-b border-charcoal-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step)
          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={state === 'future'}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                  'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2',
                  state === 'completed' && 'bg-hublot-700 text-white cursor-pointer',
                  state === 'active' && 'bg-hublot-900 text-white shadow-lg',
                  state === 'future' && 'bg-charcoal-200 text-charcoal-500 cursor-not-allowed'
                )}
              >
                {state === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              <span
                className={cn(
                  'ml-3 text-sm font-medium hidden lg:block',
                  state === 'active' ? 'text-charcoal-900' : 'text-charcoal-500'
                )}
              >
                {step.label}
              </span>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    state === 'completed' ? 'bg-hublot-700' : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
