'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  SkipForward,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

const CATEGORY_LABELS: Record<string, string> = {
  paperwork: 'Paperwork',
  it_setup: 'IT Setup',
  training: 'Training',
  orientation: 'Orientation',
  other: 'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  paperwork: 'bg-blue-100 text-blue-800',
  it_setup: 'bg-purple-100 text-purple-800',
  training: 'bg-green-100 text-green-800',
  orientation: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-800',
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-charcoal-100 text-charcoal-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
}

const TASK_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  skipped: { label: 'Skipped', color: 'bg-charcoal-100 text-charcoal-700', icon: SkipForward },
}

interface OnboardingTask {
  id: string
  taskName: string
  description: string | null
  category: string
  status: string
  isRequired: boolean
  dueDate: string | null
  skipReason: string | null
  completedAt: string | null
  completedBy: { full_name?: string } | null
}

export default function OnboardingChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const checklistId = params.checklistId as string

  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [notes, setNotes] = useState('')
  const [skipReason, setSkipReason] = useState('')

  const { data: checklist, isLoading, refetch } = trpc.hr.onboarding.checklists.getById.useQuery(
    { id: checklistId },
    { enabled: !!checklistId }
  )

  const completeMutation = trpc.hr.onboarding.tasks.complete.useMutation({
    onSuccess: () => {
      toast.success('Task completed')
      refetch()
      setShowCompleteDialog(false)
      setSelectedTask(null)
      setNotes('')
    },
    onError: (error) => toast.error(error.message),
  })

  const skipMutation = trpc.hr.onboarding.tasks.skip.useMutation({
    onSuccess: () => {
      toast.success('Task skipped')
      refetch()
      setShowSkipDialog(false)
      setSelectedTask(null)
      setSkipReason('')
    },
    onError: (error) => toast.error(error.message),
  })

  const addNoteMutation = trpc.hr.onboarding.tasks.addNote.useMutation({
    onSuccess: () => {
      toast.success('Note added')
      refetch()
      setShowNoteDialog(false)
      setSelectedTask(null)
      setNotes('')
    },
    onError: (error) => toast.error(error.message),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
              Checklist Not Found
            </h3>
            <p className="text-body text-charcoal-500 mb-4">
              The onboarding checklist you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push('/employee/operations/onboarding')}>
              Back to Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[checklist.status as keyof typeof STATUS_CONFIG]
  const StatusIcon = statusConfig.icon
  const tasks = checklist.tasks as OnboardingTask[]
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category
    if (!acc[category]) acc[category] = []
    acc[category].push(task)
    return acc
  }, {} as Record<string, OnboardingTask[]>)

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-body-sm text-charcoal-500">
        <span
          className="hover:text-charcoal-700 cursor-pointer"
          onClick={() => router.push('/employee/operations/onboarding')}
        >
          Onboarding
        </span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-charcoal-900">Checklist Details</span>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-charcoal-200 text-charcoal-700 text-lg">?</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                  Employee Onboarding
                </h1>
                <p className="text-body text-charcoal-500 mt-1">
                  Template: {(checklist.template as { name?: string })?.name ?? 'Unknown'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                  {checklist.assignedTo && (
                    <div className="flex items-center gap-2 text-body-sm text-charcoal-500">
                      <User className="h-4 w-4" />
                      Assigned to: {(checklist.assignedTo as { full_name?: string })?.full_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-body-sm text-charcoal-500 mb-2">Progress</div>
              <div className="flex items-center gap-3">
                <Progress value={checklist.progress} className="w-32 h-2" />
                <span className="text-h4 font-heading font-semibold text-charcoal-900">
                  {checklist.progress}%
                </span>
              </div>
              <p className="text-body-sm text-charcoal-500 mt-1">
                {checklist.completedTasks} of {checklist.totalTasks} tasks complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Category */}
      <div className="space-y-6">
        {Object.entries(tasksByCategory).map(([category, catTasks]) => (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2">
                <Badge className={CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other}>
                  {CATEGORY_LABELS[category] ?? 'Other'}
                </Badge>
                <span className="text-charcoal-500 font-normal text-body-sm">
                  {catTasks.filter((t) => t.status === 'completed' || t.status === 'skipped').length}/
                  {catTasks.length} complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {catTasks.map((task) => {
                  const taskStatus = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]
                  const TaskIcon = taskStatus.icon
                  const isOverdue = task.status === 'pending' && task.dueDate && new Date(task.dueDate) < new Date()

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg border transition-colors',
                        task.status === 'completed' && 'bg-green-50 border-green-200',
                        task.status === 'skipped' && 'bg-charcoal-50 border-charcoal-200',
                        task.status === 'pending' && !isOverdue && 'bg-white border-charcoal-200',
                        isOverdue && 'bg-red-50 border-red-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0',
                          task.status === 'completed' && 'bg-green-100',
                          task.status === 'skipped' && 'bg-charcoal-100',
                          task.status === 'pending' && 'bg-amber-100'
                        )}>
                          <TaskIcon className={cn(
                            'h-4 w-4',
                            task.status === 'completed' && 'text-green-600',
                            task.status === 'skipped' && 'text-charcoal-600',
                            task.status === 'pending' && 'text-amber-600'
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              'text-body font-medium',
                              task.status === 'completed' && 'text-green-800 line-through',
                              task.status === 'skipped' && 'text-charcoal-500 line-through',
                              task.status === 'pending' && 'text-charcoal-900'
                            )}>
                              {task.taskName}
                            </p>
                            {task.isRequired && <Badge variant="outline" className="text-xs">Required</Badge>}
                          </div>
                          {task.description && <p className="text-body-sm text-charcoal-500 mt-1">{task.description}</p>}
                          {task.skipReason && <p className="text-body-sm text-charcoal-500 mt-1 italic">Skipped: {task.skipReason}</p>}
                          {task.completedAt && (
                            <p className="text-caption text-charcoal-400 mt-1">
                              {task.status === 'completed' ? 'Completed' : 'Skipped'} {new Date(task.completedAt).toLocaleDateString()} by {task.completedBy?.full_name ?? 'Unknown'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.dueDate && task.status === 'pending' && (
                          <div className={cn('flex items-center gap-1 text-body-sm', isOverdue ? 'text-red-600' : 'text-charcoal-500')}>
                            <Calendar className="h-4 w-4" />
                            {isOverdue && <AlertTriangle className="h-3 w-3" />}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task.id); setShowNoteDialog(true) }}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedTask(task.id); setShowSkipDialog(true) }}>
                              <SkipForward className="h-4 w-4 mr-1" />Skip
                            </Button>
                            <Button size="sm" onClick={() => { setSelectedTask(task.id); setShowCompleteDialog(true) }}>
                              <CheckCircle className="h-4 w-4 mr-1" />Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>Mark this task as complete. You can optionally add notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" placeholder="Add any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedTask && completeMutation.mutate({ taskId: selectedTask, notes: notes || undefined })} disabled={completeMutation.isPending}>
              {completeMutation.isPending ? 'Completing...' : 'Complete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Task</DialogTitle>
            <DialogDescription>Please provide a reason for skipping this task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skipReason">Reason (required)</Label>
              <Textarea id="skipReason" placeholder="Why is this task being skipped?" value={skipReason} onChange={(e) => setSkipReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedTask && skipMutation.mutate({ taskId: selectedTask, reason: skipReason })} disabled={!skipReason || skipMutation.isPending}>
              {skipMutation.isPending ? 'Skipping...' : 'Skip Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a note to this task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" placeholder="Enter your note..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedTask && addNoteMutation.mutate({ taskId: selectedTask, note: notes })} disabled={!notes || addNoteMutation.isPending}>
              {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
