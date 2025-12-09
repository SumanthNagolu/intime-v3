'use client'

/**
 * PCF-Compatible Section Adapters for Deals
 *
 * These wrapper components adapt the existing Deal section components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Deal, DEAL_STAGE_CONFIG, DEAL_HEALTH_CONFIG } from '../deals.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Phone,
  Mail,
  Users,
  FileText,
  PlusCircle,
  Target,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

/**
 * Dispatch a dialog open event for the Deal entity
 * The detail page listens for this and manages dialog state
 */
function dispatchDealDialog(dialogId: string, dealId: string) {
  window.dispatchEvent(
    new CustomEvent('openDealDialog', {
      detail: { dialogId, dealId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

const activityTypes = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'proposal_sent', label: 'Proposal Sent', icon: FileText },
  { value: 'contract_sent', label: 'Contract Sent', icon: FileText },
]

/**
 * Overview Section Adapter
 * Shows deal details, hiring needs, services, competition, and next action
 */
export function DealOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const router = useRouter()
  const deal = entity as Deal | undefined

  if (!deal) return null

  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
  const daysUntilClose = deal.expected_close_date
    ? differenceInDays(new Date(deal.expected_close_date), new Date())
    : null
  const companyName = deal.account?.name || deal.lead?.company_name || 'No Company'

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="col-span-2 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">
                Deal Value
              </p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-charcoal-500" />
                {(deal.value || 0).toLocaleString()}
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                {(deal as any).value_basis || 'annual'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">
                Probability
              </p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <Target className="h-5 w-5 text-charcoal-500" />
                {deal.probability || 0}%
              </p>
              <Progress value={deal.probability || 0} className="mt-2 h-1" />
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">
                Weighted Value
              </p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <TrendingUp className="h-5 w-5 text-charcoal-500" />$
                {(
                  ((deal.value || 0) * (deal.probability || 0)) /
                  100
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">
                Close Date
              </p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <Calendar className="h-5 w-5 text-charcoal-500" />
                {deal.expected_close_date
                  ? format(new Date(deal.expected_close_date), 'MMM d')
                  : 'TBD'}
              </p>
              {daysUntilClose !== null && !isClosed && (
                <p
                  className={cn(
                    'text-xs mt-1',
                    daysUntilClose < 0
                      ? 'text-red-600'
                      : daysUntilClose < 7
                        ? 'text-amber-600'
                        : 'text-charcoal-500'
                  )}
                >
                  {daysUntilClose < 0
                    ? `${Math.abs(daysUntilClose)} days overdue`
                    : `${daysUntilClose} days left`}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deal Details */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">
              Deal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-charcoal-500">Deal Type</p>
              <p className="font-medium capitalize">
                {deal.deal_type?.replace('_', ' ') || 'New Business'}
              </p>
            </div>
            <div>
              <p className="text-charcoal-500">Contract Length</p>
              <p className="font-medium">
                {deal.contract_length_months || 12} months
              </p>
            </div>
            <div>
              <p className="text-charcoal-500">Est. Placements</p>
              <p className="font-medium">{deal.estimated_placements || '-'}</p>
            </div>
            <div>
              <p className="text-charcoal-500">Avg Bill Rate</p>
              <p className="font-medium">
                {deal.avg_bill_rate ? `$${deal.avg_bill_rate}/hr` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Needs */}
        {(deal as any).hiring_needs && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">
                Hiring Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{(deal as any).hiring_needs}</p>
            </CardContent>
          </Card>
        )}

        {/* Services & Competition */}
        <div className="grid grid-cols-2 gap-6">
          {(deal as any).services_required &&
            (deal as any).services_required.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide">
                    Services Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(deal as any).services_required.map((service: string) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {(deal as any).competitors && (deal as any).competitors.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide">
                  Competitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(deal as any).competitors.map((competitor: string) => (
                    <Badge key={competitor} variant="outline">
                      {competitor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Action */}
        {deal.next_action && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Next Action</p>
                <p className="text-sm text-amber-700">
                  {deal.next_action}
                  {deal.next_action_date && (
                    <span className="ml-2 text-amber-600">
                      Due: {format(new Date(deal.next_action_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Quick Info */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">
              Quick Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account/Lead */}
            {(deal.account || deal.lead) && (
              <div>
                <p className="text-xs text-charcoal-500 mb-1">
                  {deal.account ? 'Account' : 'Lead'}
                </p>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => {
                    if (deal.account) {
                      router.push(`/employee/recruiting/accounts/${deal.account.id}`)
                    } else if (deal.lead) {
                      router.push(`/employee/crm/leads/${deal.lead.id}`)
                    }
                  }}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="truncate">{companyName}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </div>
            )}

            <Separator />

            {/* Owner */}
            {deal.owner && (
              <div>
                <p className="text-xs text-charcoal-500 mb-2">Owner</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center text-xs font-medium">
                    {deal.owner.full_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deal.owner.full_name}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Health Status */}
            {deal.health_status && (
              <div>
                <p className="text-xs text-charcoal-500 mb-1">Health</p>
                <Badge
                  className={cn(
                    'text-xs',
                    DEAL_HEALTH_CONFIG[deal.health_status]?.color
                  )}
                >
                  {DEAL_HEALTH_CONFIG[deal.health_status]?.label || deal.health_status}
                </Badge>
              </div>
            )}

            <Separator />

            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Created</span>
                <span>
                  {deal.created_at
                    ? format(new Date(deal.created_at), 'MMM d, yyyy')
                    : '-'}
                </span>
              </div>
              {(deal as any).last_activity_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Last Activity</span>
                  <span>
                    {format(new Date((deal as any).last_activity_at), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {deal.closed_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Closed</span>
                  <span>{format(new Date(deal.closed_at), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {deal.notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-600">{deal.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const activitySchema = z.object({
  activityType: z.enum([
    'call',
    'email',
    'meeting',
    'note',
    'proposal_sent',
    'contract_sent',
  ]),
  description: z.string().min(1, 'Description is required'),
  outcome: z
    .enum(['positive', 'neutral', 'negative', 'no_response', 'scheduled', 'completed'])
    .optional(),
})

type ActivityFormValues = z.infer<typeof activitySchema>

/**
 * Activity Section Adapter
 * Shows activity timeline with inline logging
 */
export function DealActivitySectionPCF({ entityId, entity }: PCFSectionProps) {
  const { toast } = useToast()
  const deal = entity as Deal | undefined
  const utils = trpc.useUtils()

  const logActivity = trpc.crm.deals.logActivity.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity logged', description: 'Activity has been recorded' })
      utils.crm.deals.getById.invalidate({ id: entityId })
      activityForm.reset()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const activityForm = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityType: 'note',
      description: '',
    },
  })

  const handleLogActivity = (data: ActivityFormValues) => {
    logActivity.mutate({
      dealId: entityId,
      activityType: data.activityType,
      description: data.description,
      outcome: data.outcome,
    })
  }

  const activities = (deal as any)?.activities || []

  return (
    <div className="space-y-6">
      {/* Log Activity Form */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wide">
            Log Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={activityForm.handleSubmit(handleLogActivity)}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <div className="w-40">
                <Select
                  value={activityForm.watch('activityType')}
                  onValueChange={(val: any) =>
                    activityForm.setValue('activityType', val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="What happened?"
                  {...activityForm.register('description')}
                  rows={2}
                />
                {activityForm.formState.errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {activityForm.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Select
                value={activityForm.watch('outcome') || ''}
                onValueChange={(val: any) =>
                  activityForm.setValue('outcome', val || undefined)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Outcome (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={logActivity.isPending} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                {logActivity.isPending ? 'Logging...' : 'Log Activity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide">
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-charcoal-500 text-center py-8">
              No activities logged yet
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map(
                (activity: {
                  id: string
                  activity_type: string
                  subject?: string
                  description?: string
                  outcome?: string
                  created_at: string
                  creator?: { full_name: string; avatar_url?: string }
                }) => {
                  const activityConfig = activityTypes.find(
                    (a) => a.value === activity.activity_type
                  )
                  const Icon = activityConfig?.icon || FileText
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-charcoal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {activity.subject || activityConfig?.label}
                          </span>
                          {activity.outcome && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.outcome.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-charcoal-600 mt-1">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-charcoal-500 mt-1">
                          {activity.creator?.full_name} •{' '}
                          {format(
                            new Date(activity.created_at),
                            'MMM d, yyyy h:mm a'
                          )}
                        </p>
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Roles Section Adapter
 * Shows roles breakdown for the deal
 */
export function DealRolesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const deal = entity as Deal | undefined
  const roles = (deal as any)?.roles_breakdown || []

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wide">
            Roles Breakdown
          </CardTitle>
          <Button
            size="sm"
            onClick={() => dispatchDealDialog('addRole', entityId)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="text-sm text-charcoal-500 text-center py-8">
            No roles defined
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map(
              (
                role: {
                  title: string
                  quantity: number
                  minRate?: number
                  maxRate?: number
                  billRate?: number
                  priority?: string
                },
                index: number
              ) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-charcoal-500" />
                    <div>
                      <p className="font-medium">{role.title}</p>
                      <p className="text-sm text-charcoal-500">
                        Qty: {role.quantity}
                        {role.priority && ` • ${role.priority} priority`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {(role.minRate || role.maxRate || role.billRate) && (
                      <p className="font-medium">
                        {role.billRate
                          ? `$${role.billRate}/hr`
                          : `$${role.minRate || 0} - $${role.maxRate || 0}/hr`}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * History Section Adapter
 * Shows stage history
 */
export function DealHistorySectionPCF({ entityId, entity }: PCFSectionProps) {
  const deal = entity as Deal | undefined
  const stageHistory = (deal as any)?.stageHistory || []

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide">
          Stage History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stageHistory.length === 0 ? (
          <p className="text-sm text-charcoal-500 text-center py-8">
            No stage history
          </p>
        ) : (
          <div className="space-y-4">
            {stageHistory.map(
              (
                history: {
                  id?: string
                  stage: string
                  entered_at: string
                  exited_at?: string
                  changed_by_user?: { full_name: string }
                },
                index: number
              ) => {
                const stageInfo = DEAL_STAGE_CONFIG[history.stage]
                return (
                  <div key={history.id || index} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full',
                        stageInfo?.bgColor || 'bg-charcoal-300'
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {stageInfo?.label || history.stage}
                      </p>
                      <p className="text-xs text-charcoal-500">
                        Entered:{' '}
                        {format(new Date(history.entered_at), 'MMM d, yyyy h:mm a')}
                        {history.exited_at &&
                          ` • Exited: ${format(
                            new Date(history.exited_at),
                            'MMM d, yyyy h:mm a'
                          )}`}
                      </p>
                      {history.changed_by_user && (
                        <p className="text-xs text-charcoal-500">
                          By: {history.changed_by_user.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                )
              }
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Tasks Section Adapter
 */
export function DealTasksSectionPCF({ entityId, entity }: PCFSectionProps) {
  const deal = entity as Deal | undefined
  const tasks = (deal as any)?.tasks || []

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wide">
            Tasks ({tasks.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => dispatchDealDialog('createTask', entityId)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-charcoal-500 text-center py-8">
            No tasks assigned to this deal
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 10).map(
              (task: {
                id: string
                title: string
                due_date?: string
                status: string
                priority?: string
              }) => (
                <div
                  key={task.id}
                  className={cn(
                    'p-2 rounded-lg border text-sm',
                    task.status === 'completed' && 'bg-green-50 border-green-200'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'font-medium truncate',
                          task.status === 'completed' &&
                            'line-through text-charcoal-500'
                        )}
                      >
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-charcoal-500">
                          Due: {format(new Date(task.due_date), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

