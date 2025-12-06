'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorkflowTestDialog } from './WorkflowTestDialog'
import {
  Edit,
  Play,
  Pause,
  Copy,
  Trash2,
  History,
  FlaskConical,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  GitBranch,
  Settings,
  ArrowLeft,
  ArrowRight,
  Zap,
  User,
  Users,
  UserCog,
  Crown,
  Code,
  Mail,
  FileEdit,
  Webhook,
  Activity,
  UserPlus,
  ListTodo,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  type WorkflowType,
  type EntityType,
  type ApproverType,
  type ActionType,
  type WorkflowStatus,
} from '@/lib/workflows/types'

interface WorkflowDetailPageProps {
  workflowId: string
}

const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> = {
  approval: 'Approval Workflow',
  status_auto: 'Status Automation',
  notification: 'Notification',
  sla_escalation: 'SLA Escalation',
  field_auto: 'Field Automation',
  assignment: 'Auto Assignment',
  webhook: 'Webhook',
  scheduled: 'Scheduled',
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
  submissions: 'Submissions',
  placements: 'Placements',
  accounts: 'Accounts',
  contacts: 'Contacts',
  leads: 'Leads',
  deals: 'Deals',
  activities: 'Activities',
  employees: 'Employees',
  consultants: 'Consultants',
  vendors: 'Vendors',
  interviews: 'Interviews',
}

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-100 text-charcoal-700', icon: <Settings className="w-3 h-3" /> },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  disabled: { label: 'Disabled', color: 'bg-amber-100 text-amber-700', icon: <Pause className="w-3 h-3" /> },
  archived: { label: 'Archived', color: 'bg-charcoal-100 text-charcoal-500', icon: <History className="w-3 h-3" /> },
}

const APPROVER_TYPE_ICONS: Record<ApproverType, React.ReactNode> = {
  specific_user: <User className="w-4 h-4" />,
  record_owner: <UserCog className="w-4 h-4" />,
  owners_manager: <Crown className="w-4 h-4" />,
  role_based: <Users className="w-4 h-4" />,
  pod_manager: <Users className="w-4 h-4" />,
  custom_formula: <Code className="w-4 h-4" />,
}

const ACTION_TYPE_ICONS: Record<ActionType, React.ReactNode> = {
  update_field: <FileEdit className="w-4 h-4" />,
  send_notification: <Mail className="w-4 h-4" />,
  create_activity: <Activity className="w-4 h-4" />,
  trigger_webhook: <Webhook className="w-4 h-4" />,
  run_workflow: <Play className="w-4 h-4" />,
  assign_user: <UserPlus className="w-4 h-4" />,
  create_task: <ListTodo className="w-4 h-4" />,
}

export function WorkflowDetailPage({ workflowId }: WorkflowDetailPageProps) {
  const router = useRouter()
  const [showTestDialog, setShowTestDialog] = useState(false)

  // Queries
  const workflowQuery = trpc.workflows.getById.useQuery({ id: workflowId })
  const validateQuery = trpc.workflows.validate.useQuery({ id: workflowId })
  const utils = trpc.useUtils()

  // Mutations
  const activateMutation = trpc.workflows.activate.useMutation({
    onSuccess: () => {
      toast.success('Workflow activated')
      utils.workflows.getById.invalidate({ id: workflowId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate workflow')
    },
  })

  const disableMutation = trpc.workflows.disable.useMutation({
    onSuccess: () => {
      toast.success('Workflow disabled')
      utils.workflows.getById.invalidate({ id: workflowId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable workflow')
    },
  })

  const cloneMutation = trpc.workflows.clone.useMutation({
    onSuccess: (data) => {
      toast.success('Workflow cloned')
      router.push(`/employee/admin/workflows/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clone workflow')
    },
  })

  const deleteMutation = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast.success('Workflow deleted')
      router.push('/employee/admin/workflows')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete workflow')
    },
  })

  const createVersionMutation = trpc.workflows.createVersion.useMutation({
    onSuccess: (data) => {
      toast.success('New version created')
      router.push(`/employee/admin/workflows/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create version')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Workflows', href: '/employee/admin/workflows' },
    { label: workflowQuery.data?.name || 'Loading...' },
  ]

  if (workflowQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  if (workflowQuery.error || !workflowQuery.data) {
    return (
      <DashboardShell title="Error" breadcrumbs={breadcrumbs}>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold text-charcoal-900 mb-2">Workflow Not Found</h2>
          <p className="text-charcoal-500 mb-4">
            {workflowQuery.error?.message || 'The workflow could not be loaded'}
          </p>
          <Button variant="outline" onClick={() => router.push('/employee/admin/workflows')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const workflow = workflowQuery.data
  const statusConfig = STATUS_CONFIG[workflow.status as WorkflowStatus]
  const canActivate = workflow.status === 'draft' && validateQuery.data?.isValid
  const canDisable = workflow.status === 'active'
  const canEdit = workflow.status === 'draft'
  const canDelete = workflow.status === 'draft' || workflow.status === 'disabled'

  return (
    <DashboardShell
      title={workflow.name}
      description={workflow.description || undefined}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTestDialog(true)}
          >
            <FlaskConical className="w-4 h-4 mr-2" />
            Test
          </Button>

          {canEdit ? (
            <Button
              variant="outline"
              onClick={() => router.push(`/employee/admin/workflows/${workflowId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => createVersionMutation.mutate({ id: workflowId })}
              disabled={createVersionMutation.isPending}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              New Version
            </Button>
          )}

          {canActivate && (
            <Button
              onClick={() => activateMutation.mutate({ id: workflowId })}
              disabled={activateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {activateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Activate
            </Button>
          )}

          {canDisable && (
            <Button
              variant="outline"
              onClick={() => disableMutation.mutate({ id: workflowId })}
              disabled={disableMutation.isPending}
            >
              {disableMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              Disable
            </Button>
          )}
        </div>
      }
    >
      {/* Validation Warning */}
      {validateQuery.data && !validateQuery.data.isValid && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Configuration Issues</h3>
              <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                {validateQuery.data.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Overview Section */}
        <DashboardSection title="Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Status</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={statusConfig.color}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Type</p>
              <p className="mt-1 font-medium">
                {WORKFLOW_TYPE_LABELS[workflow.workflow_type as WorkflowType] || workflow.workflow_type}
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Entity</p>
              <p className="mt-1 font-medium">
                {ENTITY_TYPE_LABELS[workflow.entity_type as EntityType] || workflow.entity_type}
              </p>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Version</p>
              <p className="mt-1 font-medium">v{workflow.version}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <p className="text-2xl font-semibold">{workflow.totalRuns || 0}</p>
              <p className="text-sm text-charcoal-500">Total Executions</p>
            </div>
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <p className="text-2xl font-semibold text-emerald-600">{workflow.successfulRuns || 0}</p>
              <p className="text-sm text-charcoal-500">Successful</p>
            </div>
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <p className="text-2xl font-semibold text-red-600">{workflow.failedRuns || 0}</p>
              <p className="text-sm text-charcoal-500">Failed</p>
            </div>
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <p className="text-sm font-medium">
                {workflow.lastRunAt
                  ? new Date(workflow.lastRunAt).toLocaleString()
                  : 'Never'}
              </p>
              <p className="text-sm text-charcoal-500">Last Execution</p>
            </div>
          </div>
        </DashboardSection>

        {/* Trigger Section */}
        <DashboardSection title="Trigger Configuration">
          <div className="space-y-4">
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Trigger Event</p>
                  <p className="text-sm text-charcoal-500 capitalize">
                    {workflow.trigger_event.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {workflow.trigger_conditions?.conditions?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Filter Conditions ({workflow.trigger_conditions.logic.toUpperCase()})</h4>
                <div className="space-y-2">
                  {workflow.trigger_conditions.conditions.map((cond, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-charcoal-50 rounded-lg text-sm">
                      <span className="font-medium">{cond.field}</span>
                      <span className="text-charcoal-400">{cond.operator}</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded">
                        {String(cond.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Config */}
            {workflow.schedule_config && (
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Schedule</p>
                    <p className="text-sm font-mono text-charcoal-500">
                      {workflow.schedule_config.cron} ({workflow.schedule_config.timezone})
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DashboardSection>

        {/* Approval Steps Section */}
        {workflow.steps && workflow.steps.length > 0 && (
          <DashboardSection title="Approval Steps">
            <div className="space-y-3">
              {workflow.steps
                .sort((a, b) => a.step_order - b.step_order)
                .map((step, i) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-hublot-900 text-white flex items-center justify-center text-sm font-medium">
                        {step.step_order}
                      </div>
                      {i < workflow.steps!.length - 1 && (
                        <div className="w-0.5 h-8 bg-charcoal-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 p-4 bg-charcoal-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{step.step_name}</h4>
                        <div className="flex items-center gap-1 text-sm text-charcoal-500">
                          {APPROVER_TYPE_ICONS[step.approver_type as ApproverType]}
                          <span className="capitalize">{step.approver_type.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-charcoal-500">
                        {step.timeout_hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Timeout: {step.timeout_hours} {step.timeout_unit}
                          </span>
                        )}
                        {step.timeout_action && (
                          <span className="capitalize">On timeout: {step.timeout_action}</span>
                        )}
                        {step.reminder_enabled && (
                          <span>Reminder at {step.reminder_percent}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DashboardSection>
        )}

        {/* Actions Section */}
        {workflow.actions && workflow.actions.length > 0 && (
          <DashboardSection title="Actions">
            <div className="space-y-3">
              {workflow.actions
                .sort((a, b) => a.action_order - b.action_order)
                .map((action) => (
                  <div key={action.id} className="p-4 bg-charcoal-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded border border-charcoal-200">
                          {ACTION_TYPE_ICONS[action.action_type as ActionType]}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{action.action_type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-charcoal-500 capitalize">
                            {action.action_trigger.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {Object.keys(action.action_config).length > 0 && (
                      <div className="mt-3 p-2 bg-white rounded border border-charcoal-100">
                        <pre className="text-xs font-mono text-charcoal-600 overflow-x-auto">
                          {JSON.stringify(action.action_config, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </DashboardSection>
        )}

        {/* Metadata Section */}
        <DashboardSection title="Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-charcoal-500">Created</p>
              <p className="font-medium">{new Date(workflow.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-charcoal-500">Updated</p>
              <p className="font-medium">{new Date(workflow.updated_at).toLocaleString()}</p>
            </div>
            {workflow.activated_at && (
              <div>
                <p className="text-charcoal-500">Activated</p>
                <p className="font-medium">{new Date(workflow.activated_at).toLocaleString()}</p>
              </div>
            )}
            {workflow.createdByUser && (
              <div>
                <p className="text-charcoal-500">Created By</p>
                <p className="font-medium">{workflow.createdByUser.full_name || workflow.createdByUser.email}</p>
              </div>
            )}
          </div>
        </DashboardSection>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <Button variant="outline" onClick={() => router.push('/employee/admin/workflows')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workflows
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/employee/admin/workflows/${workflowId}/history`)}
            >
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>

            <Button
              variant="outline"
              onClick={() => cloneMutation.mutate({ id: workflowId })}
              disabled={cloneMutation.isPending}
            >
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </Button>

            {canDelete && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this workflow?')) {
                    deleteMutation.mutate({ id: workflowId })
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-600 hover:bg-red-50"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Dialog */}
      {showTestDialog && (
        <WorkflowTestDialog
          workflowId={workflowId}
          entityType={workflow.entity_type as EntityType}
          open={showTestDialog}
          onOpenChange={setShowTestDialog}
        />
      )}
    </DashboardShell>
  )
}
