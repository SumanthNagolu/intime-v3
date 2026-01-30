'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserMinus,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export default function OffboardingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data: stats, isLoading: statsLoading } = trpc.offboarding.stats.useQuery()

  const { data: offboardings, isLoading: listLoading } = trpc.offboarding.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter as 'not_started' | 'in_progress' | 'completed' | 'blocked' : undefined,
    page: 1,
    pageSize: 20,
  })

  const isLoading = statsLoading || listLoading

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">Offboarding</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Manage employee offboarding processes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Offboarding
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Total</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.total ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <UserMinus className="h-6 w-6 text-charcoal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Not Started</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.notStarted ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">In Progress</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.inProgress ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Completed</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.completed ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading font-semibold">Offboarding Processes</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
            </div>
          ) : !offboardings?.items.length ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 rounded-full bg-charcoal-100 flex items-center justify-center mb-8">
                <UserMinus className="h-10 w-10 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                No Offboarding Processes
              </h3>
              <p className="text-body text-charcoal-500 text-center max-w-md mb-6">
                Start an offboarding process when an employee is leaving.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Start Offboarding
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {offboardings.items.map((offboarding) => {
                const employee = offboarding.employee as {
                  id: string
                  job_title: string
                  department: string
                  user: { full_name: string; avatar_url?: string | null }
                }
                const statusConfig = STATUS_CONFIG[offboarding.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig?.icon || Clock

                return (
                  <Link
                    key={offboarding.id}
                    href={`/employee/operations/offboarding/${offboarding.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:border-charcoal-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee?.user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-charcoal-100">
                          {getInitials(employee?.user?.full_name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-charcoal-900">
                          {employee?.user?.full_name || 'Unknown Employee'}
                        </p>
                        <p className="text-sm text-charcoal-500">
                          {employee?.job_title} • {employee?.department || 'No Department'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-sm text-charcoal-600">
                          <Calendar className="h-4 w-4" />
                          <span>Last day: {new Date(offboarding.last_working_day).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-charcoal-400 mt-1">
                          {offboarding.termination_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <Badge className={cn('flex items-center gap-1', statusConfig?.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig?.label}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-charcoal-400" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
