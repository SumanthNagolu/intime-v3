'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Target,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  MessageSquare,
  ChevronRight,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const CYCLE_STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  self_review: { label: 'Self Review', color: 'bg-blue-100 text-blue-700' },
  manager_review: { label: 'Manager Review', color: 'bg-purple-100 text-purple-700' },
  calibration: { label: 'Calibration', color: 'bg-amber-100 text-amber-700' },
  acknowledged: { label: 'Acknowledged', color: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export default function PerformancePage() {
  const { data: dashboard, isLoading } = trpc.performance.dashboard.useQuery()
  const { data: cycles } = trpc.performance.cycles.list.useQuery({ page: 1, pageSize: 5 })
  const { data: goals } = trpc.performance.goals.list.useQuery({ status: 'in_progress' })
  const { data: meetings } = trpc.performance.oneOnOnes.getUpcoming.useQuery()

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">Performance Management</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Reviews, goals, and continuous feedback
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            New Goal
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Review Cycle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Reviews</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.pendingReviews ?? 0}
                </p>
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Goals</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.activeGoals ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Upcoming 1:1s</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.upcomingMeetings ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Cycle</p>
                <p className="text-h4 font-heading font-semibold text-charcoal-900 mt-2 truncate">
                  {isLoading ? '—' : dashboard?.activeCycle?.name ?? 'None'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Cycles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Review Cycles</CardTitle>
            <Link href="/employee/operations/performance/cycles">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!cycles?.items.length ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-charcoal-400" />
                </div>
                <p className="text-charcoal-500 text-sm">No review cycles yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.items.slice(0, 3).map((cycle) => {
                  const statusConfig = CYCLE_STATUS_CONFIG[cycle.status as keyof typeof CYCLE_STATUS_CONFIG]
                  return (
                    <Link
                      key={cycle.id}
                      href={`/employee/operations/performance/cycles/${cycle.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-charcoal-900">{cycle.name}</p>
                        <p className="text-xs text-charcoal-500">
                          {new Date(cycle.review_period_start).toLocaleDateString()} - {new Date(cycle.review_period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
                        <ChevronRight className="h-4 w-4 text-charcoal-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Active Goals</CardTitle>
            <Link href="/employee/operations/goals">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!goals?.length ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-charcoal-400" />
                </div>
                <p className="text-charcoal-500 text-sm">No active goals.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-charcoal-900 text-sm truncate flex-1">{goal.goal}</p>
                      <span className="text-xs text-charcoal-500 ml-2">{goal.progress_percent ?? 0}%</span>
                    </div>
                    <Progress value={goal.progress_percent ?? 0} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming 1:1 Meetings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Upcoming 1:1 Meetings</CardTitle>
            <Link href="/employee/operations/performance/1-on-1s">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!meetings?.length ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-charcoal-400" />
                </div>
                <p className="text-charcoal-500 text-sm">No upcoming meetings.</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="h-3 w-3 mr-1" />
                  Schedule 1:1
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 3).map((meeting) => {
                  const employee = meeting.employee as { user: { full_name: string } }
                  const manager = meeting.manager as { user: { full_name: string } }
                  return (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900 text-sm">
                            {employee?.user?.full_name} & {manager?.user?.full_name}
                          </p>
                          <p className="text-xs text-charcoal-500">
                            {new Date(meeting.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{meeting.duration_minutes}min</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/employee/operations/performance/cycles/new">
                <Button variant="outline" className="w-full h-auto py-4 flex-col">
                  <Calendar className="h-5 w-5 mb-2" />
                  <span className="text-sm">New Review Cycle</span>
                </Button>
              </Link>
              <Link href="/employee/operations/goals">
                <Button variant="outline" className="w-full h-auto py-4 flex-col">
                  <Target className="h-5 w-5 mb-2" />
                  <span className="text-sm">Create Goal</span>
                </Button>
              </Link>
              <Link href="/employee/operations/performance/1-on-1s">
                <Button variant="outline" className="w-full h-auto py-4 flex-col">
                  <MessageSquare className="h-5 w-5 mb-2" />
                  <span className="text-sm">Schedule 1:1</span>
                </Button>
              </Link>
              <Link href="/employee/operations/performance/calibration">
                <Button variant="outline" className="w-full h-auto py-4 flex-col">
                  <Users className="h-5 w-5 mb-2" />
                  <span className="text-sm">Calibration</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
