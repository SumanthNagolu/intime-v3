'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
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
  Loader2,
  Phone,
  Mail,
  Users,
  MessageSquare,
  CheckSquare,
  Linkedin,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface InlineActivityFormProps {
  accountId: string
  contactId?: string
  onSuccess?: () => void
  className?: string
}

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'linkedin_message'

const activityTypes: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: 'call', label: 'Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'meeting', label: 'Meeting', icon: <Users className="w-4 h-4" /> },
  { value: 'note', label: 'Note', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'task', label: 'Task', icon: <CheckSquare className="w-4 h-4" /> },
  { value: 'linkedin_message', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
]

const outcomeOptions: { value: string; label: string }[] = [
  { value: 'connected', label: 'Connected' },
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no_response', label: 'No Response' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'busy', label: 'Busy' },
]

export function InlineActivityForm({
  accountId,
  contactId,
  onSuccess,
  className,
}: InlineActivityFormProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [isExpanded, setIsExpanded] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [activityType, setActivityType] = useState<ActivityType>('call')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [outcome, setOutcome] = useState('')
  const [duration, setDuration] = useState('')
  const [selectedContactId, setSelectedContactId] = useState(contactId || '')

  // Fetch contacts for this account
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId },
    { enabled: isExpanded }
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
      setIsExpanded(false)
      onSuccess?.()
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
    setOutcome('')
    setDuration('')
    setSelectedContactId(contactId || '')
    setShowMore(false)
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
      outcome: outcome ? outcome as 'positive' | 'neutral' | 'negative' | 'no_response' | 'left_voicemail' | 'busy' | 'connected' : undefined,
      durationMinutes: duration ? parseInt(duration, 10) : undefined,
      relatedContactId: selectedContactId || undefined,
    })
  }

  const handleCancel = () => {
    resetForm()
    setIsExpanded(false)
  }

  const contacts = contactsQuery.data || []

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className={cn('w-full border-dashed', className)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Log Activity
      </Button>
    )
  }

  return (
    <div className={cn('border rounded-lg bg-white p-4 shadow-sm', className)}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-charcoal-900">Log Activity</h4>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Activity Type Selection - Compact */}
        <div className="flex flex-wrap gap-1 mb-4">
          {activityTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setActivityType(type.value)
                setOutcome('')
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                activityType === type.value
                  ? 'bg-hublot-900 text-white'
                  : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
              )}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Main Fields */}
        <div className="space-y-3">
          {/* Subject - Required */}
          <div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`Enter ${activityType} subject...`}
              required
            />
          </div>

          {/* Quick Notes */}
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes (optional)..."
              className="min-h-[60px]"
            />
          </div>

          {/* Show More Toggle */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-sm text-charcoal-500 hover:text-charcoal-700"
          >
            {showMore ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Less options
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                More options
              </>
            )}
          </button>

          {/* Additional Fields - Collapsible */}
          {showMore && (
            <div className="space-y-3 pt-2 border-t">
              {/* Contact Selection */}
              <div className="space-y-1">
                <Label className="text-xs text-charcoal-500">Contact</Label>
                <Select
                  value={selectedContactId || 'none'}
                  onValueChange={(val) => setSelectedContactId(val === 'none' ? '' : val)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select contact" />
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

              {/* Outcome */}
              <div className="space-y-1">
                <Label className="text-xs text-charcoal-500">Outcome</Label>
                <Select value={outcome || 'none'} onValueChange={(val) => setOutcome(val === 'none' ? '' : val)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No outcome</SelectItem>
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
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Duration in minutes"
                    className="h-9"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={logActivityMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={logActivityMutation.isPending}>
            {logActivityMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Log Activity
          </Button>
        </div>
      </form>
    </div>
  )
}
