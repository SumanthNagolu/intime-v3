'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Building,
  User,
  Calendar,
  DollarSign,
  Phone,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  FileText,
  Mail,
  MapPin,
  Briefcase,
  Target,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { CheckInDialog } from './CheckInDialog'
import { ExtendPlacementDialog } from './ExtendPlacementDialog'
import { TerminatePlacementDialog } from './TerminatePlacementDialog'

interface PlacementDetailPageProps {
  placementId: string
}

const HEALTH_CONFIG = {
  healthy: {
    label: 'Healthy',
    icon: Heart,
    color: 'green',
    bgClass: 'bg-green-100 text-green-800',
    borderClass: 'border-green-500',
  },
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    color: 'amber',
    bgClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-500',
  },
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    color: 'red',
    bgClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-500',
  },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending_start: { label: 'Pending Start', color: 'yellow' },
  active: { label: 'Active', color: 'green' },
  extended: { label: 'Extended', color: 'blue' },
  completed: { label: 'Completed', color: 'gray' },
  terminated: { label: 'Terminated', color: 'red' },
  on_hold: { label: 'On Hold', color: 'orange' },
}

export function PlacementDetailPage({ placementId }: PlacementDetailPageProps) {
  const router = useRouter()
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false)

  // Fetch placement details
  const { data: placement, isLoading, refetch } = trpc.ats.placements.getById.useQuery({
    placementId,
  })

  if (isLoading) {
    return <PlacementDetailSkeleton />
  }

  if (!placement) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h2 className="text-xl font-medium mb-2">Placement Not Found</h2>
        <p className="text-charcoal-500 mb-4">The requested placement could not be found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const healthConfig = HEALTH_CONFIG[placement.health_status as keyof typeof HEALTH_CONFIG] || HEALTH_CONFIG.healthy
  const statusConfig = STATUS_CONFIG[placement.status] || STATUS_CONFIG.active
  const HealthIcon = healthConfig.icon

  // Calculate days active
  const startDate = new Date(placement.start_date)
  const endDate = placement.end_date ? new Date(placement.end_date) : new Date()
  const daysActive = differenceInDays(new Date() > endDate ? endDate : new Date(), startDate)
  const daysRemaining = placement.end_date ? differenceInDays(new Date(placement.end_date), new Date()) : null

  // Calculate margin
  const marginAmount = (placement.bill_rate || 0) - (placement.pay_rate || 0)
  const marginPercent = placement.bill_rate ? ((marginAmount / placement.bill_rate) * 100).toFixed(1) : '0.0'

  // Determine next check-in type
  const getNextCheckInType = () => {
    if (!placement.checkin_7_day_completed) return '7_day'
    if (!placement.checkin_30_day_completed) return '30_day'
    if (!placement.checkin_60_day_completed) return '60_day'
    if (!placement.checkin_90_day_completed) return '90_day'
    return 'ad_hoc'
  }

  const canRecordCheckIn = ['active', 'extended'].includes(placement.status)
  const canExtend = ['active', 'extended'].includes(placement.status) && placement.end_date
  const canTerminate = ['active', 'extended', 'pending_start'].includes(placement.status)

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-heading font-semibold text-charcoal-900">
                    {placement.candidate?.first_name} {placement.candidate?.last_name}
                  </h1>
                  <Badge className={healthConfig.bgClass}>
                    <HealthIcon className="w-3 h-3 mr-1" />
                    {healthConfig.label}
                  </Badge>
                  <Badge variant={statusConfig.color === 'green' ? 'default' : 'secondary'}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-sm text-charcoal-500 mt-1">
                  {placement.job?.title} at {placement.account?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canRecordCheckIn && (
                <Button onClick={() => setIsCheckInDialogOpen(true)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Record Check-In
                </Button>
              )}
              {canExtend && (
                <Button variant="outline" onClick={() => setIsExtendDialogOpen(true)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Extend
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <FileText className="w-4 h-4 mr-2" />
                    View Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Candidate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Building className="w-4 h-4 mr-2" />
                    Email Client
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-amber-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Mark At Risk
                  </DropdownMenuItem>
                  {canTerminate && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setIsTerminateDialogOpen(true)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      End Placement
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Days Active</p>
                      <p className="text-lg font-semibold">{daysActive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Days Remaining</p>
                      <p className="text-lg font-semibold">
                        {daysRemaining !== null ? daysRemaining : 'Ongoing'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Bill Rate</p>
                      <p className="text-lg font-semibold">${placement.bill_rate}/hr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Margin</p>
                      <p className="text-lg font-semibold text-green-600">{marginPercent}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="checkins" className="w-full">
              <TabsList>
                <TabsTrigger value="checkins">Check-Ins</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="extensions">Extensions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Check-Ins Tab */}
              <TabsContent value="checkins" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Check-In Progress</CardTitle>
                    <CardDescription>
                      Track scheduled check-ins throughout the placement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { type: '7_day', label: '7-Day Check-In', completed: placement.checkin_7_day_completed },
                        { type: '30_day', label: '30-Day Check-In', completed: placement.checkin_30_day_completed },
                        { type: '60_day', label: '60-Day Check-In', completed: placement.checkin_60_day_completed },
                        { type: '90_day', label: '90-Day Check-In', completed: placement.checkin_90_day_completed },
                      ].map((checkin) => (
                        <div
                          key={checkin.type}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border',
                            checkin.completed ? 'bg-green-50 border-green-200' : 'bg-white border-charcoal-200'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {checkin.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-charcoal-400" />
                            )}
                            <span className="font-medium">{checkin.label}</span>
                          </div>
                          {checkin.completed ? (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {placement.last_check_in_date && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-charcoal-500">
                          Last check-in: {formatDistanceToNow(new Date(placement.last_check_in_date), { addSuffix: true })}
                        </p>
                      </div>
                    )}

                    {placement.next_check_in_date && (
                      <div className="mt-2">
                        <p className="text-sm text-charcoal-500">
                          Next scheduled: {format(new Date(placement.next_check_in_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Check-In History */}
                {placement.checkins && placement.checkins.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Check-In History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {placement.checkins.map((checkin: {
                          id: string
                          checkin_type: string
                          checkin_date: string
                          overall_health: string
                          candidate_sentiment?: string
                          client_satisfaction?: string
                        }) => (
                          <div key={checkin.id} className="flex items-start gap-3 p-3 bg-charcoal-50 rounded-lg">
                            <Phone className="w-4 h-4 mt-1 text-charcoal-400" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {checkin.checkin_type.replace('_', '-')} Check-In
                                </span>
                                <span className="text-sm text-charcoal-500">
                                  {format(new Date(checkin.checkin_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={HEALTH_CONFIG[checkin.overall_health as keyof typeof HEALTH_CONFIG]?.bgClass}>
                                  {checkin.overall_health}
                                </Badge>
                                {checkin.candidate_sentiment && (
                                  <span className="text-sm text-charcoal-500">
                                    Candidate: {checkin.candidate_sentiment}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Milestones Tab */}
              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Placement Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {placement.milestones && placement.milestones.length > 0 ? (
                      <div className="space-y-4">
                        {placement.milestones.map((milestone: {
                          id: string
                          milestone_type: string
                          milestone_date: string
                          status: string
                          description?: string
                        }) => (
                          <div
                            key={milestone.id}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg border',
                              milestone.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white'
                            )}
                          >
                            <Target className={cn(
                              'w-4 h-4 mt-1',
                              milestone.status === 'completed' ? 'text-green-600' : 'text-charcoal-400'
                            )} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">
                                  {milestone.milestone_type.replace(/_/g, ' ')}
                                </span>
                                <span className="text-sm text-charcoal-500">
                                  {format(new Date(milestone.milestone_date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-charcoal-500 mt-1">{milestone.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-500 text-center py-8">No milestones recorded yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Extensions Tab */}
              <TabsContent value="extensions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extension History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {placement.extensions && placement.extensions.length > 0 ? (
                      <div className="space-y-4">
                        {placement.extensions.map((extension: {
                          id: string
                          original_end_date: string
                          new_end_date: string
                          extension_reason?: string
                          status: string
                          approved_at?: string
                        }) => (
                          <div key={extension.id} className="p-4 bg-charcoal-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Extension</span>
                              </div>
                              <Badge variant={extension.status === 'approved' ? 'default' : 'secondary'}>
                                {extension.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-charcoal-500">Original End:</span>
                                <p>{format(new Date(extension.original_end_date), 'MMM d, yyyy')}</p>
                              </div>
                              <div>
                                <span className="text-charcoal-500">New End:</span>
                                <p>{format(new Date(extension.new_end_date), 'MMM d, yyyy')}</p>
                              </div>
                            </div>
                            {extension.extension_reason && (
                              <p className="text-sm text-charcoal-600 mt-2">{extension.extension_reason}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-500 text-center py-8">No extensions recorded</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-charcoal-500 text-center py-8">
                      Activity feed coming soon
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Placement Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Placement Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-charcoal-400" />
                    <div>
                      <p className="text-xs text-charcoal-500">Candidate</p>
                      <p className="font-medium">
                        {placement.candidate?.first_name} {placement.candidate?.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-charcoal-400" />
                    <div>
                      <p className="text-xs text-charcoal-500">Position</p>
                      <p className="font-medium">{placement.job?.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-charcoal-400" />
                    <div>
                      <p className="text-xs text-charcoal-500">Client</p>
                      <p className="font-medium">{placement.account?.name}</p>
                    </div>
                  </div>

                  {placement.work_location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-charcoal-400" />
                      <div>
                        <p className="text-xs text-charcoal-500">Work Location</p>
                        <p className="font-medium capitalize">{placement.work_location}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Start Date</span>
                    <span className="font-medium">{format(new Date(placement.start_date), 'MMM d, yyyy')}</span>
                  </div>
                  {placement.end_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">End Date</span>
                      <span className="font-medium">{format(new Date(placement.end_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Pay Rate</span>
                    <span className="font-medium">${placement.pay_rate}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Bill Rate</span>
                    <span className="font-medium">${placement.bill_rate}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Margin</span>
                    <span className="font-medium text-green-600">{marginPercent}% (${marginAmount}/hr)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Contact */}
            {placement.hiring_manager_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-charcoal-500">Hiring Manager</p>
                    <p className="font-medium">{placement.hiring_manager_name}</p>
                    {placement.hiring_manager_email && (
                      <a
                        href={`mailto:${placement.hiring_manager_email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {placement.hiring_manager_email}
                      </a>
                    )}
                  </div>
                  {placement.hr_contact_name && (
                    <div>
                      <p className="text-xs text-charcoal-500">HR Contact</p>
                      <p className="font-medium">{placement.hr_contact_name}</p>
                      {placement.hr_contact_email && (
                        <a
                          href={`mailto:${placement.hr_contact_email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {placement.hr_contact_email}
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Paperwork Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Paperwork Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paperwork Complete</span>
                    {placement.paperwork_complete ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Background Check</span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        placement.background_check_status === 'passed' && 'bg-green-100 text-green-800',
                        placement.background_check_status === 'pending' && 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {placement.background_check_status || 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">I-9 Complete</span>
                    {placement.i9_complete ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NDA Signed</span>
                    {placement.nda_signed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CheckInDialog
        open={isCheckInDialogOpen}
        onOpenChange={setIsCheckInDialogOpen}
        placementId={placementId}
        candidateName={`${placement.candidate?.first_name} ${placement.candidate?.last_name}`}
        jobTitle={placement.job?.title || ''}
        accountName={placement.account?.name || ''}
        currentCheckinType={getNextCheckInType()}
        startDate={placement.start_date}
        onSuccess={() => refetch()}
      />

      {placement.end_date && (
        <ExtendPlacementDialog
          open={isExtendDialogOpen}
          onOpenChange={setIsExtendDialogOpen}
          placementId={placementId}
          candidateName={`${placement.candidate?.first_name} ${placement.candidate?.last_name}`}
          jobTitle={placement.job?.title || ''}
          accountName={placement.account?.name || ''}
          currentEndDate={placement.end_date}
          currentPayRate={placement.pay_rate || 0}
          currentBillRate={placement.bill_rate || 0}
          onSuccess={() => refetch()}
        />
      )}

      <TerminatePlacementDialog
        open={isTerminateDialogOpen}
        onOpenChange={setIsTerminateDialogOpen}
        placementId={placementId}
        candidateName={`${placement.candidate?.first_name} ${placement.candidate?.last_name}`}
        jobTitle={placement.job?.title || ''}
        accountName={placement.account?.name || ''}
        startDate={placement.start_date}
        currentEndDate={placement.end_date}
        payRate={placement.pay_rate || 0}
        billRate={placement.bill_rate || 0}
        onSuccess={() => refetch()}
      />
    </div>
  )
}

function PlacementDetailSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
