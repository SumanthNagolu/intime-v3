'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  UserMinus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Briefcase,
  Building2,
  Phone,
  Mail,
  User,
  MessageSquare,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Shield,
  DollarSign,
  Monitor,
  Users,
  Scale,
  Settings,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Circle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
}

const TERMINATION_TYPE_CONFIG = {
  voluntary: { label: 'Voluntary', color: 'bg-blue-100 text-blue-700' },
  involuntary: { label: 'Involuntary', color: 'bg-red-100 text-red-700' },
  retirement: { label: 'Retirement', color: 'bg-purple-100 text-purple-700' },
  contract_end: { label: 'Contract End', color: 'bg-amber-100 text-amber-700' },
  layoff: { label: 'Layoff', color: 'bg-orange-100 text-orange-700' },
  mutual: { label: 'Mutual Agreement', color: 'bg-teal-100 text-teal-700' },
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Monitor; color: string }> = {
  it: { label: 'IT & Access', icon: Monitor, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  hr: { label: 'HR', icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  manager: { label: 'Manager', icon: User, color: 'text-green-600 bg-green-50 border-green-200' },
  finance: { label: 'Finance', icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  facilities: { label: 'Facilities', icon: Building2, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  legal: { label: 'Legal', icon: Scale, color: 'text-red-600 bg-red-50 border-red-200' },
  other: { label: 'Other', icon: Settings, color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

const TASK_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-gray-500 bg-gray-100', icon: Circle },
  in_progress: { label: 'In Progress', color: 'text-blue-600 bg-blue-100', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-600 bg-green-100', icon: CheckCircle2 },
  skipped: { label: 'Skipped', color: 'text-gray-400 bg-gray-50', icon: Circle },
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getDaysUntil(dateString: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(dateString)
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function OffboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const utils = trpc.useUtils()

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['it', 'hr', 'manager']))
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [taskNotes, setTaskNotes] = useState('')
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [isExitInterviewOpen, setIsExitInterviewOpen] = useState(false)
  const [exitInterviewNotes, setExitInterviewNotes] = useState('')

  const { data: offboarding, isLoading } = trpc.offboarding.getFullOffboarding.useQuery(
    { id },
    { enabled: !!id }
  )

  const completeTaskMutation = trpc.offboarding.completeTask.useMutation({
    onSuccess: () => {
      utils.offboarding.getFullOffboarding.invalidate({ id })
      setIsCompleteDialogOpen(false)
      setSelectedTask(null)
      setTaskNotes('')
    },
  })

  const updateOffboardingMutation = trpc.offboarding.update.useMutation({
    onSuccess: () => {
      utils.offboarding.getFullOffboarding.invalidate({ id })
      setIsExitInterviewOpen(false)
      setExitInterviewNotes('')
    },
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleCompleteTask = () => {
    if (selectedTask) {
      completeTaskMutation.mutate({
        taskId: selectedTask,
        notes: taskNotes || undefined,
      })
    }
  }

  const handleMarkExitInterviewComplete = () => {
    updateOffboardingMutation.mutate({
      id,
      exitInterviewCompletedAt: new Date().toISOString(),
      exitInterviewNotes: exitInterviewNotes || undefined,
    })
  }

  const handleStartOffboarding = () => {
    updateOffboardingMutation.mutate({
      id,
      status: 'in_progress',
    })
  }

  const handleCompleteOffboarding = () => {
    updateOffboardingMutation.mutate({
      id,
      status: 'completed',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!offboarding) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <AlertCircle className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
          <h2 className="text-h3 font-heading font-semibold text-charcoal-900 mb-2">
            Offboarding Not Found
          </h2>
          <Link href="/employee/operations/offboarding">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Offboarding
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[offboarding.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started
  const StatusIcon = statusConfig.icon
  const terminationConfig = TERMINATION_TYPE_CONFIG[offboarding.termination_type as keyof typeof TERMINATION_TYPE_CONFIG]
  const employee = offboarding.employee as {
    id: string
    user_id: string
    employee_number: string
    job_title: string
    department: string
    hire_date: string
    user: { full_name: string; email: string; avatar_url?: string | null; phone?: string | null }
  }
  const progress = offboarding.progress
  const tasksByCategory = offboarding.tasksByCategory ?? {}
  const daysUntilLWD = getDaysUntil(offboarding.last_working_day)

  const canStart = offboarding.status === 'not_started'
  const canComplete = offboarding.status === 'in_progress' && progress.percentage === 100

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/offboarding">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                    Offboarding: {employee.user.full_name}
                  </h1>
                  <Badge className={cn('flex items-center gap-1 border', statusConfig.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  Last working day: {new Date(offboarding.last_working_day).toLocaleDateString()}
                  {daysUntilLWD >= 0 && (
                    <span className={cn(
                      'ml-2',
                      daysUntilLWD <= 7 ? 'text-red-600 font-medium' : 'text-charcoal-500'
                    )}>
                      ({daysUntilLWD === 0 ? 'Today' : daysUntilLWD === 1 ? 'Tomorrow' : `${daysUntilLWD} days left`})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canStart && (
                <Button onClick={handleStartOffboarding} disabled={updateOffboardingMutation.isPending}>
                  {updateOffboardingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Start Offboarding
                </Button>
              )}

              {canComplete && (
                <Button
                  onClick={handleCompleteOffboarding}
                  disabled={updateOffboardingMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateOffboardingMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Complete Offboarding
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Summary
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mark as Blocked
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Task Progress</h3>
                    <p className="text-sm text-charcoal-500">
                      {progress.completed} of {progress.total} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      'text-3xl font-bold',
                      progress.percentage === 100
                        ? 'text-green-600'
                        : progress.percentage >= 50
                        ? 'text-blue-600'
                        : 'text-charcoal-900'
                    )}>
                      {progress.percentage}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={progress.percentage}
                  className={cn(
                    'h-3',
                    progress.percentage === 100
                      ? '[&>div]:bg-green-500'
                      : progress.percentage >= 50
                      ? '[&>div]:bg-blue-500'
                      : ''
                  )}
                />
              </CardContent>
            </Card>

            {/* Task Categories */}
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
              const tasks = tasksByCategory[category] ?? []
              if (tasks.length === 0) return null

              const completedInCategory = tasks.filter((t: { status: string }) => t.status === 'completed').length
              const CategoryIcon = config.icon
              const isExpanded = expandedCategories.has(category)

              return (
                <Collapsible
                  key={category}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <Card className={cn('border-l-4', config.color.split(' ')[2])}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-charcoal-50/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.color)}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold">
                                {config.label}
                              </CardTitle>
                              <p className="text-sm text-charcoal-500">
                                {completedInCategory} of {tasks.length} completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress
                              value={(completedInCategory / tasks.length) * 100}
                              className="w-24 h-2"
                            />
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-charcoal-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-charcoal-400" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {tasks.map((task: {
                            id: string
                            task_name: string
                            description?: string | null
                            status: string
                            due_date?: string | null
                            completed_at?: string | null
                            assigned_user?: { full_name: string; avatar_url?: string | null } | null
                            completed_user?: { full_name: string } | null
                            notes?: string | null
                          }) => {
                            const taskStatus = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.pending
                            const TaskStatusIcon = taskStatus.icon
                            const isCompleted = task.status === 'completed'
                            const isOverdue = task.due_date && !isCompleted && new Date(task.due_date) < new Date()

                            return (
                              <div
                                key={task.id}
                                className={cn(
                                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                                  isCompleted
                                    ? 'bg-green-50/50 border-green-200'
                                    : isOverdue
                                    ? 'bg-red-50/50 border-red-200'
                                    : 'bg-white border-charcoal-100 hover:border-charcoal-200'
                                )}
                              >
                                <div className="mt-0.5">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Dialog
                                      open={isCompleteDialogOpen && selectedTask === task.id}
                                      onOpenChange={(open) => {
                                        setIsCompleteDialogOpen(open)
                                        if (!open) {
                                          setSelectedTask(null)
                                          setTaskNotes('')
                                        }
                                      }}
                                    >
                                      <DialogTrigger asChild>
                                        <button
                                          onClick={() => setSelectedTask(task.id)}
                                          className="w-5 h-5 rounded border-2 border-charcoal-300 hover:border-charcoal-400 transition-colors flex items-center justify-center"
                                        >
                                          <Check className="h-3 w-3 text-transparent hover:text-charcoal-400" />
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Complete Task</DialogTitle>
                                          <DialogDescription>
                                            Mark &quot;{task.task_name}&quot; as completed
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                          <Label>Notes (Optional)</Label>
                                          <Textarea
                                            value={taskNotes}
                                            onChange={(e) => setTaskNotes(e.target.value)}
                                            placeholder="Add any notes about completing this task..."
                                            className="mt-2"
                                            rows={3}
                                          />
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setIsCompleteDialogOpen(false)
                                              setSelectedTask(null)
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={handleCompleteTask}
                                            disabled={completeTaskMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            {completeTaskMutation.isPending ? (
                                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                              <CheckCircle2 className="h-4 w-4 mr-2" />
                                            )}
                                            Complete
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className={cn(
                                        'font-medium',
                                        isCompleted ? 'text-charcoal-500 line-through' : 'text-charcoal-900'
                                      )}>
                                        {task.task_name}
                                      </p>
                                      {task.description && (
                                        <p className="text-sm text-charcoal-500 mt-0.5">
                                          {task.description}
                                        </p>
                                      )}
                                    </div>
                                    {isOverdue && (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 flex-shrink-0">
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                                    {task.due_date && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    {task.assigned_user && (
                                      <div className="flex items-center gap-1">
                                        <Avatar className="h-4 w-4">
                                          <AvatarImage src={task.assigned_user.avatar_url || undefined} />
                                          <AvatarFallback className="text-[8px]">
                                            {getInitials(task.assigned_user.full_name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{task.assigned_user.full_name}</span>
                                      </div>
                                    )}
                                    {task.completed_at && (
                                      <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>
                                          {new Date(task.completed_at).toLocaleDateString()}
                                          {task.completed_user && ` by ${task.completed_user.full_name}`}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {task.notes && (
                                    <p className="text-sm text-charcoal-600 mt-2 italic">
                                      Note: {task.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={employee.user.avatar_url || undefined} />
                    <AvatarFallback className="bg-charcoal-100 text-lg">
                      {getInitials(employee.user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-charcoal-900">
                      {employee.user.full_name}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {employee.job_title}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Building2 className="h-4 w-4 text-charcoal-400" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Mail className="h-4 w-4 text-charcoal-400" />
                    <span>{employee.user.email}</span>
                  </div>
                  {employee.user.phone && (
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Phone className="h-4 w-4 text-charcoal-400" />
                      <span>{employee.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Calendar className="h-4 w-4 text-charcoal-400" />
                    <span>
                      Started {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offboarding Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Offboarding Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                    Termination Type
                  </p>
                  <Badge className={terminationConfig?.color}>
                    {terminationConfig?.label || offboarding.termination_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                    Last Working Day
                  </p>
                  <p className="font-medium text-charcoal-900">
                    {new Date(offboarding.last_working_day).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {daysUntilLWD >= 0 && (
                    <p className={cn(
                      'text-sm mt-1',
                      daysUntilLWD <= 7 ? 'text-red-600' : 'text-charcoal-500'
                    )}>
                      {daysUntilLWD === 0
                        ? 'Today!'
                        : daysUntilLWD === 1
                        ? '1 day remaining'
                        : `${daysUntilLWD} days remaining`}
                    </p>
                  )}
                </div>
                {offboarding.template && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Template
                    </p>
                    <p className="font-medium text-charcoal-900">
                      {(offboarding.template as { name: string }).name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exit Interview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-heading font-semibold uppercase tracking-wider text-charcoal-500">
                  Exit Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {offboarding.exit_interview_completed_at ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <p className="text-sm text-charcoal-500">
                      {new Date(offboarding.exit_interview_completed_at).toLocaleDateString()}
                    </p>
                    {offboarding.exit_interview_notes && (
                      <div className="p-3 bg-charcoal-50 rounded-lg">
                        <p className="text-sm text-charcoal-700">
                          {offboarding.exit_interview_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : offboarding.exit_interview_scheduled_at ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Scheduled</span>
                    </div>
                    <p className="text-sm text-charcoal-500">
                      {new Date(offboarding.exit_interview_scheduled_at).toLocaleString()}
                    </p>
                    <Dialog open={isExitInterviewOpen} onOpenChange={setIsExitInterviewOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
                          Mark as Completed
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Complete Exit Interview</DialogTitle>
                          <DialogDescription>
                            Record the outcome of the exit interview.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label>Interview Notes</Label>
                          <Textarea
                            value={exitInterviewNotes}
                            onChange={(e) => setExitInterviewNotes(e.target.value)}
                            placeholder="Key takeaways and feedback from the exit interview..."
                            className="mt-2"
                            rows={5}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsExitInterviewOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleMarkExitInterviewComplete}
                            disabled={updateOffboardingMutation.isPending}
                          >
                            {updateOffboardingMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Complete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
                    <p className="text-sm text-charcoal-500 mb-3">
                      Exit interview not scheduled
                    </p>
                    <Button size="sm" variant="outline">
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rehire Status */}
            {offboarding.status === 'completed' && (
              <Card className={cn(
                offboarding.rehire_eligible === true
                  ? 'border-green-200 bg-green-50'
                  : offboarding.rehire_eligible === false
                  ? 'border-red-200 bg-red-50'
                  : ''
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      offboarding.rehire_eligible === true
                        ? 'bg-green-100'
                        : offboarding.rehire_eligible === false
                        ? 'bg-red-100'
                        : 'bg-charcoal-100'
                    )}>
                      {offboarding.rehire_eligible === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : offboarding.rehire_eligible === false ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <User className="h-5 w-5 text-charcoal-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">
                        {offboarding.rehire_eligible === true
                          ? 'Eligible for Rehire'
                          : offboarding.rehire_eligible === false
                          ? 'Not Eligible for Rehire'
                          : 'Rehire Status Not Set'}
                      </p>
                      {offboarding.rehire_notes && (
                        <p className="text-sm text-charcoal-500 mt-0.5">
                          {offboarding.rehire_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
