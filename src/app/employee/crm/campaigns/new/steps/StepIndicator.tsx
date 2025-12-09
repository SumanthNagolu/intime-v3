'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface Step {
  id: number
  title: string
  icon: LucideIcon
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4 border-b mb-6">
      {steps.map((s, index) => {
        const Icon = s.icon
        return (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                currentStep === s.id && 'bg-hublot-100',
                currentStep > s.id && 'text-green-600'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  currentStep === s.id && 'bg-hublot-900 text-white',
                  currentStep > s.id && 'bg-green-100 text-green-600',
                  currentStep < s.id && 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
              </div>
              <span className="hidden sm:block text-sm font-medium">{s.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-charcoal-200 mx-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}
