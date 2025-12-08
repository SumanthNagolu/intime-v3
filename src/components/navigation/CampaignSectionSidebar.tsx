'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Target,
  Edit,
  Phone,
  Pause,
  Play,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  BarChart3,
  Zap,
  Calendar,
  Copy,
  ArrowLeft,
  ChevronRight,
  Mail,
  MousePointerClick,
  AlertCircle,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { campaignSections } from '@/lib/navigation/entity-sections'
import { LucideIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { differenceInDays, format, isPast, isFuture } from 'date-fns'

// Status configuration
const statusConfig: Record<string, { 
  color: string
  bgColor: string
  icon: LucideIcon
  label: string 
}> = {
  draft: { 
    color: 'text-charcoal-700', 
    bgColor: 'bg-charcoal-100 border-charcoal-200', 
    icon: Clock,
    label: 'Draft'
  },
  scheduled: { 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50 border-blue-200', 
    icon: Calendar,
    label: 'Scheduled'
  },
  active: { 
    color: 'text-emerald-700', 
    bgColor: 'bg-emerald-50 border-emerald-200', 
    icon: Zap,
    label: 'Active'
  },
  paused: { 
    color: 'text-amber-700', 
    bgColor: 'bg-amber-50 border-amber-200', 
    icon: Pause,
    label: 'Paused'
  },
  completed: { 
    color: 'text-violet-700', 
    bgColor: 'bg-violet-50 border-violet-200', 
    icon: CheckCircle,
    label: 'Completed'
  },
}

// Quick action types
interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  actionType: 'navigate' | 'dialog' | 'mutation'
  href?: string
  dialogId?: string
  variant?: 'default' | 'outline' | 'ghost'
  showForStatuses?: string[]
  hideForStatuses?: string[]
}

// All quick actions with status-based visibility
const allQuickActions: QuickAction[] = [
  { 
    id: 'start', 
    label: 'Start Campaign', 
    icon: Play, 
    actionType: 'mutation',
    variant: 'default',
    showForStatuses: ['draft']
  },
  { 
    id: 'resume', 
    label: 'Resume Campaign', 
    icon: Play, 
    actionType: 'mutation',
    variant: 'default',
    showForStatuses: ['paused']
  },
  { 
    id: 'pause', 
    label: 'Pause Campaign', 
    icon: Pause, 
    actionType: 'mutation',
    variant: 'outline',
    showForStatuses: ['active']
  },
  { 
    id: 'complete', 
    label: 'Complete Campaign', 
    icon: CheckCircle, 
    actionType: 'dialog',
    dialogId: 'completeCampaign',
    variant: 'outline',
    hideForStatuses: ['completed', 'draft']
  },
  { 
    id: 'edit', 
    label: 'Edit Campaign', 
    icon: Edit, 
    actionType: 'dialog', 
    dialogId: 'editCampaign',
    hideForStatuses: ['completed']
  },
  { 
    id: 'logActivity', 
    label: 'Log Activity', 
    icon: Phone, 
    actionType: 'dialog', 
    dialogId: 'logActivity' 
  },
  { 
    id: 'duplicate', 
    label: 'Duplicate', 
    icon: Copy, 
    actionType: 'dialog', 
    dialogId: 'duplicateCampaign'
  },
]

interface CampaignMetrics {
  prospects?: number
  contacted?: number
  opened?: number
  responded?: number
  leads?: number
  meetings?: number
  conversionRate?: number
  openRate?: number
  responseRate?: number
}

interface CampaignTargets {
  targetLeads?: number
  targetMeetings?: number
  targetRevenue?: number
}

interface CampaignDates {
  startDate?: string
  endDate?: string
}

interface CampaignSectionSidebarProps {
  campaignId: string
  campaignName: string
  campaignSubtitle?: string
  campaignStatus: string
  counts?: {
    prospects?: number
    leads?: number
    activities?: number
    notes?: number
    documents?: number
    sequences?: number
  }
  metrics?: CampaignMetrics
  targets?: CampaignTargets
  dates?: CampaignDates
  onQuickAction?: (action: QuickAction) => void
  className?: string
}

export function CampaignSectionSidebar({
  campaignId,
  campaignName,
  campaignSubtitle,
  campaignStatus,
  counts = {},
  metrics,
  targets,
  dates,
  onQuickAction,
  className,
}: CampaignSectionSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSection = searchParams.get('section') || 'overview'

  // Calculate campaign journey progress
  const getJourneyStep = (): 'setup' | 'active' | 'converting' | 'complete' => {
    if (campaignStatus === 'draft') return 'setup'
    if (campaignStatus === 'completed') return 'complete'
    if (metrics && metrics.leads && metrics.leads > 0) return 'converting'
    if (campaignStatus === 'active' || campaignStatus === 'paused' || campaignStatus === 'scheduled') return 'active'
    return 'setup'
  }

  const currentJourneyStep = getJourneyStep()

  // Calculate days remaining/elapsed
  const getDaysInfo = () => {
    if (!dates?.startDate || !dates?.endDate) return null
    
    const start = new Date(dates.startDate)
    const end = new Date(dates.endDate)
    const now = new Date()
    
    if (isFuture(start)) {
      const daysUntil = differenceInDays(start, now)
      return { type: 'starts', days: daysUntil, label: `Starts in ${daysUntil}d` }
    }
    
    if (isPast(end)) {
      const daysAgo = differenceInDays(now, end)
      return { type: 'ended', days: daysAgo, label: `Ended ${daysAgo}d ago` }
    }
    
    const daysRemaining = differenceInDays(end, now)
    const totalDays = differenceInDays(end, start)
    const daysPassed = differenceInDays(now, start)
    const percentComplete = totalDays > 0 ? Math.round((daysPassed / totalDays) * 100) : 0
    
    return { 
      type: 'active', 
      days: daysRemaining, 
      label: `${daysRemaining}d remaining`,
      percentComplete 
    }
  }

  const daysInfo = getDaysInfo()

  // Calculate health status
  const getHealthStatus = (): { status: 'excellent' | 'good' | 'fair' | 'poor'; label: string; color: string } => {
    if (!metrics || !targets) {
      return { status: 'fair', label: 'No data', color: 'text-charcoal-500' }
    }

    const leadsProgress = targets.targetLeads ? ((metrics.leads || 0) / targets.targetLeads) * 100 : 0
    const meetingsProgress = targets.targetMeetings ? ((metrics.meetings || 0) / targets.targetMeetings) * 100 : 0
    const avgProgress = (leadsProgress + meetingsProgress) / 2

    if (avgProgress >= 100) return { status: 'excellent', label: 'Exceeding', color: 'text-emerald-600' }
    if (avgProgress >= 75) return { status: 'good', label: 'On Track', color: 'text-blue-600' }
    if (avgProgress >= 50) return { status: 'fair', label: 'Behind', color: 'text-amber-600' }
    return { status: 'poor', label: 'At Risk', color: 'text-red-600' }
  }

  const health = getHealthStatus()

  const buildSectionHref = (sectionId: string) => {
    if (sectionId === 'overview') {
      return `/employee/crm/campaigns/${campaignId}`
    }
    return `/employee/crm/campaigns/${campaignId}?section=${sectionId}`
  }

  const getSectionCount = (sectionId: string): number | undefined => {
    switch (sectionId) {
      case 'sequences': return counts.sequences
      case 'prospects': return counts.prospects
      case 'leads': return counts.leads
      case 'activities': return counts.activities
      case 'documents': return counts.documents
      case 'notes': return counts.notes
      default: return undefined
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    if (action.actionType === 'navigate' && action.href) {
      router.push(action.href.replace(':id', campaignId))
    } else if (onQuickAction) {
      onQuickAction(action)
    }
    
    // Dispatch custom event for dialog actions
    if (action.actionType === 'dialog' && action.dialogId) {
      window.dispatchEvent(
        new CustomEvent('openCampaignDialog', { 
          detail: { dialogId: action.dialogId } 
        })
      )
    }
  }

  // Filter quick actions based on status
  const visibleQuickActions = allQuickActions.filter(action => {
    if (action.showForStatuses && !action.showForStatuses.includes(campaignStatus)) {
      return false
    }
    if (action.hideForStatuses && action.hideForStatuses.includes(campaignStatus)) {
      return false
    }
    return true
  })

  const statusInfo = statusConfig[campaignStatus] || statusConfig.draft
  const StatusIcon = statusInfo.icon

  return (
    <TooltipProvider>
      <aside className={cn(
        'w-64 bg-white border-r border-charcoal-100 flex flex-col flex-shrink-0',
        className
      )}>
        {/* Back Link */}
        <div className="px-4 pt-4 pb-2">
          <Link 
            href="/employee/crm/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Campaigns
          </Link>
        </div>

        {/* Entity Header */}
        <div className="px-4 pb-4 border-b border-charcoal-100">
          <h2 className="font-heading font-semibold text-charcoal-900 text-base leading-tight">
            {campaignName}
          </h2>
          {campaignSubtitle && (
            <p className="text-sm text-charcoal-500 mt-1 capitalize">
              {campaignSubtitle.replace(/_/g, ' ')}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <Badge className={cn('gap-1.5 font-medium border', statusInfo.bgColor, statusInfo.color)}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </Badge>
            {daysInfo && (
              <Badge variant="outline" className="text-xs tabular-nums">
                <Clock className="w-3 h-3 mr-1" />
                {daysInfo.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Campaign Journey */}
        <div className="px-4 py-3 border-b border-charcoal-100 bg-charcoal-50/30">
          <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-2">
            Campaign Journey
          </div>
          <div className="flex items-center justify-between">
            {(['setup', 'active', 'converting', 'complete'] as const).map((step, idx) => {
              const isCompleted = 
                (step === 'setup' && ['active', 'converting', 'complete'].includes(currentJourneyStep)) ||
                (step === 'active' && ['converting', 'complete'].includes(currentJourneyStep)) ||
                (step === 'converting' && currentJourneyStep === 'complete')
              const isCurrent = step === currentJourneyStep
              const isFuture = !isCompleted && !isCurrent

              return (
                <Tooltip key={step}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all',
                          isCompleted && 'bg-emerald-500 border-emerald-500',
                          isCurrent && 'bg-blue-500 border-blue-500 ring-2 ring-blue-200',
                          isFuture && 'bg-charcoal-100 border-charcoal-200'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              isCurrent && 'text-white',
                              isFuture && 'text-charcoal-400'
                            )}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] capitalize',
                          isCurrent && 'font-semibold text-charcoal-900',
                          isCompleted && 'text-emerald-600',
                          isFuture && 'text-charcoal-400'
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="capitalize">{step}</span> stage
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
          {daysInfo && daysInfo.type === 'active' && daysInfo.percentComplete !== undefined && (
            <div className="mt-3">
              <Progress value={daysInfo.percentComplete} className="h-1.5" />
            </div>
          )}
        </div>

        {/* Enhanced Metrics - 4-card Grid */}
        {metrics && (
          <div className="px-4 py-3 border-b border-charcoal-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">
                Performance
              </div>
              {targets && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn('text-xs gap-1', health.color)}>
                      {health.status === 'excellent' && <TrendingUp className="w-3 h-3" />}
                      {health.status === 'good' && <CheckCircle className="w-3 h-3" />}
                      {health.status === 'fair' && <AlertCircle className="w-3 h-3" />}
                      {health.status === 'poor' && <TrendingDown className="w-3 h-3" />}
                      {health.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Campaign health based on targets</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Contacted */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-white rounded-lg border border-charcoal-100 cursor-default">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-0.5">
                      <Mail className="w-3 h-3" />
                      Contacted
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {metrics.contacted || 0}
                      <span className="text-charcoal-400 font-normal text-xs">/{metrics.prospects || 0}</span>
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {metrics.contacted || 0} of {metrics.prospects || 0} contacted
                </TooltipContent>
              </Tooltip>
              
              {/* Opened */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-white rounded-lg border border-charcoal-100 cursor-default">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-0.5">
                      <Mail className="w-3 h-3" />
                      Opened
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {metrics.opened || 0}
                      <span className="text-charcoal-400 font-normal text-xs ml-1">
                        {metrics.openRate ? `${metrics.openRate}%` : '0%'}
                      </span>
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {metrics.openRate || 0}% open rate
                </TooltipContent>
              </Tooltip>

              {/* Responded */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-white rounded-lg border border-charcoal-100 cursor-default">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-0.5">
                      <MessageSquare className="w-3 h-3" />
                      Responded
                    </div>
                    <p className="text-sm font-semibold text-blue-600 tabular-nums">
                      {metrics.responded || 0}
                      <span className="text-charcoal-400 font-normal text-xs ml-1">
                        {metrics.responseRate ? `${metrics.responseRate}%` : '0%'}
                      </span>
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {metrics.responseRate || 0}% response rate
                </TooltipContent>
              </Tooltip>
              
              {/* Leads */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 bg-white rounded-lg border border-charcoal-100 cursor-default">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-0.5">
                      <Target className="w-3 h-3" />
                      Leads
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 tabular-nums">
                      {metrics.leads || 0}
                      {targets?.targetLeads && (
                        <span className="text-charcoal-400 font-normal text-xs">/{targets.targetLeads}</span>
                      )}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {targets?.targetLeads 
                    ? `${metrics.leads || 0} of ${targets.targetLeads} target leads`
                    : `${metrics.leads || 0} leads generated`
                  }
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Progress Bars for Targets */}
            {targets && (targets.targetLeads || targets.targetMeetings) && (
              <div className="mt-3 space-y-2">
                {targets.targetLeads && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-charcoal-500">Leads Target</span>
                      <span className="font-semibold tabular-nums">
                        {Math.round(((metrics.leads || 0) / targets.targetLeads) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={((metrics.leads || 0) / targets.targetLeads) * 100} 
                      className="h-1.5"
                    />
                  </div>
                )}
                {targets.targetMeetings && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-charcoal-500">Meetings Target</span>
                      <span className="font-semibold tabular-nums">
                        {Math.round(((metrics.meetings || 0) / targets.targetMeetings) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={((metrics.meetings || 0) / targets.targetMeetings) * 100} 
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
            Sections
          </div>
          <ul className="space-y-0.5">
            {campaignSections.map((section) => {
              const Icon = section.icon
              const isActive = currentSection === section.id
              const count = getSectionCount(section.id)
              const hasAlert = section.alertOnCount && count && count > 0

              return (
                <li key={section.id}>
                  <Link
                    href={buildSectionHref(section.id)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
                      isActive 
                        ? 'bg-hublot-50 text-hublot-700' 
                        : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-800'
                    )}
                  >
                    <Icon className={cn(
                      'w-4.5 h-4.5 flex-shrink-0 transition-colors',
                      isActive ? 'text-hublot-600' : 'text-charcoal-400 group-hover:text-charcoal-500'
                    )} />
                    <span className={cn(
                      'flex-1 text-sm',
                      isActive && 'font-medium'
                    )}>
                      {section.label}
                    </span>
                    {section.showCount && count !== undefined && (
                      <Badge 
                        variant="secondary"
                        className={cn(
                          'min-w-[22px] h-5 text-xs tabular-nums justify-center',
                          isActive 
                            ? 'bg-hublot-100 text-hublot-700' 
                            : hasAlert 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-charcoal-100 text-charcoal-600'
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-hublot-400" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-3 border-t border-charcoal-100">
          <div className="text-xs font-medium text-charcoal-400 uppercase tracking-wider px-2 mb-2">
            Actions
          </div>
          <div className="space-y-1.5">
            {visibleQuickActions.slice(0, 5).map((action) => {
              const ActionIcon = action.icon
              const isPrimary = action.variant === 'default'
              
              return (
                <Button
                  key={action.id}
                  variant={isPrimary ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 h-9',
                    !isPrimary && 'text-charcoal-600 hover:text-charcoal-800 hover:bg-charcoal-50'
                  )}
                  onClick={() => handleQuickAction(action)}
                >
                  <ActionIcon className="w-4 h-4" />
                  {action.label}
                </Button>
              )
            })}
          </div>
          
          {/* Analytics Link - Always visible */}
          <div className="mt-3 pt-3 border-t border-charcoal-100">
            <Link href={`/employee/crm/campaigns/${campaignId}?section=analytics`}>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9">
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
