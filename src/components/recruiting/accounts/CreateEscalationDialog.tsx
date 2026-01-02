'use client'

import { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  FileText,
  MessageSquare,
  Users,
  Clock,
  DollarSign,
  FileWarning,
  Gavel,
  Zap,
  MoreHorizontal,
  Briefcase,
  Building2,
  UserPlus,
  Search,
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
  relatedJobId: z.string().uuid().optional().nullable(),
  relatedContactIds: z.array(z.string().uuid()).optional(),
})

type CreateEscalationFormData = z.infer<typeof createEscalationSchema>

interface CreateEscalationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
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
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
  {
    value: 'candidate_issue' as const,
    label: 'Candidate Issue',
    description: 'Performance problems',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-400',
  },
  {
    value: 'billing_dispute' as const,
    label: 'Billing Dispute',
    description: 'Invoice or payment',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-400',
  },
  {
    value: 'sla_violation' as const,
    label: 'SLA Violation',
    description: 'Service level breach',
    icon: Clock,
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-400',
  },
  {
    value: 'contract_dispute' as const,
    label: 'Contract Dispute',
    description: 'Agreement issues',
    icon: Gavel,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
  },
  {
    value: 'communication' as const,
    label: 'Communication',
    description: 'Breakdown in comms',
    icon: MessageSquare,
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-400',
  },
  {
    value: 'compliance' as const,
    label: 'Compliance',
    description: 'Regulatory concern',
    icon: Shield,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-400',
  },
  {
    value: 'relationship' as const,
    label: 'Relationship',
    description: 'Client relationship',
    icon: FileWarning,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-400',
  },
  {
    value: 'other' as const,
    label: 'Other',
    description: 'Other issues',
    icon: MoreHorizontal,
    color: 'from-charcoal-500 to-charcoal-600',
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
    gradientColor: 'from-blue-500 to-blue-600',
    description: 'Minor issue, 24h response SLA',
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
    gradientColor: 'from-amber-500 to-amber-600',
    description: 'Moderate impact, 4h response SLA',
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
    gradientColor: 'from-orange-500 to-orange-600',
    description: 'Significant impact, 2h response SLA',
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
    gradientColor: 'from-red-500 to-red-600',
    description: 'Severe impact, 1h response SLA',
    responseSla: '1 hour',
    resolutionSla: '24 hours',
  },
] as const

const IMPACT_OPTIONS = [
  { value: 'revenue_at_risk', label: 'Revenue at Risk', icon: DollarSign },
  { value: 'relationship_damage', label: 'Relationship Damage', icon: Users },
  { value: 'legal_compliance', label: 'Legal/Compliance Issue', icon: Gavel },
  { value: 'timeline_impact', label: 'Timeline Impact', icon: Clock },
  { value: 'reputation_damage', label: 'Reputation Damage', icon: Shield },
] as const

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function EscalationSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
  variant = 'default',
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'danger'
}) {
  const gradientColors = variant === 'danger' 
    ? 'from-red-100 to-red-200' 
    : 'from-amber-100 to-amber-200'
  const iconColor = variant === 'danger' ? 'text-red-700' : 'text-amber-700'
  
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm', gradientColors)}>
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// =============================================================================
// CONTACT AVATAR
// =============================================================================

function ContactAvatar({ name, selected }: { name: string; selected: boolean }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
        selected
          ? 'bg-gradient-to-br from-red-600 to-red-800 text-white ring-2 ring-red-300'
          : 'bg-charcoal-100 text-charcoal-600'
      )}
    >
      {initials}
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CreateEscalationDialog({
  open,
  onOpenChange,
  accountId,
}: CreateEscalationDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [contactSearch, setContactSearch] = useState('')

  // Form setup with react-hook-form + Zod
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateEscalationFormData>({
    resolver: zodResolver(createEscalationSchema),
    defaultValues: {
      escalationType: 'quality_concern',
      severity: 'medium',
      issueSummary: '',
      detailedDescription: '',
      clientImpact: [],
      immediateActions: '',
      assignedTo: null,
      relatedJobId: null,
      relatedContactIds: [],
    },
  })

  const escalationType = watch('escalationType')
  const severity = watch('severity')
  const issueSummary = watch('issueSummary') || ''
  const detailedDescription = watch('detailedDescription') || ''
  const clientImpact = watch('clientImpact') || []
  const selectedContactIds = watch('relatedContactIds') || []

  // Fetch contacts for this account
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId },
    { enabled: open }
  )

  // Fetch jobs for this account
  const jobsQuery = trpc.ats.jobs.getByCompany.useQuery(
    { companyId: accountId, status: 'open' },
    { enabled: open }
  )

  // Fetch org members for assignment
  const orgMembersQuery = trpc.users.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: open }
  )

  const contacts = contactsQuery.data || []
  const jobs = jobsQuery.data?.items || []
  const orgMembers = orgMembersQuery.data?.items || []

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts
    const q = contactSearch.toLowerCase()
    return contacts.filter(
      (c: { first_name: string; last_name?: string; title?: string }) =>
        c.first_name?.toLowerCase().includes(q) ||
        c.last_name?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q)
    )
  }, [contacts, contactSearch])

  const createEscalationMutation = trpc.crm.escalations.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Escalation created',
        description: 'The escalation has been logged and assigned.',
      })
      utils.crm.escalations.listByAccount.invalidate({ accountId })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create escalation.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    reset()
    setContactSearch('')
  }

  const onSubmit = (data: CreateEscalationFormData) => {
    createEscalationMutation.mutate({
      accountId,
      escalationType: data.escalationType,
      severity: data.severity,
      issueSummary: data.issueSummary.trim(),
      detailedDescription: data.detailedDescription.trim(),
      clientImpact: data.clientImpact && data.clientImpact.length > 0 ? data.clientImpact : undefined,
      immediateActions: data.immediateActions?.trim() || undefined,
      rootCause: data.rootCause?.trim() || undefined,
      resolutionPlan: data.resolutionPlan?.trim() || undefined,
      assignedTo: data.assignedTo || undefined,
      relatedEntities: [
        ...(data.relatedJobId ? [{ type: 'job', id: data.relatedJobId }] : []),
        ...(data.relatedContactIds?.map(id => ({ type: 'contact', id })) || []),
      ].length > 0 ? [
        ...(data.relatedJobId ? [{ type: 'job', id: data.relatedJobId }] : []),
        ...(data.relatedContactIds?.map(id => ({ type: 'contact', id })) || []),
      ] : undefined,
    })
  }

  const handleEscalationTypeSelect = (type: typeof escalationType) => {
    setValue('escalationType', type)
  }

  const handleSeveritySelect = (sev: typeof severity) => {
    setValue('severity', sev)
  }

  const toggleImpact = (impact: string) => {
    const current = clientImpact || []
    if (current.includes(impact)) {
      setValue('clientImpact', current.filter((i) => i !== impact))
    } else {
      setValue('clientImpact', [...current, impact])
    }
  }

  const handleContactToggle = (contactId: string) => {
    const current = selectedContactIds || []
    if (current.includes(contactId)) {
      setValue('relatedContactIds', current.filter((id) => id !== contactId))
    } else {
      setValue('relatedContactIds', [...current, contactId])
    }
  }

  const selectedEscalationType = ESCALATION_TYPES.find((t) => t.value === escalationType)
  const selectedSeverity = SEVERITY_LEVELS.find((s) => s.value === severity)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Premium Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-charcoal-50 via-white to-red-50/30 border-b border-charcoal-100">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-600" />

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/20">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-charcoal-900 tracking-tight">
                Create Escalation
              </h2>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Report a client issue or concern that requires immediate attention
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-charcoal-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 space-y-8">
            {/* Escalation Type Section */}
            <EscalationSection icon={FileText} title="Escalation Type" subtitle="Select the category of this issue">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {ESCALATION_TYPES.slice(0, 5).map((type) => {
                  const Icon = type.icon
                  const isSelected = escalationType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleEscalationTypeSelect(type.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 group',
                        isSelected
                          ? `${type.borderColor} ${type.bgColor} shadow-md`
                          : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <CheckCircle2 className={cn('w-5 h-5', type.textColor)} />
                        </div>
                      )}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isSelected
                            ? `bg-gradient-to-br ${type.color} text-white shadow-sm`
                            : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span
                          className={cn(
                            'text-xs font-semibold block',
                            isSelected ? type.textColor : 'text-charcoal-800'
                          )}
                        >
                          {type.label}
                        </span>
                        <span className="text-[10px] text-charcoal-500 hidden md:block">
                          {type.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {ESCALATION_TYPES.slice(5).map((type) => {
                  const Icon = type.icon
                  const isSelected = escalationType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleEscalationTypeSelect(type.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 group',
                        isSelected
                          ? `${type.borderColor} ${type.bgColor} shadow-md`
                          : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <CheckCircle2 className={cn('w-4 h-4', type.textColor)} />
                        </div>
                      )}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          isSelected
                            ? `bg-gradient-to-br ${type.color} text-white shadow-sm`
                            : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={cn(
                          'text-[11px] font-semibold',
                          isSelected ? type.textColor : 'text-charcoal-700'
                        )}
                      >
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </EscalationSection>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Severity & Impact */}
              <EscalationSection icon={Zap} title="Severity & Impact" subtitle="Determine urgency level" variant="danger">
                <div className="space-y-5 p-5 bg-red-50/30 rounded-2xl border border-red-100">
                  {/* Severity Selection */}
                  <div className="space-y-3">
                    <Label className="text-charcoal-700 font-medium text-sm">
                      Severity Level <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {SEVERITY_LEVELS.map((level) => {
                        const Icon = level.icon
                        const isSelected = severity === level.value
                        return (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => handleSeveritySelect(level.value)}
                            className={cn(
                              'flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left',
                              isSelected
                                ? `${level.borderColor} ${level.bgColor} shadow-md`
                                : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={cn(
                                  'w-7 h-7 rounded-lg flex items-center justify-center',
                                  isSelected
                                    ? `bg-gradient-to-br ${level.gradientColor} text-white`
                                    : `${level.bgColor} ${level.color}`
                                )}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className={cn('font-bold text-sm', isSelected ? level.color : 'text-charcoal-800')}>
                                {level.label}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className={cn('w-4 h-4 ml-auto', level.color)} />
                              )}
                            </div>
                            <span className="text-[11px] text-charcoal-500 leading-tight">
                              {level.description}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Client Impact */}
                  <div className="space-y-3">
                    <Label className="text-charcoal-700 font-medium text-sm">
                      Client Impact
                      <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Select all that apply)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {IMPACT_OPTIONS.map((option) => {
                        const Icon = option.icon
                        const isSelected = clientImpact.includes(option.value)
                        return (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200',
                              isSelected
                                ? 'bg-red-50 border-red-300'
                                : 'border-charcoal-200 hover:border-charcoal-300 bg-white'
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleImpact(option.value)}
                              className={cn(
                                'border-2',
                                isSelected ? 'border-red-500 data-[state=checked]:bg-red-500' : 'border-charcoal-300'
                              )}
                            />
                            <Icon className={cn('w-4 h-4', isSelected ? 'text-red-600' : 'text-charcoal-400')} />
                            <span className={cn('text-sm font-medium', isSelected ? 'text-red-700' : 'text-charcoal-700')}>
                              {option.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* SLA Information Card */}
                  {selectedSeverity && (
                    <div className={cn(
                      'p-4 rounded-xl border',
                      selectedSeverity.bgColor,
                      selectedSeverity.borderColor
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className={cn('w-4 h-4', selectedSeverity.color)} />
                        <span className={cn('text-sm font-bold', selectedSeverity.color)}>SLA Requirements</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-charcoal-500 text-xs">Response Due</span>
                          <p className={cn('font-semibold', selectedSeverity.color)}>{selectedSeverity.responseSla}</p>
                        </div>
                        <div>
                          <span className="text-charcoal-500 text-xs">Resolution Target</span>
                          <p className={cn('font-semibold', selectedSeverity.color)}>{selectedSeverity.resolutionSla}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </EscalationSection>

              {/* Right Column - Assignment & Related */}
              <EscalationSection icon={UserPlus} title="Assignment & Related" subtitle="Ownership and context">
                <div className="space-y-5 p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100">
                  {/* Assignee */}
                  <div className="space-y-2">
                    <Label className="text-charcoal-700 font-medium text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-charcoal-400" />
                      Assign To
                      <span className="text-[10px] text-charcoal-400 font-normal">(Optional)</span>
                    </Label>
                    <Select
                      value={watch('assignedTo') || '_self'}
                      onValueChange={(v) => setValue('assignedTo', v === '_self' ? null : v)}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue placeholder="Select team member..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">Self (default)</SelectItem>
                        {orgMembers.map((member: { id: string; full_name: string }) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Related Job */}
                  {jobs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-charcoal-700 font-medium text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-charcoal-400" />
                        Related Job
                        <span className="text-[10px] text-charcoal-400 font-normal">(Optional)</span>
                      </Label>
                      <Select
                        value={watch('relatedJobId') || '_none'}
                        onValueChange={(v) => setValue('relatedJobId', v === '_none' ? null : v)}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                          <SelectValue placeholder="Link to a job order..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">No job selected</SelectItem>
                          {jobs.map((job: { id: string; title: string }) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Related Contacts */}
                  {contacts.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-charcoal-700 font-medium text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-charcoal-400" />
                        Related Contacts
                        <span className="text-[10px] text-charcoal-400 font-normal">(Optional)</span>
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input
                          placeholder="Search contacts..."
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          className="h-10 pl-10 rounded-xl border-charcoal-200 bg-white text-sm"
                        />
                      </div>
                      {selectedContactIds.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">
                            {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} linked
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {filteredContacts.slice(0, 6).map((contact: { id: string; first_name: string; last_name?: string; title?: string }) => {
                          const isSelected = selectedContactIds.includes(contact.id)
                          const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim()
                          return (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => handleContactToggle(contact.id)}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-200',
                                isSelected
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-transparent bg-white hover:border-charcoal-200'
                              )}
                            >
                              <ContactAvatar name={fullName} selected={isSelected} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-charcoal-900 truncate">
                                  {fullName}
                                </p>
                                {contact.title && (
                                  <p className="text-[10px] text-charcoal-500 truncate">
                                    {contact.title}
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </EscalationSection>
            </div>

            {/* Issue Details Section - Full Width */}
            <EscalationSection icon={AlertTriangle} title="Issue Details" subtitle="Describe the escalation" variant="danger">
              <div className="space-y-5 p-5 bg-charcoal-50/50 rounded-2xl border border-charcoal-100">
                {/* Issue Summary */}
                <div className="space-y-2">
                  <Label htmlFor="issueSummary" className="text-charcoal-700 font-medium text-sm">
                    Issue Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="issueSummary"
                    {...register('issueSummary')}
                    placeholder="Brief summary of the issue (10-200 characters)"
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center">
                    {errors.issueSummary ? (
                      <p className="text-xs text-red-500">{errors.issueSummary.message}</p>
                    ) : (
                      <p className="text-[11px] text-charcoal-400">
                        Concise summary of the issue
                      </p>
                    )}
                    <p className="text-[11px] text-charcoal-400">
                      {issueSummary.length}/200
                    </p>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <Label htmlFor="detailedDescription" className="text-charcoal-700 font-medium text-sm">
                    Detailed Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="detailedDescription"
                    {...register('detailedDescription')}
                    placeholder="Provide full details about the issue, including:&#10;&#10;• Context and background&#10;• Timeline of events&#10;• Affected parties&#10;• Current impact"
                    rows={5}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                  <div className="flex justify-between items-center">
                    {errors.detailedDescription ? (
                      <p className="text-xs text-red-500">{errors.detailedDescription.message}</p>
                    ) : (
                      <p className="text-[11px] text-charcoal-400">
                        Include all relevant details, timeline, and impact
                      </p>
                    )}
                    <p className="text-[11px] text-charcoal-400">
                      {detailedDescription.length} characters
                    </p>
                  </div>
                </div>

                {/* Immediate Actions Taken */}
                <div className="space-y-2">
                  <Label htmlFor="immediateActions" className="text-charcoal-700 font-medium text-sm">
                    Immediate Actions Taken
                    <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Optional)</span>
                  </Label>
                  <Textarea
                    id="immediateActions"
                    {...register('immediateActions')}
                    placeholder="What steps have already been taken to address this issue?"
                    rows={3}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                </div>

                {/* Root Cause Analysis */}
                <div className="space-y-2">
                  <Label htmlFor="rootCause" className="text-charcoal-700 font-medium text-sm">
                    Root Cause Analysis
                    <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Optional)</span>
                  </Label>
                  <Textarea
                    id="rootCause"
                    {...register('rootCause')}
                    placeholder="What caused this issue? Identify the underlying factors..."
                    rows={3}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                </div>

                {/* Resolution Plan */}
                <div className="space-y-2">
                  <Label htmlFor="resolutionPlan" className="text-charcoal-700 font-medium text-sm">
                    Resolution Plan
                    <span className="text-[10px] text-charcoal-400 font-normal ml-2">(Optional)</span>
                  </Label>
                  <Textarea
                    id="resolutionPlan"
                    {...register('resolutionPlan')}
                    placeholder="What is the plan to fully resolve this issue?"
                    rows={3}
                    className="rounded-xl border-charcoal-200 bg-white resize-none"
                  />
                </div>
              </div>
            </EscalationSection>
          </div>

          {/* Footer */}
          <DialogFooter className="px-8 py-5 bg-charcoal-50/50 border-t border-charcoal-100">
            <div className="flex items-center justify-between w-full">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm text-charcoal-600">
                {selectedEscalationType && (
                  <span className="flex items-center gap-1.5">
                    <selectedEscalationType.icon className="w-4 h-4" />
                    {selectedEscalationType.label}
                  </span>
                )}
                {selectedSeverity && (
                  <span className={cn('flex items-center gap-1.5 font-medium', selectedSeverity.color)}>
                    <selectedSeverity.icon className="w-4 h-4" />
                    {selectedSeverity.label}
                  </span>
                )}
                {clientImpact.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    {clientImpact.length} impact{clientImpact.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="h-11 px-5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createEscalationMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-900/20"
                >
                  {createEscalationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Create Escalation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
