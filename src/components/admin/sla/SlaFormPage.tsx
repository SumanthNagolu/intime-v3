'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Timer,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

type EscalationLevel = {
  levelNumber: number
  levelName: string
  triggerPercentage: number
  notifyEmail: boolean
  emailRecipients: string[]
  notifySlack: boolean
  slackChannel: string
  showBadge: boolean
  badgeColor: 'yellow' | 'orange' | 'red'
  addToReport: boolean
  addToDashboard: boolean
  createTask: boolean
  taskAssignee: string
  escalateOwnership: boolean
  escalateTo: string
  requireResolutionNotes: boolean
}

type Condition = {
  field: string
  operator: string
  value: unknown
}

interface SlaFormPageProps {
  mode: 'create' | 'edit'
  ruleId?: string
}

export function SlaFormPage({ mode, ruleId }: SlaFormPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [entityType, setEntityType] = useState('')
  const [startEvent, setStartEvent] = useState('')
  const [endEvent, setEndEvent] = useState('')
  const [targetValue, setTargetValue] = useState(4)
  const [targetUnit, setTargetUnit] = useState('business_hours')
  const [useBusinessHours, setUseBusinessHours] = useState(true)
  const [excludeWeekends, setExcludeWeekends] = useState(true)
  const [excludeHolidays, setExcludeHolidays] = useState(true)
  const [pauseOnHold, setPauseOnHold] = useState(false)
  const [conditions, setConditions] = useState<Condition[]>([])
  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>([
    {
      levelNumber: 1,
      levelName: 'Warning',
      triggerPercentage: 75,
      notifyEmail: true,
      emailRecipients: ['owner'],
      notifySlack: false,
      slackChannel: '',
      showBadge: true,
      badgeColor: 'yellow',
      addToReport: false,
      addToDashboard: false,
      createTask: false,
      taskAssignee: '',
      escalateOwnership: false,
      escalateTo: '',
      requireResolutionNotes: false,
    },
    {
      levelNumber: 2,
      levelName: 'Breach',
      triggerPercentage: 100,
      notifyEmail: true,
      emailRecipients: ['owner', 'owners_manager'],
      notifySlack: false,
      slackChannel: '',
      showBadge: true,
      badgeColor: 'red',
      addToReport: true,
      addToDashboard: true,
      createTask: false,
      taskAssignee: '',
      escalateOwnership: false,
      escalateTo: '',
      requireResolutionNotes: true,
    },
  ])
  const [activateNow, setActivateNow] = useState(false)
  const [applyRetroactive, setApplyRetroactive] = useState(false)
  const [expandedLevels, setExpandedLevels] = useState<number[]>([0, 1])
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    totalRecords: number
    metSla: number
    wouldWarning: number
    wouldBreach: number
    projectedComplianceRate: number
  } | null>(null)

  // Queries
  const categoriesQuery = trpc.sla.getCategories.useQuery()
  const entityTypesQuery = trpc.sla.getEntityTypes.useQuery()
  const eventsQuery = trpc.sla.getEventsForEntity.useQuery(
    { entityType: entityType as 'jobs' | 'candidates' | 'submissions' | 'placements' | 'accounts' | 'leads' | 'interviews' | 'offers' },
    { enabled: !!entityType }
  )

  // Load existing rule for edit mode
  const ruleQuery = trpc.sla.getById.useQuery(
    { id: ruleId! },
    { enabled: mode === 'edit' && !!ruleId }
  )

  // Mutations
  const createMutation = trpc.sla.create.useMutation({
    onSuccess: (data) => {
      utils.sla.list.invalidate()
      toast.success('SLA rule created')
      router.push(`/employee/admin/sla/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create SLA rule')
    },
  })

  const updateMutation = trpc.sla.update.useMutation({
    onSuccess: () => {
      utils.sla.list.invalidate()
      utils.sla.getById.invalidate({ id: ruleId! })
      toast.success('SLA rule updated')
      router.push(`/employee/admin/sla/${ruleId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update SLA rule')
    },
  })

  const testMutation = trpc.sla.test.useQuery(
    { id: ruleId!, days: 7 },
    { enabled: false }
  )

  // Load existing data for edit mode
  useEffect(() => {
    if (mode === 'edit' && ruleQuery.data) {
      const rule = ruleQuery.data
      setName(rule.name || '')
      setDescription(rule.description || '')
      setCategory(rule.category || '')
      setEntityType(rule.entity_type || '')
      setStartEvent(rule.start_event || '')
      setEndEvent(rule.end_event || '')
      setTargetValue(rule.target_value || 4)
      setTargetUnit(rule.target_unit || 'business_hours')
      setUseBusinessHours(rule.business_hours_only ?? true)
      setExcludeWeekends(rule.exclude_weekends ?? true)
      setPauseOnHold(rule.pause_on_hold ?? false)
      setConditions(rule.conditions as Condition[] || [])
      if (rule.escalation_levels && rule.escalation_levels.length > 0) {
        setEscalationLevels(rule.escalation_levels.map((level: {
          level_number: number
          level_name: string
          trigger_percentage: number
          notify_email: boolean
          email_recipients: string[]
          notify_slack: boolean
          slack_channel: string | null
          show_badge: boolean
          badge_color: string
          add_to_report: boolean
          add_to_dashboard: boolean
          create_task: boolean
          task_assignee: string | null
          escalate_ownership: boolean
          escalate_to: string | null
          require_resolution_notes: boolean
        }) => ({
          levelNumber: level.level_number,
          levelName: level.level_name,
          triggerPercentage: level.trigger_percentage,
          notifyEmail: level.notify_email,
          emailRecipients: level.email_recipients || [],
          notifySlack: level.notify_slack,
          slackChannel: level.slack_channel || '',
          showBadge: level.show_badge,
          badgeColor: level.badge_color as 'yellow' | 'orange' | 'red',
          addToReport: level.add_to_report,
          addToDashboard: level.add_to_dashboard,
          createTask: level.create_task,
          taskAssignee: level.task_assignee || '',
          escalateOwnership: level.escalate_ownership,
          escalateTo: level.escalate_to || '',
          requireResolutionNotes: level.require_resolution_notes,
        })))
        setExpandedLevels(rule.escalation_levels.map((_: unknown, i: number) => i))
      }
    }
  }, [mode, ruleQuery.data])

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'SLA Config', href: '/employee/admin/sla' },
    { label: mode === 'create' ? 'New Rule' : 'Edit Rule' },
  ]

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (name.length < 5) {
      toast.error('Name must be at least 5 characters')
      return
    }
    if (!category) {
      toast.error('Category is required')
      return
    }
    if (!entityType) {
      toast.error('Entity type is required')
      return
    }
    if (!startEvent) {
      toast.error('Start event is required')
      return
    }
    if (!endEvent) {
      toast.error('End event is required')
      return
    }
    if (targetValue < 1) {
      toast.error('Target value must be at least 1')
      return
    }
    if (escalationLevels.length === 0) {
      toast.error('At least one escalation level is required')
      return
    }

    // Validate escalation levels are in order
    for (let i = 1; i < escalationLevels.length; i++) {
      if (escalationLevels[i].triggerPercentage <= escalationLevels[i - 1].triggerPercentage) {
        toast.error(`Escalation level ${i + 1} must have a higher trigger percentage than level ${i}`)
        return
      }
    }

    const payload = {
      name,
      category: category as 'response_time' | 'submission_speed' | 'interview_schedule' | 'interview_feedback' | 'offer_response' | 'onboarding' | 'client_touch' | 'candidate_followup' | 'document_collection' | 'timesheet_approval',
      description,
      entityType: entityType as 'jobs' | 'candidates' | 'submissions' | 'placements' | 'accounts' | 'leads' | 'interviews' | 'offers',
      startEvent,
      endEvent,
      targetValue,
      targetUnit: targetUnit as 'minutes' | 'hours' | 'business_hours' | 'days' | 'business_days' | 'weeks',
      useBusinessHours,
      excludeWeekends,
      excludeHolidays,
      pauseOnHold,
      conditions,
      escalationLevels,
      activate: activateNow,
      applyRetroactive,
    }

    if (mode === 'create') {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate({
        id: ruleId!,
        name,
        description,
        targetValue,
        targetUnit: targetUnit as 'minutes' | 'hours' | 'business_hours' | 'days' | 'business_days' | 'weeks',
        useBusinessHours,
        excludeWeekends,
        pauseOnHold,
        conditions,
        escalationLevels,
      })
    }
  }

  const addEscalationLevel = () => {
    const lastLevel = escalationLevels[escalationLevels.length - 1]
    const newLevel: EscalationLevel = {
      levelNumber: escalationLevels.length + 1,
      levelName: `Level ${escalationLevels.length + 1}`,
      triggerPercentage: lastLevel ? Math.min(lastLevel.triggerPercentage + 25, 200) : 75,
      notifyEmail: true,
      emailRecipients: ['owner'],
      notifySlack: false,
      slackChannel: '',
      showBadge: true,
      badgeColor: 'orange',
      addToReport: false,
      addToDashboard: false,
      createTask: false,
      taskAssignee: '',
      escalateOwnership: false,
      escalateTo: '',
      requireResolutionNotes: false,
    }
    setEscalationLevels([...escalationLevels, newLevel])
    setExpandedLevels([...expandedLevels, escalationLevels.length])
  }

  const removeEscalationLevel = (index: number) => {
    if (escalationLevels.length <= 1) {
      toast.error('At least one escalation level is required')
      return
    }
    const newLevels = escalationLevels.filter((_, i) => i !== index).map((level, i) => ({
      ...level,
      levelNumber: i + 1,
    }))
    setEscalationLevels(newLevels)
    setExpandedLevels(expandedLevels.filter(i => i !== index).map(i => i > index ? i - 1 : i))
  }

  const updateEscalationLevel = (index: number, updates: Partial<EscalationLevel>) => {
    const newLevels = [...escalationLevels]
    newLevels[index] = { ...newLevels[index], ...updates }
    setEscalationLevels(newLevels)
  }

  const toggleLevelExpanded = (index: number) => {
    if (expandedLevels.includes(index)) {
      setExpandedLevels(expandedLevels.filter(i => i !== index))
    } else {
      setExpandedLevels([...expandedLevels, index])
    }
  }

  const handleTestRule = async () => {
    if (mode !== 'edit' || !ruleId) {
      toast.error('Save the rule first to test it')
      return
    }
    setIsTesting(true)
    try {
      const result = await testMutation.refetch()
      if (result.data) {
        setTestResults(result.data)
      }
    } catch {
      toast.error('Failed to test rule')
    }
    setIsTesting(false)
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isEditLoading = mode === 'edit' && ruleQuery.isLoading

  if (isEditLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title={mode === 'create' ? 'Create SLA Rule' : 'Edit SLA Rule'}
      description={mode === 'create' ? 'Define a new service level agreement' : `Editing: ${name}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Rule' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <DashboardSection title="Basic Information">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., First Contact SLA"
                  className="mt-1"
                />
                <p className="text-xs text-charcoal-400 mt-1">
                  Minimum 5 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this SLA measures..."
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesQuery.data?.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entityType">Applies To *</Label>
                  <Select value={entityType} onValueChange={(v) => {
                    setEntityType(v)
                    setStartEvent('')
                    setEndEvent('')
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypesQuery.data?.map((ent) => (
                        <SelectItem key={ent.value} value={ent.value}>
                          {ent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </DashboardSection>

          {/* SLA Timing */}
          <DashboardSection title="SLA Timing">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startEvent">Clock Starts When *</Label>
                  <Select
                    value={startEvent}
                    onValueChange={setStartEvent}
                    disabled={!entityType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select start event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsQuery.data?.startEvents.map((evt) => (
                        <SelectItem key={evt.value} value={evt.value}>
                          {evt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endEvent">Clock Stops When *</Label>
                  <Select
                    value={endEvent}
                    onValueChange={setEndEvent}
                    disabled={!entityType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select end event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventsQuery.data?.endEvents.map((evt) => (
                        <SelectItem key={evt.value} value={evt.value}>
                          {evt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue">Target Time *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="targetValue"
                      type="number"
                      min={1}
                      max={9999}
                      value={targetValue}
                      onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <Select value={targetUnit} onValueChange={setTargetUnit}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="business_hours">Business Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="business_days">Business Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-charcoal-100 pt-4">
                <h4 className="text-sm font-medium text-charcoal-700 mb-3">Time Calculation Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Use Business Hours Only</Label>
                      <p className="text-xs text-charcoal-400">Only count time during work hours (9am-5pm)</p>
                    </div>
                    <Switch
                      checked={useBusinessHours}
                      onCheckedChange={setUseBusinessHours}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Exclude Weekends</Label>
                      <p className="text-xs text-charcoal-400">Don&apos;t count Saturday and Sunday</p>
                    </div>
                    <Switch
                      checked={excludeWeekends}
                      onCheckedChange={setExcludeWeekends}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Exclude Holidays</Label>
                      <p className="text-xs text-charcoal-400">Don&apos;t count company holidays</p>
                    </div>
                    <Switch
                      checked={excludeHolidays}
                      onCheckedChange={setExcludeHolidays}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Pause When On Hold</Label>
                      <p className="text-xs text-charcoal-400">Stop the clock when status is &quot;On Hold&quot;</p>
                    </div>
                    <Switch
                      checked={pauseOnHold}
                      onCheckedChange={setPauseOnHold}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>

          {/* Escalation Levels */}
          <DashboardSection
            title="Escalation Levels"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={addEscalationLevel}
                disabled={escalationLevels.length >= 10}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Level
              </Button>
            }
          >
            <div className="space-y-3">
              {escalationLevels.map((level, index) => (
                <div
                  key={index}
                  className="border border-charcoal-200 rounded-lg overflow-hidden"
                >
                  {/* Level Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-charcoal-50 cursor-pointer"
                    onClick={() => toggleLevelExpanded(index)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        level.badgeColor === 'red' ? 'bg-red-500' :
                        level.badgeColor === 'orange' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`} />
                      <span className="font-medium text-charcoal-800">
                        Level {level.levelNumber}: {level.levelName}
                      </span>
                      <span className="text-sm text-charcoal-500">
                        @ {level.triggerPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeEscalationLevel(index)
                        }}
                        disabled={escalationLevels.length <= 1}
                        className="text-charcoal-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedLevels.includes(index) ? (
                        <ChevronUp className="w-4 h-4 text-charcoal-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-charcoal-400" />
                      )}
                    </div>
                  </div>

                  {/* Level Content */}
                  {expandedLevels.includes(index) && (
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Level Name</Label>
                          <Input
                            value={level.levelName}
                            onChange={(e) => updateEscalationLevel(index, { levelName: e.target.value })}
                            placeholder="e.g., Warning"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Trigger at %</Label>
                          <Input
                            type="number"
                            min={1}
                            max={500}
                            value={level.triggerPercentage}
                            onChange={(e) => updateEscalationLevel(index, { triggerPercentage: parseInt(e.target.value) || 75 })}
                            className="mt-1"
                          />
                          <p className="text-xs text-charcoal-400 mt-1">
                            100% = at target time
                          </p>
                        </div>
                        <div>
                          <Label>Badge Color</Label>
                          <Select
                            value={level.badgeColor}
                            onValueChange={(v) => updateEscalationLevel(index, { badgeColor: v as 'yellow' | 'orange' | 'red' })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yellow">Yellow</SelectItem>
                              <SelectItem value="orange">Orange</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="border-t border-charcoal-100 pt-4">
                        <h5 className="text-sm font-medium text-charcoal-700 mb-3">Notifications</h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`email-${index}`}
                              checked={level.notifyEmail}
                              onCheckedChange={(checked) => updateEscalationLevel(index, { notifyEmail: !!checked })}
                            />
                            <Label htmlFor={`email-${index}`} className="font-normal">Send Email</Label>
                          </div>
                          {level.notifyEmail && (
                            <div className="ml-6">
                              <Label className="text-xs">Recipients (comma-separated)</Label>
                              <Input
                                value={level.emailRecipients.join(', ')}
                                onChange={(e) => updateEscalationLevel(index, {
                                  emailRecipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="owner, owners_manager, pod_manager"
                                className="mt-1"
                              />
                              <p className="text-xs text-charcoal-400 mt-1">
                                Use: owner, owners_manager, pod_manager, or email addresses
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-charcoal-100 pt-4">
                        <h5 className="text-sm font-medium text-charcoal-700 mb-3">Actions</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`badge-${index}`}
                              checked={level.showBadge}
                              onCheckedChange={(checked) => updateEscalationLevel(index, { showBadge: !!checked })}
                            />
                            <Label htmlFor={`badge-${index}`} className="font-normal">Show Badge</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`report-${index}`}
                              checked={level.addToReport}
                              onCheckedChange={(checked) => updateEscalationLevel(index, { addToReport: !!checked })}
                            />
                            <Label htmlFor={`report-${index}`} className="font-normal">Add to Report</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`dashboard-${index}`}
                              checked={level.addToDashboard}
                              onCheckedChange={(checked) => updateEscalationLevel(index, { addToDashboard: !!checked })}
                            />
                            <Label htmlFor={`dashboard-${index}`} className="font-normal">Show on Dashboard</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`notes-${index}`}
                              checked={level.requireResolutionNotes}
                              onCheckedChange={(checked) => updateEscalationLevel(index, { requireResolutionNotes: !!checked })}
                            />
                            <Label htmlFor={`notes-${index}`} className="font-normal">Require Notes</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {escalationLevels.length === 0 && (
                <div className="text-center py-8 text-charcoal-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <p>Add at least one escalation level</p>
                </div>
              )}
            </div>
          </DashboardSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activation Options */}
          {mode === 'create' && (
            <DashboardSection title="Activation">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-normal">Activate Now</Label>
                    <p className="text-xs text-charcoal-400">Start monitoring immediately</p>
                  </div>
                  <Switch
                    checked={activateNow}
                    onCheckedChange={setActivateNow}
                  />
                </div>
                {activateNow && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-normal">Apply Retroactively</Label>
                      <p className="text-xs text-charcoal-400">Check existing records</p>
                    </div>
                    <Switch
                      checked={applyRetroactive}
                      onCheckedChange={setApplyRetroactive}
                    />
                  </div>
                )}
              </div>
            </DashboardSection>
          )}

          {/* Test Results */}
          {mode === 'edit' && (
            <DashboardSection title="Test Rule">
              <div className="space-y-4">
                <p className="text-sm text-charcoal-500">
                  Test this rule against recent records to see projected impact.
                </p>
                <Button
                  variant="outline"
                  onClick={handleTestRule}
                  disabled={isTesting}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
                {testResults && (
                  <div className="bg-charcoal-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Records Checked:</span>
                      <span className="font-medium">{testResults.totalRecords}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Would Meet SLA:</span>
                      <span className="font-medium text-green-600">{testResults.metSla}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Would Warning:</span>
                      <span className="font-medium text-amber-600">{testResults.wouldWarning}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Would Breach:</span>
                      <span className="font-medium text-red-600">{testResults.wouldBreach}</span>
                    </div>
                    <div className="border-t border-charcoal-200 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-700 font-medium">Projected Compliance:</span>
                        <span className={`font-bold ${
                          testResults.projectedComplianceRate >= 90 ? 'text-green-600' :
                          testResults.projectedComplianceRate >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {testResults.projectedComplianceRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DashboardSection>
          )}

          {/* Help */}
          <DashboardSection title="Help">
            <div className="space-y-3 text-sm text-charcoal-500">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>SLA rules track time between events and trigger escalations at specified thresholds.</p>
              </div>
              <div className="flex items-start gap-2">
                <Timer className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p>Trigger percentage: 75% of a 4-hour SLA = 3 hours elapsed</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p>100% = SLA target time reached (breach)</p>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </DashboardShell>
  )
}
