'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  User,
  Building2,
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import { format, formatDistanceToNow, isBefore, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ActivityDetailPanel } from '@/components/activities/ActivityDetailPanel'

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  company: Building2,
  account: Building2,
  candidate: User,
  job: Briefcase,
}

/**
 * Escalated Activities Page
 * Shows all escalated activities across the organization
 */
export default function EscalatedActivitiesPage() {
  const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null)

  const { data, isLoading, error } = trpc.activities.getEscalated.useQuery({
    minLevel: 1,
    limit: 50,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">Failed to load escalated activities</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const today = startOfDay(new Date())
  const escalatedActivities = data?.items ?? []

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex gap-6 p-6">
        {/* Main content */}
        <div className={cn("flex-1", selectedActivityId && "w-3/5")}>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowUpRight className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Escalated Activities</h1>
                <p className="text-charcoal-600">
                  {escalatedActivities.length} activities requiring attention
                </p>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard
              label="Level 1"
              count={escalatedActivities.filter(a => a.escalationCount === 1).length}
              color="amber"
            />
            <SummaryCard
              label="Level 2"
              count={escalatedActivities.filter(a => a.escalationCount === 2).length}
              color="orange"
            />
            <SummaryCard
              label="Level 3+"
              count={escalatedActivities.filter(a => a.escalationCount >= 3).length}
              color="red"
            />
            <SummaryCard
              label="Overdue"
              count={escalatedActivities.filter(a => a.dueDate && isBefore(new Date(a.dueDate), today)).length}
              color="red"
            />
          </div>

          {/* Activities table */}
          <Card>
            <CardContent className="p-0">
              {escalatedActivities.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-success-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                    No Escalated Activities
                  </h3>
                  <p className="text-charcoal-500">
                    All activities are on track. Great job!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Level</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escalatedActivities.map((activity) => {
                      const dueDate = activity.dueDate ? new Date(activity.dueDate) : null
                      const isOverdue = dueDate && isBefore(dueDate, today)
                      const EntityIcon = ENTITY_ICONS[activity.entityType] || AlertTriangle

                      return (
                        <TableRow
                          key={activity.id}
                          className={cn(
                            'cursor-pointer',
                            selectedActivityId === activity.id && 'bg-primary-50',
                            isOverdue && 'bg-red-50'
                          )}
                          onClick={() => setSelectedActivityId(activity.id)}
                        >
                          <TableCell>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                              activity.escalationCount >= 3 
                                ? "bg-red-100 text-red-700"
                                : activity.escalationCount === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-amber-100 text-amber-700"
                            )}>
                              {activity.escalationCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{activity.subject || 'Activity'}</p>
                              <p className="text-xs text-charcoal-500 capitalize">
                                {activity.activityType}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <EntityIcon className="h-4 w-4 text-charcoal-400" />
                              <span className="text-sm capitalize">{activity.entityType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {dueDate ? (
                              <div className={cn(
                                "text-sm",
                                isOverdue && "text-red-600 font-medium"
                              )}>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(dueDate, 'MMM d')}
                                </div>
                                <p className="text-xs text-charcoal-400">
                                  {formatDistanceToNow(dueDate, { addSuffix: true })}
                                </p>
                              </div>
                            ) : (
                              <span className="text-charcoal-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('capitalize', PRIORITY_STYLES[activity.priority])}>
                              {activity.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Handle both array and object formats
                              const assignedUser = Array.isArray(activity.assignedTo) 
                                ? activity.assignedTo[0] 
                                : activity.assignedTo
                              
                              return assignedUser ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignedUser.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                      {assignedUser.full_name?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{assignedUser.full_name}</span>
                                </div>
                              ) : (
                                <span className="text-charcoal-400 text-sm">Unassigned</span>
                              )
                            })()}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/employee/${activity.entityType}s/${activity.entityId}`}
                              className="inline-flex"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        {selectedActivityId && (
          <div className="w-2/5 flex-shrink-0">
            <ActivityDetailPanel
              activityId={selectedActivityId}
              onClose={() => setSelectedActivityId(null)}
              onComplete={() => setSelectedActivityId(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  count: number
  color: 'amber' | 'orange' | 'red'
}

function SummaryCard({ label, count, color }: SummaryCardProps) {
  const colorStyles = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  }

  return (
    <Card className={cn('border', colorStyles[color])}>
      <CardContent className="p-4">
        <p className="text-3xl font-bold">{count}</p>
        <p className="text-sm">{label}</p>
      </CardContent>
    </Card>
  )
}

