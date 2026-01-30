'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('my-requests')

  const { data: stats, isLoading: statsLoading } = trpc.leave.stats.useQuery()
  const { data: myBalances, isLoading: balancesLoading } = trpc.leave.balances.getMyBalances.useQuery({})
  const { data: myRequests, isLoading: requestsLoading } = trpc.leave.requests.getMyRequests.useQuery({})
  const { data: policies } = trpc.leave.policies.list.useQuery({})

  const isLoading = statsLoading || balancesLoading || requestsLoading

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">Leave Management</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Request and manage time off
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Time Off
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.pendingApprovals ?? 0}
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
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Upcoming Time Off</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.upcomingTimeOff ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Policies</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {statsLoading ? '—' : stats?.activePolicies ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Team Members</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  —
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="my-balances">My Balances</TabsTrigger>
          <TabsTrigger value="team-calendar">Team Calendar</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">My Time Off Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : !myRequests?.length ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-charcoal-400" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                    No Time Off Requests
                  </h3>
                  <p className="text-body text-charcoal-500 text-center max-w-md mb-6">
                    Submit a time off request to get started.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Time Off
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                    return (
                      <Link
                        key={request.id}
                        href={`/employee/operations/leave/${request.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:bg-charcoal-50 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-charcoal-900 capitalize">
                            {request.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-charcoal-500">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-charcoal-600">{request.hours} hours</span>
                          <Badge className={cn('flex items-center gap-1', statusConfig?.color)}>
                            {statusConfig?.label}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-balances" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">My Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {balancesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : !myBalances?.length ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-charcoal-500">No leave balances found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myBalances.map((balance) => {
                    const policy = balance.policy as { name: string; leave_type: string }
                    return (
                      <Card key={balance.id} className="bg-charcoal-50">
                        <CardContent className="p-4">
                          <p className="font-medium text-charcoal-900">{policy?.name}</p>
                          <p className="text-xs text-charcoal-500 capitalize mt-1">
                            {policy?.leave_type?.replace(/_/g, ' ')}
                          </p>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-charcoal-600">Available</span>
                              <span className="font-semibold text-green-600">{balance.available_days} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-charcoal-600">Used</span>
                              <span className="text-charcoal-900">{balance.used_days} days</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-charcoal-600">Pending</span>
                              <span className="text-amber-600">{balance.pending_days} days</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-calendar" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold">Team Calendar</CardTitle>
                <Link href="/employee/operations/leave/calendar">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full Calendar
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-charcoal-400" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                  View Team Calendar
                </h3>
                <p className="text-charcoal-500 text-center max-w-md mb-6">
                  See your team's time off schedule in a full calendar view with filtering options.
                </p>
                <Link href="/employee/operations/leave/calendar">
                  <Button>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Open Calendar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">Leave Policies</CardTitle>
            </CardHeader>
            <CardContent>
              {!policies?.length ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-charcoal-500">No policies configured.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100"
                    >
                      <div>
                        <p className="font-medium text-charcoal-900">{policy.name}</p>
                        <p className="text-sm text-charcoal-500 capitalize">
                          {policy.leave_type?.replace(/_/g, ' ')} • {policy.accrual_type?.replace(/_/g, ' ')} accrual
                        </p>
                      </div>
                      <Badge className={policy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
