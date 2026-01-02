'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
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
  Gavel,
  Zap,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  History,
  Lightbulb,
  CheckCircle,
  Star,
  ListTodo,
  Calendar,
  User,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { AccountEscalation, EscalationType, EscalationSeverity, EscalationStatus, ClientSatisfaction } from '@/types/workspace'

// =============================================================================
// TYPES & SCHEMA
// =============================================================================

const editEscalationSchema = z.object({
  escalationType: z.enum([
    'service_issue',
    'billing_dispute',
    'quality_concern',
    'communication_breakdown',
    'contract_violation',
    'resource_issue',
    'timeline_delay',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['open', 'in_progress', 'resolved', 'escalated', 'closed']),
  issueSummary: z.string().min(10).max(500),
  detailedDescription: z.string().optional(),
  clientImpact: z.array(z.string()).optional(),
  rootCause: z.string().optional(),
  immediateActions: z.string().optional(),
  resolutionPlan: z.string().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
})

const resolutionSchema = z.object({
  resolutionSummary: z.string().min(10, 'Resolution summary must be at least 10 characters'),
  resolutionActions: z.string().optional(),
  clientSatisfaction: z.enum(['very_satisfied', 'satisfied', 'neutral', 'unsatisfied'] as const).optional().nullable(),
  lessonsLearned: z.string().optional(),
  preventiveMeasures: z.string().optional(),
})

type EditEscalationFormData = z.infer<typeof editEscalationSchema>
type ResolutionFormData = z.infer<typeof resolutionSchema>

interface EditEscalationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  escalation: AccountEscalation
  accountId: string
  onSuccess?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ESCALATION_TYPES = [
  { value: 'quality_concern' as const, label: 'Quality Concern', icon: Target },
  { value: 'service_issue' as const, label: 'Service Issue', icon: Shield },
  { value: 'billing_dispute' as const, label: 'Billing Dispute', icon: DollarSign },
  { value: 'communication_breakdown' as const, label: 'Communication', icon: MessageSquare },
  { value: 'contract_violation' as const, label: 'Contract', icon: Gavel },
  { value: 'resource_issue' as const, label: 'Resource Issue', icon: Users },
  { value: 'timeline_delay' as const, label: 'Timeline Delay', icon: Clock },
  { value: 'other' as const, label: 'Other', icon: MoreHorizontal },
] as const

const SEVERITY_LEVELS = [
  { value: 'low' as const, label: 'Low', icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { value: 'medium' as const, label: 'Medium', icon: AlertCircle, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { value: 'high' as const, label: 'High', icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { value: 'critical' as const, label: 'Critical', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
] as const

const STATUS_OPTIONS = [
  { value: 'open' as const, label: 'Open', color: 'bg-amber-100 text-amber-700' },
  { value: 'in_progress' as const, label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'escalated' as const, label: 'Escalated', color: 'bg-purple-100 text-purple-700' },
  { value: 'resolved' as const, label: 'Resolved', color: 'bg-green-100 text-green-700' },
  { value: 'closed' as const, label: 'Closed', color: 'bg-charcoal-100 text-charcoal-600' },
] as const

const IMPACT_OPTIONS = [
  { value: 'revenue_at_risk', label: 'Revenue at Risk' },
  { value: 'relationship_damage', label: 'Relationship Damage' },
  { value: 'legal_compliance', label: 'Legal/Compliance Issue' },
  { value: 'timeline_impact', label: 'Timeline Impact' },
  { value: 'reputation_damage', label: 'Reputation Damage' },
] as const

const SATISFACTION_OPTIONS = [
  { value: 'very_satisfied' as const, label: 'Very Satisfied', icon: Star, color: 'text-green-600' },
  { value: 'satisfied' as const, label: 'Satisfied', icon: CheckCircle, color: 'text-green-500' },
  { value: 'neutral' as const, label: 'Neutral', icon: AlertCircle, color: 'text-charcoal-500' },
  { value: 'unsatisfied' as const, label: 'Dissatisfied', icon: XCircle, color: 'text-red-500' },
] as const

// =============================================================================
// HELPER
// =============================================================================

function mapEscalationType(type: EscalationType): EditEscalationFormData['escalationType'] {
  // Map frontend type to form type
  const mapping: Record<string, EditEscalationFormData['escalationType']> = {
    'service_issue': 'service_issue',
    'billing_dispute': 'billing_dispute',
    'quality_concern': 'quality_concern',
    'communication_breakdown': 'communication_breakdown',
    'contract_violation': 'contract_violation',
    'resource_issue': 'resource_issue',
    'timeline_delay': 'timeline_delay',
    'other': 'other',
  }
  return mapping[type] || 'other'
}

function mapStatus(status: EscalationStatus): EditEscalationFormData['status'] {
  // Map frontend status to form status (handle 'pending_client' from older data)
  if (status === 'pending_client') return 'in_progress'
  return status as EditEscalationFormData['status']
}

function mapSeverity(severity: EscalationSeverity): EditEscalationFormData['severity'] {
  return severity as EditEscalationFormData['severity']
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EditEscalationDialog({
  open,
  onOpenChange,
  escalation,
  accountId,
  onSuccess,
}: EditEscalationDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [activeTab, setActiveTab] = useState<'details' | 'analysis' | 'resolution' | 'updates' | 'actions'>('details')
  const [newUpdateContent, setNewUpdateContent] = useState('')
  const [showResolutionForm, setShowResolutionForm] = useState(false)

  // Fetch org members for assignment
  const orgMembersQuery = trpc.users.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: open }
  )

  // Fetch escalation with updates
  const escalationQuery = trpc.crm.escalations.getById.useQuery(
    { id: escalation.id },
    { enabled: open }
  )

  const updates = escalationQuery.data?.updates || []

  // Action Items state and queries
  const [showActionItemForm, setShowActionItemForm] = useState(false)
  const [newActionItem, setNewActionItem] = useState({
    subject: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  })

  // Fetch action items (activities linked to this escalation)
  const actionItemsQuery = trpc.crm.activities.listByEntity.useQuery(
    { entityType: 'escalation', entityId: escalation.id },
    { enabled: open }
  )

  const actionItems = actionItemsQuery.data || []

  // Create action item mutation
  const createActionItemMutation = trpc.crm.activities.createTask.useMutation({
    onSuccess: () => {
      toast({
        title: 'Action item created',
        description: 'The action item has been added to this escalation.',
      })
      setShowActionItemForm(false)
      setNewActionItem({
        subject: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
      })
      utils.crm.activities.listByEntity.invalidate({ entityType: 'escalation', entityId: escalation.id })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create action item.',
        variant: 'error',
      })
    },
  })

  const handleCreateActionItem = () => {
    if (!newActionItem.subject.trim()) {
      toast({
        title: 'Subject required',
        description: 'Please enter a subject for the action item.',
        variant: 'error',
      })
      return
    }
    createActionItemMutation.mutate({
      entityType: 'escalation',
      entityId: escalation.id,
      subject: newActionItem.subject.trim(),
      description: newActionItem.description.trim() || undefined,
      assignedTo: newActionItem.assignedTo || undefined,
      dueDate: newActionItem.dueDate ? new Date(newActionItem.dueDate).toISOString() : undefined,
      priority: newActionItem.priority,
    })
  }

  // Complete action item mutation
  const completeActionItemMutation = trpc.crm.activities.completeTask.useMutation({
    onSuccess: () => {
      toast({
        title: 'Action item completed',
        description: 'The action item has been marked as complete.',
      })
      utils.crm.activities.listByEntity.invalidate({ entityType: 'escalation', entityId: escalation.id })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete action item.',
        variant: 'error',
      })
    },
  })

  const handleToggleComplete = (itemId: string, currentStatus: string) => {
    if (currentStatus !== 'completed') {
      completeActionItemMutation.mutate({ id: itemId })
    }
  }

  // Main form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditEscalationFormData>({
    resolver: zodResolver(editEscalationSchema),
    defaultValues: {
      escalationType: mapEscalationType(escalation.escalationType),
      severity: mapSeverity(escalation.severity),
      status: mapStatus(escalation.status),
      issueSummary: escalation.issueSummary || '',
      detailedDescription: escalation.detailedDescription || '',
      clientImpact: escalation.clientImpact || [],
      rootCause: escalation.rootCause || '',
      immediateActions: escalation.immediateActions || '',
      resolutionPlan: escalation.resolutionPlan || '',
      assignedTo: escalation.assignedTo?.id || null,
    },
  })

  // Resolution form
  const {
    register: registerResolution,
    handleSubmit: handleResolutionSubmit,
    watch: watchResolution,
    setValue: setResolutionValue,
    formState: { errors: resolutionErrors },
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      resolutionSummary: escalation.resolutionSummary || '',
      resolutionActions: escalation.resolutionActions || '',
      // Map old 'dissatisfied'/'very_dissatisfied' to 'unsatisfied'
      clientSatisfaction: escalation.clientSatisfaction === 'dissatisfied' || escalation.clientSatisfaction === 'very_dissatisfied' 
        ? 'unsatisfied' 
        : (escalation.clientSatisfaction as ResolutionFormData['clientSatisfaction']) || null,
      lessonsLearned: escalation.lessonsLearned || '',
      preventiveMeasures: escalation.preventiveMeasures || '',
    },
  })

  const status = watch('status')
  const severity = watch('severity')
  const clientImpact = watch('clientImpact') || []
  const issueSummary = watch('issueSummary') || ''

  // Reset form when escalation changes
  useEffect(() => {
    if (open && escalation) {
      reset({
        escalationType: mapEscalationType(escalation.escalationType),
        severity: mapSeverity(escalation.severity),
        status: mapStatus(escalation.status),
        issueSummary: escalation.issueSummary || '',
        detailedDescription: escalation.detailedDescription || '',
        clientImpact: escalation.clientImpact || [],
        rootCause: escalation.rootCause || '',
        immediateActions: escalation.immediateActions || '',
        resolutionPlan: escalation.resolutionPlan || '',
        assignedTo: escalation.assignedTo?.id || null,
      })
    }
  }, [open, escalation, reset])

  // Update mutation
  const updateMutation = trpc.crm.escalations.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Escalation updated',
        description: 'Your changes have been saved.',
      })
      utils.crm.escalations.listByAccount.invalidate({ accountId })
      utils.crm.escalations.getById.invalidate({ id: escalation.id })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update escalation.',
        variant: 'error',
      })
    },
  })

  // Add update mutation
  const addUpdateMutation = trpc.crm.escalations.addUpdate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Update added',
        description: 'Your note has been added to the escalation.',
      })
      setNewUpdateContent('')
      utils.crm.escalations.getById.invalidate({ id: escalation.id })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add update.',
        variant: 'error',
      })
    },
  })

  // Resolve mutation
  const resolveMutation = trpc.crm.escalations.resolve.useMutation({
    onSuccess: () => {
      toast({
        title: 'Escalation resolved',
        description: 'The escalation has been marked as resolved.',
      })
      utils.crm.escalations.listByAccount.invalidate({ accountId })
      utils.crm.escalations.getById.invalidate({ id: escalation.id })
      setShowResolutionForm(false)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve escalation.',
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: EditEscalationFormData) => {
    updateMutation.mutate({
      id: escalation.id,
      severity: data.severity,
      status: data.status,
      assignedTo: data.assignedTo || undefined,
      resolutionPlan: data.resolutionPlan || undefined,
      rootCause: data.rootCause || undefined,
      immediateActions: data.immediateActions || undefined,
    })
  }

  const onResolve = (data: ResolutionFormData) => {
    resolveMutation.mutate({
      id: escalation.id,
      resolutionSummary: data.resolutionSummary,
      resolutionActions: data.resolutionActions || undefined,
      clientSatisfaction: data.clientSatisfaction || undefined,
      lessonsLearned: data.lessonsLearned || undefined,
      preventiveMeasures: data.preventiveMeasures || undefined,
    })
  }

  const handleAddUpdate = () => {
    if (!newUpdateContent.trim()) return
    addUpdateMutation.mutate({
      escalationId: escalation.id,
      content: newUpdateContent.trim(),
      updateType: 'note',
      isInternal: true,
    })
  }

  const toggleImpact = (impact: string) => {
    const current = clientImpact || []
    if (current.includes(impact)) {
      setValue('clientImpact', current.filter((i) => i !== impact))
    } else {
      setValue('clientImpact', [...current, impact])
    }
  }

  const selectedSeverity = SEVERITY_LEVELS.find((s) => s.value === severity)
  const isResolved = escalation.status === 'resolved' || escalation.status === 'closed'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-charcoal-50 via-white to-red-50/30 border-b border-charcoal-100">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-amber-500" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {escalation.escalationNumber}
                </Badge>
                <Badge className={cn(
                  STATUS_OPTIONS.find(s => s.value === escalation.status)?.color,
                  'text-xs'
                )}>
                  {STATUS_OPTIONS.find(s => s.value === escalation.status)?.label}
                </Badge>
                {selectedSeverity && (
                  <Badge className={cn(selectedSeverity.bgColor, selectedSeverity.color, 'text-xs')}>
                    <selectedSeverity.icon className="w-3 h-3 mr-1" />
                    {selectedSeverity.label}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold text-charcoal-900 mt-1 truncate">
                {escalation.subject || escalation.issueSummary}
              </h2>
              <p className="text-sm text-charcoal-500">
                Created {formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })} by {escalation.createdBy.name}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-charcoal-100 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'details', label: 'Details', icon: AlertTriangle },
              { id: 'analysis', label: 'Analysis', icon: Target },
              { id: 'resolution', label: 'Resolution', icon: CheckCircle2 },
              { id: 'updates', label: `Updates (${updates.length})`, icon: History },
              { id: 'actions', label: 'Action Items', icon: ListTodo },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-red-700 border border-charcoal-200'
                    : 'text-charcoal-600 hover:bg-charcoal-100'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Severity & Status */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Severity */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Severity</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEVERITY_LEVELS.map((level) => {
                        const Icon = level.icon
                        const isSelected = severity === level.value
                        return (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setValue('severity', level.value)}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                              isSelected
                                ? `${level.bgColor} border-current ${level.color}`
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', isSelected ? level.color : 'text-charcoal-400')} />
                            <span className={cn('text-sm font-medium', isSelected ? level.color : 'text-charcoal-700')}>
                              {level.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter(s => !isResolved || s.value === escalation.status).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (opt.value === 'resolved' || opt.value === 'closed') {
                              // Switch to Resolution tab for resolve/close actions
                              setActiveTab('resolution')
                            } else {
                              setValue('status', opt.value)
                            }
                          }}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium transition-all',
                            status === opt.value
                              ? `${opt.color} ring-2 ring-offset-2 ring-red-300`
                              : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200',
                            (opt.value === 'resolved' || opt.value === 'closed') && 'border-2 border-dashed border-green-300 hover:bg-green-50'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <Select
                    value={watch('assignedTo') || '_unassigned'}
                    onValueChange={(v) => setValue('assignedTo', v === '_unassigned' ? null : v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_unassigned">Unassigned</SelectItem>
                      {orgMembersQuery.data?.items?.map((member: { id: string; full_name: string }) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Issue Summary */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Issue Summary <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('issueSummary')}
                    className="h-11 rounded-xl"
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-charcoal-500">
                    {errors.issueSummary ? (
                      <span className="text-red-500">{errors.issueSummary.message}</span>
                    ) : (
                      <span>Brief summary of the issue</span>
                    )}
                    <span>{issueSummary.length}/500</span>
                  </div>
                </div>

                {/* Client Impact */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Client Impact</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPACT_OPTIONS.map((option) => {
                      const isSelected = clientImpact.includes(option.value)
                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all',
                            isSelected
                              ? 'bg-red-50 border-red-300'
                              : 'border-charcoal-200 hover:border-charcoal-300'
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
                          <span className={cn('text-sm', isSelected ? 'text-red-700 font-medium' : 'text-charcoal-700')}>
                            {option.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Detailed Description</Label>
                  <Textarea
                    {...register('detailedDescription')}
                    rows={4}
                    className="rounded-xl resize-none"
                    placeholder="Full details about the issue..."
                  />
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Root Cause */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Root Cause Analysis
                  </Label>
                  <Textarea
                    {...register('rootCause')}
                    rows={4}
                    className="rounded-xl resize-none"
                    placeholder="What caused this issue? Identify the underlying factors..."
                  />
                </div>

                {/* Immediate Actions */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Immediate Actions Taken
                  </Label>
                  <Textarea
                    {...register('immediateActions')}
                    rows={3}
                    className="rounded-xl resize-none"
                    placeholder="What steps were taken immediately to address the issue?"
                  />
                </div>

                {/* Resolution Plan */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Resolution Plan
                  </Label>
                  <Textarea
                    {...register('resolutionPlan')}
                    rows={4}
                    className="rounded-xl resize-none"
                    placeholder="What is the plan to fully resolve this issue?"
                  />
                </div>
              </div>
            )}

            {/* Resolution Tab */}
            {activeTab === 'resolution' && (
              <div className="space-y-6">
                {isResolved ? (
                  // Show resolution details
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">Resolved</span>
                      </div>
                      {escalation.resolvedAt && (
                        <p className="text-sm text-green-600">
                          {format(new Date(escalation.resolvedAt), 'PPP')} by {escalation.resolvedBy?.name || 'Unknown'}
                        </p>
                      )}
                    </div>

                    {escalation.resolutionSummary && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Resolution Summary</Label>
                        <div className="p-4 bg-charcoal-50 rounded-xl">
                          <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                            {escalation.resolutionSummary}
                          </p>
                        </div>
                      </div>
                    )}

                    {escalation.clientSatisfaction && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Client Satisfaction</Label>
                        <Badge className={cn(
                          'text-sm py-1 px-3',
                          SATISFACTION_OPTIONS.find(s => s.value === escalation.clientSatisfaction)?.color || ''
                        )}>
                          {SATISFACTION_OPTIONS.find(s => s.value === escalation.clientSatisfaction)?.label}
                        </Badge>
                      </div>
                    )}

                    {escalation.lessonsLearned && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Lessons Learned
                        </Label>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                            {escalation.lessonsLearned}
                          </p>
                        </div>
                      </div>
                    )}

                    {escalation.preventiveMeasures && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Preventive Measures
                        </Label>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                            {escalation.preventiveMeasures}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : showResolutionForm ? (
                  // Resolution form
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Mark as Resolved
                      </h3>
                      <p className="text-sm text-green-600 mt-1">
                        Complete the resolution details below
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Resolution Summary <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        {...registerResolution('resolutionSummary')}
                        rows={4}
                        className="rounded-xl resize-none"
                        placeholder="Describe how the issue was resolved..."
                      />
                      {resolutionErrors.resolutionSummary && (
                        <p className="text-xs text-red-500">{resolutionErrors.resolutionSummary.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Resolution Actions</Label>
                      <Textarea
                        {...registerResolution('resolutionActions')}
                        rows={3}
                        className="rounded-xl resize-none"
                        placeholder="What specific actions were taken?"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Client Satisfaction</Label>
                      <div className="flex flex-wrap gap-2">
                        {SATISFACTION_OPTIONS.map((opt) => {
                          const isSelected = watchResolution('clientSatisfaction') === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setResolutionValue('clientSatisfaction', opt.value)}
                              className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                                isSelected
                                  ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                                  : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                              )}
                            >
                              <opt.icon className={cn('w-4 h-4', isSelected && opt.color)} />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Lessons Learned
                      </Label>
                      <Textarea
                        {...registerResolution('lessonsLearned')}
                        rows={3}
                        className="rounded-xl resize-none"
                        placeholder="What can we learn from this escalation?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Preventive Measures
                      </Label>
                      <Textarea
                        {...registerResolution('preventiveMeasures')}
                        rows={3}
                        className="rounded-xl resize-none"
                        placeholder="How can we prevent this from happening again?"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowResolutionForm(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleResolutionSubmit(onResolve)()}
                        disabled={resolveMutation.isPending}
                        className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {resolveMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Resolved
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Prompt to resolve
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                      Ready to resolve this escalation?
                    </h3>
                    <p className="text-charcoal-500 mb-6 max-w-md mx-auto">
                      Document how the issue was resolved, capture lessons learned, and record client satisfaction.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowResolutionForm(true)}
                      className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Start Resolution
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Updates Tab */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                {/* Add Update */}
                <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200">
                  <Label className="text-sm font-medium mb-2 block">Add Update</Label>
                  <Textarea
                    value={newUpdateContent}
                    onChange={(e) => setNewUpdateContent(e.target.value)}
                    rows={3}
                    className="rounded-xl resize-none mb-3"
                    placeholder="Add a note or status update..."
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddUpdate}
                      disabled={!newUpdateContent.trim() || addUpdateMutation.isPending}
                      className="rounded-lg"
                    >
                      {addUpdateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-1" />
                      )}
                      Add Update
                    </Button>
                  </div>
                </div>

                {/* Updates Timeline */}
                {updates.length > 0 ? (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Activity Timeline</Label>
                    <div className="space-y-3">
                      {updates.map((update: {
                        id: string
                        update_type: string
                        content: string
                        created_at: string
                        old_status?: string
                        new_status?: string
                        author?: { full_name: string; avatar_url?: string }
                      }) => (
                        <div
                          key={update.id}
                          className={cn(
                            'flex gap-3 p-4 rounded-xl border',
                            update.update_type === 'status_change'
                              ? 'bg-blue-50 border-blue-200'
                              : update.update_type === 'resolution_update'
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-charcoal-200'
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {update.author?.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-charcoal-900">
                                {update.author?.full_name || 'System'}
                              </span>
                              <span className="text-xs text-charcoal-500">
                                {formatDistanceToNow(parseISO(update.created_at), { addSuffix: true })}
                              </span>
                              {update.update_type === 'status_change' && (
                                <Badge variant="outline" className="text-[10px] bg-blue-100">
                                  Status Change
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-charcoal-700">{update.content}</p>
                            {update.old_status && update.new_status && (
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <Badge className={STATUS_OPTIONS.find(s => s.value === update.old_status)?.color}>
                                  {STATUS_OPTIONS.find(s => s.value === update.old_status)?.label}
                                </Badge>
                                <span className="text-charcoal-400">→</span>
                                <Badge className={STATUS_OPTIONS.find(s => s.value === update.new_status)?.color}>
                                  {STATUS_OPTIONS.find(s => s.value === update.new_status)?.label}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-charcoal-50 rounded-xl">
                    <History className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <p className="text-charcoal-600 font-medium">No updates yet</p>
                    <p className="text-sm text-charcoal-500 mt-1">
                      Add the first update above
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Items Tab */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Create Action Item Form */}
                {showActionItemForm ? (
                  <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">New Action Item</Label>
                      <button
                        type="button"
                        onClick={() => setShowActionItemForm(false)}
                        className="text-charcoal-400 hover:text-charcoal-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Action item subject..."
                        value={newActionItem.subject}
                        onChange={(e) => setNewActionItem({ ...newActionItem, subject: e.target.value })}
                        className="rounded-lg"
                      />
                      <Textarea
                        placeholder="Description (optional)..."
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                        rows={2}
                        className="rounded-lg resize-none"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-charcoal-500 mb-1 block">Assigned To</Label>
                          <Select
                            value={newActionItem.assignedTo}
                            onValueChange={(value) => setNewActionItem({ ...newActionItem, assignedTo: value })}
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {orgMembersQuery.data?.items?.map((member: { id: string; full_name: string }) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-charcoal-500 mb-1 block">Due Date</Label>
                          <Input
                            type="date"
                            value={newActionItem.dueDate}
                            onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-charcoal-500 mb-1 block">Priority</Label>
                          <Select
                            value={newActionItem.priority}
                            onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') =>
                              setNewActionItem({ ...newActionItem, priority: value })
                            }
                          >
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowActionItemForm(false)}
                        className="rounded-lg"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateActionItem}
                        disabled={createActionItemMutation.isPending}
                        className="rounded-lg"
                      >
                        {createActionItemMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-1" />
                        )}
                        Create
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowActionItemForm(true)}
                    className="w-full rounded-xl border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action Item
                  </Button>
                )}

                {/* Action Items List */}
                {actionItemsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
                  </div>
                ) : actionItems.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Action Items ({actionItems.length})</Label>
                    {actionItems.map((item: {
                      id: string
                      subject: string
                      description?: string
                      status: string
                      priority: string
                      due_date?: string
                      assignee?: { id: string; full_name: string; avatar_url?: string }
                      created_at: string
                    }) => (
                      <div
                        key={item.id}
                        className={cn(
                          'p-4 rounded-xl border',
                          item.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : item.priority === 'urgent'
                            ? 'bg-red-50 border-red-200'
                            : item.priority === 'high'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-white border-charcoal-200'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(item.id, item.status)}
                            disabled={item.status === 'completed' || completeActionItemMutation.isPending}
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                              item.status === 'completed'
                                ? 'border-green-500 bg-green-500 cursor-default'
                                : 'border-charcoal-300 hover:border-green-400 hover:bg-green-50 cursor-pointer'
                            )}
                          >
                            {item.status === 'completed' && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                'text-sm font-medium',
                                item.status === 'completed'
                                  ? 'text-charcoal-500 line-through'
                                  : 'text-charcoal-900'
                              )}>
                                {item.subject}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px]',
                                  item.priority === 'urgent' && 'bg-red-100 text-red-700 border-red-300',
                                  item.priority === 'high' && 'bg-orange-100 text-orange-700 border-orange-300',
                                  item.priority === 'medium' && 'bg-blue-100 text-blue-700 border-blue-300',
                                  item.priority === 'low' && 'bg-charcoal-100 text-charcoal-600'
                                )}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            {item.description && (
                              <p className="text-sm text-charcoal-600 mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-charcoal-500">
                              {item.assignee && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.assignee.full_name}
                                </span>
                              )}
                              {item.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(parseISO(item.due_date), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-charcoal-50 rounded-xl">
                    <ListTodo className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <p className="text-charcoal-600 font-medium">No action items yet</p>
                    <p className="text-sm text-charcoal-500 mt-1">
                      Add action items to track tasks for this escalation
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab !== 'resolution' && (
            <DialogFooter className="px-6 py-4 bg-charcoal-50 border-t border-charcoal-100">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-charcoal-500">
                  {isDirty && <span className="text-amber-600">• Unsaved changes</span>}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

