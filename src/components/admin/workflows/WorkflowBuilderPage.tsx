'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
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
import { ConditionBuilder } from './ConditionBuilder'
import { ApprovalStepsBuilder } from './ApprovalStepsBuilder'
import { WorkflowActionsBuilder } from './WorkflowActionsBuilder'
import { WorkflowTestDialog } from './WorkflowTestDialog'
import {
  Save,
  Play,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  FlaskConical,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  type WorkflowType,
  type TriggerEvent,
  type EntityType,
  type TriggerConditions,
  type WorkflowStep,
  type WorkflowAction,
  type ScheduleConfig,
} from '@/lib/workflows/types'

interface WorkflowBuilderPageProps {
  workflowId?: string
}

const WORKFLOW_TYPE_CONFIG: Record<WorkflowType, { showSteps: boolean; showActions: boolean; showSchedule: boolean }> = {
  approval: { showSteps: true, showActions: true, showSchedule: false },
  status_auto: { showSteps: false, showActions: true, showSchedule: false },
  notification: { showSteps: false, showActions: true, showSchedule: false },
  sla_escalation: { showSteps: false, showActions: true, showSchedule: false },
  field_auto: { showSteps: false, showActions: true, showSchedule: false },
  assignment: { showSteps: false, showActions: true, showSchedule: false },
  webhook: { showSteps: false, showActions: true, showSchedule: false },
  scheduled: { showSteps: false, showActions: true, showSchedule: true },
}

const DEFAULT_TRIGGER_CONDITIONS: TriggerConditions = {
  conditions: [],
  logic: 'and',
}

export function WorkflowBuilderPage({ workflowId }: WorkflowBuilderPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as WorkflowType | null
  const isEditMode = !!workflowId

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workflowType, setWorkflowType] = useState<WorkflowType>(typeParam || 'approval')
  const [entityType, setEntityType] = useState<EntityType>('jobs')
  const [triggerEvent, setTriggerEvent] = useState<TriggerEvent>('record_created')
  const [triggerConditions, setTriggerConditions] = useState<TriggerConditions>(DEFAULT_TRIGGER_CONDITIONS)
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([])
  const [actions, setActions] = useState<WorkflowAction[]>([])
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Queries
  const workflowTypesQuery = trpc.workflows.getWorkflowTypes.useQuery()
  const entityTypesQuery = trpc.workflows.getEntityTypes.useQuery()
  const triggerEventsQuery = trpc.workflows.getTriggerEvents.useQuery()
  const workflowQuery = trpc.workflows.getById.useQuery(
    { id: workflowId! },
    { enabled: isEditMode }
  )
  const validateQuery = trpc.workflows.validate.useQuery(
    { id: workflowId! },
    { enabled: isEditMode }
  )

  // Mutations
  const createMutation = trpc.workflows.create.useMutation({
    onSuccess: (data) => {
      toast.success('Workflow created')
      router.push(`/employee/admin/workflows/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create workflow')
    },
  })

  const updateMutation = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success('Workflow updated')
      router.push(`/employee/admin/workflows/${workflowId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update workflow')
    },
  })

  // Load existing workflow data
  useEffect(() => {
    if (workflowQuery.data) {
      const wf = workflowQuery.data
      setName(wf.name)
      setDescription(wf.description || '')
      setWorkflowType(wf.workflow_type as WorkflowType)
      setEntityType(wf.entity_type as EntityType)
      setTriggerEvent(wf.trigger_event as TriggerEvent)
      setTriggerConditions(wf.trigger_conditions || DEFAULT_TRIGGER_CONDITIONS)
      setScheduleConfig(wf.schedule_config || null)

      // Convert steps
      if (wf.steps) {
        setSteps(wf.steps.map((s: { id: string; step_name: string; step_order: number; approver_type: string; approver_config: Record<string, unknown>; timeout_hours?: number | null; timeout_unit: string; timeout_action?: string | null; reminder_enabled: boolean; reminder_percent?: number | null }) => ({
          id: s.id,
          stepName: s.step_name,
          stepOrder: s.step_order,
          approverType: s.approver_type,
          approverConfig: s.approver_config,
          timeoutHours: s.timeout_hours ?? undefined,
          timeoutUnit: s.timeout_unit,
          timeoutAction: s.timeout_action ?? undefined,
          reminderEnabled: s.reminder_enabled,
          reminderPercent: s.reminder_percent ?? undefined,
        })))
      }

      // Convert actions
      if (wf.actions) {
        setActions(wf.actions.map((a: { id: string; action_trigger: string; action_order: number; action_type: string; action_config: Record<string, unknown> }) => ({
          id: a.id,
          actionTrigger: a.action_trigger,
          actionOrder: a.action_order,
          actionType: a.action_type,
          actionConfig: a.action_config,
        })))
      }
    }
  }, [workflowQuery.data])

  // Get type config
  const typeConfig = WORKFLOW_TYPE_CONFIG[workflowType] || { showSteps: false, showActions: true, showSchedule: false }

  // Form validation
  const validationErrors = useMemo(() => {
    const errors: string[] = []

    if (!name || name.length < 5) {
      errors.push('Workflow name must be at least 5 characters')
    }

    if (workflowType === 'approval' && steps.length === 0) {
      errors.push('Approval workflows require at least one approval step')
    }

    if (workflowType === 'scheduled' && (!scheduleConfig || !scheduleConfig.cron)) {
      errors.push('Scheduled workflows require a cron expression')
    }

    return errors
  }, [name, workflowType, steps, scheduleConfig])

  const canSubmit = validationErrors.length === 0

  // Handle save
  const handleSave = async () => {
    if (!canSubmit) {
      toast.error(validationErrors[0])
      return
    }

    setIsSaving(true)

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({
          id: workflowId,
          name,
          description: description || null,
          triggerConditions,
          scheduleConfig,
          steps: steps.map((s, i) => ({
            stepName: s.stepName,
            approverType: s.approverType,
            approverConfig: s.approverConfig,
            timeoutHours: s.timeoutHours,
            timeoutUnit: s.timeoutUnit,
            timeoutAction: s.timeoutAction,
            reminderEnabled: s.reminderEnabled,
            reminderPercent: s.reminderPercent,
          })),
          actions: actions.map((a, i) => ({
            actionTrigger: a.actionTrigger,
            actionOrder: a.actionOrder || i + 1,
            actionType: a.actionType,
            actionConfig: a.actionConfig,
          })),
        })
      } else {
        await createMutation.mutateAsync({
          name,
          description: description || undefined,
          workflowType,
          entityType,
          triggerEvent,
          triggerConditions,
          scheduleConfig: scheduleConfig || undefined,
          steps: steps.map((s, i) => ({
            stepName: s.stepName,
            approverType: s.approverType,
            approverConfig: s.approverConfig,
            timeoutHours: s.timeoutHours,
            timeoutUnit: s.timeoutUnit,
            timeoutAction: s.timeoutAction,
            reminderEnabled: s.reminderEnabled,
            reminderPercent: s.reminderPercent,
          })),
          actions: actions.map((a, i) => ({
            actionTrigger: a.actionTrigger,
            actionOrder: a.actionOrder || i + 1,
            actionType: a.actionType,
            actionConfig: a.actionConfig,
          })),
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Workflows', href: '/employee/admin/workflows' },
    { label: isEditMode ? 'Edit Workflow' : 'New Workflow' },
  ]

  // Loading state for edit mode
  if (isEditMode && workflowQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  // Check if workflow is editable (only drafts)
  if (isEditMode && workflowQuery.data && workflowQuery.data.status !== 'draft') {
    return (
      <DashboardShell title="Cannot Edit" breadcrumbs={breadcrumbs}>
        <div className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-lg font-semibold text-charcoal-900 mb-2">Cannot Edit Active Workflow</h2>
          <p className="text-charcoal-500 mb-4">
            Active workflows cannot be edited directly. Create a new version to make changes.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              onClick={() => router.push(`/employee/admin/workflows/${workflowId}`)}
            >
              View Workflow
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const workflowTypeLabel = workflowTypesQuery.data?.find(t => t.value === workflowType)?.label || workflowType

  return (
    <DashboardShell
      title={isEditMode ? `Edit: ${name}` : `New ${workflowTypeLabel} Workflow`}
      description={isEditMode ? 'Update workflow configuration' : 'Configure your workflow settings'}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-3">
          {isEditMode && workflowId && (
            <Button
              variant="outline"
              onClick={() => setShowTestDialog(true)}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Test
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!canSubmit || isSaving}
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      }
    >
      {/* Validation Errors Banner */}
      {validateQuery.data && !validateQuery.data.isValid && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Validation Issues</h3>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {validateQuery.data.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Workflow Details */}
        <DashboardSection title="Workflow Details">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Job Approval - High Value"
                className="mt-1"
              />
              <p className="text-xs text-charcoal-500 mt-1">
                Use a descriptive name (minimum 5 characters)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                className="mt-1"
              />
            </div>

            {!isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Workflow Type</Label>
                  <Select value={workflowType} onValueChange={(v) => setWorkflowType(v as WorkflowType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowTypesQuery.data?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Entity Type *</Label>
                  <Select value={entityType} onValueChange={(v) => setEntityType(v as EntityType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypesQuery.data?.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {isEditMode && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-charcoal-50 rounded-lg">
                <div>
                  <span className="text-xs text-charcoal-500">Workflow Type</span>
                  <p className="font-medium">{workflowTypeLabel}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal-500">Entity Type</span>
                  <p className="font-medium">
                    {entityTypesQuery.data?.find(e => e.value === entityType)?.label || entityType}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DashboardSection>

        {/* Section 2: Trigger Configuration */}
        <DashboardSection title="Trigger Configuration">
          <div className="space-y-4">
            {!isEditMode && (
              <div>
                <Label>Trigger Event *</Label>
                <Select value={triggerEvent} onValueChange={(v) => setTriggerEvent(v as TriggerEvent)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerEventsQuery.data?.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isEditMode && (
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <span className="text-xs text-charcoal-500">Trigger Event</span>
                <p className="font-medium">
                  {triggerEventsQuery.data?.find(e => e.value === triggerEvent)?.label || triggerEvent}
                </p>
              </div>
            )}

            <div>
              <Label>Filter Conditions (Optional)</Label>
              <p className="text-sm text-charcoal-500 mb-3">
                Only run when these conditions are met:
              </p>
              <ConditionBuilder
                entityType={entityType}
                value={triggerConditions}
                onChange={setTriggerConditions}
              />
            </div>
          </div>
        </DashboardSection>

        {/* Section 3: Schedule Config (for scheduled workflows) */}
        {typeConfig.showSchedule && (
          <DashboardSection title="Schedule Configuration">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cron">Cron Expression *</Label>
                <Input
                  id="cron"
                  value={scheduleConfig?.cron || ''}
                  onChange={(e) => setScheduleConfig({
                    cron: e.target.value,
                    timezone: scheduleConfig?.timezone || 'UTC'
                  })}
                  placeholder="0 9 * * 1-5"
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-charcoal-500 mt-1">
                  Format: minute hour day-of-month month day-of-week (e.g., &quot;0 9 * * 1-5&quot; = 9 AM on weekdays)
                </p>
              </div>

              <div>
                <Label>Timezone</Label>
                <Select
                  value={scheduleConfig?.timezone || 'UTC'}
                  onValueChange={(v) => setScheduleConfig({
                    cron: scheduleConfig?.cron || '',
                    timezone: v
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Section 4: Approval Steps (for approval workflows) */}
        {typeConfig.showSteps && (
          <DashboardSection title="Approval Steps">
            <p className="text-sm text-charcoal-500 mb-4">
              Configure the approval chain. Requests will flow through each step in order.
            </p>
            <ApprovalStepsBuilder
              value={steps}
              onChange={setSteps}
            />
          </DashboardSection>
        )}

        {/* Section 5: Actions */}
        {typeConfig.showActions && (
          <DashboardSection title="Actions">
            <p className="text-sm text-charcoal-500 mb-4">
              Configure what happens when the workflow completes.
            </p>
            <WorkflowActionsBuilder
              workflowType={workflowType}
              value={actions}
              onChange={setActions}
            />
          </DashboardSection>
        )}

        {/* Validation Summary */}
        {validationErrors.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Please fix the following:</h3>
                <ul className="mt-1 text-sm text-amber-700 list-disc list-inside">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {isEditMode && workflowId && (
              <Button
                variant="outline"
                onClick={() => setShowTestDialog(true)}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Test Workflow
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!canSubmit || isSaving}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? 'Save Changes' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </div>

      {/* Test Dialog */}
      {showTestDialog && workflowId && (
        <WorkflowTestDialog
          workflowId={workflowId}
          entityType={entityType}
          open={showTestDialog}
          onOpenChange={setShowTestDialog}
        />
      )}
    </DashboardShell>
  )
}
