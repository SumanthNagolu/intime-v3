'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { InlinePanel, InlinePanelContent, InlinePanelSection } from '@/components/ui/inline-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Loader2,
  Trash2,
  Edit,
  X,
  Check,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  ListTodo,
  Target,
  Linkedin,
  PlayCircle,
  CheckCircle2,
  SkipForward,
  AlertTriangle,
  AlertCircle,
  Zap,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface CampaignActivityInlinePanelProps {
  activityId: string | null
  campaignId: string
  onClose: () => void
  onRefetch?: () => void
}

const activityTypeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: ListTodo,
  follow_up: Clock,
  review: Target,
  linkedin_message: Linkedin,
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: PlayCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  skipped: { label: 'Skipped', color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200', icon: SkipForward },
  canceled: { label: 'Canceled', color: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200', icon: AlertCircle },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-charcoal-100 text-charcoal-600' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export function CampaignActivityInlinePanel({
  activityId,
  campaignId,
  onClose,
  onRefetch,
}: CampaignActivityInlinePanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [dueDate, setDueDate] = useState('')
  const [checklistProgress, setChecklistProgress] = useState<Record<string, boolean>>({})

  // Fetch activity data
  const activityQuery = trpc.crm.campaigns.workflowActivities.getById.useQuery(
    { id: activityId! },
    { enabled: !!activityId }
  )

  // Mutations
  const updateMutation = trpc.crm.campaigns.workflowActivities.update.useMutation({
    onSuccess: () => {
      toast.success('Activity updated')
      setIsEditing(false)
      onRefetch?.()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const startMutation = trpc.crm.campaigns.workflowActivities.start.useMutation({
    onSuccess: () => {
      toast.success('Activity started')
      activityQuery.refetch()
      onRefetch?.()
    },
    onError: (error) => toast.error(error.message),
  })

  const completeMutation = trpc.crm.campaigns.workflowActivities.complete.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.successorsCreated > 0
          ? `Activity completed. ${result.successorsCreated} follow-up ${result.successorsCreated === 1 ? 'activity' : 'activities'} created.`
          : 'Activity completed'
      )
      activityQuery.refetch()
      onRefetch?.()
    },
    onError: (error) => toast.error(error.message),
  })

  const skipMutation = trpc.crm.campaigns.workflowActivities.skip.useMutation({
    onSuccess: () => {
      toast.success('Activity skipped')
      activityQuery.refetch()
      onRefetch?.()
    },
    onError: (error) => toast.error(error.message),
  })

  // Populate form when activity data loads
  useEffect(() => {
    if (activityQuery.data) {
      const a = activityQuery.data
      setSubject(a.subject || '')
      setDescription(a.description || '')
      setPriority((a.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal')
      setDueDate(a.due_date ? a.due_date.split('T')[0] : '')
      setChecklistProgress(a.checklist_progress || {})
    }
  }, [activityQuery.data])

  // Reset edit mode when activity changes
  useEffect(() => {
    setIsEditing(false)
  }, [activityId])

  const handleSave = () => {
    if (!activityId) return
    updateMutation.mutate({
      id: activityId,
      subject: subject.trim() || undefined,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      checklistProgress,
    })
  }

  const handleStart = () => {
    if (!activityId) return
    startMutation.mutate({ id: activityId })
  }

  const handleComplete = () => {
    if (!activityId) return
    completeMutation.mutate({
      id: activityId,
      outcome: 'completed',
      checklistProgress,
    })
  }

  const handleSkip = () => {
    if (!activityId) return
    skipMutation.mutate({ id: activityId })
  }

  const handleChecklistItemToggle = (index: string, checked: boolean) => {
    const updated = { ...checklistProgress, [index]: checked }
    setChecklistProgress(updated)
    
    // Auto-save checklist progress
    if (!isEditing && activityId) {
      updateMutation.mutate({
        id: activityId,
        checklistProgress: updated,
      })
    }
  }

  const activity = activityQuery.data
  const ActivityIcon = activity ? activityTypeIcons[activity.activity_type as keyof typeof activityTypeIcons] || FileText : FileText
  const StatusIcon = activity ? statusConfig[activity.status]?.icon || Clock : Clock
  const isActionable = activity && (activity.status === 'open' || activity.status === 'in_progress')

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const isOverdue = isPast(date) && activity?.status !== 'completed'

    if (isOverdue) {
      return (
        <span className="text-red-600 font-medium">
          Overdue by {formatDistanceToNow(date)}
        </span>
      )
    }

    if (isToday(date)) {
      return <span className="text-amber-600 font-medium">Due today</span>
    }

    if (isTomorrow(date)) {
      return <span className="text-amber-500">Due tomorrow</span>
    }

    return <span className="text-charcoal-500">{format(date, 'MMM d, yyyy')}</span>
  }

  const headerActions = !isEditing && activity && isActionable && (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>
  )

  const footerActions = isEditing ? (
    <>
      <Button variant="outline" onClick={() => setIsEditing(false)}>
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={updateMutation.isPending}>
        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <Check className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </>
  ) : isActionable ? (
    <>
      <Button
        variant="outline"
        className="text-charcoal-500"
        onClick={handleSkip}
        disabled={skipMutation.isPending}
      >
        <SkipForward className="w-4 h-4 mr-2" />
        Skip
      </Button>
      {activity?.status === 'open' && (
        <Button
          variant="outline"
          onClick={handleStart}
          disabled={startMutation.isPending}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Start
        </Button>
      )}
      <Button onClick={handleComplete} disabled={completeMutation.isPending}>
        {completeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Complete
      </Button>
    </>
  ) : undefined

  return (
    <InlinePanel
      isOpen={!!activityId}
      onClose={onClose}
      title={isEditing ? 'Edit Activity' : 'Activity Details'}
      description={isEditing ? 'Update activity information' : undefined}
      headerActions={headerActions}
      actions={footerActions}
      width="lg"
    >
      {activityQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : activity ? (
        isEditing ? (
          // Edit Mode
          <InlinePanelContent>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'normal' | 'high' | 'urgent')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Editable Checklist */}
            {activity.checklist && Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
              <InlinePanelSection title="Checklist">
                <div className="space-y-2 border rounded-lg p-4 bg-charcoal-50">
                  {activity.checklist.map((item: { item: string; required: boolean }, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Checkbox
                        checked={checklistProgress[idx.toString()] || false}
                        onCheckedChange={(checked) => handleChecklistItemToggle(idx.toString(), !!checked)}
                      />
                      <span className={cn(
                        'text-sm flex-1',
                        checklistProgress[idx.toString()] && 'line-through text-charcoal-400'
                      )}>
                        {item.item}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </InlinePanelSection>
            )}
          </InlinePanelContent>
        ) : (
          // View Mode
          <InlinePanelContent>
            {/* Header Info */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-lg flex-shrink-0',
                  activity.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : activity.due_date && isPast(new Date(activity.due_date))
                    ? 'bg-red-100 text-red-700'
                    : 'bg-charcoal-100 text-charcoal-700'
                )}
              >
                <ActivityIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge
                    variant="outline"
                    className={cn('text-xs border', statusConfig[activity.status]?.color)}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[activity.status]?.label}
                  </Badge>
                  {activity.priority !== 'normal' && (
                    <Badge className={cn('text-xs', priorityConfig[activity.priority]?.color)}>
                      {priorityConfig[activity.priority]?.label}
                    </Badge>
                  )}
                  {activity.auto_created && (
                    <Badge variant="outline" className="text-xs bg-violet-50 text-violet-600 border-violet-200">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-generated
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-charcoal-900">{activity.subject}</h3>
                
                {/* Meta info */}
                <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500 flex-wrap">
                  {activity.due_date && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDueDate(activity.due_date)}
                    </div>
                  )}
                  <span>
                    Created {format(new Date(activity.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Category */}
            {activity.category && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal-500">Category:</span>
                <Badge variant="secondary" className="capitalize">{activity.category}</Badge>
              </div>
            )}

            {/* Pattern Info */}
            {activity.pattern && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal-500">Pattern:</span>
                <Badge variant="outline">{activity.pattern.name}</Badge>
              </div>
            )}

            {/* Description */}
            {activity.description && (
              <InlinePanelSection title="Description">
                <div className="bg-charcoal-50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-sm text-charcoal-700">{activity.description}</p>
                </div>
              </InlinePanelSection>
            )}

            {/* Instructions */}
            {activity.instructions && (
              <InlinePanelSection title="Instructions">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="whitespace-pre-wrap text-sm text-blue-800">{activity.instructions}</p>
                </div>
              </InlinePanelSection>
            )}

            {/* Checklist */}
            {activity.checklist && Array.isArray(activity.checklist) && activity.checklist.length > 0 && (
              <InlinePanelSection title="Checklist">
                <div className="space-y-2 border rounded-lg p-4 bg-charcoal-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-charcoal-500">
                      {Object.values(checklistProgress).filter(Boolean).length} / {activity.checklist.length} completed
                    </span>
                  </div>
                  {activity.checklist.map((item: { item: string; required: boolean }, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Checkbox
                        checked={checklistProgress[idx.toString()] || false}
                        onCheckedChange={(checked) => handleChecklistItemToggle(idx.toString(), !!checked)}
                        disabled={!isActionable}
                      />
                      <span className={cn(
                        'text-sm flex-1',
                        checklistProgress[idx.toString()] && 'line-through text-charcoal-400'
                      )}>
                        {item.item}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </InlinePanelSection>
            )}

            {/* Assignee */}
            {activity.assigned_user && (
              <InlinePanelSection title="Assigned To">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.assigned_user.avatar_url || undefined} />
                    <AvatarFallback>
                      {activity.assigned_user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{activity.assigned_user.full_name}</p>
                    {activity.assigned_user.email && (
                      <p className="text-xs text-charcoal-500">{activity.assigned_user.email}</p>
                    )}
                  </div>
                </div>
              </InlinePanelSection>
            )}

            {/* Created By */}
            {activity.created_by_user && (
              <InlinePanelSection title="Created By">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.created_by_user.avatar_url || undefined} />
                    <AvatarFallback>
                      {activity.created_by_user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{activity.created_by_user.full_name}</p>
                    <p className="text-xs text-charcoal-500">
                      {format(new Date(activity.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                  </div>
                </div>
              </InlinePanelSection>
            )}

            {/* Completion Info */}
            {activity.status === 'completed' && activity.completed_at && (
              <InlinePanelSection title="Completed">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Completed {format(new Date(activity.completed_at), 'MMM d, yyyy \'at\' h:mm a')}
                    </span>
                  </div>
                  {activity.outcome && (
                    <p className="text-sm text-green-600 mt-2">Outcome: {activity.outcome}</p>
                  )}
                  {activity.outcome_notes && (
                    <p className="text-sm text-charcoal-600 mt-2">{activity.outcome_notes}</p>
                  )}
                </div>
              </InlinePanelSection>
            )}

            {/* Skip Info */}
            {activity.status === 'skipped' && (
              <InlinePanelSection title="Skipped">
                <div className="bg-charcoal-50 rounded-lg p-4 border border-charcoal-200">
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <SkipForward className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Skipped {activity.skipped_at ? format(new Date(activity.skipped_at), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                  {activity.skip_reason && (
                    <p className="text-sm text-charcoal-600 mt-2">Reason: {activity.skip_reason}</p>
                  )}
                </div>
              </InlinePanelSection>
            )}

            {/* Activity History */}
            {activity.history && activity.history.length > 0 && (
              <InlinePanelSection title="History">
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {activity.history.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-charcoal-300 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-charcoal-700 capitalize">{entry.action.replace('_', ' ')}</p>
                        {entry.notes && <p className="text-charcoal-500 text-xs">{entry.notes}</p>}
                        <p className="text-charcoal-400 text-xs">
                          {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </InlinePanelSection>
            )}
          </InlinePanelContent>
        )
      ) : (
        <div className="text-center py-8 text-charcoal-500">
          Activity not found
        </div>
      )}
    </InlinePanel>
  )
}







