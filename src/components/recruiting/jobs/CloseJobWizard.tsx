'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  Users,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FileText,
  ExternalLink,
  User,
} from 'lucide-react'

// Closure reasons - must match backend closeJobInput.closureReason enum
const CLOSURE_REASONS = [
  { value: 'filled', label: 'All Positions Filled', isFilled: true },
  { value: 'client_cancelled', label: 'Client Cancelled', isFilled: false },
  { value: 'budget_cut', label: 'Budget Constraints', isFilled: false },
  { value: 'position_eliminated', label: 'Position No Longer Needed', isFilled: false },
  { value: 'cancelled', label: 'General Cancellation', isFilled: false },
  { value: 'other', label: 'Other', isFilled: false },
] as const

type ClosureReason = (typeof CLOSURE_REASONS)[number]['value']

// Submission handling actions - must match backend closeJobInput.submissionAction enum
const SUBMISSION_ACTIONS = [
  { value: 'withdraw', label: 'Withdraw All', description: 'Withdraw all active submissions and notify candidates' },
  { value: 'transfer', label: 'Transfer to Similar Job', description: 'Move candidates to another open position' },
  { value: 'keep', label: 'Keep Active', description: 'Keep submissions active for manual handling' },
] as const

type SubmissionAction = (typeof SUBMISSION_ACTIONS)[number]['value']

interface CloseJobWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  jobTitle: string
  currentStatus: string
  positionsFilled: number
  positionsCount: number
  activeSubmissionsCount: number
  onSuccess?: () => void
}

type WizardStep = 'reason' | 'pipeline' | 'summary'

export function CloseJobWizard({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  currentStatus,
  positionsFilled,
  positionsCount,
  activeSubmissionsCount,
  onSuccess,
}: CloseJobWizardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('reason')
  const [closureReason, setClosureReason] = useState<ClosureReason | ''>('')
  const [closureNote, setClosureNote] = useState('')
  const [submissionAction, setSubmissionAction] = useState<SubmissionAction>('withdraw')
  const [targetJobId, setTargetJobId] = useState<string>('')
  const [notifyCandidates, setNotifyCandidates] = useState(true)

  // Fetch similar jobs for transfer option
  const similarJobsQuery = trpc.ats.jobs.getSimilar.useQuery(
    { jobId },
    { enabled: open && submissionAction === 'transfer' }
  )

  // Close mutation
  const closeMutation = trpc.ats.jobs.close.useMutation({
    onSuccess: () => {
      utils.ats.jobs.invalidate()
      toast({
        title: 'Job closed',
        description: `${jobTitle} has been closed successfully.`,
      })
      resetWizard()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to close job',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Derived state
  const selectedReason = CLOSURE_REASONS.find((r) => r.value === closureReason)
  const isFilled = selectedReason?.isFilled ?? false
  const hasActiveSubmissions = activeSubmissionsCount > 0
  const similarJobs = similarJobsQuery.data || []

  // Steps to show (skip pipeline step if no active submissions)
  const steps: WizardStep[] = useMemo(() => {
    if (hasActiveSubmissions) {
      return ['reason', 'pipeline', 'summary']
    }
    return ['reason', 'summary']
  }, [hasActiveSubmissions])

  const currentStepIndex = steps.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  // Validation
  const canProceed = () => {
    switch (currentStep) {
      case 'reason':
        return closureReason !== ''
      case 'pipeline':
        if (submissionAction === 'transfer' && !targetJobId) {
          return false
        }
        return true
      case 'summary':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!canProceed()) return
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleClose = () => {
    closeMutation.mutate({
      jobId,
      closureReason: closureReason as 'filled' | 'cancelled' | 'on_hold' | 'client_cancelled' | 'budget_cut' | 'position_eliminated' | 'other',
      closureNote: closureNote || undefined,
      submissionAction: hasActiveSubmissions ? submissionAction : undefined,
      transferToJobId: submissionAction === 'transfer' ? targetJobId : undefined,
      notifyCandidates,
    })
  }

  const resetWizard = () => {
    setCurrentStep('reason')
    setClosureReason('')
    setClosureNote('')
    setSubmissionAction('withdraw')
    setTargetJobId('')
    setNotifyCandidates(true)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetWizard()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Close Job</DialogTitle>
          <DialogDescription>
            Close &quot;{jobTitle}&quot; and handle active pipeline
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  currentStepIndex > index
                    ? 'bg-green-500 text-white'
                    : currentStepIndex === index
                    ? 'bg-hublot-900 text-white'
                    : 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {currentStepIndex > index ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2',
                    currentStepIndex > index ? 'bg-green-500' : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-4">
          {/* Step 1: Reason */}
          {currentStep === 'reason' && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Why are you closing this job?</Label>
                <RadioGroup
                  value={closureReason}
                  onValueChange={(value) => setClosureReason(value as ClosureReason)}
                  className="mt-3 space-y-2"
                >
                  {CLOSURE_REASONS.map((reason) => (
                    <div
                      key={reason.value}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        closureReason === reason.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:bg-cream'
                      )}
                      onClick={() => setClosureReason(reason.value)}
                    >
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label
                        htmlFor={reason.value}
                        className="flex-1 cursor-pointer flex items-center"
                      >
                        {reason.label}
                        {reason.isFilled && (
                          <Badge variant="secondary" className="ml-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Filled
                          </Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="closure-note">Additional Notes (Optional)</Label>
                <Textarea
                  id="closure-note"
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  placeholder="Add any additional context about closing this job..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Position Summary */}
              <Card className="bg-cream">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-600">Positions</span>
                    <span className="font-medium">
                      {positionsFilled} of {positionsCount} filled
                    </span>
                  </div>
                  {positionsFilled < positionsCount && isFilled && (
                    <p className="text-xs text-amber-600 mt-2">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {positionsCount - positionsFilled} position(s) will remain unfilled
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Pipeline (only if active submissions) */}
          {currentStep === 'pipeline' && hasActiveSubmissions && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-charcoal-600 mb-4">
                <Users className="w-4 h-4" />
                <span>
                  {activeSubmissionsCount} active submission{activeSubmissionsCount !== 1 ? 's' : ''} in pipeline
                </span>
              </div>

              <div>
                <Label className="text-sm font-medium">How would you like to handle active submissions?</Label>
                <RadioGroup
                  value={submissionAction}
                  onValueChange={(value) => setSubmissionAction(value as SubmissionAction)}
                  className="mt-3 space-y-2"
                >
                  {SUBMISSION_ACTIONS.map((action) => (
                    <div
                      key={action.value}
                      className={cn(
                        'flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        submissionAction === action.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:bg-cream'
                      )}
                      onClick={() => setSubmissionAction(action.value)}
                    >
                      <RadioGroupItem value={action.value} id={action.value} className="mt-0.5" />
                      <div>
                        <Label htmlFor={action.value} className="cursor-pointer font-medium">
                          {action.label}
                        </Label>
                        <p className="text-xs text-charcoal-500 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Transfer Job Selection */}
              {submissionAction === 'transfer' && (
                <div>
                  <Label htmlFor="target-job">Select Target Job</Label>
                  {similarJobsQuery.isLoading ? (
                    <div className="flex items-center gap-2 mt-2 text-sm text-charcoal-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading similar jobs...
                    </div>
                  ) : similarJobs.length === 0 ? (
                    <Card className="bg-amber-50 mt-2">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2 text-sm text-amber-800">
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>No similar open jobs found. Please select a different action.</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Select value={targetJobId} onValueChange={setTargetJobId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a job to transfer candidates to" />
                      </SelectTrigger>
                      <SelectContent>
                        {similarJobs.map((job) => {
                          const accountName = Array.isArray(job.account)
                            ? job.account[0]?.name
                            : (job.account as { name?: string } | null)?.name
                          return (
                            <SelectItem key={job.id} value={job.id}>
                              <div className="flex items-center gap-2">
                                <span>{job.title}</span>
                                {accountName && (
                                  <Badge variant="outline" className="text-xs">
                                    {accountName}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Notify Candidates Checkbox */}
              {submissionAction !== 'keep' && (
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="notify-candidates"
                    checked={notifyCandidates}
                    onCheckedChange={(checked) => setNotifyCandidates(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="notify-candidates"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Notify affected candidates
                    </Label>
                    <p className="text-xs text-charcoal-500">
                      Send email notifications to candidates about this change
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                {isFilled ? (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
                <h3 className="text-lg font-medium text-charcoal-900">
                  {isFilled ? 'Mark as Filled' : 'Cancel Job'}
                </h3>
              </div>

              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-charcoal-600">Job Title</span>
                    <span className="text-sm font-medium">{jobTitle}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-charcoal-600">Final Status</span>
                    <Badge className={isFilled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {isFilled ? 'Filled' : 'Cancelled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-charcoal-600">Reason</span>
                    <span className="text-sm font-medium">{selectedReason?.label}</span>
                  </div>
                  {closureNote && (
                    <div className="py-2 border-b">
                      <span className="text-sm text-charcoal-600 block mb-1">Notes</span>
                      <p className="text-sm">{closureNote}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-charcoal-600">Positions</span>
                    <span className="text-sm font-medium">
                      {positionsFilled} of {positionsCount} filled
                    </span>
                  </div>
                  {hasActiveSubmissions && (
                    <>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-charcoal-600">Pipeline Action</span>
                        <span className="text-sm font-medium">
                          {SUBMISSION_ACTIONS.find((a) => a.value === submissionAction)?.label}
                        </span>
                      </div>
                      {submissionAction === 'transfer' && targetJobId && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm text-charcoal-600">Transfer To</span>
                          <span className="text-sm font-medium">
                            {similarJobs.find((j) => j.id === targetJobId)?.title}
                          </span>
                        </div>
                      )}
                      {notifyCandidates && submissionAction !== 'keep' && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-charcoal-600">Notifications</span>
                          <span className="text-sm text-green-600">Will be sent</span>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-amber-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      This action cannot be undone. The job will be marked as{' '}
                      {isFilled ? 'filled' : 'cancelled'} and removed from active listings.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!isFirstStep && (
            <Button variant="outline" onClick={handleBack} disabled={closeMutation.isPending}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {isFirstStep && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          )}
          {!isLastStep && (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {isLastStep && (
            <Button
              onClick={handleClose}
              disabled={closeMutation.isPending}
              variant={isFilled ? 'default' : 'destructive'}
            >
              {closeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Closing...
                </>
              ) : isFilled ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Filled
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Job
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
