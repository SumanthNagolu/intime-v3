'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, ChevronDown, ChevronUp, GripVertical, ArrowDown, User, Users, UserCog, Crown, Code } from 'lucide-react'
import {
  type WorkflowStep,
  type ApproverType,
  type TimeoutUnit,
  type TimeoutAction,
} from '@/lib/workflows/types'

interface ApprovalStepsBuilderProps {
  value: WorkflowStep[]
  onChange: (steps: WorkflowStep[]) => void
  disabled?: boolean
}

const APPROVER_TYPES: { value: ApproverType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'specific_user', label: 'Specific User', description: 'Select a specific user', icon: <User className="w-4 h-4" /> },
  { value: 'record_owner', label: 'Record Owner', description: "The record's owner", icon: <UserCog className="w-4 h-4" /> },
  { value: 'owners_manager', label: "Owner's Manager", description: "The record owner's manager", icon: <Crown className="w-4 h-4" /> },
  { value: 'role_based', label: 'Role-Based', description: 'Any user with specific role', icon: <Users className="w-4 h-4" /> },
  { value: 'pod_manager', label: 'Pod Manager', description: "The record owner's pod manager", icon: <Users className="w-4 h-4" /> },
  { value: 'custom_formula', label: 'Custom Formula', description: 'JavaScript expression', icon: <Code className="w-4 h-4" /> },
]

const TIMEOUT_UNITS: { value: TimeoutUnit; label: string }[] = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'business_hours', label: 'Business Hours' },
  { value: 'days', label: 'Days' },
  { value: 'business_days', label: 'Business Days' },
]

const TIMEOUT_ACTIONS: { value: TimeoutAction; label: string; description: string }[] = [
  { value: 'escalate', label: 'Escalate to next step', description: 'Move to the next approval step' },
  { value: 'auto_approve', label: 'Auto-approve', description: 'Automatically approve after timeout' },
  { value: 'auto_reject', label: 'Auto-reject', description: 'Automatically reject after timeout' },
  { value: 'reminder', label: 'Send reminder', description: 'Send a reminder notification' },
  { value: 'nothing', label: 'Do nothing', description: 'Wait indefinitely' },
]

export function ApprovalStepsBuilder({
  value,
  onChange,
  disabled = false,
}: ApprovalStepsBuilderProps) {
  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      stepName: `Step ${value.length + 1}`,
      stepOrder: value.length + 1,
      approverType: 'owners_manager',
      approverConfig: {},
      timeoutHours: 24,
      timeoutUnit: 'hours',
      timeoutAction: 'escalate',
      reminderEnabled: false,
      reminderPercent: 50,
    }
    onChange([...value, newStep])
  }, [onChange, value])

  const updateStep = useCallback((index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...value]
    newSteps[index] = { ...newSteps[index], ...updates }

    // Reset approver config when type changes
    if (updates.approverType) {
      newSteps[index].approverConfig = {}
    }

    onChange(newSteps)
  }, [onChange, value])

  const removeStep = useCallback((index: number) => {
    const newSteps = value.filter((_, i) => i !== index)
    // Update step orders
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1
    })
    onChange(newSteps)
  }, [onChange, value])

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    const newSteps = [...value]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newSteps.length) return

    // Swap steps
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]

    // Update step orders
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1
    })

    onChange(newSteps)
  }, [onChange, value])

  return (
    <div className="space-y-4">
      {/* Steps List */}
      <div className="space-y-4">
        {value.map((step, index) => (
          <div key={index}>
            <StepCard
              step={step}
              index={index}
              totalSteps={value.length}
              onChange={(updates) => updateStep(index, updates)}
              onRemove={() => removeStep(index)}
              onMoveUp={() => moveStep(index, 'up')}
              onMoveDown={() => moveStep(index, 'down')}
              disabled={disabled}
            />
            {/* Arrow between steps */}
            {index < value.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-5 h-5 text-charcoal-300" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {value.length === 0 && (
        <div className="p-8 text-center bg-charcoal-50 rounded-lg border border-dashed border-charcoal-200">
          <Users className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
          <h3 className="text-sm font-medium text-charcoal-700 mb-1">No approval steps</h3>
          <p className="text-sm text-charcoal-500 mb-4">Add approval steps to create an approval chain</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStep}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add First Step
          </Button>
        </div>
      )}

      {/* Add Step Button */}
      {value.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Approval Step
        </Button>
      )}
    </div>
  )
}

// Step Card Component
interface StepCardProps {
  step: WorkflowStep
  index: number
  totalSteps: number
  onChange: (updates: Partial<WorkflowStep>) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  disabled?: boolean
}

function StepCard({
  step,
  index,
  totalSteps,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled,
}: StepCardProps) {
  const approverTypeConfig = APPROVER_TYPES.find(t => t.value === step.approverType)

  return (
    <div className="bg-white rounded-lg border border-charcoal-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-charcoal-50 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="p-1 text-charcoal-400 cursor-grab">
            <GripVertical className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-charcoal-700">
            Step {index + 1}
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
            disabled={disabled || index === totalSteps - 1}
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
        {/* Step Name */}
        <div>
          <Label htmlFor={`step-name-${index}`} className="text-sm">Step Name</Label>
          <Input
            id={`step-name-${index}`}
            value={step.stepName}
            onChange={(e) => onChange({ stepName: e.target.value })}
            disabled={disabled}
            placeholder="e.g., Manager Approval"
            className="mt-1"
          />
        </div>

        {/* Approver Type */}
        <div>
          <Label className="text-sm">Approver</Label>
          <Select
            value={step.approverType}
            onValueChange={(v) => onChange({ approverType: v as ApproverType })}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select approver type" />
            </SelectTrigger>
            <SelectContent>
              {APPROVER_TYPES.map((type) => (
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

        {/* Approver Config (based on type) */}
        <ApproverConfigFields
          approverType={step.approverType}
          config={step.approverConfig}
          onChange={(config) => onChange({ approverConfig: config })}
          disabled={disabled}
        />

        {/* Timeout Configuration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Timeout</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                min={1}
                max={720}
                value={step.timeoutHours ?? 24}
                onChange={(e) => onChange({ timeoutHours: Number(e.target.value) || 24 })}
                disabled={disabled}
                className="w-20"
              />
              <Select
                value={step.timeoutUnit}
                onValueChange={(v) => onChange({ timeoutUnit: v as TimeoutUnit })}
                disabled={disabled}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEOUT_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm">On Timeout</Label>
            <Select
              value={step.timeoutAction ?? 'escalate'}
              onValueChange={(v) => onChange({ timeoutAction: v as TimeoutAction })}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEOUT_ACTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reminder Configuration */}
        <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              id={`reminder-${index}`}
              checked={step.reminderEnabled}
              onCheckedChange={(checked) => onChange({ reminderEnabled: checked })}
              disabled={disabled}
            />
            <Label htmlFor={`reminder-${index}`} className="text-sm">
              Send reminder
            </Label>
          </div>
          {step.reminderEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-charcoal-500">at</span>
              <Input
                type="number"
                min={0}
                max={100}
                value={step.reminderPercent ?? 50}
                onChange={(e) => onChange({ reminderPercent: Number(e.target.value) || 50 })}
                disabled={disabled}
                className="w-16 h-8"
              />
              <span className="text-sm text-charcoal-500">% of timeout</span>
            </div>
          )}
        </div>

        {/* Calculated reminder time */}
        {step.reminderEnabled && step.timeoutHours && step.reminderPercent && (
          <p className="text-xs text-charcoal-500">
            Reminder will be sent after {Math.round(step.timeoutHours * (step.reminderPercent / 100))} {step.timeoutUnit}
          </p>
        )}
      </div>
    </div>
  )
}

// Approver Config Fields (based on type)
interface ApproverConfigFieldsProps {
  approverType: ApproverType
  config: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
  disabled?: boolean
}

function ApproverConfigFields({
  approverType,
  config,
  onChange,
  disabled,
}: ApproverConfigFieldsProps) {
  switch (approverType) {
    case 'specific_user':
      return (
        <div>
          <Label className="text-sm">Select User</Label>
          <Input
            value={String(config.user_id ?? '')}
            onChange={(e) => onChange({ ...config, user_id: e.target.value })}
            disabled={disabled}
            placeholder="Enter user ID"
            className="mt-1"
          />
          <p className="text-xs text-charcoal-500 mt-1">
            Enter the user ID or use the user selector
          </p>
        </div>
      )

    case 'role_based':
      return (
        <div>
          <Label className="text-sm">Select Role</Label>
          <Select
            value={String(config.role_name ?? '')}
            onValueChange={(v) => onChange({ ...config, role_name: v })}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="vp">VP</SelectItem>
              <SelectItem value="regional_director">Regional Director</SelectItem>
              <SelectItem value="hr_admin">HR Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )

    case 'custom_formula':
      return (
        <div>
          <Label className="text-sm">JavaScript Expression</Label>
          <textarea
            value={String(config.formula ?? '')}
            onChange={(e) => onChange({ ...config, formula: e.target.value })}
            disabled={disabled}
            placeholder="return record.custom_approver_id;"
            className="mt-1 w-full px-3 py-2 border border-charcoal-200 rounded-lg text-sm font-mono bg-charcoal-50"
            rows={3}
          />
          <p className="text-xs text-charcoal-500 mt-1">
            Must return a user ID. Available variables: record, owner, org
          </p>
        </div>
      )

    default:
      return null
  }
}
