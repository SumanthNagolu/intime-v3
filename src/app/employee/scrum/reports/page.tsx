'use client'

import { useState } from 'react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { useTeamSpace } from '@/components/team-space'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ReportPeriod = 'week' | 'sprint' | 'month' | 'quarter'

export default function ReportsPage() {
  const { sprints, activeSprint } = useTeamSpace()
  const [period, setPeriod] = useState<ReportPeriod>('sprint')
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(
    activeSprint?.id || sprints[0]?.id || null
  )

  // Get selected sprint
  const selectedSprint = sprints.find((s) => s.id === selectedSprintId)

  // Mock data for demonstration
  const reportData = {
    itemsByType: [
      { type: 'Story', count: 12, points: 45, color: 'bg-blue-500' },
      { type: 'Bug', count: 8, points: 15, color: 'bg-red-500' },
      { type: 'Task', count: 15, points: 22, color: 'bg-charcoal-500' },
      { type: 'Spike', count: 2, points: 6, color: 'bg-amber-500' },
    ],
    itemsByStatus: [
      { status: 'Done', count: 20, color: 'bg-green-500' },
      { status: 'In Progress', count: 8, color: 'bg-blue-500' },
      { status: 'To Do', count: 5, color: 'bg-charcoal-400' },
      { status: 'Blocked', count: 2, color: 'bg-red-500' },
    ],
    teamPerformance: [
      { name: 'John D.', completed: 8, points: 21, avatar: 'JD' },
      { name: 'Sarah M.', completed: 6, points: 18, avatar: 'SM' },
      { name: 'Mike R.', completed: 5, points: 15, avatar: 'MR' },
      { name: 'Emily L.', completed: 4, points: 12, avatar: 'EL' },
    ],
  }

  const totalItems = reportData.itemsByType.reduce((sum, t) => sum + t.count, 0)
  const totalPoints = reportData.itemsByType.reduce((sum, t) => sum + t.points, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900">Reports</h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Detailed analytics and team performance reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="sprint">This Sprint</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          {period === 'sprint' && (
            <Select
              value={selectedSprintId || ''}
              onValueChange={setSelectedSprintId}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button variant="outline">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Total Items
                </p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{totalItems}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-charcoal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Total Points
                </p>
                <p className="text-3xl font-bold text-charcoal-900 mt-1">{totalPoints}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-gold-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {reportData.itemsByStatus.find((s) => s.status === 'Done')?.count || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-elevation-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Blocked
                </p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {reportData.itemsByStatus.find((s) => s.status === 'Blocked')?.count || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Items by Type */}
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-charcoal-600" />
              Items by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.itemsByType.map((item) => {
                const percentage = Math.round((item.count / totalItems) * 100)
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded', item.color)} />
                        <span className="text-sm font-medium text-charcoal-700">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-charcoal-500">{item.count} items</span>
                        <span className="text-charcoal-500">{item.points} pts</span>
                        <span className="font-medium text-charcoal-700">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', item.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Items by Status */}
        <Card className="bg-white shadow-elevation-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-charcoal-600" />
              Items by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.itemsByStatus.map((item) => {
                const percentage = Math.round((item.count / totalItems) * 100)
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded', item.color)} />
                        <span className="text-sm font-medium text-charcoal-700">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-charcoal-500">{item.count} items</span>
                        <span className="font-medium text-charcoal-700">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', item.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="bg-white shadow-elevation-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-charcoal-600" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Items Completed
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Points Delivered
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Contribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.teamPerformance.map((member) => {
                  const totalTeamPoints = reportData.teamPerformance.reduce((sum, m) => sum + m.points, 0)
                  const contribution = Math.round((member.points / totalTeamPoints) * 100)

                  return (
                    <tr key={member.name} className="border-b border-charcoal-100 last:border-b-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center text-xs font-medium text-charcoal-600">
                            {member.avatar}
                          </div>
                          <span className="font-medium text-charcoal-800">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-charcoal-900">{member.completed}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-semibold text-charcoal-900">{member.points}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-charcoal-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${contribution}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-charcoal-600 w-10">
                            {contribution}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
