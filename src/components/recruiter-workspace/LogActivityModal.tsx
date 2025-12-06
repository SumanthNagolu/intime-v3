'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Checkbox } from '@/components/ui/checkbox'
import { trpc } from '@/lib/trpc/client'
import { Phone, Mail, Calendar, FileText, MessageSquare, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'linkedin_message', label: 'LinkedIn Message', icon: MessageSquare },
]

const DIRECTIONS = [
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
]

const OUTCOMES = [
  { value: 'positive', label: 'Positive', color: 'text-success-600' },
  { value: 'neutral', label: 'Neutral', color: 'text-charcoal-600' },
  { value: 'negative', label: 'Negative', color: 'text-error-600' },
]

interface LogActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType?: string
  entityId?: string
  entityName?: string
  defaultActivityType?: string
  onSuccess?: () => void
}

export function LogActivityModal({
  open,
  onOpenChange,
  entityType,
  entityId,
  entityName,
  defaultActivityType = 'call',
  onSuccess,
}: LogActivityModalProps) {
  const utils = trpc.useUtils()

  // Form state
  const [activityType, setActivityType] = useState(defaultActivityType)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound')
  const [durationMinutes, setDurationMinutes] = useState<number>(15)
  const [outcome, setOutcome] = useState<'positive' | 'neutral' | 'negative' | ''>('')

  // Entity selection (when not provided)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<{
    entityType: string
    entityId: string
    label: string
    sublabel?: string
  } | null>(entityType && entityId && entityName ? {
    entityType,
    entityId,
    label: entityName,
  } : null)

  // Follow-up
  const [createFollowUp, setCreateFollowUp] = useState(false)
  const [followUpSubject, setFollowUpSubject] = useState('')
  const [followUpDays, setFollowUpDays] = useState(3)

  // Search entities
  const { data: searchResults, isLoading: isSearching } = trpc.activities.searchEntities.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 1 && !selectedEntity }
  )

  // Log activity mutation
  const logMutation = trpc.activities.log.useMutation({
    onSuccess: (data) => {
      toast.success('Activity logged successfully', {
        description: data.followUp
          ? `Follow-up scheduled for ${new Date(data.followUp.dueDate).toLocaleDateString()}`
          : undefined,
      })
      utils.dashboard.getTodaysPriorities.invalidate()
      utils.dashboard.getActivitySummary.invalidate()
      utils.activities.getMyTasks.invalidate()
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error('Failed to log activity', {
        description: error.message,
      })
    },
  })

  const handleClose = useCallback(() => {
    // Reset form
    setActivityType(defaultActivityType)
    setSubject('')
    setBody('')
    setDirection('outbound')
    setDurationMinutes(15)
    setOutcome('')
    setCreateFollowUp(false)
    setFollowUpSubject('')
    setFollowUpDays(3)
    setSearchQuery('')
    if (!entityType || !entityId) {
      setSelectedEntity(null)
    }
    onOpenChange(false)
  }, [defaultActivityType, entityType, entityId, onOpenChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEntity) {
      toast.error('Please select an entity')
      return
    }

    const followUpDate = createFollowUp ? new Date() : undefined
    if (followUpDate) {
      followUpDate.setDate(followUpDate.getDate() + followUpDays)
    }

    logMutation.mutate({
      entityType: selectedEntity.entityType,
      entityId: selectedEntity.entityId,
      activityType: activityType as 'email' | 'call' | 'meeting' | 'note' | 'linkedin_message' | 'task' | 'follow_up',
      subject: subject || undefined,
      body: body || undefined,
      direction: ['call', 'email', 'linkedin_message'].includes(activityType) ? direction : undefined,
      durationMinutes: activityType === 'call' || activityType === 'meeting' ? durationMinutes : undefined,
      outcome: outcome as 'positive' | 'neutral' | 'negative' | undefined,
      createFollowUp,
      followUpSubject: createFollowUp ? (followUpSubject || `Follow up on: ${subject}`) : undefined,
      followUpDueDate: followUpDate,
    })
  }

  // Keyboard shortcut to open modal (Cmd+L or Ctrl+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l' && !open) {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const ActivityIcon = ACTIVITY_TYPES.find(t => t.value === activityType)?.icon || FileText

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Log Activity
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Activity Type */}
          <div className="flex gap-2 justify-center">
            {ACTIVITY_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setActivityType(type.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors',
                    activityType === type.value
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    activityType === type.value ? 'text-hublot-900' : 'text-charcoal-500'
                  )} />
                  <span className={cn(
                    'text-xs',
                    activityType === type.value ? 'text-hublot-900 font-medium' : 'text-charcoal-600'
                  )}>
                    {type.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Entity Selection */}
          {!entityType && (
            <div className="space-y-2">
              <Label>Related To *</Label>
              {selectedEntity ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-charcoal-50">
                  <div>
                    <p className="font-medium text-charcoal-900">{selectedEntity.label}</p>
                    {selectedEntity.sublabel && (
                      <p className="text-sm text-charcoal-500">{selectedEntity.sublabel}</p>
                    )}
                    <p className="text-xs text-charcoal-400 capitalize">{selectedEntity.entityType}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEntity(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search candidates, accounts, jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.entityType}-${result.entityId}`}
                          type="button"
                          onClick={() => {
                            setSelectedEntity(result)
                            setSearchQuery('')
                          }}
                          className="w-full text-left p-3 hover:bg-charcoal-50 border-b last:border-b-0"
                        >
                          <p className="font-medium text-charcoal-900">{result.label}</p>
                          {result.sublabel && (
                            <p className="text-sm text-charcoal-500">{result.sublabel}</p>
                          )}
                          <p className="text-xs text-charcoal-400 capitalize">{result.entityType}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Selected entity display when provided */}
          {entityType && entityId && entityName && (
            <div className="p-3 border rounded-lg bg-charcoal-50">
              <p className="font-medium text-charcoal-900">{entityName}</p>
              <p className="text-xs text-charcoal-400 capitalize">{entityType}</p>
            </div>
          )}

          {/* Direction (for calls, emails, messages) */}
          {['call', 'email', 'linkedin_message'].includes(activityType) && (
            <div className="space-y-2">
              <Label>Direction</Label>
              <div className="flex gap-2">
                {DIRECTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDirection(d.value as 'inbound' | 'outbound')}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-lg border transition-colors',
                      direction === d.value
                        ? 'border-hublot-900 bg-hublot-50 text-hublot-900'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder={activityType === 'call' ? 'Call summary...' : 'Subject...'}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body/Notes */}
          <div className="space-y-2">
            <Label htmlFor="body">Notes</Label>
            <Textarea
              id="body"
              placeholder="Add details..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
          </div>

          {/* Duration (for calls and meetings) */}
          {(activityType === 'call' || activityType === 'meeting') && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={durationMinutes.toString()}
                onValueChange={(v) => setDurationMinutes(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 min</SelectItem>
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Outcome */}
          <div className="space-y-2">
            <Label>Outcome</Label>
            <div className="flex gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value as 'positive' | 'neutral' | 'negative')}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg border transition-colors',
                    outcome === o.value
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <span className={outcome === o.value ? o.color : 'text-charcoal-600'}>
                    {o.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Create Follow-up */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followup"
                checked={createFollowUp}
                onCheckedChange={(checked) => setCreateFollowUp(checked as boolean)}
              />
              <Label htmlFor="followup" className="cursor-pointer">
                Schedule a follow-up
              </Label>
            </div>

            {createFollowUp && (
              <div className="mt-3 space-y-3 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="followup-subject">Follow-up Subject</Label>
                  <Input
                    id="followup-subject"
                    placeholder={`Follow up on: ${subject || 'activity'}`}
                    value={followUpSubject}
                    onChange={(e) => setFollowUpSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up in</Label>
                  <Select
                    value={followUpDays.toString()}
                    onValueChange={(v) => setFollowUpDays(parseInt(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tomorrow</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={logMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={logMutation.isPending || !selectedEntity}
            >
              {logMutation.isPending ? (
                <>Logging...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Log Activity
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
