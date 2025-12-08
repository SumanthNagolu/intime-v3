'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  useSubmitToClientStore,
  SUBMISSION_METHODS,
} from '@/stores/submit-to-client-store'
import {
  Loader2,
  DollarSign,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const METHOD_ICONS = {
  email: Mail,
  vms: ExternalLink,
  manual: FileText,
}

export default function SubmitToClientPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const submissionId = params.id as string

  // URL-based step management
  const stepParam = searchParams.get('step')
  const urlStep = (stepParam || 'rates') as 'rates' | 'notes' | 'review'

  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    resetForm,
    initializeFromSubmission,
    isDirty,
    lastSaved,
  } = useSubmitToClientStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync step with URL
  useEffect(() => {
    if (['rates', 'notes', 'review'].includes(urlStep)) {
      setCurrentStep(urlStep)
    }
  }, [urlStep, setCurrentStep])

  // Fetch submission data
  const submissionQuery = trpc.ats.submissions.getById.useQuery(
    { id: submissionId },
    { enabled: !!submissionId }
  )

  // Initialize from submission data
  useEffect(() => {
    if (submissionQuery.data) {
      const sub = submissionQuery.data
      const jobRateMin = sub.jobRateMin || 0
      initializeFromSubmission(
        submissionId,
        sub.candidateName || 'Candidate',
        sub.jobTitle || 'Job',
        sub.accountName || 'Account',
        jobRateMin > 0 ? Math.round(jobRateMin * 0.8) : 0,
        jobRateMin || 0
      )
    }
  }, [submissionQuery.data, submissionId, initializeFromSubmission])

  // Submit mutation
  const submitMutation = trpc.ats.submissions.submitToClient.useMutation({
    onSuccess: () => {
      toast({
        title: 'Candidate submitted to client',
        description: `${formData.candidateName} has been submitted to ${formData.accountName} for ${formData.jobTitle}`,
      })
      resetForm()
      router.push(`/employee/recruiting/submissions/${submissionId}`)
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  // Calculate margin
  const marginAmount = formData.billRate - formData.payRate
  const marginPercent = formData.billRate > 0 ? ((marginAmount / formData.billRate) * 100).toFixed(1) : '0.0'

  const navigateToStep = (step: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleNext = () => {
    if (currentStep === 'rates') {
      navigateToStep('notes')
    } else if (currentStep === 'notes') {
      navigateToStep('review')
    }
  }

  const handleBack = () => {
    if (currentStep === 'review') {
      navigateToStep('notes')
    } else if (currentStep === 'notes') {
      navigateToStep('rates')
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    submitMutation.mutate({
      id: submissionId,
      payRate: formData.payRate,
      billRate: formData.billRate,
      submissionNotes: formData.submissionNotes,
      internalNotes: formData.internalNotes || undefined,
      submissionMethod: formData.submissionMethod,
    })
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  const stepIndex = ['rates', 'notes', 'review'].indexOf(currentStep)

  if (submissionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
        <Link
          href={`/employee/recruiting/submissions/${submissionId}`}
          className="hover:text-hublot-700 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Submission
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-gold-500" />
          Submit to Client
        </h1>
        <p className="text-charcoal-500 mt-1">
          Submit <span className="font-medium text-charcoal-900">{formData.candidateName}</span> to{' '}
          <span className="font-medium text-charcoal-900">{formData.accountName}</span> for{' '}
          <span className="font-medium text-charcoal-900">{formData.jobTitle}</span>
        </p>
        {lastSaved && isDirty && (
          <p className="text-sm text-charcoal-500 mt-2">
            <Save className="w-3 h-3 inline mr-1" />
            Auto-saved {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 py-4 mb-6">
        {['rates', 'notes', 'review'].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => navigateToStep(s)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-hublot-500 focus:ring-offset-2',
                currentStep === s
                  ? 'bg-hublot-900 text-white shadow-lg'
                  : stepIndex > i
                  ? 'bg-green-100 text-green-800 cursor-pointer'
                  : 'bg-charcoal-100 text-charcoal-500 cursor-pointer'
              )}
            >
              {stepIndex > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </button>
            {i < 2 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2',
                  stepIndex > i ? 'bg-green-400' : 'bg-charcoal-200'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Rates */}
          {currentStep === 'rates' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Set Rates</h3>

              {/* Job Rate Range Hint */}
              {submissionQuery.data?.jobRateMin && submissionQuery.data.jobRateMin > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  Job rate range: ${submissionQuery.data.jobRateMin} - ${submissionQuery.data.jobRateMax}/hr
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate ($/hr) *</Label>
                  <Input
                    id="payRate"
                    type="number"
                    step="0.01"
                    value={formData.payRate || ''}
                    onChange={(e) => setFormData({ payRate: parseFloat(e.target.value) || 0 })}
                    placeholder="75.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate ($/hr) *</Label>
                  <Input
                    id="billRate"
                    type="number"
                    step="0.01"
                    value={formData.billRate || ''}
                    onChange={(e) => setFormData({ billRate: parseFloat(e.target.value) || 0 })}
                    placeholder="95.00"
                  />
                </div>
              </div>

              {/* Margin Preview */}
              <Card className="bg-cream">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-charcoal-500">Margin</span>
                      <div className="text-lg font-bold text-charcoal-900">
                        ${marginAmount.toFixed(2)}/hr ({marginPercent}%)
                      </div>
                    </div>
                    <Badge
                      variant={
                        parseFloat(marginPercent) >= 20
                          ? 'default'
                          : parseFloat(marginPercent) >= 15
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {parseFloat(marginPercent) >= 20
                        ? 'Good'
                        : parseFloat(marginPercent) >= 15
                        ? 'OK'
                        : 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Method */}
              <div className="space-y-2">
                <Label>Submission Method *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {SUBMISSION_METHODS.map((method) => {
                    const Icon = METHOD_ICONS[method.value]
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData({ submissionMethod: method.value })}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                          formData.submissionMethod === method.value
                            ? 'border-hublot-900 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <Icon className="w-5 h-5 text-charcoal-600" />
                        <div>
                          <div className="font-medium text-charcoal-900">{method.label}</div>
                          <div className="text-xs text-charcoal-500">{method.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Notes */}
          {currentStep === 'notes' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Submission Notes</h3>

              <div className="space-y-2">
                <Label htmlFor="submissionNotes">Client-Facing Notes (50-1000 chars) *</Label>
                <Textarea
                  id="submissionNotes"
                  value={formData.submissionNotes}
                  onChange={(e) => setFormData({ submissionNotes: e.target.value })}
                  placeholder="Highlight key qualifications, relevant experience, and why this candidate is a great fit..."
                  rows={5}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>Visible to client</span>
                  <span
                    className={cn(
                      formData.submissionNotes.length < 50 ? 'text-red-500' : 'text-charcoal-400'
                    )}
                  >
                    {formData.submissionNotes.length}/1000
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ internalNotes: e.target.value })}
                  placeholder="Rate negotiation notes, candidate concerns, etc..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-charcoal-500">Not visible to client</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Review Submission</h3>

              <div className="bg-cream rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Candidate</span>
                  <span className="font-medium text-charcoal-900">{formData.candidateName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Job</span>
                  <span className="font-medium text-charcoal-900">{formData.jobTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Client</span>
                  <span className="font-medium text-charcoal-900">{formData.accountName}</span>
                </div>
                <div className="border-t pt-3 mt-3" />
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Pay Rate</span>
                  <span className="font-medium text-charcoal-900">${formData.payRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Bill Rate</span>
                  <span className="font-medium text-charcoal-900">${formData.billRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Margin</span>
                  <span className="font-medium text-green-600">
                    ${marginAmount.toFixed(2)}/hr ({marginPercent}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Method</span>
                  <Badge variant="outline">
                    {SUBMISSION_METHODS.find((m) => m.value === formData.submissionMethod)?.label}
                  </Badge>
                </div>
              </div>

              {/* Warning for low margin */}
              {parseFloat(marginPercent) < 15 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Low Margin Warning</p>
                    <p className="text-xs text-amber-600">
                      Margin is below 15%. Consider adjusting rates if possible.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentStep !== 'rates' && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                resetForm()
                router.push(`/employee/recruiting/submissions/${submissionId}`)
              }
            }}
          >
            Cancel
          </Button>

          {currentStep !== 'review' ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={
                currentStep === 'rates'
                  ? formData.payRate <= 0 || formData.billRate <= 0 || formData.billRate < formData.payRate
                  : formData.submissionNotes.length < 50
              }
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || formData.submissionNotes.length < 50}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit to Client'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
