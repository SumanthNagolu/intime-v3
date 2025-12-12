'use client'

import { useState } from 'react'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  RefreshCw,
  User,
  Clock,
  Activity,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import { SendNotificationDialog } from './SendNotificationDialog'

const SEVERITY_COLORS = {
  P0: 'bg-red-100 text-red-800 border-red-300',
  P1: 'bg-orange-100 text-orange-800 border-orange-300',
  P2: 'bg-amber-100 text-amber-800 border-amber-300',
  P3: 'bg-blue-100 text-blue-800 border-blue-300',
}

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-orange-100 text-orange-800',
  identified: 'bg-amber-100 text-amber-800',
  monitoring: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'identified', label: 'Identified' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Resolved' },
]

const EVENT_ICONS = {
  detection: AlertTriangle,
  notification: Bell,
  escalation: Activity,
  action: Activity,
  update: RefreshCw,
  resolution: CheckCircle,
}

interface IncidentDetailPageProps {
  incidentId: string
}

export function IncidentDetailPage({ incidentId }: IncidentDetailPageProps) {
  const [showSendNotification, setShowSendNotification] = useState(false)
  const [timelineDescription, setTimelineDescription] = useState('')
  const [timelineEventType, setTimelineEventType] = useState<'action' | 'update' | 'escalation'>('action')

  const utils = trpc.useUtils()

  const incidentQuery = trpc.emergency.getIncident.useQuery({ id: incidentId })
  const usersQuery = trpc.emergency.getAdminUsers.useQuery()

  const updateIncidentMutation = trpc.emergency.updateIncident.useMutation({
    onSuccess: () => {
      toast.success('Incident updated')
      utils.emergency.getIncident.invalidate({ id: incidentId })
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`)
    },
  })

  const addTimelineEventMutation = trpc.emergency.addTimelineEvent.useMutation({
    onSuccess: () => {
      toast.success('Timeline event added')
      setTimelineDescription('')
      utils.emergency.getIncident.invalidate({ id: incidentId })
    },
    onError: (error) => {
      toast.error(`Failed to add event: ${error.message}`)
    },
  })

  const incident = incidentQuery.data

  const handleStatusChange = (newStatus: string) => {
    if (!incident) return
    updateIncidentMutation.mutate({
      id: incidentId,
      status: newStatus as 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved',
    })
  }

  const handleCommanderChange = (commanderId: string) => {
    if (!incident) return
    updateIncidentMutation.mutate({
      id: incidentId,
      incidentCommander: commanderId || null,
    })
  }

  const handleAddTimelineEvent = () => {
    if (!timelineDescription.trim()) return
    addTimelineEventMutation.mutate({
      incidentId,
      eventType: timelineEventType,
      description: timelineDescription.trim(),
    })
  }

  const handleFieldUpdate = (field: string, value: string) => {
    updateIncidentMutation.mutate({
      id: incidentId,
      [field]: value || undefined,
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Emergency', href: '/employee/admin/emergency' },
    { label: incident?.incident_number || 'Loading...' },
  ]

  if (incidentQuery.isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </AdminPageContent>
    )
  }

  if (!incident) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-charcoal-300" />
          <p className="text-charcoal-600">Incident not found</p>
          <Link href="/employee/admin/emergency">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </AdminPageContent>
    )
  }

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
              onClick={() => utils.emergency.getIncident.invalidate({ id: incidentId })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSendNotification(true)}
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </div>
        }
      />
      {/* Incident Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-semibold text-lg">{incident.incident_number}</span>
        <Badge variant="outline" className={SEVERITY_COLORS[incident.severity as keyof typeof SEVERITY_COLORS]}>
          {incident.severity}
        </Badge>
        <Badge variant="outline" className={STATUS_COLORS[incident.status as keyof typeof STATUS_COLORS]}>
          {incident.status}
        </Badge>
        <span className="text-charcoal-600">{incident.title}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={incident.status}
                    onValueChange={handleStatusChange}
                    disabled={updateIncidentMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Incident Commander</Label>
                  <Select
                    value={incident.incident_commander || ''}
                    onValueChange={handleCommanderChange}
                    disabled={updateIncidentMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign commander" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {usersQuery.data?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notifications">Notifications ({incident.notifications?.length || 0})</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading">Incident Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Event Form */}
                  <div className="flex gap-2 mb-4 p-3 bg-charcoal-50 rounded-lg">
                    <Select
                      value={timelineEventType}
                      onValueChange={(v) => setTimelineEventType(v as typeof timelineEventType)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="escalation">Escalation</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={timelineDescription}
                      onChange={(e) => setTimelineDescription(e.target.value)}
                      placeholder="Describe the action or update..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && timelineDescription.trim()) {
                          handleAddTimelineEvent()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddTimelineEvent}
                      disabled={!timelineDescription.trim() || addTimelineEventMutation.isPending}
                    >
                      {addTimelineEventMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Timeline Events */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-charcoal-200" />
                    <div className="space-y-4">
                      {incident.timeline?.map((event: { id: string; event_type: string; description: string; created_at: string; performer?: { full_name: string } | null }, _index: number) => {
                        const Icon = EVENT_ICONS[event.event_type as keyof typeof EVENT_ICONS] || Activity
                        return (
                          <div key={event.id} className="relative pl-10">
                            <div className="absolute left-0 p-2 rounded-full bg-white border">
                              <Icon className="w-4 h-4 text-charcoal-600" />
                            </div>
                            <div className="bg-white border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium capitalize text-charcoal-600">
                                  {event.event_type}
                                </span>
                                <span className="text-xs text-charcoal-500">
                                  {format(new Date(event.created_at), 'MMM d, HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm">{event.description}</p>
                              {event.performer && (
                                <p className="text-xs text-charcoal-500 mt-1 flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {event.performer.full_name}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      defaultValue={incident.description || ''}
                      placeholder="Incident description..."
                      rows={3}
                      onBlur={(e) => handleFieldUpdate('description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Impact</Label>
                    <Input
                      defaultValue={incident.impact || ''}
                      placeholder="What is affected?"
                      onBlur={(e) => handleFieldUpdate('impact', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Root Cause</Label>
                    <Textarea
                      defaultValue={incident.root_cause || ''}
                      placeholder="What caused the incident?"
                      rows={2}
                      onBlur={(e) => handleFieldUpdate('rootCause', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Textarea
                      defaultValue={incident.resolution || ''}
                      placeholder="How was it resolved?"
                      rows={2}
                      onBlur={(e) => handleFieldUpdate('resolution', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-heading">Sent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {incident.notifications && incident.notifications.length > 0 ? (
                    <div className="space-y-2">
                      {incident.notifications.map((notif: { id: string; status: string; recipient: string; notification_type: string; sent_at?: string }) => (
                        <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {notif.status === 'sent' || notif.status === 'delivered' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : notif.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{notif.recipient}</p>
                              <p className="text-xs text-charcoal-500 capitalize">
                                {notif.notification_type} • {notif.status}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-charcoal-500">
                            {notif.sent_at ? format(new Date(notif.sent_at), 'MMM d, HH:mm') : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-charcoal-500">No notifications sent yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Incident Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Started</span>
                <span>{format(new Date(incident.started_at), 'MMM d, HH:mm')}</span>
              </div>
              {incident.detected_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Detected</span>
                  <span>{format(new Date(incident.detected_at), 'MMM d, HH:mm')}</span>
                </div>
              )}
              {incident.resolved_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Resolved</span>
                  <span>{format(new Date(incident.resolved_at), 'MMM d, HH:mm')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-charcoal-500">Duration</span>
                <span>
                  {formatDistanceToNow(new Date(incident.started_at), { addSuffix: false })}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-charcoal-500">Created by</span>
                <span>{incident.creator?.full_name || 'Unknown'}</span>
              </div>
              {incident.commander && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Commander</span>
                  <span>{incident.commander.full_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        open={showSendNotification}
        onOpenChange={setShowSendNotification}
        incidentId={incidentId}
        incidentNumber={incident.incident_number}
        onSuccess={() => {
          utils.emergency.getIncident.invalidate({ id: incidentId })
        }}
      />
    </AdminPageContent>
  )
}
