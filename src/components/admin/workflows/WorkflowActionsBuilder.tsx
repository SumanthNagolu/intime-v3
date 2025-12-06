'use client'

import { useCallback } from 'react'
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
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Mail,
  FileEdit,
  Webhook,
  UserPlus,
  ListTodo,
  Play,
  Activity,
} from 'lucide-react'
import {
  type WorkflowAction,
  type ActionTrigger,
  type ActionType,
  type WorkflowType,
  type ActionConfig,
} from '@/lib/workflows/types'

interface WorkflowActionsBuilderProps {
  workflowType: WorkflowType
  value: WorkflowAction[]
  onChange: (actions: WorkflowAction[]) => void
  disabled?: boolean
}

// Action triggers vary by workflow type
const ACTION_TRIGGERS: Record<WorkflowType, { value: ActionTrigger; label: string; description: string }[]> = {
  approval: [
    { value: 'on_start', label: 'On Start', description: 'When workflow starts' },
    { value: 'on_approval', label: 'On Approval', description: 'When fully approved' },
    { value: 'on_rejection', label: 'On Rejection', description: 'When rejected' },
    { value: 'on_cancellation', label: 'On Cancellation', description: 'When cancelled' },
    { value: 'on_timeout', label: 'On Timeout', description: 'When step times out' },
    { value: 'on_each_step', label: 'On Each Step', description: 'After each approval step' },
  ],
  status_auto: [
    { value: 'on_completion', label: 'On Completion', description: 'When workflow completes' },
  ],
  notification: [
    { value: 'on_completion', label: 'On Trigger', description: 'When conditions are met' },
  ],
  sla_escalation: [
    { value: 'on_completion', label: 'On SLA Breach', description: 'When SLA is breached' },
  ],
  field_auto: [
    { value: 'on_completion', label: 'On Trigger', description: 'When conditions are met' },
  ],
  assignment: [
    { value: 'on_completion', label: 'On Assignment', description: 'When record is assigned' },
  ],
  webhook: [
    { value: 'on_completion', label: 'On Trigger', description: 'When conditions are met' },
  ],
  scheduled: [
    { value: 'on_completion', label: 'On Schedule', description: 'When schedule fires' },
  ],
}

const ACTION_TYPES: { value: ActionType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'update_field', label: 'Update Field', description: 'Change a field value', icon: <FileEdit className="w-4 h-4" /> },
  { value: 'send_notification', label: 'Send Notification', description: 'Email or in-app notification', icon: <Mail className="w-4 h-4" /> },
  { value: 'create_activity', label: 'Create Activity', description: 'Log an activity record', icon: <Activity className="w-4 h-4" /> },
  { value: 'trigger_webhook', label: 'Trigger Webhook', description: 'Call external webhook', icon: <Webhook className="w-4 h-4" /> },
  { value: 'run_workflow', label: 'Run Workflow', description: 'Trigger another workflow', icon: <Play className="w-4 h-4" /> },
  { value: 'assign_user', label: 'Assign User', description: 'Assign to a user', icon: <UserPlus className="w-4 h-4" /> },
  { value: 'create_task', label: 'Create Task', description: 'Create a follow-up task', icon: <ListTodo className="w-4 h-4" /> },
]

export function WorkflowActionsBuilder({
  workflowType,
  value,
  onChange,
  disabled = false,
}: WorkflowActionsBuilderProps) {
  const availableTriggers = ACTION_TRIGGERS[workflowType] || ACTION_TRIGGERS.approval

  const addAction = useCallback(() => {
    const defaultTrigger = availableTriggers[0]?.value || 'on_completion'
    const newAction: WorkflowAction = {
      actionTrigger: defaultTrigger,
      actionOrder: value.length + 1,
      actionType: 'send_notification',
      actionConfig: {},
    }
    onChange([...value, newAction])
  }, [onChange, value, availableTriggers])

  const updateAction = useCallback((index: number, updates: Partial<WorkflowAction>) => {
    const newActions = [...value]
    newActions[index] = { ...newActions[index], ...updates }

    // Reset config when type changes
    if (updates.actionType) {
      newActions[index].actionConfig = {}
    }

    onChange(newActions)
  }, [onChange, value])

  const removeAction = useCallback((index: number) => {
    const newActions = value.filter((_, i) => i !== index)
    // Update action orders
    newActions.forEach((action, i) => {
      action.actionOrder = i + 1
    })
    onChange(newActions)
  }, [onChange, value])

  const moveAction = useCallback((index: number, direction: 'up' | 'down') => {
    const newActions = [...value]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newActions.length) return

    // Swap actions
    ;[newActions[index], newActions[targetIndex]] = [newActions[targetIndex], newActions[index]]

    // Update action orders
    newActions.forEach((action, i) => {
      action.actionOrder = i + 1
    })

    onChange(newActions)
  }, [onChange, value])

  return (
    <div className="space-y-4">
      {/* Actions List */}
      <div className="space-y-4">
        {value.map((action, index) => (
          <ActionCard
            key={index}
            action={action}
            index={index}
            totalActions={value.length}
            availableTriggers={availableTriggers}
            onChange={(updates) => updateAction(index, updates)}
            onRemove={() => removeAction(index)}
            onMoveUp={() => moveAction(index, 'up')}
            onMoveDown={() => moveAction(index, 'down')}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Empty State */}
      {value.length === 0 && (
        <div className="p-8 text-center bg-charcoal-50 rounded-lg border border-dashed border-charcoal-200">
          <Zap className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
          <h3 className="text-sm font-medium text-charcoal-700 mb-1">No actions configured</h3>
          <p className="text-sm text-charcoal-500 mb-4">Add actions to define what happens when the workflow runs</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAction}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add First Action
          </Button>
        </div>
      )}

      {/* Add Action Button */}
      {value.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAction}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Action
        </Button>
      )}
    </div>
  )
}

// Action Card Component
interface ActionCardProps {
  action: WorkflowAction
  index: number
  totalActions: number
  availableTriggers: { value: ActionTrigger; label: string; description: string }[]
  onChange: (updates: Partial<WorkflowAction>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  disabled?: boolean
}

function ActionCard({
  action,
  index,
  totalActions,
  availableTriggers,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled,
}: ActionCardProps) {
  const actionTypeConfig = ACTION_TYPES.find(t => t.value === action.actionType)

  return (
    <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-charcoal-50 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white rounded border border-charcoal-200">
            {actionTypeConfig?.icon || <Zap className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-charcoal-700">
            Action {index + 1}: {actionTypeConfig?.label || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={disabled || index === 0}
            className="h-7 w-7"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={disabled || index === totalActions - 1}
            className="h-7 w-7"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="h-7 w-7 text-charcoal-400 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trigger */}
          <div>
            <Label className="text-sm">When to Execute</Label>
            <Select
              value={action.actionTrigger}
              onValueChange={(v) => onChange({ actionTrigger: v as ActionTrigger })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select trigger" />
              </SelectTrigger>
              <SelectContent>
                {availableTriggers.map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    <div>
                      <div className="font-medium">{trigger.label}</div>
                      <div className="text-xs text-charcoal-500">{trigger.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Type */}
          <div>
            <Label className="text-sm">Action Type</Label>
            <Select
              value={action.actionType}
              onValueChange={(v) => onChange({ actionType: v as ActionType })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-charcoal-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Configuration */}
        <ActionConfigFields
          actionType={action.actionType}
          config={action.actionConfig}
          onChange={(config) => onChange({ actionConfig: config })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

// Action Config Fields (based on action type)
interface ActionConfigFieldsProps {
  actionType: ActionType
  config: ActionConfig
  onChange: (config: ActionConfig) => void
  disabled?: boolean
}

function ActionConfigFields({
  actionType,
  config,
  onChange,
  disabled,
}: ActionConfigFieldsProps) {
  switch (actionType) {
    case 'update_field':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Field Name</Label>
            <Input
              value={String(config.field || '')}
              onChange={(e) => onChange({ ...config, field: e.target.value })}
              disabled={disabled}
              placeholder="e.g., status"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">New Value</Label>
            <Input
              value={String(config.value || '')}
              onChange={(e) => onChange({ ...config, value: e.target.value })}
              disabled={disabled}
              placeholder="e.g., approved"
              className="mt-1"
            />
          </div>
        </div>
      )

    case 'send_notification':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Recipient</Label>
            <Select
              value={String(config.recipient || 'owner')}
              onValueChange={(v) => onChange({ ...config, recipient: v })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Record Owner</SelectItem>
                <SelectItem value="submitter">Submitter/Creator</SelectItem>
                <SelectItem value="approver">Current Approver</SelectItem>
                <SelectItem value="managers">All Managers</SelectItem>
                <SelectItem value="custom">Custom Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.recipient === 'custom' && (
            <div>
              <Label className="text-sm">Email Address</Label>
              <Input
                type="email"
                value={String(config.custom_email || '')}
                onChange={(e) => onChange({ ...config, custom_email: e.target.value })}
                disabled={disabled}
                placeholder="user@example.com"
                className="mt-1"
              />
            </div>
          )}
          <div>
            <Label className="text-sm">Message Template</Label>
            <Textarea
              value={String(config.template || '')}
              onChange={(e) => onChange({ ...config, template: e.target.value })}
              disabled={disabled}
              placeholder="Your {{entity_type}} has been {{status}}. Click here to view details..."
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-charcoal-500 mt-1">
              Use &#123;&#123;field_name&#125;&#125; to insert record values
            </p>
          </div>
        </div>
      )

    case 'create_activity':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Activity Type</Label>
            <Select
              value={String(config.activity_type || 'note')}
              onValueChange={(v) => onChange({ ...config, activity_type: v })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="system">System Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Activity Description</Label>
            <Textarea
              value={String(config.description || '')}
              onChange={(e) => onChange({ ...config, description: e.target.value })}
              disabled={disabled}
              placeholder="Workflow completed: {{workflow_name}}"
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      )

    case 'trigger_webhook':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Webhook URL</Label>
            <Input
              type="url"
              value={String(config.webhook_url || '')}
              onChange={(e) => onChange({ ...config, webhook_url: e.target.value })}
              disabled={disabled}
              placeholder="https://api.example.com/webhook"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">HTTP Method</Label>
            <Select
              value={String(config.method || 'POST')}
              onValueChange={(v) => onChange({ ...config, method: v })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Custom Headers (JSON)</Label>
            <Textarea
              value={String(config.headers || '')}
              onChange={(e) => onChange({ ...config, headers: e.target.value })}
              disabled={disabled}
              placeholder='{"Authorization": "Bearer xxx"}'
              rows={2}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>
      )

    case 'run_workflow':
      return (
        <div>
          <Label className="text-sm">Target Workflow ID</Label>
          <Input
            value={String(config.workflow_id || '')}
            onChange={(e) => onChange({ ...config, workflow_id: e.target.value })}
            disabled={disabled}
            placeholder="Enter workflow ID"
            className="mt-1"
          />
          <p className="text-xs text-charcoal-500 mt-1">
            The target workflow must be active and apply to the same entity type
          </p>
        </div>
      )

    case 'assign_user':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Assignment Type</Label>
            <Select
              value={String(config.assignment_type || 'specific')}
              onValueChange={(v) => onChange({ ...config, assignment_type: v })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific">Specific User</SelectItem>
                <SelectItem value="round_robin">Round Robin (Team)</SelectItem>
                <SelectItem value="load_balanced">Load Balanced</SelectItem>
                <SelectItem value="manager">Record Owner&apos;s Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.assignment_type === 'specific' && (
            <div>
              <Label className="text-sm">User ID</Label>
              <Input
                value={String(config.user_id || '')}
                onChange={(e) => onChange({ ...config, user_id: e.target.value })}
                disabled={disabled}
                placeholder="Enter user ID"
                className="mt-1"
              />
            </div>
          )}
          {config.assignment_type === 'round_robin' && (
            <div>
              <Label className="text-sm">Team/Pod ID</Label>
              <Input
                value={String(config.team_id || '')}
                onChange={(e) => onChange({ ...config, team_id: e.target.value })}
                disabled={disabled}
                placeholder="Enter team or pod ID"
                className="mt-1"
              />
            </div>
          )}
        </div>
      )

    case 'create_task':
      return (
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Task Title</Label>
            <Input
              value={String(config.task_title || '')}
              onChange={(e) => onChange({ ...config, task_title: e.target.value })}
              disabled={disabled}
              placeholder="Follow up on {{entity_type}} - {{name}}"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Task Description</Label>
            <Textarea
              value={String(config.task_description || '')}
              onChange={(e) => onChange({ ...config, task_description: e.target.value })}
              disabled={disabled}
              placeholder="Review and take action on..."
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Due In</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  min={1}
                  value={Number(config.due_in_value || 1)}
                  onChange={(e) => onChange({ ...config, due_in_value: Number(e.target.value) })}
                  disabled={disabled}
                  className="w-20"
                />
                <Select
                  value={String(config.due_in_unit || 'days')}
                  onValueChange={(v) => onChange({ ...config, due_in_unit: v })}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="business_days">Business Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm">Assign To</Label>
              <Select
                value={String(config.assign_to || 'owner')}
                onValueChange={(v) => onChange({ ...config, assign_to: v })}
                disabled={disabled}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Record Owner</SelectItem>
                  <SelectItem value="manager">Owner&apos;s Manager</SelectItem>
                  <SelectItem value="initiator">Workflow Initiator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className="p-4 text-center text-charcoal-500 bg-charcoal-50 rounded-lg">
          <p className="text-sm">No additional configuration required</p>
        </div>
      )
  }
}
