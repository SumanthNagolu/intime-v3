'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  X,
  CheckCircle2,
  Target,
  Shield,
  MessageSquare,
  Users,
  Clock,
  DollarSign,
  FileWarning,
  Gavel,
  Zap,
  MoreHorizontal,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES & SCHEMA
// =============================================================================

const createEscalationSchema = z.object({
  escalationType: z.enum([
    'quality_concern',
    'candidate_issue',
    'billing_dispute',
    'sla_violation',
    'contract_dispute',
    'communication',
    'compliance',
    'relationship',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  issueSummary: z.string().min(10, 'Summary must be at least 10 characters').max(200),
  detailedDescription: z.string().min(20, 'Description must be at least 20 characters'),
  clientImpact: z.array(z.string()).optional(),
  immediateActions: z.string().optional(),
  rootCause: z.string().optional(),
  resolutionPlan: z.string().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
})

type CreateEscalationFormData = z.infer<typeof createEscalationSchema>

interface CreateContactEscalationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  contactName: string
  onSuccess?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ESCALATION_TYPES = [
  {
    value: 'quality_concern' as const,
    label: 'Quality Concern',
    description: 'Work quality issues',
    icon: Target,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
  {
    value: 'candidate_issue' as const,
    label: 'Candidate Issue',
    description: 'Performance problems',
    icon: Users,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
  },
  {
    value: 'billing_dispute' as const,
    label: 'Billing Dispute',
    description: 'Invoice or payment',
    icon: DollarSign,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
  },
  {
    value: 'sla_violation' as const,
    label: 'SLA Violation',
    description: 'Service level breach',
    icon: Clock,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
  },
  {
    value: 'contract_dispute' as const,
    label: 'Contract Dispute',
    description: 'Agreement issues',
    icon: Gavel,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
  },
  {
    value: 'communication' as const,
    label: 'Communication',
    description: 'Breakdown in comms',
    icon: MessageSquare,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-400',
  },
  {
    value: 'compliance' as const,
    label: 'Compliance',
    description: 'Regulatory concern',
    icon: Shield,
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-400',
  },
  {
    value: 'relationship' as const,
    label: 'Relationship',
    description: 'Client relationship',
    icon: FileWarning,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-400',
  },
  {
    value: 'other' as const,
    label: 'Other',
    description: 'Other issues',
    icon: MoreHorizontal,
    bgColor: 'bg-charcoal-50',
    textColor: 'text-charcoal-700',
    borderColor: 'border-charcoal-400',
  },
] as const

const SEVERITY_LEVELS = [
  {
    value: 'low' as const,
    label: 'Low',
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Minor issue',
    responseSla: '24 hours',
    resolutionSla: '10 days',
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Moderate issue',
    responseSla: '4 hours',
    resolutionSla: '5 days',
  },
  {
    value: 'high' as const,
    label: 'High',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Serious issue',
    responseSla: '2 hours',
    resolutionSla: '48 hours',
  },
  {
    value: 'critical' as const,
    label: 'Critical',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Urgent issue',
    responseSla: '1 hour',
    resolutionSla: '24 hours',
  },
] as const

const CLIENT_IMPACT_OPTIONS = [
  { value: 'revenue_risk', label: 'Revenue at Risk' },
  { value: 'relationship_damage', label: 'Relationship Damage' },
  { value: 'legal_compliance', label: 'Legal/Compliance Issue' },
  { value: 'timeline_impact', label: 'Timeline Impact' },
  { value: 'reputation_damage', label: 'Reputation Damage' },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function CreateContactEscalationDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  onSuccess,
}: CreateContactEscalationDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [step, setStep] = useState(1)

  // Fetch team members for assignment
  const { data: teamMembers = [] } = trpc.users.list.useQuery(undefined, {
    enabled: open,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CreateEscalationFormData>({
    resolver: zodResolver(createEscalationSchema),
    defaultValues: {
      escalationType: 'quality_concern',
      severity: 'medium',
      issueSummary: '',
      detailedDescription: '',
      clientImpact: [],
      immediateActions: '',
      assignedTo: null,
    },
  })

  const watchSeverity = watch('severity')
  const watchType = watch('escalationType')
  const watchClientImpact = watch('clientImpact') || []

  const createEscalationMutation = trpc.crm.escalations.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Escalation Created',
        description: 'The escalation has been created successfully.',
      })
      utils.crm.escalations.invalidate()
      reset()
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create escalation',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: CreateEscalationFormData) => {
    createEscalationMutation.mutate({
      contactId,
      escalationType: data.escalationType,
      severity: data.severity,
      issueSummary: data.issueSummary,
      detailedDescription: data.detailedDescription,
      clientImpact: data.clientImpact,
      immediateActions: data.immediateActions,
      rootCause: data.rootCause,
      resolutionPlan: data.resolutionPlan,
      assignedTo: data.assignedTo || undefined,
    })
  }

  const handleClose = () => {
    reset()
    setStep(1)
    onOpenChange(false)
  }

  const toggleImpact = (value: string) => {
    const current = watchClientImpact || []
    if (current.includes(value)) {
      setValue('clientImpact', current.filter(v => v !== value))
    } else {
      setValue('clientImpact', [...current, value])
    }
  }

  const selectedSeverity = SEVERITY_LEVELS.find(s => s.value === watchSeverity)
  const selectedType = ESCALATION_TYPES.find(t => t.value === watchType)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-50 via-white to-amber-50 px-6 py-4 border-b border-charcoal-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-charcoal-900">Create Escalation</h2>
                <p className="text-sm text-charcoal-500">For contact: {contactName}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-charcoal-100 rounded-full transition-colors">
              <X className="h-5 w-5 text-charcoal-400" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    step === s
                      ? "bg-red-500 text-white"
                      : step > s
                      ? "bg-green-500 text-white"
                      : "bg-charcoal-100 text-charcoal-400"
                  )}
                >
                  {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                </button>
                {s < 3 && (
                  <div className={cn(
                    "w-16 h-0.5 transition-colors",
                    step > s ? "bg-green-500" : "bg-charcoal-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6 space-y-6">
            {/* Step 1: Type & Severity */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Escalation Type */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-3 block">
                    Escalation Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {ESCALATION_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = watchType === type.value
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setValue('escalationType', type.value)}
                          className={cn(
                            "relative p-4 rounded-xl border-2 transition-all text-left",
                            isSelected
                              ? `${type.bgColor} ${type.borderColor} ring-2 ring-offset-1`
                              : "border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 mb-2", isSelected ? type.textColor : "text-charcoal-400")} />
                          <p className={cn("font-semibold text-sm", isSelected ? type.textColor : "text-charcoal-700")}>
                            {type.label}
                          </p>
                          <p className="text-xs text-charcoal-500 mt-0.5">{type.description}</p>
                          {isSelected && (
                            <div className={cn("absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center", type.bgColor)}>
                              <CheckCircle2 className={cn("h-4 w-4", type.textColor)} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-3 block">
                    Severity <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {SEVERITY_LEVELS.map((severity) => {
                      const Icon = severity.icon
                      const isSelected = watchSeverity === severity.value
                      return (
                        <button
                          key={severity.value}
                          type="button"
                          onClick={() => setValue('severity', severity.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            isSelected
                              ? `${severity.bgColor} ${severity.borderColor}`
                              : "border-charcoal-200 hover:border-charcoal-300"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 mx-auto mb-1", isSelected ? severity.color : "text-charcoal-400")} />
                          <p className={cn("font-semibold text-sm", isSelected ? severity.color : "text-charcoal-600")}>
                            {severity.label}
                          </p>
                          <p className="text-[10px] text-charcoal-500 mt-0.5">{severity.description}</p>
                        </button>
                      )
                    })}
                  </div>
                  {selectedSeverity && (
                    <div className={cn("mt-3 p-3 rounded-lg", selectedSeverity.bgColor)}>
                      <p className="text-xs text-charcoal-600">
                        <span className="font-semibold">Response SLA:</span> {selectedSeverity.responseSla} |
                        <span className="font-semibold ml-2">Resolution SLA:</span> {selectedSeverity.resolutionSla}
                      </p>
                    </div>
                  )}
                </div>

                {/* Client Impact */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-3 block">
                    Client Impact (select all that apply)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_IMPACT_OPTIONS.map((impact) => (
                      <button
                        key={impact.value}
                        type="button"
                        onClick={() => toggleImpact(impact.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          watchClientImpact.includes(impact.value)
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                        )}
                      >
                        {impact.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Issue Summary */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Issue Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('issueSummary')}
                    placeholder="Brief summary of the escalation (10-200 characters)"
                    className={cn(errors.issueSummary && "border-red-500")}
                  />
                  {errors.issueSummary && (
                    <p className="text-xs text-red-500 mt-1">{errors.issueSummary.message}</p>
                  )}
                </div>

                {/* Detailed Description */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Detailed Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    {...register('detailedDescription')}
                    placeholder="Provide a detailed description of the issue (minimum 20 characters)"
                    className={cn("min-h-[120px]", errors.detailedDescription && "border-red-500")}
                  />
                  {errors.detailedDescription && (
                    <p className="text-xs text-red-500 mt-1">{errors.detailedDescription.message}</p>
                  )}
                </div>

                {/* Immediate Actions */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Immediate Actions Taken
                  </Label>
                  <Textarea
                    {...register('immediateActions')}
                    placeholder="What actions have already been taken?"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Assignment & Plan */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Assigned To */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Assign To
                  </Label>
                  <Select
                    value={watch('assignedTo') || 'self'}
                    onValueChange={(value) => setValue('assignedTo', value === 'self' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self (will be assigned to you)</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Root Cause */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Root Cause Analysis
                  </Label>
                  <Textarea
                    {...register('rootCause')}
                    placeholder="What is the underlying cause of this issue?"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Resolution Plan */}
                <div>
                  <Label className="text-sm font-semibold text-charcoal-700 mb-2 block">
                    Resolution Plan
                  </Label>
                  <Textarea
                    {...register('resolutionPlan')}
                    placeholder="How do you plan to resolve this issue?"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-charcoal-50 border border-charcoal-200">
                  <h4 className="font-semibold text-charcoal-700 mb-3">Escalation Summary</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-charcoal-500">Type:</span>
                      <span className="ml-2 font-medium">{selectedType?.label}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Severity:</span>
                      <span className={cn("ml-2 font-medium", selectedSeverity?.color)}>{selectedSeverity?.label}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Response SLA:</span>
                      <span className="ml-2 font-medium">{selectedSeverity?.responseSla}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Resolution SLA:</span>
                      <span className="ml-2 font-medium">{selectedSeverity?.resolutionSla}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-charcoal-50 border-t border-charcoal-200">
            <div className="flex items-center justify-between w-full">
              <div>
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(step + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createEscalationMutation.isPending}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {createEscalationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Create Escalation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateContactEscalationDialog
