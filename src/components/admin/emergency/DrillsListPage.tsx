'use client'

import { useState } from 'react'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import {
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Shield,
  Database,
  Users,
} from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { toast } from 'sonner'
import { CreateDrillDialog } from './CreateDrillDialog'

const DRILL_TYPE_CONFIG = {
  tabletop: { label: 'Tabletop Exercise', icon: Users, color: 'bg-blue-100 text-blue-800' },
  simulated_outage: { label: 'Simulated Outage', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' },
  security_breach: { label: 'Security Breach', icon: Shield, color: 'bg-red-100 text-red-800' },
  backup_restore: { label: 'Backup Restore', icon: Database, color: 'bg-purple-100 text-purple-800' },
}

const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-charcoal-100 text-charcoal-600' },
}

export function DrillsListPage() {
  const [showCreateDrill, setShowCreateDrill] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const utils = trpc.useUtils()

  const drillsQuery = trpc.emergency.listDrills.useQuery({
    status: statusFilter === 'all' ? 'all' : statusFilter as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    drillType: typeFilter ? typeFilter as 'tabletop' | 'simulated_outage' | 'security_breach' | 'backup_restore' : undefined,
    page,
    pageSize: 20,
  })

  const updateDrillMutation = trpc.emergency.updateDrill.useMutation({
    onSuccess: () => {
      toast.success('Drill updated')
      utils.emergency.listDrills.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to update drill: ${error.message}`)
    },
  })

  const deleteDrillMutation = trpc.emergency.deleteDrill.useMutation({
    onSuccess: () => {
      toast.success('Drill deleted')
      utils.emergency.listDrills.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to delete drill: ${error.message}`)
    },
  })

  const handleStartDrill = (id: string) => {
    updateDrillMutation.mutate({
      id,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    })
  }

  const handleCompleteDrill = (id: string) => {
    updateDrillMutation.mutate({
      id,
      status: 'completed',
      completedAt: new Date().toISOString(),
    })
  }

  const handleCancelDrill = (id: string) => {
    updateDrillMutation.mutate({
      id,
      status: 'cancelled',
    })
  }

  const handleRefresh = () => {
    utils.emergency.listDrills.invalidate()
  }

  const drills = drillsQuery.data?.items ?? []
  const pagination = drillsQuery.data?.pagination

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Emergency', href: '/employee/admin/emergency' },
    { label: 'Drills' },
  ]

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={drillsQuery.isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${drillsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateDrill(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Drill
            </Button>
          </div>
        }
      />
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="tabletop">Tabletop Exercise</SelectItem>
                  <SelectItem value="simulated_outage">Simulated Outage</SelectItem>
                  <SelectItem value="security_breach">Security Breach</SelectItem>
                  <SelectItem value="backup_restore">Backup Restore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drills List */}
      {drills.length > 0 ? (
        <div className="space-y-4">
          {drills.map((drill) => {
            const typeConfig = DRILL_TYPE_CONFIG[drill.drill_type as keyof typeof DRILL_TYPE_CONFIG]
            const statusConfig = STATUS_CONFIG[drill.status as keyof typeof STATUS_CONFIG]
            const TypeIcon = typeConfig.icon
            const isOverdue = drill.status === 'scheduled' && isPast(new Date(drill.scheduled_at))

            return (
              <Card key={drill.id} className={isOverdue ? 'border-amber-300' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{drill.title}</h3>
                          <Badge variant="outline" className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-amber-500">Overdue</Badge>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">{drill.scenario}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Scheduled: {format(new Date(drill.scheduled_at), 'MMM d, yyyy HH:mm')}
                          </span>
                          {drill.started_at && (
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Started: {format(new Date(drill.started_at), 'MMM d, HH:mm')}
                            </span>
                          )}
                          {drill.completed_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed: {format(new Date(drill.completed_at), 'MMM d, HH:mm')}
                            </span>
                          )}
                          {drill.creator?.[0] && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {drill.creator[0].full_name}
                            </span>
                          )}
                        </div>
                        {drill.findings && (
                          <div className="mt-2 p-2 bg-charcoal-50 rounded text-sm">
                            <strong className="text-xs">Findings:</strong>
                            <p className="text-charcoal-600">{drill.findings}</p>
                          </div>
                        )}
                        {drill.action_items && Array.isArray(drill.action_items) && drill.action_items.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-charcoal-600">
                              Action Items: {drill.action_items.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {drill.status === 'scheduled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartDrill(drill.id)}
                            disabled={updateDrillMutation.isPending}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelDrill(drill.id)}
                            disabled={updateDrillMutation.isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {drill.status === 'in_progress' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCompleteDrill(drill.id)}
                          disabled={updateDrillMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-charcoal-500">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-charcoal-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No drills found</p>
              <p className="text-sm mt-1">Schedule your first emergency drill</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateDrill(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Drill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Drill Dialog */}
      <CreateDrillDialog
        open={showCreateDrill}
        onOpenChange={setShowCreateDrill}
        onSuccess={() => {
          setShowCreateDrill(false)
          utils.emergency.listDrills.invalidate()
        }}
      />
    </AdminPageContent>
  )
}
