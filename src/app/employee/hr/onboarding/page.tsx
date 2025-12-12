'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

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

interface DashboardTask {
  id: string
  taskName: string
  category: string
  isRequired: boolean
  dueDate: string | null
  daysOverdue: number
  onboardingId: string
  employeeName: string | null
  employeeAvatar: string | null
}

export default function OnboardingDashboardPage() {
  const router = useRouter()
  const [showAllOverdue, setShowAllOverdue] = useState(false)

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.hr.onboarding.dashboard.getStats.useQuery()

  // Fetch pending tasks
  const { data: pendingTasks, isLoading: pendingLoading } =
    trpc.hr.onboarding.dashboard.getPending.useQuery({ dueSoon: true, limit: 10 })

  // Fetch overdue tasks
  const { data: overdueTasks, isLoading: overdueLoading } =
    trpc.hr.onboarding.dashboard.getOverdue.useQuery()

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } =
    trpc.hr.onboarding.templates.list.useQuery({})

  const displayedOverdue = showAllOverdue ? overdueTasks : overdueTasks?.slice(0, 5)

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Employee Onboarding
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Manage employee onboarding checklists and tasks
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/employee/hr/onboarding/templates')}>
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button onClick={() => router.push('/employee/hr/employees?status=onboarding')}>
            <Plus className="h-4 w-4 mr-2" />
            Start Onboarding
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">
                  Active Onboardings
                </p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {stats?.active ?? 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">
                  Pending Tasks
                </p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {stats?.pendingTasks ?? 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">
                  Overdue Tasks
                </p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p
                    className={cn(
                      'text-h3 font-heading font-semibold mt-2',
                      (stats?.overdueTasks ?? 0) > 0 ? 'text-red-600' : 'text-charcoal-900'
                    )}
                  >
                    {stats?.overdueTasks ?? 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Completed</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {stats?.completed ?? 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Overdue Tasks
            </CardTitle>
            {(overdueTasks?.length ?? 0) > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllOverdue(!showAllOverdue)}
              >
                {showAllOverdue ? 'Show Less' : `View All (${overdueTasks?.length})`}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {overdueLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : displayedOverdue?.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-body text-charcoal-600">No overdue tasks</p>
                <p className="text-body-sm text-charcoal-500">All tasks are on track!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(displayedOverdue as DashboardTask[] | undefined)?.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/employee/hr/onboarding/${task.onboardingId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={task.employeeAvatar ?? undefined} />
                        <AvatarFallback className="bg-charcoal-200 text-charcoal-700 text-xs">
                          {task.employeeName?.charAt(0) ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-body-sm font-medium text-charcoal-900">
                          {task.taskName}
                        </p>
                        <p className="text-caption text-charcoal-500">
                          {task.employeeName ?? 'Unknown Employee'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other}>
                        {CATEGORY_LABELS[task.category] ?? 'Other'}
                      </Badge>
                      <Badge variant="destructive">
                        {task.daysOverdue} day{task.daysOverdue !== 1 ? 's' : ''} overdue
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-charcoal-600" />
              Templates
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/employee/hr/onboarding/templates')}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : templates?.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-10 w-10 text-charcoal-300 mx-auto mb-2" />
                <p className="text-body-sm text-charcoal-500">No templates yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => router.push('/employee/hr/onboarding/templates')}
                >
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {templates?.slice(0, 5).map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/employee/hr/onboarding/templates?id=${template.id}`)
                    }
                  >
                    <div>
                      <p className="text-body-sm font-medium text-charcoal-900 flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </p>
                      <p className="text-caption text-charcoal-500">
                        {template.taskCount} task{template.taskCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-charcoal-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Upcoming Tasks (Due Within 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingTasks?.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-body text-charcoal-600">No upcoming tasks</p>
              <p className="text-body-sm text-charcoal-500">All tasks are scheduled for later</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(pendingTasks as DashboardTask[] | undefined)?.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-white border border-charcoal-100 rounded-lg hover:border-charcoal-200 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => router.push(`/employee/hr/onboarding/${task.onboardingId}`)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={task.employeeAvatar ?? undefined} />
                      <AvatarFallback className="bg-charcoal-200 text-charcoal-700">
                        {task.employeeName?.charAt(0) ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-body font-medium text-charcoal-900">{task.taskName}</p>
                      <p className="text-body-sm text-charcoal-500">
                        {task.employeeName ?? 'Unknown Employee'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.other}>
                      {CATEGORY_LABELS[task.category] ?? 'Other'}
                    </Badge>
                    {task.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {task.dueDate && (
                      <span className="text-body-sm text-charcoal-500">
                        Due {new Date(task.dueDate as string).toLocaleDateString()}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-charcoal-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
