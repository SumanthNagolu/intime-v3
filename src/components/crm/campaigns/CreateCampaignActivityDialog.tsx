'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  Phone,
  Mail,
  Calendar as CalendarIcon,
  FileText,
  ListTodo,
  Clock,
  Target,
  Loader2,
  User,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'

interface Pattern {
  id: string
  code: string
  name: string
  description?: string
  category?: string
  icon?: string
  color?: string
  target_days?: number
  escalation_days?: number
  priority?: string
  instructions?: string
  checklist?: Array<{ item: string; required: boolean }>
}

interface CreateCampaignActivityDialogProps {
  campaignId: string
  patterns: Pattern[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const activityTypes = [
  { id: 'task', label: 'Task', icon: ListTodo, description: 'General task or action item' },
  { id: 'call', label: 'Call', icon: Phone, description: 'Phone call or scheduled call' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email follow-up or outreach' },
  { id: 'meeting', label: 'Meeting', icon: CalendarIcon, description: 'Scheduled meeting or sync' },
  { id: 'review', label: 'Review', icon: Target, description: 'Campaign review or analysis' },
  { id: 'follow_up', label: 'Follow-up', icon: Clock, description: 'Follow-up action' },
]

const priorities = [
  { value: 'low', label: 'Low', color: 'text-charcoal-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-600' },
  { value: 'high', label: 'High', color: 'text-amber-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
]

export function CreateCampaignActivityDialog({
  campaignId,
  patterns,
  open,
  onOpenChange,
  onSuccess,
}: CreateCampaignActivityDialogProps) {
  const [mode, setMode] = useState<'pattern' | 'custom'>('custom')
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)

  // Custom activity form state
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [activityType, setActivityType] = useState('task')
  const [priority, setPriority] = useState('normal')
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [assignedTo, setAssignedTo] = useState<string | undefined>()

  // Get team members for assignment
  const { data: assignees } = trpc.crm.campaigns.workflowActivities.getAssignees.useQuery(
    { campaignId },
    { enabled: open }
  )

  const createActivity = trpc.crm.campaigns.workflowActivities.create.useMutation({
    onSuccess: () => {
      toast.success('Activity created successfully')
      resetForm()
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create activity')
    },
  })

  const resetForm = () => {
    setSubject('')
    setDescription('')
    setActivityType('task')
    setPriority('normal')
    setDueDate(addDays(new Date(), 1))
    setAssignedTo(undefined)
    setSelectedPattern(null)
    setMode('custom')
  }

  const handleCreate = () => {
    if (mode === 'pattern' && selectedPattern) {
      createActivity.mutate({
        campaignId,
        subject: selectedPattern.name,
        description: selectedPattern.description,
        activityType: 'task',
        priority: (selectedPattern.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
        patternCode: selectedPattern.code,
        category: selectedPattern.category,
        assignedTo,
        dueDate: dueDate?.toISOString(),
        checklist: selectedPattern.checklist,
      })
    } else {
      if (!subject.trim()) {
        toast.error('Subject is required')
        return
      }
      createActivity.mutate({
        campaignId,
        subject,
        description: description || undefined,
        activityType: activityType as 'task' | 'call' | 'email' | 'meeting' | 'note' | 'follow_up' | 'review',
        priority: priority as 'low' | 'normal' | 'high' | 'urgent',
        assignedTo,
        dueDate: dueDate?.toISOString(),
      })
    }
  }

  // Group patterns by category
  const patternsByCategory = patterns.reduce((acc, pattern) => {
    const category = pattern.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(pattern)
    return acc
  }, {} as Record<string, Pattern[]>)

  const categoryLabels: Record<string, string> = {
    setup: 'Setup & Configuration',
    sourcing: 'Sourcing & List Building',
    review: 'Reviews & Analysis',
    approval: 'Approvals & Decisions',
    workflow: 'Workflow & Process',
    other: 'Other',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Activity</DialogTitle>
          <DialogDescription>
            Add a new activity to track campaign tasks and progress.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'pattern' | 'custom')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="custom">Custom Activity</TabsTrigger>
            <TabsTrigger value="pattern" disabled={patterns.length === 0}>
              From Template {patterns.length > 0 && `(${patterns.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Custom Activity Tab */}
          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Activity Type Selection */}
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {activityTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = activityType === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setActivityType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center',
                        isSelected
                          ? 'border-hublot-500 bg-hublot-50 text-hublot-700'
                          : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="What needs to be done?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details or instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <span className={p.color}>{p.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {assignees?.owner && (
                    <SelectItem value={assignees.owner.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={assignees.owner.avatar_url} />
                          <AvatarFallback>{assignees.owner.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{assignees.owner.full_name}</span>
                        <Badge variant="secondary" className="text-xs ml-1">Owner</Badge>
                      </div>
                    </SelectItem>
                  )}
                  {assignees?.teamMembers
                    ?.filter((m) => m.id !== assignees.owner?.id)
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar_url ?? undefined} />
                            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{member.full_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Pattern Selection Tab */}
          <TabsContent value="pattern" className="space-y-4 mt-4">
            {selectedPattern ? (
              // Selected Pattern Details
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedPattern(null)}
                  className="text-sm text-hublot-600 hover:underline flex items-center gap-1"
                >
                  ← Back to templates
                </button>

                <div className="border rounded-lg p-4 bg-charcoal-50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-hublot-100 text-hublot-700">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-charcoal-900">{selectedPattern.name}</h4>
                      {selectedPattern.description && (
                        <p className="text-sm text-charcoal-600 mt-1">{selectedPattern.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 text-xs text-charcoal-500">
                        {selectedPattern.target_days && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {selectedPattern.target_days} day target
                          </span>
                        )}
                        {selectedPattern.priority && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {selectedPattern.priority} priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {selectedPattern.instructions && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-charcoal-500">Instructions</Label>
                      <p className="text-sm text-charcoal-700 mt-1">{selectedPattern.instructions}</p>
                    </div>
                  )}

                  {/* Checklist Preview */}
                  {selectedPattern.checklist && selectedPattern.checklist.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-charcoal-500">Checklist ({selectedPattern.checklist.length} items)</Label>
                      <ul className="mt-2 space-y-1">
                        {selectedPattern.checklist.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="text-sm text-charcoal-600 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-charcoal-400" />
                            {item.item}
                            {item.required && <span className="text-red-500">*</span>}
                          </li>
                        ))}
                        {selectedPattern.checklist.length > 4 && (
                          <li className="text-xs text-charcoal-400">
                            +{selectedPattern.checklist.length - 4} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Due Date Override */}
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dueDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedPattern.target_days && (
                    <p className="text-xs text-charcoal-500">
                      Suggested: {selectedPattern.target_days} days from now
                    </p>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignees?.owner && (
                        <SelectItem value={assignees.owner.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={assignees.owner.avatar_url} />
                              <AvatarFallback>{assignees.owner.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{assignees.owner.full_name}</span>
                            <Badge variant="secondary" className="text-xs ml-1">Owner</Badge>
                          </div>
                        </SelectItem>
                      )}
                      {assignees?.teamMembers
                        ?.filter((m) => m.id !== assignees.owner?.id)
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={member.avatar_url ?? undefined} />
                                <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{member.full_name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              // Pattern List
              <div className="space-y-4">
                {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                      {categoryLabels[category] || category}
                    </h4>
                    <div className="space-y-2">
                      {categoryPatterns.map((pattern) => (
                        <button
                          key={pattern.id}
                          onClick={() => {
                            setSelectedPattern(pattern)
                            if (pattern.target_days) {
                              setDueDate(addDays(new Date(), pattern.target_days))
                            }
                          }}
                          className="w-full text-left p-3 border rounded-lg hover:border-hublot-300 hover:bg-hublot-50/50 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded bg-charcoal-100 group-hover:bg-hublot-100 transition-colors">
                                <Zap className="h-4 w-4 text-charcoal-500 group-hover:text-hublot-600" />
                              </div>
                              <div>
                                <p className="font-medium text-charcoal-900">{pattern.name}</p>
                                {pattern.description && (
                                  <p className="text-xs text-charcoal-500 line-clamp-1">{pattern.description}</p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-hublot-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {patterns.length === 0 && (
                  <div className="text-center py-8 text-charcoal-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
                    <p>No activity templates available</p>
                    <p className="text-sm text-charcoal-400">Create a custom activity instead</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              createActivity.isPending ||
              (mode === 'custom' && !subject.trim()) ||
              (mode === 'pattern' && !selectedPattern)
            }
          >
            {createActivity.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

