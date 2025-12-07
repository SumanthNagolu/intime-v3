'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Phone,
  Mail,
  Trophy,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  PlusCircle,
  Send,
  AlertCircle,
  CheckCircle2,
  Target,
  Briefcase,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { CloseWonDialog, CloseLostDialog } from '@/components/crm/deals'

// Stage configuration
const stageConfig = [
  { key: 'discovery', label: 'Discovery', probability: 20, color: 'bg-slate-500' },
  { key: 'qualification', label: 'Qualification', probability: 40, color: 'bg-blue-500' },
  { key: 'proposal', label: 'Proposal', probability: 60, color: 'bg-amber-500' },
  { key: 'negotiation', label: 'Negotiation', probability: 70, color: 'bg-orange-500' },
  { key: 'verbal_commit', label: 'Verbal Commit', probability: 90, color: 'bg-green-500' },
  { key: 'closed_won', label: 'Closed Won', probability: 100, color: 'bg-emerald-600' },
  { key: 'closed_lost', label: 'Closed Lost', probability: 0, color: 'bg-red-500' },
]

const healthColors: Record<string, { bg: string; text: string; label: string }> = {
  on_track: { bg: 'bg-green-100', text: 'text-green-700', label: 'On Track' },
  slow: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Slow' },
  stale: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Stale' },
  urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
  at_risk: { bg: 'bg-red-200', text: 'text-red-800', label: 'At Risk' },
}

const activityTypes = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'proposal_sent', label: 'Proposal Sent', icon: Send },
  { value: 'contract_sent', label: 'Contract Sent', icon: FileText },
]

const activitySchema = z.object({
  activityType: z.enum(['call', 'email', 'meeting', 'note', 'proposal_sent', 'contract_sent']),
  description: z.string().min(1, 'Description is required'),
  outcome: z.enum(['positive', 'neutral', 'negative', 'no_response', 'scheduled', 'completed']).optional(),
})

type ActivityFormValues = z.infer<typeof activitySchema>

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const dealId = params.id as string

  const [closeWonOpen, setCloseWonOpen] = React.useState(false)
  const [closeLostOpen, setCloseLostOpen] = React.useState(false)
  const [activityDialogOpen, setActivityDialogOpen] = React.useState(false)
  const [moveStageDialogOpen, setMoveStageDialogOpen] = React.useState(false)
  const [selectedStage, setSelectedStage] = React.useState<string>('')

  // Fetch deal data
  const { data: deal, isLoading, error } = trpc.crm.deals.getById.useQuery(
    { id: dealId },
    { enabled: !!dealId }
  )

  // Log activity mutation
  const logActivity = trpc.crm.deals.logActivity.useMutation({
    onSuccess: () => {
      toast({ title: 'Activity logged', description: 'Activity has been recorded' })
      utils.crm.deals.getById.invalidate({ id: dealId })
      setActivityDialogOpen(false)
      activityForm.reset()
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Update stage mutation
  const updateStage = trpc.crm.deals.updateStage.useMutation({
    onSuccess: () => {
      toast({ title: 'Stage updated', description: 'Deal stage has been updated' })
      utils.crm.deals.getById.invalidate({ id: dealId })
      utils.crm.deals.pipeline.invalidate()
      setMoveStageDialogOpen(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const activityForm = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityType: 'note',
      description: '',
    },
  })

  const handleLogActivity = (data: ActivityFormValues) => {
    logActivity.mutate({
      dealId,
      activityType: data.activityType,
      description: data.description,
      outcome: data.outcome,
    })
  }

  const handleMoveStage = () => {
    if (selectedStage) {
      updateStage.mutate({
        id: dealId,
        stage: selectedStage as 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'verbal_commit' | 'closed_won' | 'closed_lost',
      })
    }
  }

  // Listen for dialog events from sidebar quick actions
  React.useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'moveStage':
          setMoveStageDialogOpen(true)
          break
        case 'logDealActivity':
          setActivityDialogOpen(true)
          break
        case 'closeWon':
          setCloseWonOpen(true)
          break
      }
    }

    window.addEventListener('openDealDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openDealDialog', handleOpenDialog as EventListener)
    }
  }, [])

  // Loading handled by layout
  if (isLoading || !deal) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Error loading deal</p>
      </div>
    )
  }

  const currentStageIndex = stageConfig.findIndex(s => s.key === deal.stage)
  const currentStageConfig = stageConfig.find(s => s.key === deal.stage)
  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
  const daysUntilClose = deal.expected_close_date
    ? differenceInDays(new Date(deal.expected_close_date), new Date())
    : null
  const companyName = deal.account?.name || deal.lead?.company_name || 'No Company'

  return (
    <div className="flex flex-col h-full">
      {/* Header - Simplified with Actions */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {deal.health_status && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  healthColors[deal.health_status]?.bg,
                  healthColors[deal.health_status]?.text
                )}
              >
                {healthColors[deal.health_status]?.label}
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {companyName}
            </span>
            {deal.owner && (
              <span className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {deal.owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {deal.owner.full_name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isClosed && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMoveStageDialogOpen(true)}
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Move Stage
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => setCloseWonOpen(true)}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Close Won
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setCloseLostOpen(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Lost
                </Button>
              </>
            )}
            <Button onClick={() => setActivityDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Log Activity
            </Button>
          </div>
        </div>

        {/* Stage Pipeline Progress */}
        {!isClosed && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              {stageConfig.slice(0, 5).map((stage, index) => (
                <React.Fragment key={stage.key}>
                  <div
                    className={cn(
                      'flex-1 h-2 rounded-full transition-colors',
                      index <= currentStageIndex ? stage.color : 'bg-muted'
                    )}
                  />
                  {index < 4 && <div className="w-1" />}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              {stageConfig.slice(0, 5).map((stage) => (
                <span
                  key={stage.key}
                  className={cn(
                    stage.key === deal.stage && 'font-medium text-foreground'
                  )}
                >
                  {stage.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Closed Status Banner */}
        {isClosed && (
          <div className={cn(
            'mt-4 p-4 rounded-lg flex items-center gap-3',
            deal.stage === 'closed_won' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          )}>
            {deal.stage === 'closed_won' ? (
              <>
                <Trophy className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Deal Closed Won!</p>
                  <p className="text-sm text-green-600">
                    Closed on {deal.closed_at ? format(new Date(deal.closed_at), 'MMM d, yyyy') : 'N/A'}
                    {deal.win_reason && ` • Win reason: ${deal.win_reason.replace('_', ' ')}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Deal Closed Lost</p>
                  <p className="text-sm text-red-600">
                    Closed on {deal.closed_at ? format(new Date(deal.closed_at), 'MMM d, yyyy') : 'N/A'}
                    {deal.loss_reason_category && ` • Reason: ${deal.loss_reason_category.replace('_', ' ')}`}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-cream">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Deal Value</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    {(deal.value || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deal.value_basis || 'annual'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Probability</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    {deal.probability || 0}%
                  </p>
                  <Progress value={deal.probability || 0} className="mt-2 h-1" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Weighted Value</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    ${(((deal.value || 0) * (deal.probability || 0)) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Close Date</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d') : 'TBD'}
                  </p>
                  {daysUntilClose !== null && !isClosed && (
                    <p className={cn(
                      'text-xs mt-1',
                      daysUntilClose < 0 ? 'text-red-600' : daysUntilClose < 7 ? 'text-amber-600' : 'text-muted-foreground'
                    )}>
                      {daysUntilClose < 0 ? `${Math.abs(daysUntilClose)} days overdue` : `${daysUntilClose} days left`}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">
                  Activity ({deal.activities?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="roles">
                  Roles ({deal.roles_breakdown?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="history">Stage History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-4">
                {/* Deal Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wide">Deal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Deal Type</p>
                      <p className="font-medium capitalize">
                        {deal.deal_type?.replace('_', ' ') || 'New Business'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contract Length</p>
                      <p className="font-medium">
                        {deal.contract_length_months || 12} months
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Est. Placements</p>
                      <p className="font-medium">{deal.estimated_placements || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Bill Rate</p>
                      <p className="font-medium">
                        {deal.avg_bill_rate ? `$${deal.avg_bill_rate}/hr` : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Hiring Needs */}
                {deal.hiring_needs && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-wide">Hiring Needs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{deal.hiring_needs}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Services & Competition */}
                <div className="grid grid-cols-2 gap-6">
                  {deal.services_required && deal.services_required.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wide">Services Required</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {deal.services_required.map((service: string) => (
                            <Badge key={service} variant="secondary">{service}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {deal.competitors && deal.competitors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wide">Competitors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {deal.competitors.map((competitor: string) => (
                            <Badge key={competitor} variant="outline">{competitor}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Next Action */}
                {deal.next_action && (
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-800">Next Action</p>
                        <p className="text-sm text-amber-700">
                          {deal.next_action}
                          {deal.next_action_date && (
                            <span className="ml-2 text-amber-600">
                              Due: {format(new Date(deal.next_action_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="pt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm uppercase tracking-wide">Activity Timeline</CardTitle>
                    <Button size="sm" onClick={() => setActivityDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Log Activity
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {!deal.activities || deal.activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No activities logged yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {deal.activities.map((activity: { id: string; activity_type: string; subject?: string; description?: string; outcome?: string; created_at: string; creator?: { full_name: string; avatar_url?: string } }) => {
                          const activityConfig = activityTypes.find(a => a.value === activity.activity_type)
                          const Icon = activityConfig?.icon || FileText
                          return (
                            <div key={activity.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {activity.subject || activityConfig?.label}
                                  </span>
                                  {activity.outcome && (
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {activity.outcome.replace('_', ' ')}
                                    </Badge>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {activity.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {activity.creator?.full_name} • {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wide">Roles Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!deal.roles_breakdown || deal.roles_breakdown.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No roles defined
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {deal.roles_breakdown.map((role: { title: string; quantity: number; minRate?: number; maxRate?: number; billRate?: number; priority?: string }, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Briefcase className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{role.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {role.quantity}
                                  {role.priority && ` • ${role.priority} priority`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {(role.minRate || role.maxRate || role.billRate) && (
                                <p className="font-medium">
                                  {role.billRate
                                    ? `$${role.billRate}/hr`
                                    : `$${role.minRate || 0} - $${role.maxRate || 0}/hr`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm uppercase tracking-wide">Stage History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!deal.stageHistory || deal.stageHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No stage history
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {deal.stageHistory.map((history: { id?: string; stage: string; entered_at: string; exited_at?: string; changed_by_user?: { full_name: string } }, index: number) => {
                          const stageInfo = stageConfig.find(s => s.key === history.stage)
                          return (
                            <div key={history.id || index} className="flex items-center gap-3">
                              <div className={cn('w-3 h-3 rounded-full', stageInfo?.color || 'bg-muted')} />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{stageInfo?.label || history.stage}</p>
                                <p className="text-xs text-muted-foreground">
                                  Entered: {format(new Date(history.entered_at), 'MMM d, yyyy h:mm a')}
                                  {history.exited_at && ` • Exited: ${format(new Date(history.exited_at), 'MMM d, yyyy h:mm a')}`}
                                </p>
                                {history.changed_by_user && (
                                  <p className="text-xs text-muted-foreground">
                                    By: {history.changed_by_user.full_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account/Lead */}
                {(deal.account || deal.lead) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {deal.account ? 'Account' : 'Lead'}
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto"
                      onClick={() => {
                        if (deal.account) {
                          router.push(`/employee/crm/accounts/${deal.account.id}`)
                        } else if (deal.lead) {
                          router.push(`/employee/crm/leads/${deal.lead.id}`)
                        }
                      }}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{companyName}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Owner */}
                {deal.owner && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Owner</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={deal.owner.avatar_url || ''} />
                        <AvatarFallback>
                          {deal.owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{deal.owner.full_name}</p>
                        <p className="text-xs text-muted-foreground">{deal.owner.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{deal.created_at ? format(new Date(deal.created_at), 'MMM d, yyyy') : '-'}</span>
                  </div>
                  {deal.last_activity_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Activity</span>
                      <span>{format(new Date(deal.last_activity_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {deal.closed_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closed</span>
                      <span>{format(new Date(deal.closed_at), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            {deal.tasks && deal.tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide">
                    Tasks ({deal.tasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deal.tasks.slice(0, 5).map((task: { id: string; title: string; due_date?: string; status: string; priority?: string }) => (
                      <div
                        key={task.id}
                        className={cn(
                          'p-2 rounded-lg border text-sm',
                          task.status === 'completed' && 'bg-green-50 border-green-200'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium truncate',
                              task.status === 'completed' && 'line-through text-muted-foreground'
                            )}>
                              {task.title}
                            </p>
                            {task.due_date && (
                              <p className="text-xs text-muted-foreground">
                                Due: {format(new Date(task.due_date), 'MMM d')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {deal.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{deal.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record an activity for this deal
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={activityForm.handleSubmit(handleLogActivity)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select
                value={activityForm.watch('activityType')}
                onValueChange={(val) => activityForm.setValue('activityType', val as 'call' | 'email' | 'meeting' | 'note' | 'proposal_sent' | 'contract_sent')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="What happened?"
                {...activityForm.register('description')}
                rows={3}
              />
              {activityForm.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {activityForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome (optional)</label>
              <Select
                value={activityForm.watch('outcome') || ''}
                onValueChange={(val) => activityForm.setValue('outcome', val as 'positive' | 'neutral' | 'negative' | 'no_response' | 'scheduled' | 'completed' | undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActivityDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={logActivity.isPending}>
                {logActivity.isPending ? 'Saving...' : 'Log Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move Stage Dialog */}
      <Dialog open={moveStageDialogOpen} onOpenChange={setMoveStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Deal to Stage</DialogTitle>
            <DialogDescription>
              Select the new stage for this deal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {stageConfig.slice(0, 5).map((stage) => (
                  <SelectItem
                    key={stage.key}
                    value={stage.key}
                    disabled={stage.key === deal.stage}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', stage.color)} />
                      {stage.label}
                      {stage.key === deal.stage && ' (current)'}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMoveStageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMoveStage}
              disabled={!selectedStage || updateStage.isPending}
            >
              {updateStage.isPending ? 'Moving...' : 'Move Stage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Won/Lost Dialogs */}
      <CloseWonDialog
        open={closeWonOpen}
        onOpenChange={setCloseWonOpen}
        deal={deal}
        onSuccess={() => router.push('/employee/crm/deals')}
      />

      <CloseLostDialog
        open={closeLostOpen}
        onOpenChange={setCloseLostOpen}
        deal={deal}
        onSuccess={() => router.push('/employee/crm/deals')}
      />
    </div>
  )
}
