'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Clock,
  ArrowRight,
  AlertTriangle,
  Users,
  Briefcase,
  X,
  Plus,
  Info,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Scorecard recommendation type that maps to database
type ScorecardRecommendation = 'strong_hire' | 'hire' | 'neutral' | 'no_hire' | 'strong_no_hire'

// Legacy recommendation type for backward compatibility
type LegacyRecommendation = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'

// Form validation schema - enhanced for scorecard support
const interviewFeedbackSchema = z.object({
  attendanceStatus: z.enum(['attended', 'no_show', 'rescheduled']),
  rating: z.number().int().min(1).max(5),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
  technicalRating: z.number().int().min(1).max(5).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  cultureFitRating: z.number().int().min(1).max(5).optional(),
  problemSolvingRating: z.number().int().min(1).max(5).optional(),
  leadershipRating: z.number().int().min(1).max(5).optional(),
  strengths: z.string().max(500).optional(),
  concerns: z.string().max(500).optional(),
  strengthsList: z.array(z.string()).optional(),
  concernsList: z.array(z.string()).optional(),
  nextSteps: z.enum(['schedule_next_round', 'extend_offer', 'reject', 'on_hold']).optional(),
  wouldWorkWith: z.boolean().optional(),
  wouldRecommendForDifferentRole: z.boolean().optional(),
  alternativeRoleNotes: z.string().max(500).optional(),
})

type InterviewFeedbackFormData = z.infer<typeof interviewFeedbackSchema>

// Scorecard criteria interface
interface ScorecardCriteria {
  key: string
  name: string
  description?: string
  weight?: number
}

interface InterviewFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interviewId: string
  candidateName: string
  jobTitle: string
  interviewType: string
  roundNumber: number
  scheduledDate?: string
  daysSinceInterview?: number
  onSuccess?: () => void
  // New props for scorecard support
  participantId?: string
  scorecardTemplateId?: string
  isPanel?: boolean
}

const ATTENDANCE_OPTIONS = [
  { value: 'attended', label: 'Attended', icon: UserCheck, color: 'text-green-600' },
  { value: 'no_show', label: 'No Show', icon: UserX, color: 'text-red-600' },
  { value: 'rescheduled', label: 'Rescheduled', icon: Clock, color: 'text-amber-600' },
] as const

const RECOMMENDATIONS = [
  { value: 'strong_yes', label: 'Strong Yes', color: 'bg-green-600 hover:bg-green-700' },
  { value: 'yes', label: 'Yes', color: 'bg-green-500 hover:bg-green-600' },
  { value: 'maybe', label: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'no', label: 'No', color: 'bg-red-400 hover:bg-red-500' },
  { value: 'strong_no', label: 'Strong No', color: 'bg-red-600 hover:bg-red-700' },
] as const

const NEXT_STEPS = [
  { value: 'schedule_next_round', label: 'Schedule Next Round', icon: ArrowRight },
  { value: 'extend_offer', label: 'Move to Offer', icon: CheckCircle },
  { value: 'on_hold', label: 'Put on Hold', icon: Clock },
  { value: 'reject', label: 'Reject Candidate', icon: XCircle },
] as const

// Map legacy recommendation to scorecard recommendation
const mapToScorecardRecommendation = (legacy: LegacyRecommendation): ScorecardRecommendation => {
  const mapping: Record<LegacyRecommendation, ScorecardRecommendation> = {
    strong_yes: 'strong_hire',
    yes: 'hire',
    maybe: 'neutral',
    no: 'no_hire',
    strong_no: 'strong_no_hire',
  }
  return mapping[legacy]
}

// Default scorecard criteria when no template is provided
const DEFAULT_CRITERIA: ScorecardCriteria[] = [
  { key: 'technical', name: 'Technical Skills', description: 'Technical knowledge and problem-solving ability' },
  { key: 'communication', name: 'Communication', description: 'Verbal and written communication skills' },
  { key: 'culture_fit', name: 'Culture Fit', description: 'Alignment with company values and team dynamics' },
  { key: 'problem_solving', name: 'Problem Solving', description: 'Analytical thinking and approach to challenges' },
  { key: 'leadership', name: 'Leadership Potential', description: 'Leadership qualities and growth potential' },
]

export function InterviewFeedbackDialog({
  open,
  onOpenChange,
  interviewId,
  candidateName,
  jobTitle,
  interviewType,
  roundNumber,
  scheduledDate,
  daysSinceInterview = 0,
  onSuccess,
  participantId,
  scorecardTemplateId,
  isPanel = false,
}: InterviewFeedbackDialogProps) {
  const { toast } = useToast()

  // State for array-based strengths/concerns
  const [strengthsList, setStrengthsList] = useState<string[]>([])
  const [concernsList, setConcernsList] = useState<string[]>([])
  const [newStrength, setNewStrength] = useState('')
  const [newConcern, setNewConcern] = useState('')
  const [useAdvancedMode, setUseAdvancedMode] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<InterviewFeedbackFormData>({
    resolver: zodResolver(interviewFeedbackSchema),
    defaultValues: {
      attendanceStatus: 'attended',
      rating: 3,
      recommendation: 'maybe',
      feedback: '',
      technicalRating: undefined,
      communicationRating: undefined,
      cultureFitRating: undefined,
      problemSolvingRating: undefined,
      leadershipRating: undefined,
      strengths: '',
      concerns: '',
      strengthsList: [],
      concernsList: [],
      nextSteps: undefined,
      wouldWorkWith: undefined,
      wouldRecommendForDifferentRole: false,
      alternativeRoleNotes: '',
    },
    mode: 'onChange',
  })

  const attendanceStatus = watch('attendanceStatus')
  const rating = watch('rating')
  const recommendation = watch('recommendation')
  const feedback = watch('feedback')
  const technicalRating = watch('technicalRating')
  const communicationRating = watch('communicationRating')
  const cultureFitRating = watch('cultureFitRating')
  const problemSolvingRating = watch('problemSolvingRating')
  const leadershipRating = watch('leadershipRating')
  const nextSteps = watch('nextSteps')
  const wouldWorkWith = watch('wouldWorkWith')
  const wouldRecommendForDifferentRole = watch('wouldRecommendForDifferentRole')
  const alternativeRoleNotes = watch('alternativeRoleNotes')

  // Feedback mutation (legacy)
  const feedbackMutation = trpc.ats.interviews.addFeedback.useMutation({
    onSuccess: (result) => {
      toast({
        title: 'Feedback submitted',
        description: `Interview feedback recorded: ${result.recommendation.replace(/_/g, ' ')}`,
      })
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit feedback',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Scorecard mutation (new structured format)
  const scorecardMutation = trpc.ats.interviews.submitScorecard.useMutation({
    onSuccess: () => {
      toast({
        title: 'Scorecard submitted',
        description: `Interview scorecard recorded for ${candidateName}`,
      })
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit scorecard',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const resetForm = useCallback(() => {
    reset()
    setStrengthsList([])
    setConcernsList([])
    setNewStrength('')
    setNewConcern('')
  }, [reset])

  const onSubmit = (data: InterviewFeedbackFormData) => {
    // Build criteria scores object
    const criteriaScores: Record<string, number> = {}
    if (data.technicalRating) criteriaScores.technical = data.technicalRating
    if (data.communicationRating) criteriaScores.communication = data.communicationRating
    if (data.cultureFitRating) criteriaScores.culture_fit = data.cultureFitRating
    if (data.problemSolvingRating) criteriaScores.problem_solving = data.problemSolvingRating
    if (data.leadershipRating) criteriaScores.leadership = data.leadershipRating

    // Determine which API to use based on whether we have scorecard features enabled
    if (useAdvancedMode || participantId || scorecardTemplateId) {
      // Use new scorecard API
      scorecardMutation.mutate({
        interviewId,
        participantId: participantId || undefined,
        overallRating: data.rating,
        recommendation: mapToScorecardRecommendation(data.recommendation),
        criteriaScores,
        strengths: strengthsList.length > 0 ? strengthsList : (data.strengths ? [data.strengths] : undefined),
        concerns: concernsList.length > 0 ? concernsList : (data.concerns ? [data.concerns] : undefined),
        additionalNotes: data.feedback,
        wouldWorkWith: data.wouldWorkWith ?? undefined,
        wouldRecommendForDifferentRole: data.wouldRecommendForDifferentRole || false,
        alternativeRoleNotes: data.alternativeRoleNotes || undefined,
      })
    } else {
      // Use legacy feedback API for backward compatibility
      feedbackMutation.mutate({
        interviewId,
        attendanceStatus: data.attendanceStatus,
        rating: data.rating,
        recommendation: data.recommendation,
        feedback: data.feedback,
        technicalRating: data.technicalRating,
        communicationRating: data.communicationRating,
        cultureFitRating: data.cultureFitRating,
        strengths: data.strengths || undefined,
        concerns: data.concerns || undefined,
        nextSteps: data.nextSteps,
      })
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Handler for adding strengths
  const handleAddStrength = () => {
    if (newStrength.trim() && strengthsList.length < 10) {
      setStrengthsList([...strengthsList, newStrength.trim()])
      setNewStrength('')
    }
  }

  const handleStrengthKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddStrength()
    }
  }

  // Handler for adding concerns
  const handleAddConcern = () => {
    if (newConcern.trim() && concernsList.length < 10) {
      setConcernsList([...concernsList, newConcern.trim()])
      setNewConcern('')
    }
  }

  const handleConcernKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddConcern()
    }
  }

  const isPending = feedbackMutation.isPending || scorecardMutation.isPending

  const renderStarRating = (
    value: number | undefined,
    onChange: (value: number) => void,
    label: string,
    description?: string
  ) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1">
            <Label className="text-sm">{label}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onChange(star)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      'w-5 h-5 transition-colors',
                      (value ?? 0) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-charcoal-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="bottom" className="max-w-xs">
            <p>{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Interview Feedback
          </DialogTitle>
          <DialogDescription>
            Record feedback for{' '}
            <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s{' '}
            Round {roundNumber} {interviewType.replace(/_/g, ' ')} for{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Overdue Warning */}
        {daysSinceInterview > 2 && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-3 text-sm',
              daysSinceInterview > 5
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              Interview was {daysSinceInterview} days ago -{' '}
              {daysSinceInterview > 5 ? 'Urgently needs feedback' : 'Feedback overdue'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Attendance Status */}
          <div className="space-y-2">
            <Label>Attendance Status *</Label>
            <div className="flex gap-2">
              {ATTENDANCE_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = attendanceStatus === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('attendanceStatus', option.value)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-hublot-900 bg-hublot-50'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isSelected ? option.color : 'text-charcoal-400')} />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Only show rest of form if attended */}
          {attendanceStatus === 'attended' && (
            <>
              {/* Overall Rating */}
              <div className="space-y-2">
                <Label>Overall Rating *</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          'w-8 h-8 transition-colors',
                          rating >= star
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-charcoal-300'
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-charcoal-500 self-center">
                    {rating}/5
                  </span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <Label>Recommendation *</Label>
                <div className="flex flex-wrap gap-2">
                  {RECOMMENDATIONS.map((rec) => (
                    <Button
                      key={rec.value}
                      type="button"
                      size="sm"
                      variant={recommendation === rec.value ? 'default' : 'outline'}
                      className={cn(
                        recommendation === rec.value && rec.color,
                        'min-w-20'
                      )}
                      onClick={() => setValue('recommendation', rec.value)}
                    >
                      {rec.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Mode Toggle */}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-charcoal-50">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-charcoal-500" />
                  <span className="text-sm font-medium">Structured Scorecard</span>
                  {isPanel && (
                    <Badge variant="outline" className="text-xs bg-gold-50 text-gold-700 border-gold-300">
                      Panel
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="advanced-mode" className="text-sm text-charcoal-500">
                    {useAdvancedMode ? 'On' : 'Off'}
                  </Label>
                  <Switch
                    id="advanced-mode"
                    checked={useAdvancedMode}
                    onCheckedChange={setUseAdvancedMode}
                  />
                </div>
              </div>

              {/* Detailed Ratings */}
              <Card className="bg-cream">
                <CardContent className="py-4">
                  <div className="grid grid-cols-3 gap-4">
                    {renderStarRating(
                      technicalRating,
                      (v) => setValue('technicalRating', v),
                      'Technical',
                      'Technical knowledge and problem-solving ability'
                    )}
                    {renderStarRating(
                      communicationRating,
                      (v) => setValue('communicationRating', v),
                      'Communication',
                      'Verbal and written communication skills'
                    )}
                    {renderStarRating(
                      cultureFitRating,
                      (v) => setValue('cultureFitRating', v),
                      'Culture Fit',
                      'Alignment with company values and team dynamics'
                    )}
                  </div>
                  {/* Extended criteria when advanced mode is on */}
                  {useAdvancedMode && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-charcoal-200">
                      {renderStarRating(
                        problemSolvingRating,
                        (v) => setValue('problemSolvingRating', v),
                        'Problem Solving',
                        'Analytical thinking and approach to challenges'
                      )}
                      {renderStarRating(
                        leadershipRating,
                        (v) => setValue('leadershipRating', v),
                        'Leadership',
                        'Leadership qualities and growth potential'
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Interview Feedback *{' '}
                  <span className="font-normal text-charcoal-400">(10-2000 chars)</span>
                </Label>
                <Textarea
                  id="feedback"
                  {...register('feedback')}
                  placeholder="Describe the interview, candidate's responses, and your observations..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-xs">
                  {errors.feedback ? (
                    <span className="text-red-500">{errors.feedback.message}</span>
                  ) : (
                    <span className="text-charcoal-500">Be specific and objective</span>
                  )}
                  <span
                    className={cn(
                      feedback.length < 10 ? 'text-red-500' : 'text-charcoal-400'
                    )}
                  >
                    {feedback.length}/2000
                  </span>
                </div>
              </div>

              {/* Strengths & Concerns */}
              {useAdvancedMode ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Tag-based Strengths */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      Strengths ({strengthsList.length}/10)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={newStrength}
                        onChange={(e) => setNewStrength(e.target.value)}
                        onKeyDown={handleStrengthKeyDown}
                        placeholder="Add strength..."
                        className="flex-1 h-9"
                        disabled={strengthsList.length >= 10}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddStrength}
                        disabled={!newStrength.trim() || strengthsList.length >= 10}
                        className="h-9 w-9"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-lg border bg-green-50/50">
                      {strengthsList.length === 0 ? (
                        <span className="text-xs text-charcoal-400">Press Enter or click + to add</span>
                      ) : (
                        strengthsList.map((strength, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-300 pr-1"
                          >
                            {strength}
                            <button
                              type="button"
                              onClick={() => setStrengthsList(strengthsList.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-green-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Tag-based Concerns */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      Concerns ({concernsList.length}/10)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={newConcern}
                        onChange={(e) => setNewConcern(e.target.value)}
                        onKeyDown={handleConcernKeyDown}
                        placeholder="Add concern..."
                        className="flex-1 h-9"
                        disabled={concernsList.length >= 10}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddConcern}
                        disabled={!newConcern.trim() || concernsList.length >= 10}
                        className="h-9 w-9"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 rounded-lg border bg-red-50/50">
                      {concernsList.length === 0 ? (
                        <span className="text-xs text-charcoal-400">Press Enter or click + to add</span>
                      ) : (
                        concernsList.map((concern, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-red-100 text-red-800 border-red-300 pr-1"
                          >
                            {concern}
                            <button
                              type="button"
                              onClick={() => setConcernsList(concernsList.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-red-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strengths" className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      Strengths
                    </Label>
                    <Textarea
                      id="strengths"
                      {...register('strengths')}
                      placeholder="Key strengths observed..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concerns" className="flex items-center gap-1">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      Concerns
                    </Label>
                    <Textarea
                      id="concerns"
                      {...register('concerns')}
                      placeholder="Areas of concern..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Would Work With / Different Role - Only in Advanced Mode */}
              {useAdvancedMode && (
                <Card className="border-charcoal-200">
                  <CardContent className="py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-charcoal-500" />
                        <Label htmlFor="would-work-with" className="text-sm cursor-pointer">
                          Would you want to work with this person?
                        </Label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setValue('wouldWorkWith', true)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all',
                              wouldWorkWith === true
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-charcoal-200 text-charcoal-500 hover:border-charcoal-300'
                            )}
                          >
                            <ThumbsUp className="w-4 h-4 inline mr-1" />
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setValue('wouldWorkWith', false)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all',
                              wouldWorkWith === false
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-charcoal-200 text-charcoal-500 hover:border-charcoal-300'
                            )}
                          >
                            <ThumbsDown className="w-4 h-4 inline mr-1" />
                            No
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="different-role"
                          checked={wouldRecommendForDifferentRole || false}
                          onCheckedChange={(checked) => setValue('wouldRecommendForDifferentRole', !!checked)}
                        />
                        <Label htmlFor="different-role" className="text-sm cursor-pointer flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-charcoal-500" />
                          Would recommend for a different role
                        </Label>
                      </div>

                      {wouldRecommendForDifferentRole && (
                        <div className="ml-6 mt-2">
                          <Input
                            {...register('alternativeRoleNotes')}
                            placeholder="What role would be a better fit?"
                            className="h-9"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <div className="space-y-2 border-t pt-4">
                <Label>Suggested Next Steps</Label>
                <div className="grid grid-cols-2 gap-2">
                  {NEXT_STEPS.map((step) => {
                    const Icon = step.icon
                    const isSelected = nextSteps === step.value
                    return (
                      <button
                        key={step.value}
                        type="button"
                        onClick={() => setValue('nextSteps', isSelected ? undefined : step.value)}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'border-hublot-900 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300',
                          step.value === 'reject' && isSelected && 'border-red-500 bg-red-50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            step.value === 'reject'
                              ? 'text-red-600'
                              : step.value === 'extend_offer'
                              ? 'text-green-600'
                              : 'text-charcoal-600'
                          )}
                        />
                        <span className="text-sm font-medium">{step.label}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-charcoal-500">
                  This will update the submission status accordingly
                </p>
              </div>
            </>
          )}

          {/* Minimal form for no-show */}
          {attendanceStatus === 'no_show' && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                No Show Notes *
              </Label>
              <Textarea
                id="feedback"
                {...register('feedback')}
                placeholder="Document the no-show situation, any communication attempts..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {/* Minimal form for rescheduled */}
          {attendanceStatus === 'rescheduled' && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                Reschedule Notes *
              </Label>
              <Textarea
                id="feedback"
                {...register('feedback')}
                placeholder="Reason for reschedule, new proposed times..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isValid}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : useAdvancedMode || participantId || scorecardTemplateId ? (
                <>
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Submit Scorecard
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
