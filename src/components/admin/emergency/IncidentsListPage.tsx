'use client'

import { useState } from 'react'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Siren,
  Eye,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { CreateIncidentDialog } from './CreateIncidentDialog'

const SEVERITY_CONFIG = {
  P0: { label: 'P0 - Critical', color: 'bg-red-100 text-red-800 border-red-300' },
  P1: { label: 'P1 - High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  P2: { label: 'P2 - Medium', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  P3: { label: 'P3 - Low', color: 'bg-blue-100 text-blue-800 border-blue-300' },
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  investigating: { label: 'Investigating', color: 'bg-orange-100 text-orange-800' },
  identified: { label: 'Identified', color: 'bg-amber-100 text-amber-800' },
  monitoring: { label: 'Monitoring', color: 'bg-blue-100 text-blue-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
}

export function IncidentsListPage() {
  const [showCreateIncident, setShowCreateIncident] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('__all__')
  const [page, setPage] = useState(1)

  const utils = trpc.useUtils()

  const incidentsQuery = trpc.emergency.listIncidents.useQuery({
    status: statusFilter as 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'all',
    severity: severityFilter && severityFilter !== '__all__' ? severityFilter as 'P0' | 'P1' | 'P2' | 'P3' : undefined,
    page,
    pageSize: 20,
  })

  const handleRefresh = () => {
    utils.emergency.listIncidents.invalidate()
  }

  const incidents = incidentsQuery.data?.items ?? []
  const pagination = incidentsQuery.data?.pagination

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Emergency', href: '/employee/admin/emergency' },
    { label: 'Incidents' },
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
              disabled={incidentsQuery.isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${incidentsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateIncident(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Incident
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Severities</SelectItem>
                  <SelectItem value="P0">P0 - Critical</SelectItem>
                  <SelectItem value="P1">P1 - High</SelectItem>
                  <SelectItem value="P2">P2 - Medium</SelectItem>
                  <SelectItem value="P3">P3 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((incident) => {
            const severityConfig = SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG]
            const statusConfig = STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG]

            return (
              <Card key={incident.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${severityConfig.color}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-charcoal-500">
                            {incident.incident_number}
                          </span>
                          <h3 className="font-medium">{incident.title}</h3>
                          <Badge variant="outline" className={severityConfig.color}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {incident.description && (
                          <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">
                            {incident.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Started: {format(new Date(incident.started_at), 'MMM d, yyyy HH:mm')}
                          </span>
                          {incident.resolved_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              Resolved: {format(new Date(incident.resolved_at), 'MMM d, HH:mm')}
                            </span>
                          )}
                          {!incident.resolved_at && (
                            <span className="flex items-center gap-1 text-amber-600">
                              Duration: {formatDistanceToNow(new Date(incident.started_at))}
                            </span>
                          )}
                          {incident.commander && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Commander: {incident.commander.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/employee/admin/emergency/incidents/${incident.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
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
              <Siren className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No incidents found</p>
              <p className="text-sm mt-1">All systems operational</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCreateIncident(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Incident
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Incident Dialog */}
      <CreateIncidentDialog
        open={showCreateIncident}
        onOpenChange={setShowCreateIncident}
        onSuccess={() => {
          setShowCreateIncident(false)
          utils.emergency.listIncidents.invalidate()
        }}
      />
    </AdminPageContent>
  )
}
