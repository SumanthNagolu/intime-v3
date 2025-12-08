'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { trpc } from '@/lib/trpc/client'
import { Phone, Mail, Calendar, FileText, Linkedin, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InlineCampaignActivityFormProps {
  campaignId: string
  onSuccess: () => void
  onCancel: () => void
}

const activityTypes = [
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'meeting', label: 'Meeting', icon: Calendar },
  { id: 'note', label: 'Note', icon: FileText },
  { id: 'linkedin_message', label: 'LinkedIn', icon: Linkedin },
]

const outcomes = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no_response', label: 'No Response' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'busy', label: 'Busy' },
  { value: 'connected', label: 'Connected' },
]

export function InlineCampaignActivityForm({
  campaignId,
  onSuccess,
  onCancel,
}: InlineCampaignActivityFormProps) {
  const [activityType, setActivityType] = useState<string>('call')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [outcome, setOutcome] = useState<string>('')
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>()

  const createActivity = trpc.crm.activities.log.useMutation({
    onSuccess: () => {
      toast.success('Activity logged successfully')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log activity')
    },
  })

  const handleSubmit = () => {
    if (!subject.trim()) {
      toast.error('Subject is required')
      return
    }

    createActivity.mutate({
      entityType: 'campaign',
      entityId: campaignId,
      activityType: activityType as 'call' | 'email' | 'meeting' | 'note' | 'task' | 'linkedin_message',
      subject,
      description,
      outcome: (outcome || undefined) as 'positive' | 'neutral' | 'negative' | 'no_response' | 'left_voicemail' | 'busy' | 'connected' | undefined,
      durationMinutes,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Log Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity Type Selection */}
        <div className="space-y-2">
          <Label>Activity Type</Label>
          <div className="flex gap-2">
            {activityTypes.map((type) => {
              const Icon = type.icon
              const isSelected = activityType === type.id
              return (
                <Button
                  key={type.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex-1',
                    isSelected && 'bg-hublot-600 hover:bg-hublot-700'
                  )}
                  onClick={() => setActivityType(type.id)}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {type.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            placeholder="Brief summary of the activity..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Detailed notes about the activity..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Outcome (for calls, emails, meetings) */}
        {['call', 'email', 'meeting', 'linkedin_message'].includes(activityType) && (
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome..." />
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
        )}

        {/* Duration (for calls, meetings) */}
        {['call', 'meeting'].includes(activityType) && (
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g., 30"
              value={durationMinutes ?? ''}
              onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={createActivity.isPending || !subject.trim()}
          >
            {createActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Activity
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
