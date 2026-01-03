'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addDays } from 'date-fns'
import {
  type CreateActivityFormState,
  type SelectedPattern,
  type ActivityPriority,
  INITIAL_FORM_STATE,
} from './create-activity/types'
import { PathSelector } from './create-activity/PathSelector'
import { InlinePatternPicker } from './create-activity/InlinePatternPicker'
import { PatternPreview } from './create-activity/PatternPreview'
import { ActivityFormFields } from './create-activity/ActivityFormFields'

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityId: string
  entityName?: string
  onSuccess?: (activityId: string) => void
}

type WizardStep = 'select-path' | 'select-pattern' | 'form'

export function CreateActivityDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  onSuccess,
}: CreateActivityDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [state, setState] = React.useState<CreateActivityFormState>(INITIAL_FORM_STATE)
  const [step, setStep] = React.useState<WizardStep>('select-path')

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setState(INITIAL_FORM_STATE)
      setStep('select-path')
    }
  }, [open])

  // Create activity mutation (unified)
  const createMutation = trpc.activities.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Activity created',
        description: `"${data.subject}" has been created`,
      })
      utils.crm.activities.listByAccount.invalidate({ accountId: entityId })
      utils.activities.invalidate()
      onOpenChange(false)
      onSuccess?.(data.id)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const updateState = (updates: Partial<CreateActivityFormState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const handlePathChange = (path: 'pattern' | 'manual') => {
    setState((prev) => ({
      ...prev,
      path,
      // Clear pattern selection when switching to manual
      selectedPattern: path === 'manual' ? null : prev.selectedPattern,
    }))
    // Navigate to next step based on path
    if (path === 'manual') {
      setStep('form')
    } else {
      setStep('select-pattern')
    }
  }

  const handlePatternSelect = (pattern: SelectedPattern | null) => {
    if (pattern) {
      // Pre-fill form with pattern defaults
      const dueDate = pattern.targetDays
        ? addDays(new Date(), pattern.targetDays)
        : addDays(new Date(), 1)

      const escalationDate = pattern.escalationDays
        ? addDays(new Date(), pattern.escalationDays)
        : null

      setState((prev) => ({
        ...prev,
        selectedPattern: pattern,
        subject: pattern.name,
        description: pattern.description || '',
        category: pattern.category || '',
        priority: (pattern.priority as ActivityPriority) || 'normal',
        dueDate,
        escalationDate,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        selectedPattern: null,
      }))
    }
  }

  const handlePatternConfirm = () => {
    if (state.selectedPattern) {
      setStep('form')
    }
  }

  const handleBack = () => {
    if (step === 'form' && state.path === 'pattern') {
      setStep('select-pattern')
    } else if (step === 'form' && state.path === 'manual') {
      setStep('select-path')
    } else if (step === 'select-pattern') {
      setStep('select-path')
    }
  }

  const handleSubmit = () => {
    if (!state.subject.trim()) return

    // Map frontend entityType to backend
    const backendEntityType = entityType === 'account' ? 'company' : entityType

    // Map 'normal' priority to 'medium' for backend compatibility
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
      low: 'low',
      normal: 'medium',
      medium: 'medium',
      high: 'high',
      urgent: 'urgent',
    }

    createMutation.mutate({
      entityType: backendEntityType,
      entityId,
      subject: state.subject.trim(),
      patternId: state.selectedPattern?.id,
      description: state.description.trim() || undefined,
      category: state.category || undefined,
      priority: priorityMap[state.priority] || 'medium',
      status: state.status,
      dueDate: state.dueDate?.toISOString(),
      escalationDate: state.escalationDate?.toISOString(),
      assignedTo: state.assignedTo || undefined,
      queueId: state.queueId || undefined,
      relatedContactId: state.contactId || undefined,
    })
  }

  const canSubmit = state.subject.trim().length > 0

  // Dynamic title based on step
  const getTitle = () => {
    switch (step) {
      case 'select-path':
        return 'Create Activity'
      case 'select-pattern':
        return 'Select Pattern'
      case 'form':
        return state.path === 'pattern' ? 'Configure Activity' : 'Create Activity'
    }
  }

  const getDescription = () => {
    switch (step) {
      case 'select-path':
        return 'Choose how to create your activity'
      case 'select-pattern':
        return 'Select a pattern to use as a template'
      case 'form':
        return entityName ? `For ${entityName}` : 'Fill in the activity details'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {/* Step 1: Path Selection */}
        {step === 'select-path' && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
              <PathSelector
                value={state.path}
                onChange={handlePathChange}
                variant="cards"
              />
            </div>
            <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-50/50 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {/* Step 2a: Pattern Selection */}
        {step === 'select-pattern' && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
              <InlinePatternPicker
                entityType={entityType}
                selectedPattern={state.selectedPattern}
                onSelect={handlePatternSelect}
              />
            </div>
            <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-50/50 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handlePatternConfirm}
                disabled={!state.selectedPattern}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2b/3: Form */}
        {step === 'form' && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
              {/* Pattern Preview (only if pattern was selected) */}
              {state.path === 'pattern' && state.selectedPattern && (
                <PatternPreview pattern={state.selectedPattern} />
              )}

              {/* Form Fields */}
              <ActivityFormFields
                state={state}
                onChange={updateState}
                entityType={entityType}
                entityId={entityId}
              />
            </div>

            <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-50/50 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || createMutation.isPending}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Activity'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateActivityDialog
