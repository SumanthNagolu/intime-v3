'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
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
  Loader2,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  Compass,
  ClipboardList,
  Star,
  Activity,
  Clock,
  User,
  Target,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

// Category config with icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  communication: { icon: <Phone className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Communication' },
  calendar: { icon: <Calendar className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700', label: 'Calendar' },
  workflow: { icon: <FileText className="w-4 h-4" />, color: 'bg-violet-100 text-violet-700', label: 'Workflow' },
  documentation: { icon: <ClipboardList className="w-4 h-4" />, color: 'bg-charcoal-100 text-charcoal-600', label: 'Documentation' },
  research: { icon: <Compass className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', label: 'Research' },
  administrative: { icon: <CheckSquare className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700', label: 'Administrative' },
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidate',
  job: 'Job',
  submission: 'Submission',
  placement: 'Placement',
  account: 'Account',
  contact: 'Contact',
  lead: 'Lead',
  deal: 'Deal',
  consultant: 'Consultant',
  vendor: 'Vendor',
  interview: 'Interview',
  general: 'General',
}

// Outcome color classes
const OUTCOME_COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
}

// Next action labels
const NEXT_ACTION_LABELS: Record<string, string> = {
  none: 'No action',
  log_notes: 'Log additional notes',
  schedule_followup: 'Schedule follow-up',
  retry_later: 'Set retry reminder',
  update_info: 'Update contact info',
  mark_invalid: 'Mark as invalid',
  create_task: 'Create task',
  send_email: 'Send email',
}

interface ActivityPatternDetailPageProps {
  params: Promise<{ id: string }>
}

export function ActivityPatternDetailPage({ params }: ActivityPatternDetailPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const patternId = resolvedParams.id

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const utils = trpc.useUtils()

  const patternQuery = trpc.activityPatterns.getById.useQuery({ id: patternId })
  const usageQuery = trpc.activityPatterns.getUsageCount.useQuery({ id: patternId, days: 30 })

  const toggleStatusMutation = trpc.activityPatterns.toggleStatus.useMutation({
    onSuccess: (data) => {
      utils.activityPatterns.getById.invalidate({ id: patternId })
      utils.activityPatterns.list.invalidate()
      toast.success(data.is_active ? 'Pattern enabled' : 'Pattern disabled')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const duplicateMutation = trpc.activityPatterns.duplicate.useMutation({
    onSuccess: (data) => {
      utils.activityPatterns.list.invalidate()
      toast.success('Pattern duplicated')
      router.push(`/employee/admin/activity-patterns/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate pattern')
    },
  })

  const deleteMutation = trpc.activityPatterns.delete.useMutation({
    onSuccess: () => {
      utils.activityPatterns.list.invalidate()
      toast.success('Pattern deleted')
      router.push('/employee/admin/activity-patterns')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete pattern')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Activity Patterns', href: '/employee/admin/activity-patterns' },
    { label: patternQuery.data?.name || 'Pattern Details' },
  ]

  if (patternQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  if (patternQuery.error || !patternQuery.data) {
    return (
      <DashboardShell title="Pattern Not Found" breadcrumbs={breadcrumbs}>
        <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Pattern Not Found</h3>
          <p className="text-red-600 mb-4">The requested activity pattern could not be found.</p>
          <Button
            variant="outline"
            onClick={() => router.push('/employee/admin/activity-patterns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patterns
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const pattern = patternQuery.data
  const categoryConfig = CATEGORY_CONFIG[pattern.category] || {
    icon: <Activity className="w-4 h-4" />,
    color: 'bg-charcoal-100 text-charcoal-600',
    label: pattern.category,
  }

  const outcomes = (pattern.outcomes as Array<{
    label: string
    value: string
    color: string
    nextAction: string
  }>) || []

  const customFields = (pattern.pattern_fields as Array<{
    id: string
    field_name: string
    field_label: string
    field_type: string
    is_required: boolean
  }>) || []

  const followupRules = (pattern.followup_rules as Array<{
    outcome: string
    delayHours: number
    taskTitle: string
    assignTo: string
  }>) || []

  return (
    <DashboardShell
      title={
        <div className="flex items-center gap-3">
          <span className="text-3xl">{pattern.icon || '📋'}</span>
          <div>
            <h1 className="text-2xl font-semibold text-charcoal-900">{pattern.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                {categoryConfig.icon}
                {categoryConfig.label}
              </span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                pattern.is_active ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'
              }`}>
                {pattern.is_active ? 'Active' : 'Inactive'}
              </span>
              {pattern.is_system && (
                <span className="text-xs text-charcoal-400">System</span>
              )}
            </div>
          </div>
        </div>
      }
      description=""
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/employee/admin/activity-patterns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {!pattern.is_system && (
            <>
              <Button
                variant="outline"
                onClick={() => toggleStatusMutation.mutate({ id: patternId, isActive: !pattern.is_active })}
                disabled={toggleStatusMutation.isPending}
              >
                {pattern.is_active ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
              <Link href={`/employee/admin/activity-patterns/${patternId}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => duplicateMutation.mutate({ id: patternId })}
            disabled={duplicateMutation.isPending}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          {!pattern.is_system && (
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-charcoal-500">Uses (30d)</span>
            <Activity className="w-5 h-5 text-charcoal-400" />
          </div>
          <span className="text-2xl font-semibold text-charcoal-900">{usageQuery.data?.count ?? 0}</span>
        </div>
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-charcoal-500">Total Uses</span>
            <Activity className="w-5 h-5 text-charcoal-400" />
          </div>
          <span className="text-2xl font-semibold text-charcoal-900">{usageQuery.data?.totalCount ?? 0}</span>
        </div>
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-charcoal-500">Base Points</span>
            <Star className="w-5 h-5 text-gold-500" />
          </div>
          <span className="text-2xl font-semibold text-charcoal-900">{Number(pattern.points) || 0}</span>
        </div>
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-charcoal-500">Target Days</span>
            <Clock className="w-5 h-5 text-charcoal-400" />
          </div>
          <span className="text-2xl font-semibold text-charcoal-900">{pattern.target_days}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {pattern.description && (
            <DashboardSection title="Description">
              <p className="text-charcoal-600">{pattern.description}</p>
            </DashboardSection>
          )}

          {/* Outcomes */}
          <DashboardSection title={`Outcomes (${outcomes.length})`}>
            {outcomes.length === 0 ? (
              <p className="text-charcoal-500 text-sm">No outcomes configured</p>
            ) : (
              <div className="space-y-3">
                {outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${OUTCOME_COLOR_CLASSES[outcome.color] || 'bg-gray-100 text-gray-800'}`}>
                        {outcome.label}
                      </span>
                      <span className="text-sm text-charcoal-500">({outcome.value})</span>
                    </div>
                    <span className="text-sm text-charcoal-500">
                      {NEXT_ACTION_LABELS[outcome.nextAction] || outcome.nextAction}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Custom Fields */}
          <DashboardSection title={`Custom Fields (${customFields.length})`}>
            {customFields.length === 0 ? (
              <p className="text-charcoal-500 text-sm">No custom fields configured</p>
            ) : (
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                    <div>
                      <span className="font-medium text-charcoal-900">{field.field_label}</span>
                      <span className="text-sm text-charcoal-500 ml-2">({field.field_name})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-charcoal-600">{field.field_type}</span>
                      {field.is_required && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Follow-up Rules */}
          <DashboardSection title={`Follow-up Rules (${followupRules.length})`}>
            {followupRules.length === 0 ? (
              <p className="text-charcoal-500 text-sm">No follow-up rules configured</p>
            ) : (
              <div className="space-y-3">
                {followupRules.map((rule, i) => (
                  <div key={i} className="p-3 bg-charcoal-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>When outcome is</span>
                      <span className="font-medium">{rule.outcome}</span>
                      <span className="text-charcoal-400">→</span>
                      <span>Create &quot;{rule.taskTitle}&quot; after {rule.delayHours}h</span>
                      <span className="text-charcoal-400">→</span>
                      <span>Assign to {rule.assignTo.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Configuration */}
          <DashboardSection title="Configuration">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Code</dt>
                <dd className="text-charcoal-900 text-sm font-mono">{pattern.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Entity Type</dt>
                <dd className="text-charcoal-900 text-sm">{ENTITY_TYPE_LABELS[pattern.entity_type] || pattern.entity_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Priority</dt>
                <dd className="text-charcoal-900 text-sm capitalize">{pattern.priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Default Assignee</dt>
                <dd className="text-charcoal-900 text-sm capitalize">{pattern.default_assignee?.replace('_', ' ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Show in Timeline</dt>
                <dd className="text-charcoal-900 text-sm">{pattern.show_in_timeline ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm">Display Order</dt>
                <dd className="text-charcoal-900 text-sm">{pattern.display_order}</dd>
              </div>
            </dl>
          </DashboardSection>

          {/* Auto-Log Integrations */}
          {(pattern.auto_log_integrations as string[])?.length > 0 && (
            <DashboardSection title="Auto-Log Integrations">
              <div className="flex flex-wrap gap-2">
                {(pattern.auto_log_integrations as string[]).map((integration) => (
                  <span
                    key={integration}
                    className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </DashboardSection>
          )}

          {/* Metadata */}
          <DashboardSection title="Metadata">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Created
                </dt>
                <dd className="text-charcoal-900 text-sm">
                  {formatDistanceToNow(new Date(pattern.created_at), { addSuffix: true })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal-500 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated
                </dt>
                <dd className="text-charcoal-900 text-sm">
                  {formatDistanceToNow(new Date(pattern.updated_at), { addSuffix: true })}
                </dd>
              </div>
            </dl>
          </DashboardSection>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pattern</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{pattern.name}&quot;? This action cannot be undone.
              {usageQuery.data?.totalCount ? (
                <span className="block mt-2 text-amber-600">
                  Warning: This pattern has been used {usageQuery.data.totalCount} times.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate({ id: patternId })}
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
