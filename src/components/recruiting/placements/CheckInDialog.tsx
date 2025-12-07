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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Phone,
  User,
  Building,
  Heart,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

// Form validation schema
const checkInSchema = z.object({
  checkinType: z.enum(['7_day', '30_day', '60_day', '90_day', 'ad_hoc']),
  checkinDate: z.string(),
  // Candidate feedback
  candidateContactMethod: z.enum(['phone', 'video', 'in_person', 'email']).optional(),
  candidateResponseStatus: z.enum(['completed', 'scheduled', 'left_message', 'no_response']),
  candidateOverallSatisfaction: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  candidateRoleSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
  candidateTeamRelationship: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  candidateWorkload: z.enum(['just_right', 'a_bit_much', 'too_much', 'too_little']).optional(),
  candidatePaymentStatus: z.enum(['no_issues', 'minor_delay', 'major_issue']).optional(),
  candidateExtensionInterest: z.enum(['definitely_interested', 'probably_interested', 'unsure', 'not_interested', 'too_early']).optional(),
  candidateSentiment: z.enum(['very_positive', 'positive', 'neutral', 'negative']).optional(),
  candidateConcerns: z.string().max(2000).optional(),
  candidateNotes: z.string().max(2000).optional(),
  // Client feedback
  clientContactMethod: z.enum(['phone', 'video', 'in_person', 'email']).optional(),
  clientPerformanceRating: z.enum(['exceeds', 'meets', 'below', 'not_meeting']).optional(),
  clientTeamIntegration: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientWorkQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientCommunication: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  clientExtensionInterest: z.enum(['definitely', 'probably', 'unsure', 'probably_not']).optional(),
  clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied']).optional(),
  clientConcerns: z.string().max(2000).optional(),
  clientNotes: z.string().max(2000).optional(),
  // Assessment
  overallHealth: z.enum(['healthy', 'at_risk', 'critical']),
  riskFactors: z.array(z.string()).optional(),
  // Follow-up
  nextCheckinDate: z.string().optional(),
  followUpRequired: z.enum(['none', 'scheduled', 'escalate']),
})

type CheckInFormData = z.infer<typeof checkInSchema>

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string
  currentCheckinType: string
  startDate: string
  onSuccess?: () => void
}

const CHECKIN_TYPES = [
  { value: '7_day', label: '7-Day Check-in', days: 7 },
  { value: '30_day', label: '30-Day Check-in', days: 30 },
  { value: '60_day', label: '60-Day Check-in', days: 60 },
  { value: '90_day', label: '90-Day Check-in', days: 90 },
  { value: 'ad_hoc', label: 'Ad-hoc Check-in', days: 0 },
]

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'video', label: 'Video Call', icon: MessageSquare },
  { value: 'in_person', label: 'In Person', icon: User },
  { value: 'email', label: 'Email', icon: MessageSquare },
]

const SATISFACTION_OPTIONS = [
  { value: 'excellent', label: 'Excellent', color: 'green' },
  { value: 'good', label: 'Good', color: 'blue' },
  { value: 'fair', label: 'Fair', color: 'yellow' },
  { value: 'poor', label: 'Poor', color: 'red' },
]

const RISK_FACTORS = [
  'Communication issues',
  'Performance concerns',
  'Cultural fit challenges',
  'Workload issues',
  'Payment/billing problems',
  'Scope creep',
  'Client relationship strain',
  'Personal circumstances',
  'Seeking other opportunities',
  'Extension unlikely',
]

const HEALTH_OPTIONS = [
  { value: 'healthy', label: 'Healthy', icon: Heart, color: 'green', description: 'No issues, placement going well' },
  { value: 'at_risk', label: 'At Risk', icon: AlertTriangle, color: 'yellow', description: 'Some concerns that need monitoring' },
  { value: 'critical', label: 'Critical', icon: AlertTriangle, color: 'red', description: 'Immediate attention required' },
]

export function CheckInDialog({
  open,
  onOpenChange,
  placementId,
  candidateName,
  jobTitle,
  accountName,
  currentCheckinType,
  startDate,
  onSuccess,
}: CheckInDialogProps) {
  const { toast } = useToast()
  const [selectedRiskFactors, setSelectedRiskFactors] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      checkinType: currentCheckinType as '7_day' | '30_day' | '60_day' | '90_day' | 'ad_hoc',
      checkinDate: format(new Date(), 'yyyy-MM-dd'),
      candidateResponseStatus: 'completed',
      overallHealth: 'healthy',
      followUpRequired: 'none',
    },
    mode: 'onChange',
  })

  const overallHealth = watch('overallHealth')
  const checkinDate = watch('checkinDate')
  const candidateResponseStatus = watch('candidateResponseStatus')

  const recordCheckInMutation = trpc.ats.placements.recordCheckIn.useMutation({
    onSuccess: () => {
      toast({
        title: 'Check-in recorded',
        description: `Check-in completed for ${candidateName}`,
      })
      reset()
      setSelectedRiskFactors([])
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to record check-in',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: CheckInFormData) => {
    recordCheckInMutation.mutate({
      placementId,
      checkinType: data.checkinType,
      checkinDate: data.checkinDate,
      candidateContactMethod: data.candidateContactMethod,
      candidateResponseStatus: data.candidateResponseStatus,
      candidateOverallSatisfaction: data.candidateOverallSatisfaction,
      candidateRoleSatisfaction: data.candidateRoleSatisfaction,
      candidateTeamRelationship: data.candidateTeamRelationship,
      candidateWorkload: data.candidateWorkload,
      candidatePaymentStatus: data.candidatePaymentStatus,
      candidateExtensionInterest: data.candidateExtensionInterest,
      candidateSentiment: data.candidateSentiment,
      candidateConcerns: data.candidateConcerns,
      candidateNotes: data.candidateNotes,
      clientContactMethod: data.clientContactMethod,
      clientPerformanceRating: data.clientPerformanceRating,
      clientTeamIntegration: data.clientTeamIntegration,
      clientWorkQuality: data.clientWorkQuality,
      clientCommunication: data.clientCommunication,
      clientExtensionInterest: data.clientExtensionInterest,
      clientSatisfaction: data.clientSatisfaction,
      clientConcerns: data.clientConcerns,
      clientNotes: data.clientNotes,
      overallHealth: data.overallHealth,
      riskFactors: selectedRiskFactors,
      nextCheckinDate: data.nextCheckinDate,
      followUpRequired: data.followUpRequired,
    })
  }

  const handleClose = () => {
    reset()
    setSelectedRiskFactors([])
    onOpenChange(false)
  }

  const toggleRiskFactor = (factor: string) => {
    setSelectedRiskFactors(prev =>
      prev.includes(factor)
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    )
  }

  const showCandidateFeedback = candidateResponseStatus === 'completed'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gold-500" />
            Record Check-In
          </DialogTitle>
          <DialogDescription>
            Log a check-in for <span className="font-medium text-charcoal-900">{candidateName}</span> at{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Check-in Type and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Type</Label>
              <Select
                value={watch('checkinType')}
                onValueChange={(v) => setValue('checkinType', v as CheckInFormData['checkinType'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHECKIN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Check-in Date</Label>
              <Input
                type="date"
                {...register('checkinDate')}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          <Tabs defaultValue="candidate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidate" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidate
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Client
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Assessment
              </TabsTrigger>
            </TabsList>

            {/* Candidate Tab */}
            <TabsContent value="candidate" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Method</Label>
                  <Select
                    value={watch('candidateContactMethod') || ''}
                    onValueChange={(v) => setValue('candidateContactMethod', v as CheckInFormData['candidateContactMethod'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Response Status *</Label>
                  <Select
                    value={watch('candidateResponseStatus')}
                    onValueChange={(v) => setValue('candidateResponseStatus', v as CheckInFormData['candidateResponseStatus'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="left_message">Left Message</SelectItem>
                      <SelectItem value="no_response">No Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showCandidateFeedback && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Satisfaction Ratings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Overall Satisfaction</Label>
                          <Select
                            value={watch('candidateOverallSatisfaction') || ''}
                            onValueChange={(v) => setValue('candidateOverallSatisfaction', v as CheckInFormData['candidateOverallSatisfaction'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {SATISFACTION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Role Satisfaction</Label>
                          <Select
                            value={watch('candidateRoleSatisfaction') || ''}
                            onValueChange={(v) => setValue('candidateRoleSatisfaction', v as CheckInFormData['candidateRoleSatisfaction'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="very_satisfied">Very Satisfied</SelectItem>
                              <SelectItem value="satisfied">Satisfied</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="unsatisfied">Unsatisfied</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Team Relationship</Label>
                          <Select
                            value={watch('candidateTeamRelationship') || ''}
                            onValueChange={(v) => setValue('candidateTeamRelationship', v as CheckInFormData['candidateTeamRelationship'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {SATISFACTION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Workload</Label>
                          <Select
                            value={watch('candidateWorkload') || ''}
                            onValueChange={(v) => setValue('candidateWorkload', v as CheckInFormData['candidateWorkload'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="just_right">Just Right</SelectItem>
                              <SelectItem value="a_bit_much">A Bit Much</SelectItem>
                              <SelectItem value="too_much">Too Much</SelectItem>
                              <SelectItem value="too_little">Too Little</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Payment Status</Label>
                      <Select
                        value={watch('candidatePaymentStatus') || ''}
                        onValueChange={(v) => setValue('candidatePaymentStatus', v as CheckInFormData['candidatePaymentStatus'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no_issues">No Issues</SelectItem>
                          <SelectItem value="minor_delay">Minor Delay</SelectItem>
                          <SelectItem value="major_issue">Major Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Extension Interest</Label>
                      <Select
                        value={watch('candidateExtensionInterest') || ''}
                        onValueChange={(v) => setValue('candidateExtensionInterest', v as CheckInFormData['candidateExtensionInterest'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="definitely_interested">Definitely Interested</SelectItem>
                          <SelectItem value="probably_interested">Probably Interested</SelectItem>
                          <SelectItem value="unsure">Unsure</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="too_early">Too Early</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Concerns or Issues</Label>
                    <Textarea
                      {...register('candidateConcerns')}
                      placeholder="Any concerns raised by the candidate..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      {...register('candidateNotes')}
                      placeholder="Additional notes from candidate check-in..."
                      rows={2}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Client Tab */}
            <TabsContent value="client" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <Select
                  value={watch('clientContactMethod') || ''}
                  onValueChange={(v) => setValue('clientContactMethod', v as CheckInFormData['clientContactMethod'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Performance Ratings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Performance Rating</Label>
                      <Select
                        value={watch('clientPerformanceRating') || ''}
                        onValueChange={(v) => setValue('clientPerformanceRating', v as CheckInFormData['clientPerformanceRating'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exceeds">Exceeds Expectations</SelectItem>
                          <SelectItem value="meets">Meets Expectations</SelectItem>
                          <SelectItem value="below">Below Expectations</SelectItem>
                          <SelectItem value="not_meeting">Not Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Team Integration</Label>
                      <Select
                        value={watch('clientTeamIntegration') || ''}
                        onValueChange={(v) => setValue('clientTeamIntegration', v as CheckInFormData['clientTeamIntegration'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SATISFACTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Work Quality</Label>
                      <Select
                        value={watch('clientWorkQuality') || ''}
                        onValueChange={(v) => setValue('clientWorkQuality', v as CheckInFormData['clientWorkQuality'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SATISFACTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Communication</Label>
                      <Select
                        value={watch('clientCommunication') || ''}
                        onValueChange={(v) => setValue('clientCommunication', v as CheckInFormData['clientCommunication'])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SATISFACTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label>Extension Interest</Label>
                <Select
                  value={watch('clientExtensionInterest') || ''}
                  onValueChange={(v) => setValue('clientExtensionInterest', v as CheckInFormData['clientExtensionInterest'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="definitely">Definitely</SelectItem>
                    <SelectItem value="probably">Probably</SelectItem>
                    <SelectItem value="unsure">Unsure</SelectItem>
                    <SelectItem value="probably_not">Probably Not</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Concerns or Issues</Label>
                <Textarea
                  {...register('clientConcerns')}
                  placeholder="Any concerns raised by the client..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  {...register('clientNotes')}
                  placeholder="Additional notes from client check-in..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Assessment Tab */}
            <TabsContent value="assessment" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Overall Placement Health *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {HEALTH_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setValue('overallHealth', option.value as 'healthy' | 'at_risk' | 'critical')}
                        className={cn(
                          'p-3 rounded-lg border text-left transition-colors',
                          overallHealth === option.value
                            ? option.color === 'green' ? 'border-green-500 bg-green-50' :
                              option.color === 'yellow' ? 'border-amber-500 bg-amber-50' :
                              'border-red-500 bg-red-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <Icon className={cn(
                          'w-5 h-5 mb-2',
                          option.color === 'green' ? 'text-green-600' :
                          option.color === 'yellow' ? 'text-amber-600' :
                          'text-red-600'
                        )} />
                        <div className="font-medium text-charcoal-900 text-sm">{option.label}</div>
                        <div className="text-xs text-charcoal-500 mt-1">{option.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {(overallHealth === 'at_risk' || overallHealth === 'critical') && (
                <div className="space-y-2">
                  <Label>Risk Factors</Label>
                  <div className="flex flex-wrap gap-2">
                    {RISK_FACTORS.map((factor) => (
                      <Badge
                        key={factor}
                        variant={selectedRiskFactors.includes(factor) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedRiskFactors.includes(factor) && 'bg-red-600'
                        )}
                        onClick={() => toggleRiskFactor(factor)}
                      >
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Next Check-in Date</Label>
                  <Input
                    type="date"
                    {...register('nextCheckinDate')}
                    min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Required</Label>
                  <Select
                    value={watch('followUpRequired')}
                    onValueChange={(v) => setValue('followUpRequired', v as 'none' | 'scheduled' | 'escalate')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scheduled">Scheduled Follow-up</SelectItem>
                      <SelectItem value="escalate">Escalate to Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordCheckInMutation.isPending}>
              {recordCheckInMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Record Check-In
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
