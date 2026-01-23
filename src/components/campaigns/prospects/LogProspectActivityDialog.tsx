'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Mail, Phone, Linkedin, StickyNote, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

type ActivityType = 'email' | 'call' | 'linkedin' | 'note'

interface LogProspectActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectId: string
  prospectName: string
  initialType?: ActivityType
  onSuccess?: () => void
}

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: typeof Mail; color: string; placeholder: string }> = {
  email: {
    label: 'Email',
    icon: Mail,
    color: 'text-blue-500',
    placeholder: 'Sent follow-up email regarding...',
  },
  call: {
    label: 'Call',
    icon: Phone,
    color: 'text-green-500',
    placeholder: 'Discussed requirements and next steps...',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-[#0A66C2]',
    placeholder: 'Sent connection request / message about...',
  },
  note: {
    label: 'Note',
    icon: StickyNote,
    color: 'text-amber-500',
    placeholder: 'Important observation or reminder...',
  },
}

const OUTCOME_OPTIONS = [
  { value: 'positive', label: 'Positive - Interested' },
  { value: 'neutral', label: 'Neutral - Follow up needed' },
  { value: 'negative', label: 'Negative - Not interested' },
  { value: 'no_answer', label: 'No Answer / Voicemail' },
  { value: 'scheduled', label: 'Meeting Scheduled' },
]

export function LogProspectActivityDialog({
  open,
  onOpenChange,
  prospectId,
  prospectName,
  initialType = 'note',
  onSuccess,
}: LogProspectActivityDialogProps) {
  const [activityType, setActivityType] = useState<ActivityType>(initialType)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [outcome, setOutcome] = useState('')
  const [nextSteps, setNextSteps] = useState('')

  const utils = trpc.useUtils()

  const logActivityMutation = trpc.crm.campaigns.logProspectActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity logged successfully')
      utils.crm.campaigns.getProspects.invalidate()
      utils.crm.campaigns.getFullEntity.invalidate()
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log activity')
    },
  })

  const handleClose = () => {
    setSubject('')
    setDescription('')
    setOutcome('')
    setNextSteps('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }

    logActivityMutation.mutate({
      prospectId,
      activityType,
      subject: subject.trim(),
      description: description.trim() || undefined,
      outcome: outcome || undefined,
      nextSteps: nextSteps.trim() || undefined,
    })
  }

  const config = ACTIVITY_CONFIG[activityType]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('w-5 h-5', config.color)} />
            Log {config.label}
          </DialogTitle>
          <DialogDescription>
            Record an activity for {prospectName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Activity Type Selector */}
          <div className="flex gap-2">
            {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((type) => {
              const typeConfig = ACTIVITY_CONFIG[type]
              const TypeIcon = typeConfig.icon
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActivityType(type)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all',
                    activityType === type
                      ? 'border-charcoal-900 bg-charcoal-50'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <TypeIcon className={cn('w-5 h-5', typeConfig.color)} />
                  <span className="text-xs font-medium">{typeConfig.label}</span>
                </button>
              )
            })}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`${config.label} subject...`}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
            />
          </div>

          {/* Outcome (for calls and emails) */}
          {(activityType === 'call' || activityType === 'email') && (
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome..." />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-2">
            <Label htmlFor="nextSteps">Next Steps</Label>
            <Input
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Follow up in 3 days, schedule meeting, etc."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={logActivityMutation.isPending || !subject.trim()}
          >
            {logActivityMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Log Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
