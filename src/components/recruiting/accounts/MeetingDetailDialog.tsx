'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
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
import { Loader2, Trash2, Edit, X, Check, Calendar, Clock, MapPin, Video, Phone, Users } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface MeetingDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingId: string | null
  accountId: string
}

const meetingTypeOptions = [
  { value: 'kickoff', label: 'Kickoff' },
  { value: 'check_in', label: 'Check-in' },
  { value: 'qbr', label: 'QBR' },
  { value: 'intake', label: 'Intake' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

const locationTypeOptions = [
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in_person', label: 'In Person' },
]

const locationIcons = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
}

export function MeetingDetailDialog({
  open,
  onOpenChange,
  meetingId,
  accountId,
}: MeetingDetailDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [meetingType, setMeetingType] = useState('check_in')
  const [status, setStatus] = useState('scheduled')
  const [description, setDescription] = useState('')
  const [locationType, setLocationType] = useState('video')
  const [locationDetails, setLocationDetails] = useState('')
  const [agenda, setAgenda] = useState('')
  const [discussionNotes, setDiscussionNotes] = useState('')

  // Fetch meeting data
  const meetingQuery = trpc.crm.meetingNotes.getById.useQuery(
    { id: meetingId! },
    { enabled: !!meetingId && open }
  )

  // Update mutation
  const updateMutation = trpc.crm.meetingNotes.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Meeting updated' })
      utils.crm.meetingNotes.listByAccount.invalidate({ accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.crm.meetingNotes.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Meeting deleted' })
      utils.crm.meetingNotes.listByAccount.invalidate({ accountId })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when meeting data loads
  useEffect(() => {
    if (meetingQuery.data) {
      const m = meetingQuery.data
      setTitle(m.title || '')
      setMeetingType(m.meeting_type || 'check_in')
      setStatus(m.status || 'scheduled')
      setDescription(m.description || '')
      setLocationType(m.location_type || 'video')
      setLocationDetails(m.location_details || '')
      setAgenda(m.agenda || '')
      setDiscussionNotes(m.discussion_notes || '')
    }
  }, [meetingQuery.data])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  const handleSave = () => {
    if (!meetingId) return
    updateMutation.mutate({
      id: meetingId,
      title: title.trim(),
      meetingType: meetingType as 'kickoff' | 'check_in' | 'qbr' | 'intake' | 'escalation' | 'other',
      status: status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
      description: description.trim() || undefined,
      locationType: locationType as 'video' | 'phone' | 'in_person',
      locationDetails: locationDetails.trim() || undefined,
      agenda: agenda.trim() || undefined,
      discussionNotes: discussionNotes.trim() || undefined,
    })
  }

  const handleDelete = () => {
    if (!meetingId) return
    deleteMutation.mutate({ id: meetingId })
  }

  const meeting = meetingQuery.data
  const LocationIcon = meeting ? locationIcons[meeting.location_type as keyof typeof locationIcons] || Video : Video

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Meeting' : 'Meeting Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update meeting information' : 'View meeting details and notes'}
              </DialogDescription>
            </div>
            {!isEditing && meeting && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {meetingQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : meeting ? (
          isEditing ? (
            // Edit Mode
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationDetails">Location Details</Label>
                  <Input
                    id="locationDetails"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    placeholder="Meeting link or address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenda">Agenda</Label>
                <Textarea
                  id="agenda"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discussionNotes">Discussion Notes</Label>
                <Textarea
                  id="discussionNotes"
                  value={discussionNotes}
                  onChange={(e) => setDiscussionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="py-4 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                    {meeting.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {meeting.meeting_type?.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{meeting.title}</h3>
                {meeting.description && (
                  <p className="text-charcoal-600 mt-1">{meeting.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {meeting.scheduled_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <span>{format(new Date(meeting.scheduled_at), 'PPP p')}</span>
                  </div>
                )}
                {meeting.duration_minutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-charcoal-400" />
                    <span>{meeting.duration_minutes} minutes</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <LocationIcon className="w-4 h-4 text-charcoal-400" />
                  <span className="capitalize">{meeting.location_type?.replace('_', ' ')}</span>
                </div>
                {meeting.creator && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-charcoal-400" />
                    <span>{meeting.creator.full_name}</span>
                  </div>
                )}
              </div>

              {meeting.agenda && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Agenda</h4>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{meeting.agenda}</p>
                  </div>
                </div>
              )}

              {meeting.discussion_notes && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Discussion Notes</h4>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{meeting.discussion_notes}</p>
                  </div>
                </div>
              )}

              {meeting.key_takeaways && meeting.key_takeaways.length > 0 && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Key Takeaways</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {meeting.key_takeaways.map((takeaway: string, index: number) => (
                      <li key={index} className="text-sm">{takeaway}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-charcoal-500">
            Meeting not found
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 mr-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this meeting and all associated notes.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending || !title.trim()}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
