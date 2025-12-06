'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Edit,
  Copy,
  Power,
  PowerOff,
  Trash2,
  Timer,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar,
  User,
  Mail,
  Loader2,
  Target,
  PlayCircle,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

// Status colors
const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Active' },
  draft: { color: 'bg-amber-100 text-amber-800', icon: <Clock className="w-4 h-4" />, label: 'Draft' },
  disabled: { color: 'bg-charcoal-100 text-charcoal-600', icon: <PowerOff className="w-4 h-4" />, label: 'Disabled' },
}

// Event status colors
const EVENT_STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
  warning: { color: 'bg-amber-100 text-amber-800', icon: <AlertTriangle className="w-4 h-4" />, label: 'Warning' },
  breach: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" />, label: 'Breach' },
  critical: { color: 'bg-red-200 text-red-900', icon: <XCircle className="w-4 h-4" />, label: 'Critical' },
  met: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Met' },
  cancelled: { color: 'bg-charcoal-100 text-charcoal-600', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
}

// Category labels
const CATEGORY_LABELS: Record<string, string> = {
  response_time: 'Response Time',
  submission_speed: 'Submission Speed',
  interview_schedule: 'Interview Scheduling',
  interview_feedback: 'Interview Feedback',
  offer_response: 'Offer Response',
  onboarding: 'Onboarding',
  client_touch: 'Client Communication',
  candidate_followup: 'Candidate Follow-up',
  document_collection: 'Document Collection',
  timesheet_approval: 'Timesheet Approval',
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
  submissions: 'Submissions',
  placements: 'Placements',
  accounts: 'Accounts',
  leads: 'Leads',
  interviews: 'Interviews',
  offers: 'Offers',
}

interface SlaDetailPageProps {
  ruleId: string
}

export function SlaDetailPage({ ruleId }: SlaDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [applyRetroactive, setApplyRetroactive] = useState(false)

  // Query
  const ruleQuery = trpc.sla.getById.useQuery({ id: ruleId })
  const eventsQuery = trpc.sla.getEvents.useQuery({
    ruleId,
    page: 1,
    pageSize: 20,
  })

  // Mutations
  const activateMutation = trpc.sla.activate.useMutation({
    onSuccess: () => {
      utils.sla.getById.invalidate({ id: ruleId })
      utils.sla.list.invalidate()
      toast.success('SLA rule activated')
      setActivateDialogOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate SLA rule')
    },
  })

  const disableMutation = trpc.sla.disable.useMutation({
    onSuccess: () => {
      utils.sla.getById.invalidate({ id: ruleId })
      utils.sla.list.invalidate()
      toast.success('SLA rule disabled')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable SLA rule')
    },
  })

  const cloneMutation = trpc.sla.clone.useMutation({
    onSuccess: (data) => {
      utils.sla.list.invalidate()
      toast.success('SLA rule cloned')
      router.push(`/employee/admin/sla/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clone SLA rule')
    },
  })

  const deleteMutation = trpc.sla.delete.useMutation({
    onSuccess: () => {
      utils.sla.list.invalidate()
      toast.success('SLA rule deleted')
      router.push('/employee/admin/sla')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete SLA rule')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'SLA Config', href: '/employee/admin/sla' },
    { label: ruleQuery.data?.name || 'Loading...' },
  ]

  if (ruleQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  if (ruleQuery.error || !ruleQuery.data) {
    return (
      <DashboardShell title="Error" breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <XCircle className="w-12 h-12 mb-4" />
          <p>Failed to load SLA rule</p>
          <Button
            variant="outline"
            onClick={() => router.push('/employee/admin/sla')}
            className="mt-4"
          >
            Back to SLA Config
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const rule = ruleQuery.data
  const statusConfig = STATUS_CONFIG[rule.status] || STATUS_CONFIG.draft
  const isLoading = activateMutation.isPending || disableMutation.isPending || cloneMutation.isPending || deleteMutation.isPending

  const formatTargetTime = () => {
    const unit = rule.target_unit === 'business_hours' ? 'business hours' :
                 rule.target_unit === 'business_days' ? 'business days' :
                 rule.target_unit
    return `${rule.target_value} ${unit}`
  }

  // Calculate compliance from recent events
  const recentEvents = rule.recentEvents || []
  const metEvents = recentEvents.filter((e: { status: string }) => e.status === 'met').length
  const breachedEvents = recentEvents.filter((e: { status: string }) => ['breach', 'critical'].includes(e.status)).length
  const totalResolved = metEvents + breachedEvents
  const complianceRate = totalResolved > 0 ? Math.round((metEvents / totalResolved) * 100) : 100

  return (
    <DashboardShell
      title={rule.name}
      description={rule.description || 'SLA Rule Details'}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/employee/admin/sla')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {rule.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => router.push(`/employee/admin/sla/${ruleId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => cloneMutation.mutate({ id: ruleId })}
            disabled={isLoading}
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone
          </Button>
          {rule.status === 'draft' && (
            <Button
              onClick={() => setActivateDialogOpen(true)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Power className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
          {rule.status === 'active' && (
            <Button
              variant="outline"
              onClick={() => disableMutation.mutate({ id: ruleId })}
              disabled={isLoading}
            >
              <PowerOff className="w-4 h-4 mr-2" />
              Disable
            </Button>
          )}
          {rule.status === 'disabled' && (
            <Button
              onClick={() => setActivateDialogOpen(true)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Power className="w-4 h-4 mr-2" />
              Re-enable
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Stats */}
          {rule.status === 'active' && (
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Compliance"
                value={`${complianceRate}%`}
                icon={<TrendingUp className="w-5 h-5 text-charcoal-400" />}
                color={complianceRate >= 90 ? 'green' : complianceRate >= 70 ? 'amber' : 'red'}
              />
              <StatCard
                label="Met (30d)"
                value={metEvents}
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                color="green"
              />
              <StatCard
                label="Warning (30d)"
                value={recentEvents.filter((e: { status: string }) => e.status === 'warning').length}
                icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                color="amber"
              />
              <StatCard
                label="Breach (30d)"
                value={breachedEvents}
                icon={<XCircle className="w-5 h-5 text-red-600" />}
                color="red"
              />
            </div>
          )}

          {/* Rule Configuration */}
          <DashboardSection title="Configuration">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Category</label>
                  <p className="text-charcoal-800 font-medium">
                    {CATEGORY_LABELS[rule.category] || rule.category}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Entity Type</label>
                  <p className="text-charcoal-800 font-medium">
                    {ENTITY_TYPE_LABELS[rule.entity_type] || rule.entity_type}
                  </p>
                </div>
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Target Time</label>
                  <p className="text-charcoal-800 font-medium flex items-center gap-2">
                    <Timer className="w-4 h-4 text-charcoal-400" />
                    {formatTargetTime()}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Clock Starts</label>
                  <p className="text-charcoal-800 font-medium">{rule.start_event}</p>
                </div>
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Clock Stops</label>
                  <p className="text-charcoal-800 font-medium">{rule.end_event}</p>
                </div>
                <div>
                  <label className="text-xs uppercase text-charcoal-400 font-medium">Time Options</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rule.business_hours_only && (
                      <Badge variant="secondary">Business Hours</Badge>
                    )}
                    {rule.exclude_weekends && (
                      <Badge variant="secondary">Exclude Weekends</Badge>
                    )}
                    {rule.pause_on_hold && (
                      <Badge variant="secondary">Pause on Hold</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>

          {/* Escalation Levels */}
          <DashboardSection title="Escalation Levels">
            <div className="space-y-3">
              {rule.escalation_levels && rule.escalation_levels.length > 0 ? (
                rule.escalation_levels.map((level: {
                  id: string
                  level_number: number
                  level_name: string
                  trigger_percentage: number
                  badge_color: string
                  notify_email: boolean
                  email_recipients: string[]
                  show_badge: boolean
                  add_to_report: boolean
                  add_to_dashboard: boolean
                  require_resolution_notes: boolean
                }) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-4 h-4 rounded-full ${
                        level.badge_color === 'red' ? 'bg-red-500' :
                        level.badge_color === 'orange' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-charcoal-800">
                          Level {level.level_number}: {level.level_name}
                        </p>
                        <p className="text-sm text-charcoal-500">
                          Triggers at {level.trigger_percentage}% ({Math.round(rule.target_value * level.trigger_percentage / 100)} {rule.target_unit === 'business_hours' ? 'biz hrs' : rule.target_unit})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-charcoal-500">
                      {level.notify_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {level.email_recipients?.join(', ')}
                        </span>
                      )}
                      <div className="flex gap-2">
                        {level.show_badge && (
                          <Badge variant="secondary">Badge</Badge>
                        )}
                        {level.add_to_report && (
                          <Badge variant="secondary">Report</Badge>
                        )}
                        {level.add_to_dashboard && (
                          <Badge variant="secondary">Dashboard</Badge>
                        )}
                        {level.require_resolution_notes && (
                          <Badge variant="secondary">Notes Required</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-charcoal-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p>No escalation levels configured</p>
                </div>
              )}
            </div>
          </DashboardSection>

          {/* Recent Events */}
          <DashboardSection
            title="Recent Events"
            action={
              eventsQuery.data && eventsQuery.data.pagination.total > 0 && (
                <Link
                  href={`/employee/admin/sla/${ruleId}/events`}
                  className="text-sm text-hublot-600 hover:text-hublot-700 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )
            }
          >
            {eventsQuery.isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
              </div>
            ) : eventsQuery.data?.items.length === 0 ? (
              <div className="text-center py-8 text-charcoal-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-charcoal-400" />
                <p>No events recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {eventsQuery.data?.items.slice(0, 10).map((event: {
                  id: string
                  entity_type: string
                  entity_id: string
                  status: string
                  start_time: string
                  target_deadline: string
                  current_percentage: number
                }) => {
                  const eventStatusConfig = EVENT_STATUS_CONFIG[event.status] || EVENT_STATUS_CONFIG.pending
                  return (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 hover:bg-charcoal-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${eventStatusConfig.color}`}>
                          {eventStatusConfig.icon}
                          {eventStatusConfig.label}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-charcoal-800">
                            {ENTITY_TYPE_LABELS[event.entity_type]} #{event.entity_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-charcoal-500">
                            Started {formatDistanceToNow(new Date(event.start_time), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-charcoal-600">
                          {Math.round(event.current_percentage)}% elapsed
                        </p>
                        <p className="text-xs text-charcoal-400">
                          Due: {format(new Date(event.target_deadline), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <DashboardSection title="Status">
            <div className="flex items-center gap-3 p-4 bg-charcoal-50 rounded-lg">
              {statusConfig.icon}
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <p className="text-xs text-charcoal-500 mt-1">
                  {rule.status === 'active' ? 'Monitoring is active' :
                   rule.status === 'draft' ? 'Not yet activated' :
                   'Monitoring paused'}
                </p>
              </div>
            </div>
          </DashboardSection>

          {/* Quick Actions */}
          <DashboardSection title="Quick Actions">
            <div className="space-y-2">
              {rule.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/employee/admin/sla/${ruleId}/events`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  View All Events
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => cloneMutation.mutate({ id: ruleId })}
                disabled={isLoading}
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone Rule
              </Button>
              {rule.status === 'draft' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/employee/admin/sla/${ruleId}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Configuration
                </Button>
              )}
            </div>
          </DashboardSection>

          {/* Metadata */}
          <DashboardSection title="Details">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Created</span>
                <span className="text-charcoal-700">
                  {format(new Date(rule.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {rule.createdByUser && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Created by</span>
                  <span className="text-charcoal-700 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {rule.createdByUser.full_name || rule.createdByUser.email}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Last Updated</span>
                <span className="text-charcoal-700">
                  {formatDistanceToNow(new Date(rule.updated_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Rule ID</span>
                <span className="text-charcoal-500 font-mono text-xs">
                  {rule.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>

      {/* Activate Dialog */}
      <Dialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate SLA Rule</DialogTitle>
            <DialogDescription>
              Activating this rule will start monitoring all matching {ENTITY_TYPE_LABELS[rule.entity_type]} records.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={applyRetroactive}
                onChange={(e) => setApplyRetroactive(e.target.checked)}
                className="w-4 h-4 text-hublot-600 border-charcoal-300 rounded focus:ring-hublot-500"
              />
              <div>
                <span className="font-medium text-charcoal-800">Apply retroactively</span>
                <p className="text-sm text-charcoal-500">
                  Check existing records that match the criteria
                </p>
              </div>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => activateMutation.mutate({ id: ruleId, applyRetroactive })}
              disabled={activateMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {activateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete SLA Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{rule.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: ruleId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: 'green' | 'amber' | 'red'
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-charcoal-500">{label}</span>
        {icon}
      </div>
      <span className={`text-2xl font-semibold ${
        color === 'green' ? 'text-green-600' :
        color === 'amber' ? 'text-amber-600' :
        color === 'red' ? 'text-red-600' :
        'text-charcoal-900'
      }`}>
        {value}
      </span>
    </div>
  )
}
