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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Checklist items for screening (per F01 spec)
const SCREENING_CHECKLIST = [
  {
    id: 'skills_match',
    label: 'Skills Match',
    description: 'Required technical skills verified',
    required: true,
  },
  {
    id: 'experience_level',
    label: 'Experience Level',
    description: 'Years of experience meets requirements',
    required: true,
  },
  {
    id: 'availability',
    label: 'Availability',
    description: 'Can start within required timeframe',
    required: true,
  },
  {
    id: 'rate_expectations',
    label: 'Rate Expectations',
    description: 'Salary/rate expectations align with budget',
    required: true,
  },
  {
    id: 'work_authorization',
    label: 'Work Authorization',
    description: 'Legally authorized to work / visa status verified',
    required: true,
  },
  {
    id: 'location_match',
    label: 'Location Match',
    description: 'Location/relocation/remote requirements met',
    required: false,
  },
  {
    id: 'background_check',
    label: 'Background Check Ready',
    description: 'No known issues with background screening',
    required: false,
  },
  {
    id: 'references_available',
    label: 'References Available',
    description: 'Can provide professional references',
    required: false,
  },
] as const

// Form validation schema
const screeningChecklistSchema = z.object({
  checklist: z.record(z.boolean()),
  screeningNotes: z.string().max(2000).optional(),
  recommendation: z.enum(['proceed', 'need_more_info', 'not_a_fit']),
})

type ScreeningChecklistFormData = z.infer<typeof screeningChecklistSchema>

interface ScreeningChecklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submissionId: string
  candidateName: string
  jobTitle: string
  onComplete?: () => void
}

export function ScreeningChecklistDialog({
  open,
  onOpenChange,
  submissionId,
  candidateName,
  jobTitle,
  onComplete,
}: ScreeningChecklistDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScreeningChecklistFormData>({
    resolver: zodResolver(screeningChecklistSchema),
    defaultValues: {
      checklist: {},
      screeningNotes: '',
      recommendation: 'proceed',
    },
  })

  const checklist = watch('checklist')
  const recommendation = watch('recommendation')

  // Calculate completion
  const requiredItems = SCREENING_CHECKLIST.filter(item => item.required)
  const completedRequired = requiredItems.filter(item => checklist[item.id]).length
  const allRequiredComplete = completedRequired === requiredItems.length

  // Update status mutation
  const updateStatusMutation = trpc.ats.submissions.updateStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Screening complete',
        description: recommendation === 'proceed'
          ? `${candidateName} is ready for submission`
          : recommendation === 'need_more_info'
          ? `${candidateName} needs more information`
          : `${candidateName} marked as not a fit`,
      })
      utils.ats.submissions.invalidate()
      handleClose()
      onComplete?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ScreeningChecklistFormData) => {
    // Map recommendation to status
    const statusMap: Record<string, string> = {
      proceed: 'submission_ready',
      need_more_info: 'screening', // Keep in screening
      not_a_fit: 'rejected',
    }

    updateStatusMutation.mutate({
      id: submissionId,
      status: statusMap[data.recommendation] as 'submission_ready' | 'screening' | 'rejected',
      reason: data.recommendation === 'not_a_fit'
        ? `Screening: ${data.screeningNotes || 'Did not meet requirements'}`
        : undefined,
    })
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const toggleChecklistItem = (id: string) => {
    setValue(`checklist.${id}`, !checklist[id])
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-gold-500" />
            Screening Checklist
          </DialogTitle>
          <DialogDescription>
            Review <span className="font-medium text-charcoal-900">{candidateName}</span> for{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center justify-between bg-cream rounded-lg p-3">
          <div className="text-sm">
            <span className="font-medium text-charcoal-900">{completedRequired}</span>
            <span className="text-charcoal-500"> of {requiredItems.length} required items</span>
          </div>
          <Badge variant={allRequiredComplete ? 'default' : 'secondary'}>
            {allRequiredComplete ? 'Ready' : 'In Progress'}
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Checklist */}
          <div className="space-y-3">
            <Label>Screening Items</Label>
            <div className="space-y-2">
              {SCREENING_CHECKLIST.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    checklist[item.id]
                      ? 'border-green-500 bg-green-50'
                      : 'hover:border-charcoal-300'
                  )}
                  onClick={() => toggleChecklistItem(item.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={checklist[item.id] || false}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium',
                            checklist[item.id] ? 'text-green-700' : 'text-charcoal-900'
                          )}>
                            {item.label}
                          </span>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-500">{item.description}</p>
                      </div>
                      {checklist[item.id] && (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Screening Notes */}
          <div className="space-y-2">
            <Label htmlFor="screeningNotes">Screening Notes (Optional)</Label>
            <Textarea
              id="screeningNotes"
              {...register('screeningNotes')}
              placeholder="Additional notes from screening call..."
              rows={3}
              className="resize-none"
            />
            {errors.screeningNotes && (
              <p className="text-sm text-red-500">{errors.screeningNotes.message}</p>
            )}
          </div>

          {/* Recommendation */}
          <div className="space-y-3">
            <Label>Recommendation</Label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setValue('recommendation', 'proceed')}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  recommendation === 'proceed'
                    ? 'border-green-500 bg-green-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                <CheckCircle className={cn(
                  'w-5 h-5',
                  recommendation === 'proceed' ? 'text-green-600' : 'text-charcoal-400'
                )} />
                <div>
                  <div className="font-medium text-charcoal-900">Proceed to Submission</div>
                  <div className="text-xs text-charcoal-500">Ready for client submission</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue('recommendation', 'need_more_info')}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  recommendation === 'need_more_info'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                <HelpCircle className={cn(
                  'w-5 h-5',
                  recommendation === 'need_more_info' ? 'text-amber-600' : 'text-charcoal-400'
                )} />
                <div>
                  <div className="font-medium text-charcoal-900">Need More Information</div>
                  <div className="text-xs text-charcoal-500">Follow up needed before decision</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue('recommendation', 'not_a_fit')}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                  recommendation === 'not_a_fit'
                    ? 'border-red-500 bg-red-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                <XCircle className={cn(
                  'w-5 h-5',
                  recommendation === 'not_a_fit' ? 'text-red-600' : 'text-charcoal-400'
                )} />
                <div>
                  <div className="font-medium text-charcoal-900">Not a Fit</div>
                  <div className="text-xs text-charcoal-500">Does not meet requirements</div>
                </div>
              </button>
            </div>
          </div>

          {/* Warning for incomplete checklist */}
          {recommendation === 'proceed' && !allRequiredComplete && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Incomplete Checklist</p>
                <p className="text-xs text-amber-600">
                  Not all required items are checked. Please complete before proceeding.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateStatusMutation.isPending ||
                (recommendation === 'proceed' && !allRequiredComplete)
              }
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Screening
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
