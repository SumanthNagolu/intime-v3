'use client'

/**
 * Campaign Journey Step Components
 *
 * These components implement the PCF journey step pattern with checklist-driven
 * workflow progression. Each step corresponds to a phase in the campaign lifecycle.
 *
 * Steps:
 * 1. Setup - Configure campaign settings, goals, and channels
 * 2. Audience - Build and refine prospect list
 * 3. Execute - Launch and monitor outreach sequences
 * 4. Nurture - Follow up with engaged prospects
 * 5. Close - Complete campaign and analyze results
 */

import React, { useMemo, memo } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { useJourneyChecklist, JourneyChecklistItem } from '@/lib/hooks/useJourneyChecklist'
import {
  Settings,
  Target,
  Rocket,
  Heart,
  Flag,
  CheckCircle2,
  Circle,
  Users,
  Mail,
  Linkedin,
  Phone,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  ArrowRight,
  Plus,
  Upload,
  Play,
  Pause,
  BarChart3,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react'

// Types
interface PCFStepProps {
  entityId: string
  entity?: unknown
}

interface Campaign {
  id: string
  name: string
  status: string
  description?: string
  campaignType?: string
  campaign_type?: string
  channels?: string[]
  startDate?: string
  start_date?: string
  endDate?: string
  end_date?: string
  targetLeads?: number
  target_leads?: number
  targetMeetings?: number
  target_meetings?: number
  budgetTotal?: number
  budget_total?: number
  budgetSpent?: number
  budget_spent?: number
  audienceSize?: number
  audience_size?: number
  prospectsContacted?: number
  prospects_contacted?: number
  prospectsResponded?: number
  prospects_responded?: number
  leadsGenerated?: number
  leads_generated?: number
  meetingsBooked?: number
  meetings_booked?: number
  sequences?: Record<string, unknown>
  sequence_template_ids?: string[]
}

/**
 * Dispatch a dialog open event for the Campaign entity
 */
function dispatchCampaignDialog(dialogId: string, campaignId: string) {
  window.dispatchEvent(
    new CustomEvent('openCampaignDialog', {
      detail: { dialogId, campaignId },
    })
  )
}

/**
 * Navigate to a section within the campaign
 */
function navigateToSection(entityId: string, section: string) {
  window.history.pushState(
    {},
    '',
    `/employee/crm/campaigns/${entityId}?mode=sections&section=${section}`
  )
  window.dispatchEvent(new PopStateEvent('popstate'))
}

/**
 * Navigate to next journey step
 */
function navigateToStep(entityId: string, step: string) {
  window.history.pushState(
    {},
    '',
    `/employee/crm/campaigns/${entityId}?mode=journey&step=${step}`
  )
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// ==========================================
// Checklist Item Component
// ==========================================

interface ChecklistItemProps {
  item: JourneyChecklistItem
  onToggle: (id: string) => void
  onAction?: () => void
  actionLabel?: string
}

const ChecklistItemComponent = memo(function ChecklistItemComponent({
  item,
  onToggle,
  onAction,
  actionLabel,
}: ChecklistItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-all duration-300',
        item.completed ? 'bg-green-50/50' : 'bg-charcoal-50/50 hover:bg-charcoal-100/50'
      )}
    >
      <button
        onClick={() => onToggle(item.id)}
        className="flex-shrink-0 mt-0.5 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 rounded"
        aria-label={item.completed ? `Mark "${item.label}" as incomplete` : `Mark "${item.label}" as complete`}
      >
        {item.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-charcoal-400 hover:text-charcoal-600" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium transition-colors',
            item.completed ? 'text-charcoal-500 line-through' : 'text-charcoal-900'
          )}
        >
          {item.label}
        </p>
        {item.description && (
          <p className="text-xs text-charcoal-400 mt-0.5">{item.description}</p>
        )}
      </div>
      {onAction && actionLabel && !item.completed && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onAction}
          className="text-gold-600 hover:text-gold-700 flex-shrink-0 whitespace-nowrap mt-0.5"
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  )
})

// ==========================================
// Step Header Component
// ==========================================

interface StepHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
  progress: number
  status: 'pending' | 'in_progress' | 'completed'
  onNext?: () => void
  nextLabel?: string
  showNextButton?: boolean
}

const StepHeader = memo(function StepHeader({
  icon,
  title,
  description,
  progress,
  status,
  onNext,
  nextLabel = 'Continue',
  showNextButton = true,
}: StepHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300',
            status === 'completed'
              ? 'bg-green-100 text-green-600'
              : status === 'in_progress'
                ? 'bg-gold-100 text-gold-600'
                : 'bg-charcoal-100 text-charcoal-500'
          )}
        >
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-charcoal-900">{title}</h2>
            {status === 'completed' && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          <p className="text-sm text-charcoal-500 mt-1">{description}</p>
          <div className="flex items-center gap-3 mt-3">
            <Progress value={progress} className="w-48 h-2" />
            <span className="text-sm font-medium text-charcoal-600">{progress}%</span>
          </div>
        </div>
      </div>
      {showNextButton && onNext && progress >= 80 && (
        <Button onClick={onNext} className="flex-shrink-0">
          {nextLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  )
})

// ==========================================
// Step 1: Setup
// ==========================================

export function CampaignSetupStepPCF({ entityId, entity }: PCFStepProps) {
  const campaign = entity as Campaign | undefined

  // Checklist items for setup step
  const checklistItems: JourneyChecklistItem[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Campaign name defined',
        description: 'Give your campaign a descriptive name',
        completed: !!campaign?.name && campaign.name !== 'Untitled Campaign',
      },
      {
        id: 'type',
        label: 'Campaign type selected',
        description: 'Choose outbound, inbound, nurture, or event',
        completed: !!(campaign?.campaignType || campaign?.campaign_type),
      },
      {
        id: 'description',
        label: 'Goal description added',
        description: 'Describe what you want to achieve',
        completed: !!(campaign?.description && campaign.description.length > 10),
      },
      {
        id: 'channels',
        label: 'Channels selected',
        description: 'Choose Email, LinkedIn, Phone, or SMS',
        completed: !!(campaign?.channels && campaign.channels.length > 0),
      },
      {
        id: 'targets',
        label: 'Target metrics set',
        description: 'Set lead and meeting goals',
        completed: !!(
          (campaign?.targetLeads || campaign?.target_leads) &&
          (campaign?.targetMeetings || campaign?.target_meetings)
        ),
      },
      {
        id: 'dates',
        label: 'Start and end dates configured',
        description: 'Define the campaign timeline',
        completed: !!(
          (campaign?.startDate || campaign?.start_date) &&
          (campaign?.endDate || campaign?.end_date)
        ),
      },
      {
        id: 'budget',
        label: 'Budget allocated',
        description: 'Set your campaign budget',
        completed: !!(campaign?.budgetTotal || campaign?.budget_total),
      },
    ],
    [campaign]
  )

  const { items, toggleItem, progress } = useJourneyChecklist(
    `campaign-${entityId}-setup`,
    checklistItems
  )

  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'

  const channels = campaign?.channels || []
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepHeader
        icon={<Settings className="w-6 h-6" />}
        title="Campaign Setup"
        description="Configure your campaign settings, goals, and channels"
        progress={progress}
        status={status}
        onNext={() => navigateToStep(entityId, 'audience')}
        nextLabel="Build Audience"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Checklist */}
        <Card className="flex-1 min-w-0 lg:min-w-[320px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
              Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onAction={
                    item.id === 'name' || item.id === 'type' || item.id === 'description'
                      ? () => dispatchCampaignDialog('edit', entityId)
                      : item.id === 'channels'
                        ? () => dispatchCampaignDialog('editChannels', entityId)
                        : item.id === 'targets'
                          ? () => dispatchCampaignDialog('editTargets', entityId)
                          : item.id === 'dates'
                            ? () => dispatchCampaignDialog('editDates', entityId)
                            : item.id === 'budget'
                              ? () => dispatchCampaignDialog('editBudget', entityId)
                              : undefined
                  }
                  actionLabel={!item.completed ? 'Configure' : undefined}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Summary */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-charcoal-900">{campaign.name}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Type</p>
                <p className="font-medium text-charcoal-900 capitalize">
                  {campaign.campaignType || campaign.campaign_type || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Channels</p>
                <div className="flex gap-2 flex-wrap">
                  {channels.length > 0 ? (
                    channels.map((channel: string) => (
                      <span
                        key={channel}
                        className="flex items-center gap-1 px-2 py-1 bg-charcoal-50 rounded text-xs text-charcoal-600"
                      >
                        {channelIcons[channel]}
                        {channel}
                      </span>
                    ))
                  ) : (
                    <span className="text-charcoal-400 text-sm">Not configured</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gold-500" />
                  <span className="text-sm text-charcoal-600">Lead Goal</span>
                </div>
                <span className="font-medium text-charcoal-900">
                  {campaign.targetLeads || campaign.target_leads || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-charcoal-600">Meeting Goal</span>
                </div>
                <span className="font-medium text-charcoal-900">
                  {campaign.targetMeetings || campaign.target_meetings || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-charcoal-600">Budget</span>
                </div>
                <span className="font-medium text-charcoal-900">
                  {campaign.budgetTotal || campaign.budget_total
                    ? `$${(campaign.budgetTotal || campaign.budget_total || 0).toLocaleString()}`
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Start Date</span>
                <span className="font-medium text-charcoal-900">
                  {campaign.startDate || campaign.start_date
                    ? format(new Date(campaign.startDate || campaign.start_date!), 'MMM d, yyyy')
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">End Date</span>
                <span className="font-medium text-charcoal-900">
                  {campaign.endDate || campaign.end_date
                    ? format(new Date(campaign.endDate || campaign.end_date!), 'MMM d, yyyy')
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-gold-50 to-amber-50 border-gold-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-gold-600" />
              <div>
                <p className="font-medium text-charcoal-900">Ready to build your audience?</p>
                <p className="text-sm text-charcoal-500">
                  Complete the setup checklist to proceed to audience building
                </p>
              </div>
            </div>
            <Button
              onClick={() => dispatchCampaignDialog('edit', entityId)}
              variant="outline"
              className="border-gold-300 text-gold-700 hover:bg-gold-100"
            >
              Edit Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// Step 2: Audience
// ==========================================

export function CampaignAudienceStepPCF({ entityId, entity }: PCFStepProps) {
  const campaign = entity as Campaign | undefined

  // Query prospects count
  const prospectsQuery = trpc.crm.campaigns.getProspects.useQuery(
    { campaignId: entityId, limit: 1 },
    { enabled: !!entityId }
  )

  const audienceSize = campaign?.audienceSize || campaign?.audience_size || 0
  const prospectCount = prospectsQuery.data?.total || audienceSize

  const checklistItems: JourneyChecklistItem[] = useMemo(
    () => [
      {
        id: 'criteria',
        label: 'Target audience criteria defined',
        description: 'Define your ideal customer profile',
        completed: prospectCount > 0, // If prospects exist, criteria was likely defined
      },
      {
        id: 'prospects',
        label: 'Prospects imported or added',
        description: `Minimum 10 prospects (currently ${prospectCount})`,
        completed: prospectCount >= 10,
      },
      {
        id: 'duplicates',
        label: 'Duplicates removed',
        description: 'Ensure no duplicate contacts in the list',
        completed: prospectCount >= 10, // Assume deduplication happens during import
      },
      {
        id: 'validation',
        label: 'Invalid contacts cleaned',
        description: 'Remove bounced emails and bad phone numbers',
        completed: false, // Manual check
      },
      {
        id: 'segment',
        label: 'Segment assigned',
        description: 'Categorize prospects for targeted messaging',
        completed: false, // Manual check
      },
    ],
    [prospectCount]
  )

  const { items, toggleItem, progress } = useJourneyChecklist(
    `campaign-${entityId}-audience`,
    checklistItems
  )

  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepHeader
        icon={<Users className="w-6 h-6" />}
        title="Build Audience"
        description="Import prospects and build your target list"
        progress={progress}
        status={status}
        onNext={() => navigateToStep(entityId, 'execute')}
        nextLabel="Configure Sequence"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Checklist */}
        <Card className="flex-1 min-w-0 lg:min-w-[320px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
              Audience Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onAction={
                    item.id === 'prospects'
                      ? () => dispatchCampaignDialog('importProspects', entityId)
                      : item.id === 'duplicates'
                        ? () => navigateToSection(entityId, 'prospects')
                        : undefined
                  }
                  actionLabel={
                    item.id === 'prospects' && !item.completed
                      ? 'Import'
                      : item.id === 'duplicates' && !item.completed
                        ? 'Review'
                        : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Stats */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Audience Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-blue-600" />
                </div>
                <p className="text-4xl font-bold text-charcoal-900">{prospectCount.toLocaleString()}</p>
                <p className="text-sm text-charcoal-500 mt-1">Total Prospects</p>
                {prospectCount < 10 && (
                  <p className="text-xs text-amber-600 mt-2">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Add at least {10 - prospectCount} more prospects
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => dispatchCampaignDialog('addProspect', entityId)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Prospect
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => dispatchCampaignDialog('importProspects', entityId)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from CSV
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigateToSection(entityId, 'prospects')}
              >
                <Users className="w-4 h-4 mr-2" />
                View All Prospects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Step 3: Execute
// ==========================================

export function CampaignExecuteStepPCF({ entityId, entity }: PCFStepProps) {
  const campaign = entity as Campaign | undefined

  const hasSequences = !!(
    campaign?.sequences &&
    Object.keys(campaign.sequences).length > 0
  ) || !!(campaign?.sequence_template_ids && campaign.sequence_template_ids.length > 0)

  const isActive = campaign?.status === 'active'
  const isPaused = campaign?.status === 'paused'
  const contacted = campaign?.prospectsContacted || campaign?.prospects_contacted || 0
  const audienceSize = campaign?.audienceSize || campaign?.audience_size || 0

  const checklistItems: JourneyChecklistItem[] = useMemo(
    () => [
      {
        id: 'sequence',
        label: 'Email sequence configured',
        description: 'Set up your outreach email sequence',
        completed: hasSequences,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn automation set (if applicable)',
        description: 'Configure LinkedIn connection requests and messages',
        completed: hasSequences, // Simplified - would check specific channel
      },
      {
        id: 'first-batch',
        label: 'First batch sent',
        description: 'Send the first round of outreach',
        completed: contacted > 0,
      },
      {
        id: 'tracking',
        label: 'Tracking enabled',
        description: 'Email opens and link clicks being tracked',
        completed: isActive || contacted > 0,
      },
      {
        id: 'monitoring',
        label: 'Response monitoring active',
        description: 'Replies and engagement are being captured',
        completed: isActive,
      },
    ],
    [hasSequences, contacted, isActive]
  )

  const { items, toggleItem, progress } = useJourneyChecklist(
    `campaign-${entityId}-execute`,
    checklistItems
  )

  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const contactRate = audienceSize > 0 ? ((contacted / audienceSize) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Paused Banner */}
      {isPaused && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Pause className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Campaign Paused</p>
                  <p className="text-sm text-amber-700">
                    All outreach activities are on hold. Resume to continue execution.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => dispatchCampaignDialog('resume', entityId)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Header */}
      <StepHeader
        icon={<Rocket className="w-6 h-6" />}
        title="Execute Outreach"
        description="Launch and monitor your outreach sequences"
        progress={progress}
        status={status}
        onNext={isPaused ? undefined : () => navigateToStep(entityId, 'nurture')}
        nextLabel="Nurture Leads"
        showNextButton={!isPaused}
      />

      <div className={cn(
        'flex flex-col lg:flex-row gap-6',
        isPaused && 'opacity-60 pointer-events-none'
      )}>
        {/* Checklist */}
        <Card className="flex-1 min-w-0 lg:min-w-[320px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
              Execution Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={isPaused ? () => {} : toggleItem}
                  onAction={
                    isPaused ? undefined :
                    item.id === 'sequence'
                      ? () => navigateToSection(entityId, 'sequence')
                      : item.id === 'first-batch'
                        ? () => dispatchCampaignDialog('start', entityId)
                        : undefined
                  }
                  actionLabel={
                    isPaused ? undefined :
                    item.id === 'sequence' && !item.completed
                      ? 'Configure'
                      : item.id === 'first-batch' && !item.completed
                        ? 'Start Campaign'
                        : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execution Stats */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Execution Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Status</span>
                <Badge
                  className={cn(
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : isPaused
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {isActive ? 'Active' : isPaused ? 'Paused' : 'Not Started'}
                </Badge>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-charcoal-600">Contacted</span>
                  <span className="font-medium text-charcoal-900">
                    {contacted.toLocaleString()} / {audienceSize.toLocaleString()} ({contactRate}%)
                  </span>
                </div>
                <Progress value={Number(contactRate)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isPaused && (
                <Button
                  className="w-full justify-start pointer-events-auto"
                  onClick={() => dispatchCampaignDialog('resume', entityId)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Campaign
                </Button>
              )}
              {!isActive && !isPaused && campaign?.status !== 'completed' && (
                <Button
                  className="w-full justify-start"
                  onClick={() => dispatchCampaignDialog('start', entityId)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Campaign
                </Button>
              )}
              {isActive && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => dispatchCampaignDialog('pause', entityId)}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Campaign
                </Button>
              )}
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={isPaused}
                onClick={() => navigateToSection(entityId, 'sequence')}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Sequence
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled={isPaused}
                onClick={() => navigateToSection(entityId, 'analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Step 4: Nurture
// ==========================================

export function CampaignNurtureStepPCF({ entityId, entity }: PCFStepProps) {
  const campaign = entity as Campaign | undefined

  const responded = campaign?.prospectsResponded || campaign?.prospects_responded || 0
  const leads = campaign?.leadsGenerated || campaign?.leads_generated || 0
  const meetings = campaign?.meetingsBooked || campaign?.meetings_booked || 0

  const checklistItems: JourneyChecklistItem[] = useMemo(
    () => [
      {
        id: 'responded',
        label: 'Responded prospects identified',
        description: `${responded} prospects have responded`,
        completed: responded > 0,
      },
      {
        id: 'tasks',
        label: 'Follow-up tasks created',
        description: 'Create tasks to follow up with engaged prospects',
        completed: false, // Would check tasks table
      },
      {
        id: 'meetings',
        label: 'Meetings scheduled',
        description: `${meetings} meetings booked`,
        completed: meetings > 0,
      },
      {
        id: 'qualified',
        label: 'Leads qualified',
        description: `${leads} leads generated and qualified`,
        completed: leads > 0,
      },
      {
        id: 'handoff',
        label: 'Handoff to sales completed',
        description: 'Qualified leads assigned to sales team',
        completed: false, // Would check lead assignments
      },
    ],
    [responded, leads, meetings]
  )

  const { items, toggleItem, progress } = useJourneyChecklist(
    `campaign-${entityId}-nurture`,
    checklistItems
  )

  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepHeader
        icon={<Heart className="w-6 h-6" />}
        title="Nurture Prospects"
        description="Follow up with engaged prospects and qualify leads"
        progress={progress}
        status={status}
        onNext={() => navigateToStep(entityId, 'close')}
        nextLabel="Complete Campaign"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Checklist */}
        <Card className="flex-1 min-w-0 lg:min-w-[320px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
              Nurture Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onAction={
                    item.id === 'responded'
                      ? () => navigateToSection(entityId, 'prospects')
                      : item.id === 'tasks'
                        ? () => dispatchCampaignDialog('logActivity', entityId)
                        : item.id === 'qualified'
                          ? () => navigateToSection(entityId, 'leads')
                          : undefined
                  }
                  actionLabel={
                    item.id === 'responded' && !item.completed
                      ? 'View'
                      : item.id === 'tasks' && !item.completed
                        ? 'Create Task'
                        : item.id === 'qualified' && !item.completed
                          ? 'View Leads'
                          : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nurture Stats */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-pink-600">{responded}</p>
                  <p className="text-xs text-charcoal-500">Responded</p>
                </div>
                <div className="text-center p-3 bg-gold-50 rounded-lg">
                  <p className="text-2xl font-bold text-gold-600">{leads}</p>
                  <p className="text-xs text-charcoal-500">Leads</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{meetings}</p>
                  <p className="text-xs text-charcoal-500">Meetings</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {responded > 0 ? ((leads / responded) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-xs text-charcoal-500">Qualification Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigateToSection(entityId, 'leads')}
              >
                <Target className="w-4 h-4 mr-2" />
                View Leads
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => dispatchCampaignDialog('logActivity', entityId)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigateToSection(entityId, 'activities')}
              >
                <Clock className="w-4 h-4 mr-2" />
                View Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// Step 5: Close
// ==========================================

export function CampaignCloseStepPCF({ entityId, entity }: PCFStepProps) {
  const campaign = entity as Campaign | undefined

  const isCompleted = campaign?.status === 'completed'
  const leads = campaign?.leadsGenerated || campaign?.leads_generated || 0
  const meetings = campaign?.meetingsBooked || campaign?.meetings_booked || 0
  const budgetSpent = campaign?.budgetSpent || campaign?.budget_spent || 0
  const targetLeads = campaign?.targetLeads || campaign?.target_leads || 0
  const targetMeetings = campaign?.targetMeetings || campaign?.target_meetings || 0

  const checklistItems: JourneyChecklistItem[] = useMemo(
    () => [
      {
        id: 'sequences',
        label: 'All sequences completed',
        description: 'All outreach sequences have finished',
        completed: isCompleted,
      },
      {
        id: 'metrics',
        label: 'Final metrics captured',
        description: 'All campaign performance data recorded',
        completed: isCompleted,
      },
      {
        id: 'roi',
        label: 'ROI calculated',
        description: leads > 0 && budgetSpent > 0
          ? `$${(budgetSpent / leads).toFixed(0)} cost per lead`
          : 'Calculate return on investment',
        completed: leads > 0 && budgetSpent > 0,
      },
      {
        id: 'learnings',
        label: 'Learnings documented',
        description: 'Record what worked and what to improve',
        completed: false, // Would check notes
      },
      {
        id: 'archive',
        label: 'Archive decision made',
        description: 'Decide to archive or duplicate the campaign',
        completed: isCompleted,
      },
    ],
    [isCompleted, leads, budgetSpent]
  )

  const { items, toggleItem, progress } = useJourneyChecklist(
    `campaign-${entityId}-close`,
    checklistItems
  )

  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Goal achievement
  const leadsAchieved = targetLeads > 0 ? (leads / targetLeads) * 100 : 0
  const meetingsAchieved = targetMeetings > 0 ? (meetings / targetMeetings) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepHeader
        icon={<Flag className="w-6 h-6" />}
        title="Complete Campaign"
        description="Analyze results and document learnings"
        progress={progress}
        status={status}
        showNextButton={false}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Checklist */}
        <Card className="flex-1 min-w-0 lg:min-w-[320px] bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-500" />
              Completion Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <ChecklistItemComponent
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onAction={
                    item.id === 'learnings'
                      ? () => dispatchCampaignDialog('logActivity', entityId)
                      : item.id === 'archive' && !isCompleted
                        ? () => dispatchCampaignDialog('complete', entityId)
                        : undefined
                  }
                  actionLabel={
                    item.id === 'learnings' && !item.completed
                      ? 'Add Note'
                      : item.id === 'archive' && !isCompleted
                        ? 'Complete Campaign'
                        : undefined
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final Stats */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-4">
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Goal Achievement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-charcoal-600">Lead Goal</span>
                  <span className="font-medium">
                    {leads} / {targetLeads || '—'}
                    {targetLeads > 0 && (
                      <span
                        className={cn(
                          'ml-2',
                          leadsAchieved >= 100 ? 'text-green-600' : 'text-amber-600'
                        )}
                      >
                        ({leadsAchieved.toFixed(0)}%)
                      </span>
                    )}
                  </span>
                </div>
                {targetLeads > 0 && (
                  <Progress
                    value={Math.min(leadsAchieved, 100)}
                    className={cn('h-2', leadsAchieved >= 100 ? '[&>div]:bg-green-500' : '')}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-charcoal-600">Meeting Goal</span>
                  <span className="font-medium">
                    {meetings} / {targetMeetings || '—'}
                    {targetMeetings > 0 && (
                      <span
                        className={cn(
                          'ml-2',
                          meetingsAchieved >= 100 ? 'text-green-600' : 'text-amber-600'
                        )}
                      >
                        ({meetingsAchieved.toFixed(0)}%)
                      </span>
                    )}
                  </span>
                </div>
                {targetMeetings > 0 && (
                  <Progress
                    value={Math.min(meetingsAchieved, 100)}
                    className={cn('h-2', meetingsAchieved >= 100 ? '[&>div]:bg-green-500' : '')}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ROI Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Budget Spent</span>
                <span className="font-medium text-charcoal-900">
                  ${budgetSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Cost per Lead</span>
                <span className="font-medium text-charcoal-900">
                  {leads > 0 ? `$${(budgetSpent / leads).toFixed(0)}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Cost per Meeting</span>
                <span className="font-medium text-charcoal-900">
                  {meetings > 0 ? `$${(budgetSpent / meetings).toFixed(0)}` : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isCompleted && (
                <Button
                  className="w-full justify-start"
                  onClick={() => dispatchCampaignDialog('complete', entityId)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Campaign
                </Button>
              )}
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => dispatchCampaignDialog('duplicate', entityId)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Duplicate Campaign
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigateToSection(entityId, 'analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Export all step components
export const campaignJourneySteps = {
  setup: CampaignSetupStepPCF,
  audience: CampaignAudienceStepPCF,
  execute: CampaignExecuteStepPCF,
  nurture: CampaignNurtureStepPCF,
  close: CampaignCloseStepPCF,
}
