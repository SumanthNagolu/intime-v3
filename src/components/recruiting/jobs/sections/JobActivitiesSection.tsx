'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Phone,
  Mail,
  Calendar,
  Clock,
  Loader2,
  FileText,
  MessageSquare,
  Users,
  Plus,
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface JobActivitiesSectionProps {
  jobId: string
}

const activityTypes = [
  { value: 'call', label: 'Call', icon: <Phone className="w-4 h-4" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'meeting', label: 'Meeting', icon: <Calendar className="w-4 h-4" /> },
  { value: 'note', label: 'Note', icon: <FileText className="w-4 h-4" /> },
  { value: 'task', label: 'Task', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'linkedin_message', label: 'LinkedIn', icon: <Users className="w-4 h-4" /> },
]

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  task: <MessageSquare className="w-4 h-4" />,
  linkedin_message: <Users className="w-4 h-4" />,
  follow_up: <Clock className="w-4 h-4" />,
}

export function JobActivitiesSection({ jobId }: JobActivitiesSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [isFormExpanded, setIsFormExpanded] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [activityType, setActivityType] = useState('note')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  // Query activities for this job
  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
    limit: 50,
  })
  const activities = activitiesQuery.data?.items || []

  // Create activity mutation
  const logActivityMutation = trpc.activities.log.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity logged' })
      utils.activities.listByEntity.invalidate({ entityType: 'job', entityId: jobId })
      resetForm()
      setIsFormExpanded(false)
    },
    onError: (error) => {
      toast({ title: 'Failed to log activity', description: error.message, variant: 'error' })
    },
  })

  const resetForm = () => {
    setActivityType('note')
    setSubject('')
    setDescription('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast({ title: 'Please enter a description', variant: 'error' })
      return
    }

    logActivityMutation.mutate({
      entityType: 'job',
      entityId: jobId,
      activityType: activityType as 'call' | 'email' | 'meeting' | 'note' | 'task' | 'linkedin_message' | 'follow_up',
      subject: subject.trim() || undefined,
      body: description.trim(),
    })
  }

  const handleCancel = () => {
    resetForm()
    setIsFormExpanded(false)
  }

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(selectedActivityId === activityId ? null : activityId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Log
        </CardTitle>
        <CardDescription>
          Track all interactions and updates for this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Inline Activity Form */}
        <div className="mb-6">
          {!isFormExpanded ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFormExpanded(true)}
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          ) : (
            <div className="border rounded-lg bg-white p-4 shadow-sm">
              <form onSubmit={handleSubmit}>
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

                {/* Activity Type Selection */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {activityTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setActivityType(type.value)}
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

                {/* Form Fields */}
                <div className="space-y-3">
                  <div>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subject (optional)"
                    />
                  </div>
                  <div>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What happened?"
                      className="min-h-[80px]"
                      required
                    />
                  </div>
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
          )}
        </div>

        {/* Activities List */}
        {activitiesQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No activities logged yet</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Use the form above to log your first activity
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity.id)}
                className={cn(
                  'flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                  selectedActivityId === activity.id
                    ? 'border-hublot-500 bg-hublot-50'
                    : 'hover:border-hublot-300'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                  {activityIcons[activity.activity_type] || <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium capitalize">{activity.activity_type}</p>
                    <span className="text-sm text-charcoal-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {activity.subject && (
                    <p className="font-medium mt-1 truncate">{activity.subject}</p>
                  )}
                  {activity.description && (
                    <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {activity.outcome && (
                      <Badge variant="outline" className="capitalize">
                        {activity.outcome}
                      </Badge>
                    )}
                    {activity.performed_by?.full_name && (
                      <span className="text-xs text-charcoal-500">
                        by {activity.performed_by.full_name}
                      </span>
                    )}
                  </div>

                  {/* Expanded details */}
                  {selectedActivityId === activity.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {activity.description && (
                        <div>
                          <Label className="text-xs text-charcoal-500">Full Description</Label>
                          <p className="text-sm mt-1">{activity.description}</p>
                        </div>
                      )}
                      {activity.scheduled_at && (
                        <div>
                          <Label className="text-xs text-charcoal-500">Scheduled</Label>
                          <p className="text-sm mt-1">
                            {new Date(activity.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {activity.duration_minutes && (
                        <div>
                          <Label className="text-xs text-charcoal-500">Duration</Label>
                          <p className="text-sm mt-1">{activity.duration_minutes} minutes</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
