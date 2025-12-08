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
import { Loader2, Trash2, Edit, X, Check, Phone, Mail, Calendar, FileText, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { formatDistanceToNow, format } from 'date-fns'

interface ActivityDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityId: string | null
  accountId: string
}

const outcomeOptions = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
  { value: 'no_response', label: 'No Response' },
  { value: 'left_voicemail', label: 'Left Voicemail' },
  { value: 'busy', label: 'Busy' },
  { value: 'connected', label: 'Connected' },
]

const activityTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
}

const outcomeColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-charcoal-100 text-charcoal-700',
  negative: 'bg-red-100 text-red-700',
  no_response: 'bg-amber-100 text-amber-700',
  left_voicemail: 'bg-blue-100 text-blue-700',
  busy: 'bg-orange-100 text-orange-700',
  connected: 'bg-green-100 text-green-700',
}

export function ActivityDetailDialog({
  open,
  onOpenChange,
  activityId,
  accountId,
}: ActivityDetailDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [outcome, setOutcome] = useState('')
  const [nextSteps, setNextSteps] = useState('')

  // Fetch activity data
  const activityQuery = trpc.crm.activities.getById.useQuery(
    { id: activityId! },
    { enabled: !!activityId && open }
  )

  // Update mutation
  const updateMutation = trpc.crm.activities.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity updated' })
      utils.crm.activities.listByAccount.invalidate({ accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.crm.activities.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity deleted' })
      utils.crm.activities.listByAccount.invalidate({ accountId })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when activity data loads
  useEffect(() => {
    if (activityQuery.data) {
      const a = activityQuery.data
      setSubject(a.subject || '')
      setDescription(a.description || '')
      setOutcome(a.outcome || '')
      setNextSteps(a.next_steps || '')
    }
  }, [activityQuery.data])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  const handleSave = () => {
    if (!activityId) return
    updateMutation.mutate({
      id: activityId,
      subject: subject.trim() || undefined,
      description: description.trim() || undefined,
      outcome: outcome as 'positive' | 'neutral' | 'negative' | 'no_response' | 'left_voicemail' | 'busy' | 'connected' | undefined,
      nextSteps: nextSteps.trim() || undefined,
    })
  }

  const handleDelete = () => {
    if (!activityId) return
    deleteMutation.mutate({ id: activityId })
  }

  const activity = activityQuery.data
  const ActivityIcon = activity ? activityTypeIcons[activity.activity_type as keyof typeof activityTypeIcons] || FileText : FileText

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Activity' : 'Activity Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update activity information' : 'View activity details'}
              </DialogDescription>
            </div>
            {!isEditing && activity && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {activityQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : activity ? (
          isEditing ? (
            // Edit Mode
            <div className="space-y-4 py-4">
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

              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {outcomeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextSteps">Next Steps</Label>
                <Textarea
                  id="nextSteps"
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="py-4 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                  <ActivityIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {activity.activity_type}
                    </Badge>
                    {activity.outcome && (
                      <Badge className={outcomeColors[activity.outcome] || 'bg-charcoal-100'}>
                        {activity.outcome.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  {activity.subject && (
                    <h3 className="font-semibold">{activity.subject}</h3>
                  )}
                  <div className="flex items-center gap-2 text-sm text-charcoal-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                    {activity.creator && (
                      <>
                        <span>&bull;</span>
                        <span>{activity.creator.full_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {activity.description && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Description</h4>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{activity.description}</p>
                  </div>
                </div>
              )}

              {activity.duration_minutes && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-charcoal-500">Duration:</span>
                  <span>{activity.duration_minutes} minutes</span>
                </div>
              )}

              {activity.next_steps && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Next Steps</h4>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{activity.next_steps}</p>
                  </div>
                </div>
              )}

              {activity.next_follow_up_date && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-charcoal-500">Follow-up Date:</span>
                  <span>{format(new Date(activity.next_follow_up_date), 'PPP')}</span>
                </div>
              )}

              {activity.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-charcoal-500">Contact:</span>
                  <span>{activity.contact.first_name} {activity.contact.last_name}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-charcoal-500">
            Activity not found
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
                    <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this activity. This action cannot be undone.
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
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
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
