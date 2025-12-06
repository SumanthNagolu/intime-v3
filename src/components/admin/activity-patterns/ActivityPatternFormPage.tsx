'use client'

import { useState, useEffect, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Save,
  ArrowLeft,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  Compass,
  ClipboardList,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

// Types for form data
interface OutcomeData {
  label: string
  value: string
  color: 'green' | 'yellow' | 'orange' | 'red' | 'gray' | 'blue' | 'purple'
  nextAction: 'log_notes' | 'schedule_followup' | 'retry_later' | 'update_info' | 'mark_invalid' | 'create_task' | 'send_email' | 'none'
}

interface CustomFieldData {
  fieldName: string
  fieldLabel: string
  fieldType: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'textarea'
  isRequired: boolean
  defaultValue?: string
  options?: Array<{ label: string; value: string }>
}

interface FollowupRuleData {
  outcome: string
  delayHours: number
  taskTitle: string
  assignTo: 'activity_owner' | 'manager' | 'specific_user'
  assigneeId?: string
}

interface PointMultiplierData {
  condition: {
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than'
    value: string | number | boolean
  }
  type: 'multiply' | 'add'
  value: number
}

// Color options for outcomes
const OUTCOME_COLORS = [
  { value: 'green', label: 'Green (Success)', className: 'bg-green-100 text-green-800' },
  { value: 'yellow', label: 'Yellow (Warning)', className: 'bg-yellow-100 text-yellow-800' },
  { value: 'orange', label: 'Orange (Pending)', className: 'bg-orange-100 text-orange-800' },
  { value: 'red', label: 'Red (Failed)', className: 'bg-red-100 text-red-800' },
  { value: 'gray', label: 'Gray (Neutral)', className: 'bg-gray-100 text-gray-800' },
  { value: 'blue', label: 'Blue (Info)', className: 'bg-blue-100 text-blue-800' },
  { value: 'purple', label: 'Purple (Special)', className: 'bg-purple-100 text-purple-800' },
]

// Next action options
const NEXT_ACTIONS = [
  { value: 'none', label: 'No action' },
  { value: 'log_notes', label: 'Log additional notes' },
  { value: 'schedule_followup', label: 'Schedule follow-up' },
  { value: 'retry_later', label: 'Set retry reminder' },
  { value: 'update_info', label: 'Update contact info' },
  { value: 'mark_invalid', label: 'Mark as invalid' },
  { value: 'create_task', label: 'Create task' },
  { value: 'send_email', label: 'Send email' },
]

// Category icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  communication: <Phone className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  workflow: <FileText className="w-4 h-4" />,
  documentation: <ClipboardList className="w-4 h-4" />,
  research: <Compass className="w-4 h-4" />,
  administrative: <CheckSquare className="w-4 h-4" />,
}

// Common emojis for activity patterns
const COMMON_ICONS = [
  '📞', '📧', '📅', '📝', '✅', '📋', '🔍', '💼',
  '📊', '📈', '🤝', '💬', '📁', '🎯', '⏰', '📌',
]

interface ActivityPatternFormPageProps {
  params?: Promise<{ id: string }>
}

export function ActivityPatternFormPage({ params }: ActivityPatternFormPageProps) {
  const router = useRouter()
  const resolvedParams = params ? use(params) : null
  const patternId = resolvedParams?.id
  const isEdit = !!patternId

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState<string>('communication')
  const [description, setDescription] = useState('')
  const [entityType, setEntityType] = useState<string>('general')
  const [icon, setIcon] = useState('📞')
  const [color, setColor] = useState('blue')
  const [displayOrder, setDisplayOrder] = useState(100)

  // Fields
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([])

  // Outcomes
  const [outcomes, setOutcomes] = useState<OutcomeData[]>([
    { label: 'Successful', value: 'successful', color: 'green', nextAction: 'log_notes' },
    { label: 'Unsuccessful', value: 'unsuccessful', color: 'red', nextAction: 'schedule_followup' },
  ])

  // Automation
  const [autoLogIntegrations, setAutoLogIntegrations] = useState<string[]>([])
  const [followupRules, setFollowupRules] = useState<FollowupRuleData[]>([])

  // Points
  const [points, setPoints] = useState(0)
  const [pointMultipliers, setPointMultipliers] = useState<PointMultiplierData[]>([])

  // Display options
  const [showInTimeline, setShowInTimeline] = useState(true)
  const [defaultAssignee, setDefaultAssignee] = useState<'owner' | 'manager' | 'pod' | 'specific_user'>('owner')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [targetDays, setTargetDays] = useState(1)

  const utils = trpc.useUtils()

  // Queries
  const categoriesQuery = trpc.activityPatterns.getCategories.useQuery()
  const entityTypesQuery = trpc.activityPatterns.getEntityTypes.useQuery()
  const patternQuery = trpc.activityPatterns.getById.useQuery(
    { id: patternId! },
    { enabled: isEdit && !!patternId }
  )

  // Mutations
  const createMutation = trpc.activityPatterns.create.useMutation({
    onSuccess: (data) => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      toast.success('Pattern created successfully')
      router.push(`/employee/admin/activity-patterns/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create pattern')
    },
  })

  const updateMutation = trpc.activityPatterns.update.useMutation({
    onSuccess: () => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      utils.activityPatterns.getById.invalidate({ id: patternId! })
      toast.success('Pattern updated successfully')
      router.push(`/employee/admin/activity-patterns/${patternId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update pattern')
    },
  })

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && patternQuery.data) {
      const p = patternQuery.data
      setName(p.name)
      setCode(p.code)
      setCategory(p.category || 'communication')
      setDescription(p.description || '')
      setEntityType(p.entity_type || 'general')
      setIcon(p.icon || '📞')
      setColor(p.color || 'blue')
      setDisplayOrder(p.display_order || 100)
      setOutcomes((p.outcomes as OutcomeData[]) || [])
      setAutoLogIntegrations(p.auto_log_integrations || [])
      setFollowupRules((p.followup_rules as FollowupRuleData[]) || [])
      setPoints(Number(p.points) || 0)
      setPointMultipliers((p.point_multipliers as PointMultiplierData[]) || [])
      setShowInTimeline(p.show_in_timeline ?? true)
      setDefaultAssignee((p.default_assignee as 'owner' | 'manager' | 'pod' | 'specific_user') || 'owner')
      setPriority((p.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal')
      setTargetDays(p.target_days || 1)

      // Load custom fields from pattern_fields
      if (p.pattern_fields) {
        setCustomFields((p.pattern_fields as Array<{
          field_name: string
          field_label: string
          field_type: string
          is_required: boolean
          default_value?: string
          options?: Array<{ label: string; value: string }>
        }>).map(f => ({
          fieldName: f.field_name,
          fieldLabel: f.field_label,
          fieldType: f.field_type as CustomFieldData['fieldType'],
          isRequired: f.is_required,
          defaultValue: f.default_value,
          options: f.options,
        })))
      }
    }
  }, [isEdit, patternQuery.data])

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (!name.trim()) errors.push('Name is required')
    if (name.length < 3) errors.push('Name must be at least 3 characters')
    if (!category) errors.push('Category is required')
    if (!entityType) errors.push('Entity type is required')
    if (outcomes.length === 0) errors.push('At least one outcome is required')
    outcomes.forEach((o, i) => {
      if (!o.label.trim()) errors.push(`Outcome ${i + 1}: Label is required`)
      if (!o.value.trim()) errors.push(`Outcome ${i + 1}: Value is required`)
    })
    return errors
  }, [name, category, entityType, outcomes])

  // Generate code from name
  useEffect(() => {
    if (!isEdit && name && !code) {
      setCode(name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))
    }
  }, [name, code, isEdit])

  const handleSave = () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0])
      return
    }

    const data = {
      name,
      code: code || undefined,
      category: category as 'communication' | 'calendar' | 'workflow' | 'documentation' | 'research' | 'administrative',
      description: description || undefined,
      entityType,
      icon,
      color,
      displayOrder,
      customFields,
      outcomes,
      autoLogIntegrations,
      followupRules,
      points,
      pointMultipliers,
      showInTimeline,
      defaultAssignee,
      priority,
      targetDays,
      requiredFields: customFields.filter(f => f.isRequired).map(f => f.fieldName),
      fieldDependencies: [],
    }

    if (isEdit) {
      updateMutation.mutate({ id: patternId!, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Activity Patterns', href: '/employee/admin/activity-patterns' },
    { label: isEdit ? 'Edit Pattern' : 'New Pattern' },
  ]

  if (isEdit && patternQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  if (isEdit && patternQuery.data?.is_system) {
    return (
      <DashboardShell title="System Pattern" breadcrumbs={breadcrumbs}>
        <div className="p-8 text-center bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">System Pattern</h3>
          <p className="text-charcoal-600 mb-4">
            This is a system-defined pattern and cannot be modified. You can duplicate it to create a custom version.
          </p>
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

  return (
    <DashboardShell
      title={isEdit ? 'Edit Activity Pattern' : 'New Activity Pattern'}
      description={isEdit ? 'Update the pattern configuration' : 'Configure a new activity type'}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/employee/admin/activity-patterns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={validationErrors.length > 0 || createMutation.isPending || updateMutation.isPending}
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Pattern'}
          </Button>
        </div>
      }
    >
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-600">
            {validationErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <DashboardSection title="Basic Information" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Pattern Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Phone Call - Outbound"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="code">Code (auto-generated)</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., phone_call_outbound"
                className="mt-1"
              />
              <p className="text-xs text-charcoal-500 mt-1">Unique identifier used in API calls</p>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data?.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        {CATEGORY_ICONS[cat.value]}
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entityTypesQuery.data?.map((entity) => (
                    <SelectItem key={entity.value} value={entity.value}>
                      {entity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of when to use this activity type..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COMMON_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg border transition-all ${
                      icon === emoji
                        ? 'border-hublot-600 bg-hublot-50 ring-2 ring-hublot-600'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Default Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'normal' | 'high' | 'urgent')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetDays">Target Days</Label>
                <Input
                  id="targetDays"
                  type="number"
                  min={1}
                  max={365}
                  value={targetDays}
                  onChange={(e) => setTargetDays(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Section 2: Custom Fields */}
      <DashboardSection title="Custom Fields" className="mb-6">
        <p className="text-sm text-charcoal-500 mb-4">
          Define additional fields that users must fill when logging this activity type.
        </p>
        <div className="space-y-4">
          {customFields.map((field, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-charcoal-50 rounded-lg">
              <GripVertical className="w-4 h-4 text-charcoal-400 mt-2 cursor-grab" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Field name (e.g., call_duration)"
                  value={field.fieldName}
                  onChange={(e) => {
                    const updated = [...customFields]
                    updated[index].fieldName = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                    setCustomFields(updated)
                  }}
                />
                <Input
                  placeholder="Label (e.g., Call Duration)"
                  value={field.fieldLabel}
                  onChange={(e) => {
                    const updated = [...customFields]
                    updated[index].fieldLabel = e.target.value
                    setCustomFields(updated)
                  }}
                />
                <Select
                  value={field.fieldType}
                  onValueChange={(v) => {
                    const updated = [...customFields]
                    updated[index].fieldType = v as CustomFieldData['fieldType']
                    setCustomFields(updated)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Field Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={field.isRequired}
                      onCheckedChange={(checked) => {
                        const updated = [...customFields]
                        updated[index].isRequired = checked
                        setCustomFields(updated)
                      }}
                    />
                    Required
                  </label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setCustomFields([...customFields, {
              fieldName: '',
              fieldLabel: '',
              fieldType: 'text',
              isRequired: false,
            }])}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      </DashboardSection>

      {/* Section 3: Outcomes */}
      <DashboardSection title="Outcomes *" className="mb-6">
        <p className="text-sm text-charcoal-500 mb-4">
          Define the possible outcomes when this activity is completed. At least one outcome is required.
        </p>
        <div className="space-y-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="p-4 bg-charcoal-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Label *</Label>
                  <Input
                    value={outcome.label}
                    onChange={(e) => {
                      const updated = [...outcomes]
                      updated[index].label = e.target.value
                      setOutcomes(updated)
                    }}
                    placeholder="e.g., Connected"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Value *</Label>
                  <Input
                    value={outcome.value}
                    onChange={(e) => {
                      const updated = [...outcomes]
                      updated[index].value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                      setOutcomes(updated)
                    }}
                    placeholder="e.g., connected"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Select
                    value={outcome.color}
                    onValueChange={(v) => {
                      const updated = [...outcomes]
                      updated[index].color = v as OutcomeData['color']
                      setOutcomes(updated)
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOME_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.className}`}>
                            {c.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Next Action</Label>
                    <Select
                      value={outcome.nextAction}
                      onValueChange={(v) => {
                        const updated = [...outcomes]
                        updated[index].nextAction = v as OutcomeData['nextAction']
                        setOutcomes(updated)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NEXT_ACTIONS.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOutcomes(outcomes.filter((_, i) => i !== index))}
                    disabled={outcomes.length <= 1}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setOutcomes([...outcomes, {
              label: '',
              value: '',
              color: 'gray',
              nextAction: 'none',
            }])}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Outcome
          </Button>
        </div>
      </DashboardSection>

      {/* Section 4: Automation & Points */}
      <DashboardSection title="Automation & Points" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Auto-Log Integrations</Label>
              <p className="text-xs text-charcoal-500 mb-2">
                Select integrations that should automatically log this activity type
              </p>
              <div className="space-y-2">
                {['gmail', 'outlook', 'calendar', 'slack'].map((integration) => (
                  <label key={integration} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoLogIntegrations.includes(integration)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAutoLogIntegrations([...autoLogIntegrations, integration])
                        } else {
                          setAutoLogIntegrations(autoLogIntegrations.filter(i => i !== integration))
                        }
                      }}
                      className="rounded border-charcoal-300"
                    />
                    <span className="capitalize">{integration}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="showInTimeline">Show in Timeline</Label>
              <Switch
                id="showInTimeline"
                checked={showInTimeline}
                onCheckedChange={setShowInTimeline}
              />
            </div>
            <div>
              <Label htmlFor="defaultAssignee">Default Assignee</Label>
              <Select value={defaultAssignee} onValueChange={(v) => setDefaultAssignee(v as typeof defaultAssignee)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Entity Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="pod">Pod</SelectItem>
                  <SelectItem value="specific_user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="points">Base Points</Label>
              <Input
                id="points"
                type="number"
                min={0}
                max={100}
                value={points}
                onChange={(e) => setPoints(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-charcoal-500 mt-1">Points earned when this activity is logged</p>
            </div>
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 100)}
                className="mt-1"
              />
              <p className="text-xs text-charcoal-500 mt-1">Lower numbers appear first in lists</p>
            </div>
          </div>
        </div>

        {/* Follow-up Rules */}
        <div className="mt-6">
          <Label className="text-base">Follow-up Rules</Label>
          <p className="text-sm text-charcoal-500 mb-4">
            Automatically create follow-up tasks based on the activity outcome
          </p>
          <div className="space-y-4">
            {followupRules.map((rule, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>When outcome is</Label>
                    <Select
                      value={rule.outcome}
                      onValueChange={(v) => {
                        const updated = [...followupRules]
                        updated[index].outcome = v
                        setFollowupRules(updated)
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {outcomes.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Create task after (hours)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={720}
                      value={rule.delayHours}
                      onChange={(e) => {
                        const updated = [...followupRules]
                        updated[index].delayHours = parseInt(e.target.value) || 24
                        setFollowupRules(updated)
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Task title</Label>
                    <Input
                      value={rule.taskTitle}
                      onChange={(e) => {
                        const updated = [...followupRules]
                        updated[index].taskTitle = e.target.value
                        setFollowupRules(updated)
                      }}
                      placeholder="e.g., Follow up call"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label>Assign to</Label>
                      <Select
                        value={rule.assignTo}
                        onValueChange={(v) => {
                          const updated = [...followupRules]
                          updated[index].assignTo = v as FollowupRuleData['assignTo']
                          setFollowupRules(updated)
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activity_owner">Activity Owner</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="specific_user">Specific User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFollowupRules(followupRules.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setFollowupRules([...followupRules, {
                outcome: outcomes[0]?.value || '',
                delayHours: 24,
                taskTitle: '',
                assignTo: 'activity_owner',
              }])}
              disabled={outcomes.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Follow-up Rule
            </Button>
          </div>
        </div>
      </DashboardSection>
    </DashboardShell>
  )
}
