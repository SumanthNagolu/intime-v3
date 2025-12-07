'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  DollarSign,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Form validation schema
const submitToClientSchema = z.object({
  payRate: z.number().positive('Pay rate must be positive'),
  billRate: z.number().positive('Bill rate must be positive'),
  submissionNotes: z
    .string()
    .min(50, 'Notes must be at least 50 characters')
    .max(1000, 'Notes must be 1000 characters or less'),
  internalNotes: z.string().max(500).optional(),
  submissionMethod: z.enum(['email', 'vms', 'manual']),
})

type SubmitToClientFormData = z.infer<typeof submitToClientSchema>

interface SubmitToClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  accountName: string
  jobRateMin?: number
  jobRateMax?: number
  onSuccess?: () => void
}

const SUBMISSION_METHODS = [
  {
    value: 'email',
    label: 'Email Submission',
    icon: Mail,
    description: 'Send candidate via email to client',
  },
  {
    value: 'vms',
    label: 'VMS Submission',
    icon: ExternalLink,
    description: 'Submit through vendor management system',
  },
  {
    value: 'manual',
    label: 'Manual/External',
    icon: FileText,
    description: 'Already submitted externally',
  },
] as const

export function SubmitToClientDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  accountName,
  jobRateMin = 0,
  jobRateMax = 0,
  onSuccess,
}: SubmitToClientDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'rates' | 'notes' | 'review'>('rates')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<SubmitToClientFormData>({
    resolver: zodResolver(submitToClientSchema),
    defaultValues: {
      payRate: jobRateMin > 0 ? Math.round(jobRateMin * 0.8) : 0,
      billRate: jobRateMin > 0 ? jobRateMin : 0,
      submissionNotes: '',
      internalNotes: '',
      submissionMethod: 'email',
    },
    mode: 'onChange',
  })

  const payRate = watch('payRate')
  const billRate = watch('billRate')
  const submissionMethod = watch('submissionMethod')
  const submissionNotes = watch('submissionNotes')

  // Calculate margin
  const marginAmount = billRate - payRate
  const marginPercent = billRate > 0 ? ((marginAmount / billRate) * 100).toFixed(1) : '0.0'

  const submitMutation = trpc.ats.submissions.submitToClient.useMutation({
    onSuccess: () => {
      toast({
        title: 'Candidate submitted to client',
        description: `${candidateName} has been submitted to ${accountName} for ${jobTitle}`,
      })
      reset()
      setStep('rates')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: SubmitToClientFormData) => {
    submitMutation.mutate({
      id: submissionId,
      payRate: data.payRate,
      billRate: data.billRate,
      submissionNotes: data.submissionNotes,
      internalNotes: data.internalNotes || undefined,
      submissionMethod: data.submissionMethod,
    })
  }

  const handleClose = () => {
    reset()
    setStep('rates')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-500" />
            Submit to Client
          </DialogTitle>
          <DialogDescription>
            Submit <span className="font-medium text-charcoal-900">{candidateName}</span> to{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span> for{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-2">
          {['rates', 'notes', 'review'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s
                    ? 'bg-hublot-900 text-white'
                    : ['rates', 'notes', 'review'].indexOf(step) > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {['rates', 'notes', 'review'].indexOf(step) > i ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    ['rates', 'notes', 'review'].indexOf(step) > i
                      ? 'bg-green-400'
                      : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Rates */}
          {step === 'rates' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Set Rates</h3>

              {/* Job Rate Range Hint */}
              {jobRateMin > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  Job rate range: ${jobRateMin} - ${jobRateMax}/hr
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate ($/hr) *</Label>
                  <Input
                    id="payRate"
                    type="number"
                    step="0.01"
                    {...register('payRate', { valueAsNumber: true })}
                    placeholder="75.00"
                  />
                  {errors.payRate && (
                    <p className="text-sm text-red-500">{errors.payRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate ($/hr) *</Label>
                  <Input
                    id="billRate"
                    type="number"
                    step="0.01"
                    {...register('billRate', { valueAsNumber: true })}
                    placeholder="95.00"
                  />
                  {errors.billRate && (
                    <p className="text-sm text-red-500">{errors.billRate.message}</p>
                  )}
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
                    const Icon = method.icon
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setValue('submissionMethod', method.value)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                          submissionMethod === method.value
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
          {step === 'notes' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Submission Notes</h3>

              <div className="space-y-2">
                <Label htmlFor="submissionNotes">Client-Facing Notes (50-1000 chars) *</Label>
                <Textarea
                  id="submissionNotes"
                  {...register('submissionNotes')}
                  placeholder="Highlight key qualifications, relevant experience, and why this candidate is a great fit..."
                  rows={5}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-xs text-charcoal-500">
                  <span>{errors.submissionNotes?.message || 'Visible to client'}</span>
                  <span
                    className={cn(
                      submissionNotes.length < 50 ? 'text-red-500' : 'text-charcoal-400'
                    )}
                  >
                    {submissionNotes.length}/1000
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
                <Textarea
                  id="internalNotes"
                  {...register('internalNotes')}
                  placeholder="Rate negotiation notes, candidate concerns, etc..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-charcoal-500">Not visible to client</p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Review Submission</h3>

              <div className="bg-cream rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Candidate</span>
                  <span className="font-medium text-charcoal-900">{candidateName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Job</span>
                  <span className="font-medium text-charcoal-900">{jobTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Client</span>
                  <span className="font-medium text-charcoal-900">{accountName}</span>
                </div>
                <div className="border-t pt-3 mt-3" />
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Pay Rate</span>
                  <span className="font-medium text-charcoal-900">${payRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Bill Rate</span>
                  <span className="font-medium text-charcoal-900">${billRate.toFixed(2)}/hr</span>
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
                    {SUBMISSION_METHODS.find((m) => m.value === submissionMethod)?.label}
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

          <DialogFooter className="flex justify-between">
            {step !== 'rates' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step === 'review' ? 'notes' : 'rates')}
              >
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step !== 'review' ? (
                <Button
                  type="button"
                  onClick={() => setStep(step === 'rates' ? 'notes' : 'review')}
                  disabled={
                    step === 'rates'
                      ? payRate <= 0 || billRate <= 0 || billRate < payRate
                      : submissionNotes.length < 50
                  }
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={submitMutation.isPending || !isValid}>
                  {submitMutation.isPending ? (
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
