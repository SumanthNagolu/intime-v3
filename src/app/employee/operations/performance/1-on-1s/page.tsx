'use client'

/**
 * 1:1 Meetings Page
 * Manage one-on-one meetings between employees and managers
 */

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, addDays } from 'date-fns'
import {
  Calendar,
  Clock,
  Plus,
  Users,
  MessageSquare,
  Video,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ListTodo,
  User,
  CalendarDays,
  CalendarCheck,
  ArrowRight,
  Repeat,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MeetingEmployee {
  id: string
  job_title: string | null
  user: {
    full_name: string
    avatar_url: string | null
  }
}

interface Meeting {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  employee_agenda: string | null
  manager_agenda: string | null
  shared_notes: string | null
  action_items: Array<{
    description: string
    assignedTo?: string
    dueDate?: string
    completed?: boolean
  }> | null
  is_recurring: boolean
  completed_at: string | null
  employee: MeetingEmployee | null
  manager: MeetingEmployee | null
}

export default function OneOnOneMeetingsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    managerId: '',
    scheduledAt: format(addDays(new Date(), 1), "yyyy-MM-dd'T'10:00"),
    durationMinutes: 30,
    employeeAgenda: '',
    managerAgenda: '',
    isRecurring: false,
    recurrenceRule: 'weekly',
  })

  // Fetch meetings
  const { data: upcomingMeetings = [], isLoading: loadingUpcoming, refetch: refetchUpcoming } = trpc.performance.oneOnOnes.list.useQuery({
    upcoming: true,
  })

  const { data: pastMeetings = [], isLoading: loadingPast, refetch: refetchPast } = trpc.performance.oneOnOnes.list.useQuery({
    status: 'completed',
  })

  const { data: myUpcoming = [] } = trpc.performance.oneOnOnes.getUpcoming.useQuery()

  // Fetch employees for selection
  const { data: employeesData } = trpc.hr.employees.list.useQuery({
    status: 'active',
    page: 1,
    pageSize: 100,
  })
  const employees = employeesData?.items ?? []

  // Mutations
  const createMutation = trpc.performance.oneOnOnes.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false)
      setCreateForm({
        employeeId: '',
        managerId: '',
        scheduledAt: format(addDays(new Date(), 1), "yyyy-MM-dd'T'10:00"),
        durationMinutes: 30,
        employeeAgenda: '',
        managerAgenda: '',
        isRecurring: false,
        recurrenceRule: 'weekly',
      })
      refetchUpcoming()
    },
  })

  const updateAgendaMutation = trpc.performance.oneOnOnes.updateAgenda.useMutation({
    onSuccess: () => {
      refetchUpcoming()
      refetchPast()
    },
  })

  const completeMutation = trpc.performance.oneOnOnes.complete.useMutation({
    onSuccess: () => {
      setSelectedMeeting(null)
      refetchUpcoming()
      refetchPast()
    },
  })

  const handleCreateMeeting = () => {
    if (!createForm.employeeId || !createForm.managerId) return

    createMutation.mutate({
      employeeId: createForm.employeeId,
      managerId: createForm.managerId,
      scheduledAt: new Date(createForm.scheduledAt).toISOString(),
      durationMinutes: createForm.durationMinutes,
      employeeAgenda: createForm.employeeAgenda || undefined,
      managerAgenda: createForm.managerAgenda || undefined,
      isRecurring: createForm.isRecurring,
      recurrenceRule: createForm.isRecurring ? createForm.recurrenceRule : undefined,
    })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      scheduled: { variant: 'default', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      in_progress: { variant: 'default', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      completed: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      cancelled: { variant: 'secondary', className: 'bg-charcoal-100 text-charcoal-600' },
      rescheduled: { variant: 'default', className: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    }
    const config = configs[status] || configs.scheduled
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getMeetingTimeLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return formatDistanceToNow(date, { addSuffix: true })
    return format(date, 'EEE, MMM d')
  }

  const stats = {
    upcoming: upcomingMeetings.length,
    thisWeek: myUpcoming.length,
    completedMonth: pastMeetings.filter(m => {
      const date = new Date(m.completed_at || m.scheduled_at)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
    needsAction: upcomingMeetings.filter(m => {
      const date = new Date(m.scheduled_at)
      return isToday(date) && !m.employee_agenda && !m.manager_agenda
    }).length,
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-cream min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">1:1 Meetings</h1>
          <p className="text-charcoal-500 mt-1">Manage one-on-one meetings with your team</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-charcoal-900 hover:bg-charcoal-800">
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule 1:1 Meeting</DialogTitle>
              <DialogDescription>
                Set up a one-on-one meeting between an employee and their manager
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={createForm.employeeId}
                    onValueChange={(v) => setCreateForm(f => ({ ...f, employeeId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.user?.full_name || emp.first_name + ' ' + emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select
                    value={createForm.managerId}
                    onValueChange={(v) => setCreateForm(f => ({ ...f, managerId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.user?.full_name || emp.first_name + ' ' + emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Date & Time</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={createForm.scheduledAt}
                    onChange={(e) => setCreateForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select
                    value={String(createForm.durationMinutes)}
                    onValueChange={(v) => setCreateForm(f => ({ ...f, durationMinutes: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                <Checkbox
                  id="recurring"
                  checked={createForm.isRecurring}
                  onCheckedChange={(c) => setCreateForm(f => ({ ...f, isRecurring: !!c }))}
                />
                <div className="flex-1">
                  <Label htmlFor="recurring" className="cursor-pointer">
                    Make recurring
                  </Label>
                  {createForm.isRecurring && (
                    <Select
                      value={createForm.recurrenceRule}
                      onValueChange={(v) => setCreateForm(f => ({ ...f, recurrenceRule: v }))}
                    >
                      <SelectTrigger className="mt-2 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Repeat className={cn('h-4 w-4', createForm.isRecurring ? 'text-charcoal-700' : 'text-charcoal-400')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerAgenda">Initial Agenda (Optional)</Label>
                <Textarea
                  id="managerAgenda"
                  placeholder="What topics should be discussed?"
                  value={createForm.managerAgenda}
                  onChange={(e) => setCreateForm(f => ({ ...f, managerAgenda: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMeeting}
                disabled={!createForm.employeeId || !createForm.managerId || createMutation.isPending}
                className="bg-charcoal-900 hover:bg-charcoal-800"
              >
                {createMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-charcoal-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">Upcoming</p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{stats.upcoming}</p>
                <p className="text-sm text-charcoal-500 mt-1">Total scheduled</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-charcoal-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">This Week</p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{stats.thisWeek}</p>
                <p className="text-sm text-charcoal-500 mt-1">My meetings</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-charcoal-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">Completed</p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{stats.completedMonth}</p>
                <p className="text-sm text-charcoal-500 mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-charcoal-200/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">Needs Agenda</p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{stats.needsAction}</p>
                <p className="text-sm text-charcoal-500 mt-1">Today&apos;s meetings</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {loadingUpcoming ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-charcoal-400" />
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <Card className="bg-white border-charcoal-200/60">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-charcoal-300 mb-4" />
                <p className="text-charcoal-600 font-medium">No upcoming meetings</p>
                <p className="text-charcoal-400 text-sm mt-1">Schedule a 1:1 to get started</p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting as Meeting}
                  onSelect={() => setSelectedMeeting(meeting as Meeting)}
                  getStatusBadge={getStatusBadge}
                  getMeetingTimeLabel={getMeetingTimeLabel}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {loadingPast ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-charcoal-400" />
            </div>
          ) : pastMeetings.length === 0 ? (
            <Card className="bg-white border-charcoal-200/60">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-charcoal-300 mb-4" />
                <p className="text-charcoal-600 font-medium">No completed meetings yet</p>
                <p className="text-charcoal-400 text-sm mt-1">Completed meetings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting as Meeting}
                  onSelect={() => setSelectedMeeting(meeting as Meeting)}
                  getStatusBadge={getStatusBadge}
                  getMeetingTimeLabel={getMeetingTimeLabel}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Meeting Detail Sheet */}
      <MeetingDetailSheet
        meeting={selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
        onUpdateAgenda={(id, employeeAgenda, managerAgenda) => {
          updateAgendaMutation.mutate({ id, employeeAgenda, managerAgenda })
        }}
        onComplete={(id, notes, actionItems) => {
          completeMutation.mutate({
            id,
            sharedNotes: notes,
            actionItems: actionItems.map(a => ({ description: a })),
          })
        }}
        getStatusBadge={getStatusBadge}
        isUpdating={updateAgendaMutation.isPending}
        isCompleting={completeMutation.isPending}
      />
    </div>
  )
}

// Meeting Card Component
function MeetingCard({
  meeting,
  onSelect,
  getStatusBadge,
  getMeetingTimeLabel,
}: {
  meeting: Meeting
  onSelect: () => void
  getStatusBadge: (status: string) => React.ReactNode
  getMeetingTimeLabel: (date: Date) => string
}) {
  const scheduledDate = new Date(meeting.scheduled_at)
  const isUpcoming = !isPast(scheduledDate) || meeting.status === 'scheduled'
  const needsAgenda = isUpcoming && !meeting.employee_agenda && !meeting.manager_agenda

  return (
    <Card
      className={cn(
        'bg-white border-charcoal-200/60 hover:shadow-elevation-md transition-all duration-200 cursor-pointer',
        isToday(scheduledDate) && 'ring-2 ring-amber-200',
        needsAgenda && 'border-l-4 border-l-amber-400'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Date/Time */}
            <div className="flex flex-col items-center justify-center min-w-[60px] p-3 bg-charcoal-50 rounded-lg">
              <span className="text-[11px] font-medium text-charcoal-500 uppercase">
                {getMeetingTimeLabel(scheduledDate)}
              </span>
              <span className="text-lg font-bold text-charcoal-900">
                {format(scheduledDate, 'h:mm')}
              </span>
              <span className="text-xs text-charcoal-400">
                {format(scheduledDate, 'a')}
              </span>
            </div>

            {/* Participants */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={meeting.employee?.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {meeting.employee?.user?.full_name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={meeting.manager?.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-green-100 text-green-700">
                      {meeting.manager?.user?.full_name?.charAt(0) || 'M'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">
                    {meeting.employee?.user?.full_name || 'Employee'}{' '}
                    <span className="text-charcoal-400 font-normal">with</span>{' '}
                    {meeting.manager?.user?.full_name || 'Manager'}
                  </p>
                  <p className="text-sm text-charcoal-500">
                    {meeting.duration_minutes} min
                    {meeting.is_recurring && (
                      <span className="inline-flex items-center gap-1 ml-2 text-charcoal-400">
                        <Repeat className="h-3 w-3" />
                        Recurring
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Agenda Preview */}
              {(meeting.employee_agenda || meeting.manager_agenda) && (
                <div className="flex items-start gap-2 mt-1 p-2 bg-charcoal-50 rounded text-sm text-charcoal-600">
                  <MessageSquare className="h-4 w-4 text-charcoal-400 mt-0.5 flex-shrink-0" />
                  <p className="line-clamp-2">
                    {meeting.employee_agenda || meeting.manager_agenda}
                  </p>
                </div>
              )}

              {/* Action Items Preview */}
              {meeting.action_items && meeting.action_items.length > 0 && (
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <ListTodo className="h-4 w-4 text-charcoal-400" />
                  <span className="text-charcoal-600">{meeting.action_items.length} action items</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(meeting.status)}
            <ChevronRight className="h-5 w-5 text-charcoal-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Meeting Detail Sheet Component
function MeetingDetailSheet({
  meeting,
  onClose,
  onUpdateAgenda,
  onComplete,
  getStatusBadge,
  isUpdating,
  isCompleting,
}: {
  meeting: Meeting | null
  onClose: () => void
  onUpdateAgenda: (id: string, employeeAgenda?: string, managerAgenda?: string) => void
  onComplete: (id: string, notes: string, actionItems: string[]) => void
  getStatusBadge: (status: string) => React.ReactNode
  isUpdating: boolean
  isCompleting: boolean
}) {
  const [employeeAgenda, setEmployeeAgenda] = useState('')
  const [managerAgenda, setManagerAgenda] = useState('')
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState<string[]>([''])

  // Reset form when meeting changes
  useState(() => {
    if (meeting) {
      setEmployeeAgenda(meeting.employee_agenda || '')
      setManagerAgenda(meeting.manager_agenda || '')
      setNotes(meeting.shared_notes || '')
      setActionItems(meeting.action_items?.map(a => a.description) || [''])
    }
  })

  if (!meeting) return null

  const scheduledDate = new Date(meeting.scheduled_at)
  const canComplete = meeting.status === 'scheduled' || meeting.status === 'in_progress'
  const isCompleted = meeting.status === 'completed'

  const handleAddActionItem = () => {
    setActionItems([...actionItems, ''])
  }

  const handleUpdateActionItem = (index: number, value: string) => {
    const updated = [...actionItems]
    updated[index] = value
    setActionItems(updated)
  }

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index))
  }

  return (
    <Sheet open={!!meeting} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>1:1 Meeting</span>
            {getStatusBadge(meeting.status)}
          </SheetTitle>
          <SheetDescription>
            {format(scheduledDate, 'EEEE, MMMM d, yyyy')} at {format(scheduledDate, 'h:mm a')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Participants */}
          <div className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={meeting.employee?.user?.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {meeting.employee?.user?.full_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-charcoal-900">
                  {meeting.employee?.user?.full_name || 'Employee'}
                </p>
                <p className="text-sm text-charcoal-500">
                  {meeting.employee?.job_title || 'Team Member'}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-charcoal-400" />
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={meeting.manager?.user?.avatar_url || undefined} />
                <AvatarFallback className="bg-green-100 text-green-700">
                  {meeting.manager?.user?.full_name?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-charcoal-900">
                  {meeting.manager?.user?.full_name || 'Manager'}
                </p>
                <p className="text-sm text-charcoal-500">
                  {meeting.manager?.job_title || 'Manager'}
                </p>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-charcoal-400" />
              <span>{meeting.duration_minutes} minutes</span>
            </div>
            {meeting.is_recurring && (
              <div className="flex items-center gap-2 text-sm">
                <Repeat className="h-4 w-4 text-charcoal-400" />
                <span>Recurring</span>
              </div>
            )}
          </div>

          {/* Agenda Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Agenda
            </h3>

            <div className="space-y-3">
              <div>
                <Label className="text-sm text-charcoal-600">Employee&apos;s Topics</Label>
                <Textarea
                  placeholder="What would you like to discuss?"
                  value={employeeAgenda}
                  onChange={(e) => setEmployeeAgenda(e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={isCompleted}
                />
              </div>
              <div>
                <Label className="text-sm text-charcoal-600">Manager&apos;s Topics</Label>
                <Textarea
                  placeholder="Topics to cover..."
                  value={managerAgenda}
                  onChange={(e) => setManagerAgenda(e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={isCompleted}
                />
              </div>
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateAgenda(meeting.id, employeeAgenda, managerAgenda)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Agenda'}
                </Button>
              )}
            </div>
          </div>

          {/* Notes & Action Items (for completing) */}
          {canComplete && (
            <div className="space-y-4 pt-4 border-t border-charcoal-200">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meeting Notes
              </h3>
              <Textarea
                placeholder="Summary of the discussion..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />

              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Action Items
              </h3>
              <div className="space-y-2">
                {actionItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Action item..."
                      value={item}
                      onChange={(e) => handleUpdateActionItem(index, e.target.value)}
                    />
                    {actionItems.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveActionItem(index)}
                      >
                        <XCircle className="h-4 w-4 text-charcoal-400" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddActionItem}
                  className="gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Action Item
                </Button>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                onClick={() => onComplete(meeting.id, notes, actionItems.filter(Boolean))}
                disabled={isCompleting}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleting ? 'Completing...' : 'Complete Meeting'}
              </Button>
            </div>
          )}

          {/* Completed Meeting View */}
          {isCompleted && (
            <div className="space-y-4 pt-4 border-t border-charcoal-200">
              {meeting.shared_notes && (
                <div>
                  <h3 className="font-medium text-charcoal-900 flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4" />
                    Meeting Notes
                  </h3>
                  <div className="p-3 bg-charcoal-50 rounded-lg text-sm text-charcoal-700 whitespace-pre-wrap">
                    {meeting.shared_notes}
                  </div>
                </div>
              )}

              {meeting.action_items && meeting.action_items.length > 0 && (
                <div>
                  <h3 className="font-medium text-charcoal-900 flex items-center gap-2 mb-2">
                    <ListTodo className="h-4 w-4" />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {meeting.action_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-charcoal-50 rounded"
                      >
                        <Checkbox checked={item.completed} disabled />
                        <span className={cn(
                          'text-sm',
                          item.completed && 'line-through text-charcoal-400'
                        )}>
                          {item.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {meeting.completed_at && (
                <div className="flex items-center gap-2 text-sm text-charcoal-500 pt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed {format(new Date(meeting.completed_at), 'MMM d, yyyy')} at{' '}
                  {format(new Date(meeting.completed_at), 'h:mm a')}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
