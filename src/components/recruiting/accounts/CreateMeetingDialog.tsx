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
import { Loader2, Video, Phone, MapPin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const meetingTypes = [
  { value: 'kickoff', label: 'Kickoff Meeting' },
  { value: 'check_in', label: 'Regular Check-In' },
  { value: 'qbr', label: 'Quarterly Business Review' },
  { value: 'intake', label: 'Job Intake' },
  { value: 'escalation', label: 'Escalation Discussion' },
  { value: 'other', label: 'Other' },
]

const locationTypes = [
  { value: 'video', label: 'Video Call', icon: <Video className="w-4 h-4" /> },
  { value: 'phone', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'in_person', label: 'In Person', icon: <MapPin className="w-4 h-4" /> },
]

export function CreateMeetingDialog({
  open,
  onOpenChange,
  accountId,
}: CreateMeetingDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [title, setTitle] = useState('')
  const [meetingType, setMeetingType] = useState('check_in')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [locationType, setLocationType] = useState('video')
  const [locationDetails, setLocationDetails] = useState('')
  const [agenda, setAgenda] = useState('')
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  // Fetch contacts for this account
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId },
    { enabled: open }
  )

  const createMeetingMutation = trpc.crm.meetingNotes.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Meeting scheduled',
        description: 'The meeting has been added to the calendar.',
      })
      utils.crm.meetingNotes.listByAccount.invalidate({ accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule meeting.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setTitle('')
    setMeetingType('check_in')
    setScheduledDate('')
    setScheduledTime('')
    setDuration('30')
    setLocationType('video')
    setLocationDetails('')
    setAgenda('')
    setSelectedContactIds([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a meeting title.',
        variant: 'error',
      })
      return
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: 'Validation Error',
        description: 'Please select date and time for the meeting.',
        variant: 'error',
      })
      return
    }

    // Combine date and time
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`)

    createMeetingMutation.mutate({
      accountId,
      title: title.trim(),
      meetingType: meetingType as 'kickoff' | 'check_in' | 'qbr' | 'intake' | 'escalation' | 'other',
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: parseInt(duration, 10),
      locationType: locationType as 'video' | 'phone' | 'in_person',
      locationDetails: locationDetails.trim() || undefined,
      agenda: agenda.trim() || undefined,
      contactIds: selectedContactIds.length > 0 ? selectedContactIds : undefined,
    })
  }

  const contacts = contactsQuery.data || []

  // Generate default title based on meeting type
  const generateDefaultTitle = (type: string) => {
    const typeLabel = meetingTypes.find(t => t.value === type)?.label || 'Meeting'
    return typeLabel
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting with this account's contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Meeting Type */}
            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting Type</Label>
              <Select
                value={meetingType}
                onValueChange={(value) => {
                  setMeetingType(value)
                  if (!title) {
                    setTitle(generateDefaultTitle(value))
                  }
                }}
              >
                <SelectTrigger id="meetingType">
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting title"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Type */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="grid grid-cols-3 gap-2">
                {locationTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setLocationType(type.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      locationType === type.value
                        ? 'border-hublot-700 bg-hublot-50 text-hublot-900'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600'
                    }`}
                  >
                    {type.icon}
                    <span className="text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-2">
              <Label htmlFor="locationDetails">
                {locationType === 'video' ? 'Meeting Link' :
                 locationType === 'phone' ? 'Phone Number' :
                 'Address'}
              </Label>
              <Input
                id="locationDetails"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder={
                  locationType === 'video' ? 'https://zoom.us/j/...' :
                  locationType === 'phone' ? '(555) 123-4567' :
                  '123 Main St, City, State'
                }
              />
            </div>

            {/* Attendees */}
            {contacts.length > 0 && (
              <div className="space-y-2">
                <Label>Attendees</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {contacts.map((contact: { id: string; first_name: string; last_name?: string }) => (
                    <label
                      key={contact.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedContactIds.includes(contact.id)
                          ? 'bg-hublot-50'
                          : 'hover:bg-charcoal-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedContactIds.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContactIds([...selectedContactIds, contact.id])
                          } else {
                            setSelectedContactIds(
                              selectedContactIds.filter((id) => id !== contact.id)
                            )
                          }
                        }}
                        className="rounded border-charcoal-300"
                      />
                      <span className="text-sm">
                        {contact.first_name} {contact.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda</Label>
              <Textarea
                id="agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Meeting agenda items..."
                rows={3}
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
            <Button type="submit" disabled={createMeetingMutation.isPending}>
              {createMeetingMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Schedule Meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
