'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Target,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Briefcase,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
  self_review: { label: 'Self Review', color: 'bg-blue-100 text-blue-700', icon: User },
  self_submitted: { label: 'Self Submitted', color: 'bg-indigo-100 text-indigo-700', icon: Send },
  manager_review: { label: 'Manager Review', color: 'bg-amber-100 text-amber-700', icon: Star },
  manager_submitted: { label: 'Manager Submitted', color: 'bg-purple-100 text-purple-700', icon: Send },
  calibration: { label: 'In Calibration', color: 'bg-pink-100 text-pink-700', icon: TrendingUp },
  calibrated: { label: 'Calibrated', color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
  acknowledged: { label: 'Acknowledged', color: 'bg-emerald-100 text-emerald-700', icon: ThumbsUp },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
}

const RATING_LABELS = {
  1: { label: 'Needs Improvement', color: 'text-red-600' },
  2: { label: 'Below Expectations', color: 'text-orange-600' },
  3: { label: 'Meets Expectations', color: 'text-amber-600' },
  4: { label: 'Exceeds Expectations', color: 'text-blue-600' },
  5: { label: 'Outstanding', color: 'text-green-600' },
}

function RatingStars({
  rating,
  maxRating = 5,
  onChange,
  size = 'md',
  readonly = false,
}: {
  rating: number
  maxRating?: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <Tooltip key={star}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onChange?.(star)}
                onMouseEnter={() => !readonly && setHovered(star)}
                onMouseLeave={() => !readonly && setHovered(0)}
                disabled={readonly}
                className={cn(
                  'transition-transform',
                  !readonly && 'hover:scale-110 cursor-pointer'
                )}
              >
                <Star
                  className={cn(
                    sizeClass,
                    (hovered >= star || (!hovered && rating >= star))
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-charcoal-200'
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {RATING_LABELS[star as keyof typeof RATING_LABELS]?.label || `${star} star`}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function PerformanceReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const utils = trpc.useUtils()

  const [activeTab, setActiveTab] = useState('overview')
  const [selfAssessment, setSelfAssessment] = useState('')
  const [employeeComments, setEmployeeComments] = useState('')
  const [overallRating, setOverallRating] = useState(3)
  const [qualityRating, setQualityRating] = useState(3)
  const [communicationRating, setCommunicationRating] = useState(3)
  const [teamworkRating, setTeamworkRating] = useState(3)
  const [initiativeRating, setInitiativeRating] = useState(3)
  const [reliabilityRating, setReliabilityRating] = useState(3)
  const [potentialRating, setPotentialRating] = useState(3)
  const [strengths, setStrengths] = useState('')
  const [areasForImprovement, setAreasForImprovement] = useState('')
  const [managerComments, setManagerComments] = useState('')
  const [isSubmitSelfOpen, setIsSubmitSelfOpen] = useState(false)
  const [isSubmitManagerOpen, setIsSubmitManagerOpen] = useState(false)
  const [isAcknowledgeOpen, setIsAcknowledgeOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(true)

  const { data: review, isLoading } = trpc.performance.reviews.getById.useQuery(
    { id },
    { enabled: !!id }
  )

  const submitSelfMutation = trpc.performance.reviews.submitSelfAssessment.useMutation({
    onSuccess: () => {
      utils.performance.reviews.getById.invalidate({ id })
      setIsSubmitSelfOpen(false)
    },
  })

  const submitManagerMutation = trpc.performance.reviews.submitManagerReview.useMutation({
    onSuccess: () => {
      utils.performance.reviews.getById.invalidate({ id })
      setIsSubmitManagerOpen(false)
    },
  })

  const acknowledgeMutation = trpc.performance.reviews.acknowledge.useMutation({
    onSuccess: () => {
      utils.performance.reviews.getById.invalidate({ id })
      setIsAcknowledgeOpen(false)
    },
  })

  const handleSubmitSelf = () => {
    submitSelfMutation.mutate({
      id,
      selfAssessment,
      employeeComments: employeeComments || undefined,
    })
  }

  const handleSubmitManager = () => {
    submitManagerMutation.mutate({
      id,
      overallRating,
      qualityOfWork: qualityRating,
      communication: communicationRating,
      teamwork: teamworkRating,
      initiative: initiativeRating,
      reliability: reliabilityRating,
      potentialRating,
      strengths: strengths || undefined,
      areasForImprovement: areasForImprovement || undefined,
      managerComments: managerComments || undefined,
    })
  }

  const handleAcknowledge = () => {
    acknowledgeMutation.mutate({
      id,
      employeeComments: employeeComments || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
          <h2 className="text-h3 font-heading font-semibold text-charcoal-900 mb-2">
            Review Not Found
          </h2>
          <Link href="/employee/operations/performance">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Performance
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[review.review_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon
  const employee = review.employee as {
    id: string
    job_title: string
    department: string
    hire_date: string
    user: { full_name: string; email: string; avatar_url?: string | null }
  }
  const reviewer = review.reviewer as { id: string; full_name: string; avatar_url?: string | null } | null
  const cycle = review.cycle as {
    id: string
    name: string
    status: string
    include_self_assessment: boolean
    include_goals: boolean
    include_competencies: boolean
  } | null
  const goals = review.goals ?? []

  const canSubmitSelf = review.review_status === 'self_review' || review.review_status === 'pending'
  const canSubmitManager = review.review_status === 'self_submitted' || review.review_status === 'manager_review'
  const canAcknowledge = review.review_status === 'calibrated' || review.review_status === 'manager_submitted'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/performance">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                    Performance Review
                  </h1>
                  <Badge className={cn('flex items-center gap-1', statusConfig.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  {cycle?.name || review.review_cycle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canSubmitSelf && (
                <Dialog open={isSubmitSelfOpen} onOpenChange={setIsSubmitSelfOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Self-Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Submit Self-Assessment</DialogTitle>
                      <DialogDescription>
                        Complete your self-assessment for this review period.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div>
                        <Label>Self-Assessment *</Label>
                        <Textarea
                          value={selfAssessment}
                          onChange={(e) => setSelfAssessment(e.target.value)}
                          placeholder="Describe your key accomplishments, challenges, and areas where you've grown during this review period..."
                          className="mt-2"
                          rows={6}
                        />
                      </div>
                      <div>
                        <Label>Additional Comments</Label>
                        <Textarea
                          value={employeeComments}
                          onChange={(e) => setEmployeeComments(e.target.value)}
                          placeholder="Any additional context or feedback..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubmitSelfOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitSelf}
                        disabled={!selfAssessment.trim() || submitSelfMutation.isPending}
                      >
                        {submitSelfMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canSubmitManager && (
                <Dialog open={isSubmitManagerOpen} onOpenChange={setIsSubmitManagerOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Star className="h-4 w-4 mr-2" />
                      Complete Manager Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Manager Review</DialogTitle>
                      <DialogDescription>
                        Complete the performance review for {employee.user.full_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Overall Rating */}
                      <div className="p-4 bg-charcoal-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-base font-medium">Overall Performance Rating *</Label>
                          <span className={cn(
                            'text-sm font-medium',
                            RATING_LABELS[overallRating as keyof typeof RATING_LABELS]?.color
                          )}>
                            {RATING_LABELS[overallRating as keyof typeof RATING_LABELS]?.label}
                          </span>
                        </div>
                        <RatingStars
                          rating={overallRating}
                          onChange={setOverallRating}
                          size="lg"
                        />
                      </div>

                      {/* Detailed Ratings */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Quality of Work', rating: qualityRating, setRating: setQualityRating },
                          { label: 'Communication', rating: communicationRating, setRating: setCommunicationRating },
                          { label: 'Teamwork', rating: teamworkRating, setRating: setTeamworkRating },
                          { label: 'Initiative', rating: initiativeRating, setRating: setInitiativeRating },
                          { label: 'Reliability', rating: reliabilityRating, setRating: setReliabilityRating },
                          { label: 'Potential', rating: potentialRating, setRating: setPotentialRating },
                        ].map(({ label, rating, setRating }) => (
                          <div key={label} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm text-charcoal-700">{label}</span>
                            <RatingStars
                              rating={rating}
                              onChange={setRating}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Text Fields */}
                      <div>
                        <Label>Key Strengths</Label>
                        <Textarea
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                          placeholder="Highlight the employee's key strengths..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Areas for Improvement</Label>
                        <Textarea
                          value={areasForImprovement}
                          onChange={(e) => setAreasForImprovement(e.target.value)}
                          placeholder="Identify areas where the employee can improve..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Manager Comments</Label>
                        <Textarea
                          value={managerComments}
                          onChange={(e) => setManagerComments(e.target.value)}
                          placeholder="Any additional feedback or comments..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSubmitManagerOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitManager}
                        disabled={submitManagerMutation.isPending}
                      >
                        {submitManagerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Submit Review
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {canAcknowledge && (
                <Dialog open={isAcknowledgeOpen} onOpenChange={setIsAcknowledgeOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Acknowledge Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Acknowledge Review</DialogTitle>
                      <DialogDescription>
                        By acknowledging, you confirm that you have reviewed and discussed this performance review with your manager.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label>Comments (Optional)</Label>
                      <Textarea
                        value={employeeComments}
                        onChange={(e) => setEmployeeComments(e.target.value)}
                        placeholder="Any additional comments or feedback..."
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAcknowledgeOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleAcknowledge}
                        disabled={acknowledgeMutation.isPending}
                      >
                        {acknowledgeMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4 mr-2" />
                        )}
                        Acknowledge
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="self-assessment">Self-Assessment</TabsTrigger>
                <TabsTrigger value="manager-review">Manager Review</TabsTrigger>
                {goals.length > 0 && <TabsTrigger value="goals">Goals ({goals.length})</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Rating Summary */}
                {review.overall_rating && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-heading font-semibold">
                        Rating Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                          <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                            Overall
                          </p>
                          <div className="flex justify-center mb-1">
                            <RatingStars rating={review.overall_rating} readonly size="sm" />
                          </div>
                          <p className={cn(
                            'text-sm font-medium',
                            RATING_LABELS[review.overall_rating as keyof typeof RATING_LABELS]?.color
                          )}>
                            {RATING_LABELS[review.overall_rating as keyof typeof RATING_LABELS]?.label}
                          </p>
                        </div>
                        {review.potential_rating && (
                          <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                              Potential
                            </p>
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <TrendingUp
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i <= review.potential_rating!
                                      ? 'text-sky-500'
                                      : 'text-charcoal-200'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-sm font-medium text-charcoal-700 mt-1">
                              {review.potential_rating}/5
                            </p>
                          </div>
                        )}
                        {review.calibrated_rating && (
                          <div className="p-4 bg-amber-50 rounded-lg text-center border border-amber-200">
                            <p className="text-xs text-amber-700 uppercase tracking-wider mb-1">
                              Calibrated
                            </p>
                            <div className="flex justify-center mb-1">
                              <RatingStars rating={review.calibrated_rating} readonly size="sm" />
                            </div>
                            <p className="text-sm font-medium text-amber-700">
                              {review.calibrated_rating}
                            </p>
                          </div>
                        )}
                        {review.nine_box_position && (
                          <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
                            <p className="text-xs text-purple-700 uppercase tracking-wider mb-1">
                              9-Box
                            </p>
                            <p className="text-lg font-semibold text-purple-700 capitalize">
                              {review.nine_box_position.split('-').join(' ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Detailed Ratings */}
                      {(review.quality_of_work || review.communication || review.teamwork || review.initiative || review.reliability) && (
                        <div className="mt-6 space-y-3">
                          <h4 className="text-sm font-medium text-charcoal-700">Detailed Ratings</h4>
                          {[
                            { label: 'Quality of Work', value: review.quality_of_work },
                            { label: 'Communication', value: review.communication },
                            { label: 'Teamwork', value: review.teamwork },
                            { label: 'Initiative', value: review.initiative },
                            { label: 'Reliability', value: review.reliability },
                          ].filter(r => r.value).map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-sm text-charcoal-600">{label}</span>
                              <div className="flex items-center gap-2">
                                <Progress value={(value! / 5) * 100} className="w-24 h-2" />
                                <span className="text-sm font-medium text-charcoal-900 w-4">
                                  {value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Strengths & Areas for Improvement */}
                {(review.strengths || review.areas_for_improvement) && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {review.strengths && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <ThumbsUp className="h-5 w-5 text-green-600" />
                              <h4 className="font-medium text-charcoal-900">Strengths</h4>
                            </div>
                            <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                              {review.strengths}
                            </p>
                          </div>
                        )}
                        {review.areas_for_improvement && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Target className="h-5 w-5 text-amber-600" />
                              <h4 className="font-medium text-charcoal-900">Areas for Improvement</h4>
                            </div>
                            <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                              {review.areas_for_improvement}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="self-assessment" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-semibold">
                      Self-Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {review.employee_self_assessment ? (
                      <div className="space-y-4">
                        <p className="text-charcoal-700 whitespace-pre-wrap">
                          {review.employee_self_assessment}
                        </p>
                        {review.self_review_submitted_at && (
                          <p className="text-xs text-charcoal-500">
                            Submitted on {new Date(review.self_review_submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                        <p className="text-charcoal-500">No self-assessment submitted yet</p>
                        {canSubmitSelf && (
                          <Button
                            className="mt-4"
                            onClick={() => setIsSubmitSelfOpen(true)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Submit Self-Assessment
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manager-review" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-heading font-semibold">
                      Manager Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {review.manager_comments || review.overall_rating ? (
                      <div className="space-y-6">
                        {review.manager_comments && (
                          <div>
                            <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                              Manager Comments
                            </h4>
                            <p className="text-charcoal-600 whitespace-pre-wrap">
                              {review.manager_comments}
                            </p>
                          </div>
                        )}
                        {review.manager_review_submitted_at && (
                          <p className="text-xs text-charcoal-500">
                            Submitted on {new Date(review.manager_review_submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                        <p className="text-charcoal-500">Manager review not completed yet</p>
                        {canSubmitManager && (
                          <Button
                            className="mt-4"
                            onClick={() => setIsSubmitManagerOpen(true)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Complete Review
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {goals.length > 0 && (
                <TabsContent value="goals" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-heading font-semibold">
                        Goals & Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {goals.map((goal) => (
                          <div
                            key={goal.id}
                            className="p-4 border rounded-lg hover:border-charcoal-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-charcoal-900">
                                  {goal.goal}
                                </h4>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {goal.category}
                                  </Badge>
                                  <span className="text-xs text-charcoal-500">
                                    {goal.progress_percent}% complete
                                  </span>
                                </div>
                              </div>
                              {goal.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                  <span className="font-medium">{goal.rating}</span>
                                </div>
                              )}
                            </div>
                            <Progress
                              value={goal.progress_percent}
                              className="mt-3 h-1.5"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee?.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-charcoal-100">
                      {employee ? getInitials(employee.user.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {employee?.user?.full_name}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {employee?.job_title}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Briefcase className="h-4 w-4 text-charcoal-400" />
                    <span>{employee?.department}</span>
                  </div>
                  {employee?.hire_date && (
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Calendar className="h-4 w-4 text-charcoal-400" />
                      <span>Started {new Date(employee.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviewer Info */}
            {reviewer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                    Reviewer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={reviewer.avatar_url || undefined} />
                      <AvatarFallback className="bg-charcoal-100">
                        {getInitials(reviewer.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-charcoal-900">
                        {reviewer.full_name}
                      </p>
                      <p className="text-sm text-charcoal-500">Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Review Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {review.period_start_date && review.period_end_date && (
                  <div>
                    <p className="text-charcoal-500">Period</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(review.period_start_date).toLocaleDateString()} -{' '}
                      {new Date(review.period_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {review.self_review_submitted_at && (
                  <div>
                    <p className="text-charcoal-500">Self-Review Submitted</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(review.self_review_submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {review.manager_review_submitted_at && (
                  <div>
                    <p className="text-charcoal-500">Manager Review Submitted</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(review.manager_review_submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {review.calibrated_at && (
                  <div>
                    <p className="text-charcoal-500">Calibrated</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(review.calibrated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {review.employee_acknowledged_at && (
                  <div>
                    <p className="text-charcoal-500">Acknowledged</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(review.employee_acknowledged_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
