'use client'

import React from 'react'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { WizardStepsSidebar } from './WizardStepsSidebar'
import { useEntityWizard, WizardStore, UseEntityWizardReturn } from '@/hooks/use-entity-wizard'
import { WizardConfig } from '@/configs/entities/types'
import { UseEntityDraftReturn } from '@/hooks/use-entity-draft'
import { WizardStep } from './WizardStep'
import { WizardReview } from './WizardReview'
import { WizardNavigation } from './WizardNavigation'
import { Clock, AlertCircle, Sparkles } from 'lucide-react'

interface WizardWithSidebarProps<T extends object> {
  config: WizardConfig<T>
  store: WizardStore<T>
  draftState?: UseEntityDraftReturn<any>
  onCancel?: () => void
}

export function WizardWithSidebar<T extends object>(props: WizardWithSidebarProps<T>) {
  const { config, store, draftState } = props
  
  // Use the hook to manage wizard logic
  const wizard = useEntityWizard(props)
  
  const {
    currentStep,
    totalSteps,
    isReviewStep,
    validationErrors,
    isSubmitting,
    handleStepClick,
    handleBack,
    handleNext,
    handleSaveDraft,
    handleCancel,
    handleSubmit,
    currentStepConfig,
    allFieldDefinitions,
  } = wizard

  // Create the custom sidebar
  const sidebar = (
    <WizardStepsSidebar
      title={config.title}
      status={draftState?.draftId ? 'Draft' : 'New'}
      steps={config.steps}
      currentStep={currentStep}
      validationErrors={validationErrors}
      onStepClick={handleStepClick}
    />
  )

  return (
    <SidebarLayout customSidebar={sidebar} hideSidebar={false}>
      <div className="min-h-full flex flex-col">
        {/* Main Content Header */}
        <header className="bg-white border-b border-charcoal-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
               <Sparkles className="w-5 h-5 text-gold-500" />
               <h1 className="text-xl font-heading font-bold text-charcoal-900">
                {isReviewStep ? (config.reviewStep?.title || 'Review & Create') : currentStepConfig?.label}
               </h1>
            </div>
            {currentStepConfig?.description && (
              <p className="text-sm text-charcoal-500 mt-1 ml-7">{currentStepConfig.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {/* Last Saved Indicator */}
            {(store.lastSaved || draftState?.lastSavedAt) && (
              <div className="flex items-center gap-2 text-xs text-charcoal-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Saved {new Date(store.lastSaved || draftState?.lastSavedAt || new Date()).toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {/* Top Navigation Actions */}
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={handleBack}
              onNext={handleNext}
              onSaveDraft={handleSaveDraft}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel={config.submitLabel}
              saveDraftLabel={config.saveDraftLabel}
              variant="compact" // Assuming WizardNavigation supports variant or we might need to adjust styling
            />
          </div>
        </header>

        {/* Validation Errors Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Please fix the following errors:</span>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-red-600 space-y-1">
              {Object.entries(validationErrors)
                .filter(([key]) => !key.startsWith('custom_'))
                .map(([key, error]) => (
                  <li key={key}>{error}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Step Content - Guidewire pattern: content fills available width */}
        <div className="flex-1 w-full overflow-y-auto bg-cream">
          <div className="w-full max-w-none px-8 py-6">
            {isReviewStep && config.reviewStep ? (
              <WizardReview
                title={config.reviewStep.title}
                sections={config.reviewStep.sections.map((s) => ({
                  label: s.label,
                  fields: s.fields,
                  stepNumber: s.stepNumber,
                }))}
                formData={store.formData}
                fieldDefinitions={allFieldDefinitions}
                onEditStep={handleStepClick}
              />
            ) : currentStepConfig ? (
              <WizardStep
                step={currentStepConfig}
                formData={store.formData}
                setFormData={store.setFormData}
                errors={validationErrors}
              />
            ) : null}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}


