'use client'

import { useState, useEffect, useRef } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Play,
  Pause,
  Settings,
  Mail,
  Linkedin,
  Phone,
  Users,
  Calendar,
  CheckCircle,
  Loader2,
  Target,
  TrendingUp,
  Zap,
  Clock,
  DollarSign,
  BarChart3,
  ArrowLeft,
  Copy,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSearchParams, useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { EditCampaignDialog } from './EditCampaignDialog'
import { CompleteCampaignDialog } from './CompleteCampaignDialog'
import { DuplicateCampaignDialog } from './DuplicateCampaignDialog'
import {
  CampaignOverviewSection,
  CampaignSequencesSection,
  CampaignProspectsSection,
  CampaignLeadsSection,
  CampaignActivitiesSection,
  CampaignDocumentsSection,
  CampaignNotesSection,
  CampaignAnalyticsSection,
  CampaignHistorySection,
} from './sections'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CampaignDetailPageProps {
  campaignId: string
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  draft: { 
    color: 'text-charcoal-700', 
    bgColor: 'bg-charcoal-100 border-charcoal-200', 
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Draft'
  },
  scheduled: { 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50 border-blue-200', 
    icon: <Calendar className="w-3.5 h-3.5" />,
    label: 'Scheduled'
  },
  active: { 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50 border-emerald-200', 
    icon: <Zap className="w-3.5 h-3.5" />,
    label: 'Active'
  },
  paused: { 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-50 border-amber-200', 
    icon: <Pause className="w-3.5 h-3.5" />,
    label: 'Paused'
  },
  completed: { 
    color: 'text-violet-700', 
    bgColor: 'bg-violet-50 border-violet-200', 
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: 'Completed'
  },
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
}

export function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSection = searchParams.get('section') || 'overview'
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)

  const utils = trpc.useUtils()

  // Use optimized query that fetches campaign + all counts in one call
  const { data: campaign, isLoading } = trpc.crm.campaigns.getByIdWithCounts.useQuery(
    { id: campaignId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      refetchOnWindowFocus: false,
    }
  )

  const updateStatus = trpc.crm.campaigns.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Campaign status updated')
      utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
      utils.crm.campaigns.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  // Sticky header detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setIsHeaderSticky(rect.top <= 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Listen for dialog events from sidebar
  useEffect(() => {
    const handleCampaignDialog = (e: CustomEvent<{ dialogId: string }>) => {
      if (e.detail.dialogId === 'editCampaign') {
        setEditDialogOpen(true)
      } else if (e.detail.dialogId === 'logActivity') {
        router.push(`/employee/crm/campaigns/${campaignId}?section=activities`)
      }
    }

    window.addEventListener('openCampaignDialog', handleCampaignDialog as EventListener)
    return () => {
      window.removeEventListener('openCampaignDialog', handleCampaignDialog as EventListener)
    }
  }, [campaignId, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-500" />
          <p className="text-sm text-charcoal-500">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-charcoal-50 rounded-full mb-4">
          <Target className="w-10 h-10 text-charcoal-300" />
        </div>
        <h3 className="text-lg font-semibold text-charcoal-900">Campaign not found</h3>
        <p className="text-sm text-charcoal-500 mt-1">
          The campaign you're looking for doesn't exist or you don't have access.
        </p>
        <Link href="/employee/crm/campaigns">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </Link>
      </div>
    )
  }

  const handleToggleStatus = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    updateStatus.mutate({ id: campaignId, status: newStatus })
  }

  // Calculate key metrics for sticky header
  const funnel = campaign?.funnel ?? {
    total_prospects: 0,
    contacted: 0,
    opened: 0,
    responded: 0,
    leads: 0,
    meetings: 0,
    open_rate: 0,
    response_rate: 0,
    conversion_rate: 0,
  }

  const leadsProgress = campaign?.targets?.targetLeads
    ? Math.round(((campaign.metrics?.leads || 0) / campaign.targets.targetLeads) * 100)
    : 0

  const daysRemaining = campaign?.endDate
    ? Math.max(0, differenceInDays(new Date(campaign.endDate), new Date()))
    : null

  const statusInfo = statusConfig[campaign?.status || 'draft'] || statusConfig.draft

  // Render current section (lazy-loaded)
  const renderSection = () => {
    switch (currentSection) {
      case 'sequences':
        return <CampaignSequencesSection campaignId={campaignId} />
      case 'prospects':
        return <CampaignProspectsSection campaignId={campaignId} />
      case 'leads':
        return <CampaignLeadsSection campaignId={campaignId} />
      case 'activities':
        return <CampaignActivitiesSection campaignId={campaignId} />
      case 'documents':
        return <CampaignDocumentsSection campaignId={campaignId} />
      case 'notes':
        return <CampaignNotesSection campaignId={campaignId} />
      case 'analytics':
        return <CampaignAnalyticsSection campaignId={campaignId} />
      case 'history':
        return <CampaignHistorySection campaignId={campaignId} />
      case 'overview':
      default:
        return (
          <CampaignOverviewSection
            campaignId={campaignId}
            campaign={campaign}
            metrics={campaign?.metrics}
          />
        )
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-full">
        {/* Sticky Header */}
        <div 
          ref={headerRef}
          className={cn(
            'sticky top-0 z-20 bg-white transition-shadow duration-200',
            isHeaderSticky && 'shadow-md border-b border-charcoal-100'
          )}
        >
          {/* Main Header */}
          <div className="px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    href="/employee/crm/campaigns"
                    className="text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  >
                    Campaigns
                  </Link>
                  <span className="text-charcoal-300">/</span>
                  <span className="text-sm text-charcoal-700 truncate max-w-[200px]">
                    {campaign?.name}
                  </span>
                </div>

                {/* Title Row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-heading font-semibold text-charcoal-900 tracking-tight">
                    {campaign?.name}
                  </h1>
                  <Badge className={cn('gap-1.5 font-medium border', statusInfo.bgColor, statusInfo.color)}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {campaign?.startDate && format(new Date(campaign.startDate), 'MMM d, yyyy')}
                    {campaign?.endDate && ` - ${format(new Date(campaign.endDate), 'MMM d, yyyy')}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {(campaign?.audienceSize || 0).toLocaleString()} prospects
                  </span>
                  <div className="flex gap-1">
                    {campaign?.channels?.map((channel: string) => (
                      <Tooltip key={channel}>
                        <TooltipTrigger asChild>
                          <span className="p-1.5 bg-charcoal-100 rounded-md text-charcoal-600">
                            {channelIcons[channel]}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="capitalize">{channel}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  {daysRemaining !== null && campaign?.status === 'active' && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {daysRemaining === 0 ? 'Ends today' : `${daysRemaining} days left`}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {campaign?.status !== 'completed' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleToggleStatus}
                      disabled={updateStatus.isPending}
                      className="gap-2"
                    >
                      {updateStatus.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : campaign?.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          {campaign?.status === 'draft' ? 'Start' : 'Resume'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCompleteDialogOpen(true)}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </Button>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Campaign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDuplicateDialogOpen(true)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/employee/crm/campaigns/${campaignId}?section=analytics`}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Key Metrics Bar - Always visible */}
          <div className="px-6 py-3 bg-charcoal-50/50 border-t border-charcoal-100">
            <div className="flex items-center justify-between gap-6">
              {/* Quick Stats */}
              <div className="flex items-center gap-6 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-md">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-500">Contacted</div>
                        <div className="text-sm font-semibold tabular-nums">
                          {funnel.contacted.toLocaleString()}
                          <span className="text-charcoal-400 font-normal ml-1">
                            / {funnel.total_prospects.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {funnel.total_prospects > 0 
                      ? `${Math.round((funnel.contacted / funnel.total_prospects) * 100)}% of audience contacted`
                      : 'No prospects enrolled yet'}
                  </TooltipContent>
                </Tooltip>

                <div className="h-8 w-px bg-charcoal-200" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-cyan-100 rounded-md">
                        <TrendingUp className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-500">Response Rate</div>
                        <div className="text-sm font-semibold tabular-nums">
                          {funnel.conversion_rate || 0}%
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {funnel.responded} responses from {funnel.contacted} contacted
                  </TooltipContent>
                </Tooltip>

                <div className="h-8 w-px bg-charcoal-200" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-md">
                        <Target className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-500">Leads</div>
                        <div className="text-sm font-semibold text-emerald-600 tabular-nums">
                          {funnel.leads}
                          {campaign?.targets?.targetLeads && (
                            <span className="text-charcoal-400 font-normal ml-1">
                              / {campaign.targets.targetLeads}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {leadsProgress}% of target achieved
                  </TooltipContent>
                </Tooltip>

                <div className="h-8 w-px bg-charcoal-200" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-100 rounded-md">
                        <Calendar className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-charcoal-500">Meetings</div>
                        <div className="text-sm font-semibold tabular-nums">
                          {funnel.meetings}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Meetings booked from this campaign</TooltipContent>
                </Tooltip>

                {campaign?.budgetSpent !== undefined && campaign.budgetSpent > 0 && funnel.leads > 0 && (
                  <>
                    <div className="h-8 w-px bg-charcoal-200" />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-violet-100 rounded-md">
                            <DollarSign className="w-4 h-4 text-violet-600" />
                          </div>
                          <div>
                            <div className="text-xs text-charcoal-500">Cost/Lead</div>
                            <div className="text-sm font-semibold tabular-nums">
                              ${(campaign.budgetSpent / funnel.leads).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        ${campaign.budgetSpent.toLocaleString()} spent
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>

              {/* Progress to Target */}
              {campaign?.targets?.targetLeads && campaign.targets.targetLeads > 0 && (
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-charcoal-500">Target Progress</span>
                      <span className={cn(
                        'font-medium',
                        leadsProgress >= 100 ? 'text-emerald-600' : 'text-charcoal-600'
                      )}>
                        {leadsProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          leadsProgress >= 100 ? 'bg-emerald-500' :
                          leadsProgress >= 75 ? 'bg-blue-500' :
                          leadsProgress >= 50 ? 'bg-amber-500' : 'bg-charcoal-300'
                        )}
                        style={{ width: `${Math.min(leadsProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 px-6 py-6 bg-charcoal-50/30">
          {renderSection()}
        </div>

        {/* Dialogs */}
        {campaign && (
          <>
            <EditCampaignDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              campaignId={campaignId}
              onSuccess={() => {
                utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
                utils.crm.campaigns.list.invalidate()
              }}
            />

            <CompleteCampaignDialog
              open={completeDialogOpen}
              onOpenChange={setCompleteDialogOpen}
              campaignId={campaignId}
              campaignName={campaign.name}
              metrics={{ funnel: campaign.funnel, targets: campaign.targets }}
              onSuccess={() => {
                utils.crm.campaigns.getByIdWithCounts.invalidate({ id: campaignId })
                utils.crm.campaigns.list.invalidate()
              }}
            />

            <DuplicateCampaignDialog
              open={duplicateDialogOpen}
              onOpenChange={setDuplicateDialogOpen}
              campaignId={campaignId}
              originalName={campaign.name}
              onSuccess={() => {
                utils.crm.campaigns.list.invalidate()
              }}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
