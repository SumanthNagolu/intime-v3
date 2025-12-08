'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Phone, Mail, Users, MessageSquare, CheckSquare, Linkedin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface LogActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  contactId?: string
}

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'linkedin_message'

const activityTypes: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: 'call', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'meeting', label: 'Meeting', icon: <Users className="w-4 h-4" /> },
  { value: 'note', label: 'Note', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'task', label: 'Task', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'linkedin_message', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
]

// These match the outcome enum in the activities.log mutation
const outcomeOptions: { value: string; label: string }[] = [
  { value: 'connected', label: 'Connected' },
  { value: 'positive', label: 'Positive Outcome' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no_response', label: 'No Response' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'busy', label: 'Busy' },
]

export function LogActivityDialog({
  open,
  onOpenChange,
  accountId,
  contactId,
}: LogActivityDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [activityType, setActivityType] = useState<ActivityType>('call')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [outcome, setOutcome] = useState('none')
  const [duration, setDuration] = useState('')
  const [selectedContactId, setSelectedContactId] = useState(contactId || '')

  // Fetch contacts for this account
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId },
    { enabled: open }
  )

  const logActivityMutation = trpc.crm.activities.log.useMutation({
    onSuccess: () => {
      toast({
        title: 'Activity logged',
        description: 'The activity has been recorded successfully.',
      })
      utils.crm.activities.listByAccount.invalidate({ accountId })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log activity.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setActivityType('call')
    setSubject('')
    setDescription('')
    setOutcome('none')
    setDuration('')
    setSelectedContactId(contactId || '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a subject.',
        variant: 'error',
      })
      return
    }

    logActivityMutation.mutate({
      entityType: 'account',
      entityId: accountId,
      activityType,
      subject: subject.trim(),
      description: description.trim() || undefined,
      outcome: outcome && outcome !== 'none' ? outcome as 'positive' | 'neutral' | 'negative' | 'no_response' | 'left_voicemail' | 'busy' | 'connected' : undefined,
      durationMinutes: duration ? parseInt(duration, 10) : undefined,
      relatedContactId: selectedContactId || undefined,
    })
  }

  const contacts = contactsQuery.data || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record interactions with this account: calls, emails, meetings, notes, tasks, or LinkedIn messages.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Activity Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setActivityType(type.value)
                    setOutcome('none')
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                    activityType === type.value
                      ? 'border-hublot-700 bg-hublot-50 text-hublot-900'
                      : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                  }`}
                >
                  {type.icon}
                  <span className="text-xs mt-1">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Contact Selection */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact (Optional)</Label>
              <Select value={selectedContactId || 'none'} onValueChange={(val) => setSelectedContactId(val === 'none' ? '' : val)}>
                <SelectTrigger id="contact">
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific contact</SelectItem>
                  {contacts.map((contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.title && ` - ${contact.title}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Enter ${activityType} subject...`}
                required
              />
            </div>

            {/* Outcome */}
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Select value={outcome || 'none'} onValueChange={(val) => setOutcome(val === 'none' ? '' : val)}>
                <SelectTrigger id="outcome">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No outcome selected</SelectItem>
                  {outcomeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration (for calls and meetings) */}
            {(activityType === 'call' || activityType === 'meeting') && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Enter duration in minutes"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this activity..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={logActivityMutation.isPending}>
              {logActivityMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Log Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
