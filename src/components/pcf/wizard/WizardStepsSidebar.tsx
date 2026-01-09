import React from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle, FileText, StickyNote, Users } from 'lucide-react'
import { WizardStepConfig } from '@/configs/entities/types'

interface WizardStepsSidebarProps {
  title: string
  status?: string
  steps: WizardStepConfig<any>[]
  currentStep: number
  validationErrors?: Record<string, string>
  onStepClick: (step: number) => void
  tools?: {
    showNotes?: boolean
    showDocuments?: boolean
    showParticipants?: boolean
  }
}

export function WizardStepsSidebar({
  title,
  status = 'Draft',
  steps,
  currentStep,
  validationErrors = {},
  onStepClick,
  tools = { showNotes: true, showDocuments: true, showParticipants: true },
}: WizardStepsSidebarProps) {
  
  // Helper to check if a step has errors
  const stepHasErrors = (stepNumber: number) => {
    // This is a simplification - ideally we'd map specific errors to steps
    // For now we rely on the parent to pass down step-specific error state if needed
    // or we check if any error key starts with something relevant to the step
    // But since validationErrors is a flat map, it's hard to know which step it belongs to without config
    // We can assume if we are on a step and it has errors, it's this step.
    // However, for sidebar indicators, we usually only show error if we've visited it and it's invalid.
    return false 
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-charcoal-100 w-64 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-charcoal-100 bg-charcoal-900 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-500">
            New Account
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white border border-white/20">
            {status}
          </span>
        </div>
        <h2 className="text-lg font-heading font-bold text-white truncate" title={title}>
          {title}
        </h2>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          Steps
        </div>
        <nav className="space-y-1">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep
            const isCurrent = step.number === currentStep
            const isPending = step.number > currentStep
            const hasError = stepHasErrors(step.number)

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.number)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4",
                  isCurrent
                    ? "bg-gold-50 border-gold-500"
                    : "border-transparent hover:bg-charcoal-50",
                  isPending && "opacity-70"
                )}
              >
                {/* Status Indicator */}
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border text-xs transition-colors",
                  isCompleted ? "bg-green-500 border-green-500 text-white" :
                  isCurrent ? "bg-gold-500 border-gold-500 text-white" :
                  hasError ? "bg-red-500 border-red-500 text-white" :
                  "border-charcoal-300 text-charcoal-500"
                )}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : hasError ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isCurrent ? "text-charcoal-900" : "text-charcoal-600"
                  )}>
                    {step.label}
                  </p>
                </div>
              </button>
            )
          })}
          
          {/* Review Step (Implicit) */}
          <button
            onClick={() => onStepClick(steps.length + 1)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4",
              currentStep === steps.length + 1
                ? "bg-gold-50 border-gold-500"
                : "border-transparent hover:bg-charcoal-50",
               currentStep <= steps.length && "opacity-70"
            )}
          >
             <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border text-xs transition-colors",
                currentStep === steps.length + 1 ? "bg-gold-500 border-gold-500 text-white" : "border-charcoal-300 text-charcoal-500"
              )}>
                <span>{steps.length + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  currentStep === steps.length + 1 ? "text-charcoal-900" : "text-charcoal-600"
                )}>
                  Review
                </p>
              </div>
          </button>
        </nav>
      </div>

      {/* Tools Section */}
      <div className="border-t border-charcoal-100 bg-charcoal-50/50">
        <div className="px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wider flex items-center justify-between">
          <span>Tools</span>
        </div>
        <div className="pb-4 px-2 space-y-1">
          {tools.showNotes && (
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-600 hover:bg-white hover:text-charcoal-900 rounded-md transition-colors">
              <StickyNote className="w-4 h-4 text-charcoal-400" />
              <span>Notes</span>
            </button>
          )}
          {tools.showDocuments && (
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-600 hover:bg-white hover:text-charcoal-900 rounded-md transition-colors">
              <FileText className="w-4 h-4 text-charcoal-400" />
              <span>Documents</span>
            </button>
          )}
           {tools.showParticipants && (
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-charcoal-600 hover:bg-white hover:text-charcoal-900 rounded-md transition-colors">
              <Users className="w-4 h-4 text-charcoal-400" />
              <span>Participants</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}




