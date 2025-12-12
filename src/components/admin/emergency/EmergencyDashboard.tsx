'use client'

import { useState } from 'react'
import { DashboardSection, DashboardGrid } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  RefreshCw,
  Siren,
  ShieldAlert,
  Calendar,
  ArrowRight,
  Activity,
  Key,
  User,
  Bell,
  Keyboard,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { CreateIncidentDialog } from './CreateIncidentDialog'
import { useEmergencyShortcuts, EmergencyShortcutsHelp } from '@/hooks/useEmergencyShortcuts'

const SEVERITY_COLORS = {
  P0: 'bg-red-100 text-red-800 border-red-300',
  P1: 'bg-orange-100 text-orange-800 border-orange-300',
  P2: 'bg-amber-100 text-amber-800 border-amber-300',
  P3: 'bg-blue-100 text-blue-800 border-blue-300',
}

const SEVERITY_DOT_COLORS = {
  P0: 'bg-red-500',
  P1: 'bg-orange-500',
  P2: 'bg-amber-500',
  P3: 'bg-blue-500',
}

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-orange-100 text-orange-800',
  identified: 'bg-amber-100 text-amber-800',
  monitoring: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const EVENT_ICONS = {
  detection: AlertTriangle,
  notification: Bell,
  escalation: ArrowRight,
  action: Activity,
  update: RefreshCw,
  resolution: ShieldAlert,
}

export function EmergencyDashboard() {
  const [showCreateIncident, setShowCreateIncident] = useState(false)
  const utils = trpc.useUtils()

  // Keyboard shortcuts
  useEmergencyShortcuts({
    onCreateIncident: () => setShowCreateIncident(true),
    enabled: true,
  })

  // Auto-refresh every 30 seconds
  const dashboardQuery = trpc.emergency.getDashboard.useQuery(undefined, {
    refetchInterval: 30000,
  })

  const handleRefresh = () => {
    utils.emergency.getDashboard.invalidate()
  }

  const handleIncidentCreated = () => {
    setShowCreateIncident(false)
    utils.emergency.getDashboard.invalidate()
  }

  const data = dashboardQuery.data

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Emergency' },
  ]

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Keyboard className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <EmergencyShortcutsHelp />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={dashboardQuery.isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateIncident(true)}
            >
              <Siren className="w-4 h-4 mr-2" />
              Create Incident
            </Button>
          </div>
        }
      />
      {/* Stats Overview */}
      <DashboardSection title="Overview">
        <DashboardGrid>
          <StatsCard
            title="Active Incidents"
            value={data?.stats.activeIncidents ?? 0}
            icon={AlertTriangle}
            variant={data?.stats.activeIncidents && data.stats.activeIncidents > 0 ? 'warning' : 'default'}
          />
          <StatsCard
            title="Critical (24h)"
            value={data?.stats.criticalLast24h ?? 0}
            icon={Siren}
            variant={data?.stats.criticalLast24h && data.stats.criticalLast24h > 0 ? 'error' : 'default'}
          />
          <StatsCard
            title="Resolved"
            value={data?.stats.resolvedIncidents ?? 0}
            icon={ShieldAlert}
            variant="success"
          />
          <StatsCard
            title="Upcoming Drills"
            value={data?.stats.upcomingDrills ?? 0}
            icon={Calendar}
          />
        </DashboardGrid>
      </DashboardSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Active Incidents */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-heading">Active Incidents</CardTitle>
              <CardDescription>Ongoing incidents requiring attention</CardDescription>
            </div>
            <Link href="/employee/admin/emergency/incidents">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.activeIncidents && data.activeIncidents.length > 0 ? (
              <div className="space-y-3">
                {data.activeIncidents.map((incident) => (
                  <Link
                    key={incident.id}
                    href={`/employee/admin/emergency/incidents/${incident.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-charcoal-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT_COLORS[incident.severity as keyof typeof SEVERITY_DOT_COLORS]}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{incident.incident_number}</span>
                            <Badge variant="outline" className={SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS]}>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline" className={STATUS_COLORS[incident.status as keyof typeof STATUS_COLORS]}>
                              {incident.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-charcoal-600 mt-0.5">{incident.title}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-charcoal-500">
                        <p>{formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}</p>
                        {incident.commander?.[0] && (
                          <p className="flex items-center justify-end gap-1 mt-1">
                            <User className="w-3 h-3" />
                            {incident.commander[0].full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-charcoal-500">
                <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No active incidents</p>
                <p className="text-sm mt-1">All systems operational</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentTimeline && data.recentTimeline.length > 0 ? (
                <div className="space-y-3">
                  {data.recentTimeline.slice(0, 8).map((event) => {
                    const Icon = EVENT_ICONS[event.event_type as keyof typeof EVENT_ICONS] || Activity
                    return (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-charcoal-100">
                          <Icon className="w-3 h-3 text-charcoal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-700 truncate">{event.description}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-500">
                            <span>{(event.incident as { incident_number: string; }[] | null)?.[0]?.incident_number}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-charcoal-500 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Drills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-heading">Upcoming Drills</CardTitle>
              <Link href="/employee/admin/emergency/drills">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data?.upcomingDrills && data.upcomingDrills.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingDrills.map((drill) => (
                    <div key={drill.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{drill.title}</p>
                        <p className="text-xs text-charcoal-500 capitalize">{drill.drill_type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-charcoal-600">
                          {format(new Date(drill.scheduled_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal-500 text-center py-4">No upcoming drills scheduled</p>
              )}
            </CardContent>
          </Card>

          {/* Break-Glass Access */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-heading">Break-Glass Access</CardTitle>
              <Link href="/employee/admin/emergency/break-glass">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data?.recentBreakGlass && data.recentBreakGlass.length > 0 ? (
                <div className="space-y-2">
                  {data.recentBreakGlass.slice(0, 3).map((access) => (
                    <div key={access.id} className="flex items-center justify-between p-2 rounded-lg border border-red-200 bg-red-50">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-900">{access.accessed_by}</p>
                          <p className="text-xs text-red-700 truncate max-w-[150px]">{access.reason}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-red-600">
                        {formatDistanceToNow(new Date(access.accessed_at), { addSuffix: true })}
                        {!access.ended_at && <Badge className="ml-2 bg-red-600">Active</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Key className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
                  <p className="text-sm text-charcoal-500">No recent break-glass access</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Incident Dialog */}
      <CreateIncidentDialog
        open={showCreateIncident}
        onOpenChange={setShowCreateIncident}
        onSuccess={handleIncidentCreated}
      />
    </AdminPageContent>
  )
}
