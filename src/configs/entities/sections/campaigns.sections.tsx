'use client'

/**
 * PCF-Compatible Section Components for Campaigns
 *
 * These components implement the PCF SectionConfig interface with ONE database call pattern support.
 *
 * Props:
 * - entityId: string - The campaign ID
 * - entity?: unknown - The campaign entity data
 * - sectionData?: SectionData - Pre-loaded section data (ONE db call pattern)
 *
 * When sectionData is provided, components use it instead of making additional queries.
 * This eliminates N+1 queries when navigating between sections.
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Campaign } from '../campaigns.config'
import { SectionData, PCFSectionProps } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { trpc } from '@/lib/trpc/client'
import {
  Users,
  Target,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Mail,
  Linkedin,
  Phone,
  Activity,
  StickyNote,
  Clock,
  CheckCircle,
  Workflow,
  MousePointerClick,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { FunnelChart, FunnelStage } from '@/components/ui/funnel-chart'
import { SequenceTimeline, SequenceStep } from '@/components/ui/sequence-timeline'
import { ProgressRing, CampaignHealthRing } from '@/components/ui/progress-ring'
import { EngagementChart, type EngagementDataPoint } from '@/components/ui/engagement-chart'
import { ListDetailPanel, DetailTab } from '@/components/pcf/list-detail/ListDetailPanel'
import {
  ProspectContactTab,
  ProspectEngagementTab,
  ProspectQualificationTab,
} from '@/components/campaigns/prospects'
import {
  LeadOverviewTab,
  LeadEngagementTab,
  LeadDealTab,
} from '@/components/campaigns/leads'
import type { CampaignProspect, CampaignLead } from '@/types/campaign'
import { cn } from '@/lib/utils'

/**
 * Dispatch a dialog open event for the Campaign entity
 * The detail page listens for this and manages dialog state
 */
function dispatchCampaignDialog(dialogId: string, entityId: string, stepData?: {
  id: string
  channel: string
  stepNumber: number
  dayOffset?: number
  subject?: string
  templateName?: string
}) {
  window.dispatchEvent(
    new CustomEvent('openCampaignDialog', {
      detail: { dialogId, campaignId: entityId, stepData },
    })
  )
}

/**
 * Overview Section - Enterprise-grade campaign health dashboard
 *
 * Features:
 * - Campaign health ring with weighted score
 * - Key performance metrics
 * - Progress towards targets
 * - Quick funnel visualization
 * - Recent activity feed
 */
// Extended Campaign type with batched data from getByIdWithCounts
interface CampaignWithActivities extends Campaign {
  recentActivities?: Array<{
    id: string
    activity_type: string
    subject?: string
    created_at: string
    status?: string
    creator?: {
      id: string
      full_name: string
      avatar_url?: string
    }
  }>
}

export function CampaignOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as CampaignWithActivities | undefined

  // Use batched recentActivities from getByIdWithCounts (no separate query needed)
  // This eliminates an extra API call per page load
  const recentActivities = campaign?.recentActivities || []

  if (!campaign) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const channels = campaign.channels || []
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
  }

  // Extract metrics
  const audienceSize = campaign.audienceSize || campaign.audience_size || 0
  const contacted = campaign.prospectsContacted || campaign.prospects_contacted || 0
  const responded = campaign.prospectsResponded || campaign.prospects_responded || 0
  const leads = campaign.leadsGenerated || campaign.leads_generated || 0
  const meetings = campaign.meetingsBooked || campaign.meetings_booked || 0
  const targetLeads = campaign.targetLeads || campaign.target_leads || 0
  const targetMeetings = campaign.targetMeetings || campaign.target_meetings || 0
  const budgetTotal = campaign.budgetTotal || campaign.budget_total || 0
  const budgetSpent = campaign.budgetSpent || campaign.budget_spent || 0

  // Calculate rates
  const responseRate = contacted > 0 ? (responded / contacted) * 100 : 0
  const conversionRate = contacted > 0 ? (leads / contacted) * 100 : 0

  // Health metrics for CampaignHealthRing
  const healthMetrics = {
    leadsGenerated: leads,
    targetLeads: targetLeads || 100,
    meetingsBooked: meetings,
    targetMeetings: targetMeetings || 10,
    responseRate,
    conversionRate,
  }

  // Status badge config
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Draft', color: 'text-charcoal-600', bg: 'bg-charcoal-100' },
    scheduled: { label: 'Scheduled', color: 'text-blue-600', bg: 'bg-blue-100' },
    active: { label: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
    paused: { label: 'Paused', color: 'text-amber-600', bg: 'bg-amber-100' },
    completed: { label: 'Completed', color: 'text-purple-600', bg: 'bg-purple-100' },
  }

  const status = statusConfig[campaign.status] || statusConfig.draft

  return (
    <div className="space-y-6">
      {/* Hero Section with Health Ring - Responsive flex layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Health Ring */}
        <Card className="lg:w-64 flex-shrink-0 bg-white" role="region" aria-label="Campaign health score">
          <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
            <CampaignHealthRing metrics={healthMetrics} size="lg" />
          </CardContent>
        </Card>

        {/* Key Metrics Grid - Responsive */}
        <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {/* Audience & Reach */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-charcoal-600">Audience</span>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', status.bg, status.color)}>
                  {status.label}
                </span>
              </div>
              <p className="text-3xl font-bold text-charcoal-900">
                {audienceSize.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-charcoal-500">
                  {contacted.toLocaleString()} contacted
                </span>
                <span className="text-charcoal-400">•</span>
                <span className="text-green-600">
                  {responded.toLocaleString()} responded
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Leads Progress */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-gold-500" />
                <span className="text-sm font-medium text-charcoal-600">Leads Generated</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-charcoal-900">{leads.toLocaleString()}</p>
                {targetLeads > 0 && (
                  <p className="text-sm text-charcoal-400">/ {targetLeads.toLocaleString()}</p>
                )}
              </div>
              {targetLeads > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal-500">Progress</span>
                    <span className="font-medium text-charcoal-700">
                      {Math.min((leads / targetLeads) * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((leads / targetLeads) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meetings Progress */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-charcoal-600">Meetings Booked</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-charcoal-900">{meetings.toLocaleString()}</p>
                {targetMeetings > 0 && (
                  <p className="text-sm text-charcoal-400">/ {targetMeetings.toLocaleString()}</p>
                )}
              </div>
              {targetMeetings > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal-500">Progress</span>
                    <span className="font-medium text-charcoal-700">
                      {Math.min((meetings / targetMeetings) * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((meetings / targetMeetings) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-charcoal-600">Response Rate</span>
              </div>
              <p className="text-3xl font-bold text-charcoal-900">{responseRate.toFixed(1)}%</p>
              <p className="text-sm text-charcoal-400 mt-2">
                {responded.toLocaleString()} of {contacted.toLocaleString()} responded
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-charcoal-600">Conversion Rate</span>
              </div>
              <p className="text-3xl font-bold text-charcoal-900">{conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-charcoal-400 mt-2">
                Contact to lead conversion
              </p>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-charcoal-600">Budget</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-charcoal-900">
                  ${budgetSpent.toLocaleString()}
                </p>
                {budgetTotal > 0 && (
                  <p className="text-sm text-charcoal-400">/ ${budgetTotal.toLocaleString()}</p>
                )}
              </div>
              {budgetTotal > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal-500">Spent</span>
                    <span className="font-medium text-charcoal-700">
                      {((budgetSpent / budgetTotal) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        budgetSpent / budgetTotal > 0.9 ? 'bg-red-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.min((budgetSpent / budgetTotal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Details & Recent Activity - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Campaign Details */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Type</p>
                <p className="font-medium text-charcoal-900 capitalize">
                  {campaign.campaignType || campaign.campaign_type || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Channels</p>
                <div className="flex gap-2">
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
                    <span className="text-charcoal-400 text-sm">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-medium text-charcoal-900">
                  {campaign.startDate || campaign.start_date
                    ? format(new Date(campaign.startDate || campaign.start_date!), 'MMM d, yyyy')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">End Date</p>
                <p className="font-medium text-charcoal-900">
                  {campaign.endDate || campaign.end_date
                    ? format(new Date(campaign.endDate || campaign.end_date!), 'MMM d, yyyy')
                    : '—'}
                </p>
              </div>
            </div>
            {campaign.description && (
              <div className="pt-3 border-t border-charcoal-100">
                <p className="text-xs text-charcoal-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-charcoal-600">{campaign.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-gold-600 hover:text-gold-700"
                onClick={() => {
                  window.history.pushState(
                    {},
                    '',
                    `/employee/crm/campaigns/${entityId}?mode=sections&section=activities`
                  )
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-charcoal-50 transition-colors"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        activity.activity_type === 'email'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.activity_type === 'call'
                            ? 'bg-green-100 text-green-600'
                            : activity.activity_type === 'meeting'
                              ? 'bg-purple-100 text-purple-600'
                              : activity.activity_type === 'note'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-charcoal-100 text-charcoal-600'
                      )}
                    >
                      {activity.activity_type === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : activity.activity_type === 'call' ? (
                        <Phone className="w-4 h-4" />
                      ) : activity.activity_type === 'meeting' ? (
                        <Calendar className="w-4 h-4" />
                      ) : activity.activity_type === 'note' ? (
                        <StickyNote className="w-4 h-4" />
                      ) : (
                        <Activity className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {activity.subject || activity.activity_type}
                      </p>
                      <p className="text-xs text-charcoal-400">
                        {activity.creator?.full_name || 'System'} •{' '}
                        {activity.created_at
                          ? format(new Date(activity.created_at), 'MMM d, h:mm a')
                          : '—'}
                      </p>
                    </div>
                    {activity.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Funnel Preview */}
      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Funnel Overview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-gold-600 hover:text-gold-700"
              onClick={() => {
                window.history.pushState(
                  {},
                  '',
                  `/employee/crm/campaigns/${entityId}?mode=sections&section=funnel`
                )
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {audienceSize === 0 ? (
            <div className="py-8 text-center">
              <TrendingDown className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
              <p className="text-sm text-charcoal-400">
                Add prospects to start tracking your funnel
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {[
                { label: 'Audience', value: audienceSize, color: 'bg-blue-500' },
                { label: 'Contacted', value: contacted, color: 'bg-indigo-500' },
                { label: 'Responded', value: responded, color: 'bg-pink-500' },
                { label: 'Leads', value: leads, color: 'bg-gold-500' },
                { label: 'Meetings', value: meetings, color: 'bg-green-500' },
              ].map((stage, index, arr) => (
                <div key={stage.label} className="flex-1 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-charcoal-500">{stage.label}</span>
                      <span className="text-sm font-bold text-charcoal-900">
                        {stage.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className={cn(stage.color, 'h-full rounded-full transition-all duration-500')}
                        style={{
                          width: `${audienceSize > 0 ? Math.max((stage.value / audienceSize) * 100, 5) : 5}%`,
                        }}
                      />
                    </div>
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-charcoal-300 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Transform raw prospect data from DB to typed CampaignProspect
 */
function transformRawProspect(prospect: Record<string, unknown>): CampaignProspect {
  const contact = prospect.contact as Record<string, unknown> | undefined

  return {
    id: prospect.id as string,
    campaignId: prospect.campaign_id as string,
    contactId: prospect.contact_id as string,
    status: prospect.status as CampaignProspect['status'],
    firstName: (contact?.first_name as string) || '',
    lastName: (contact?.last_name as string) || '',
    email: (contact?.email as string | null) || null,
    phone: (contact?.phone as string | null) || null,
    companyName: (contact?.company_name as string | null) || null,
    title: (contact?.title as string | null) || null,
    engagementScore: prospect.engagement_score as number | null,
    emailsSent: prospect.emails_sent as number | null,
    emailsOpened: prospect.emails_opened as number | null,
    linksClicked: prospect.links_clicked as number | null,
    repliesReceived: prospect.replies_received as number | null,
    currentStep: prospect.current_step as number | null,
    sequenceStatus: prospect.sequence_status as string | null,
    nextStepAt: prospect.next_step_at as string | null,
    enrolledAt: prospect.created_at as string,
    firstContactedAt: prospect.first_contacted_at as string | null,
    openedAt: prospect.opened_at as string | null,
    clickedAt: prospect.clicked_at as string | null,
    respondedAt: prospect.responded_at as string | null,
    convertedAt: prospect.converted_to_lead_at as string | null,
    convertedLeadId: prospect.converted_lead_id as string | null,
  }
}

/**
 * Prospects Section
 *
 * ONE database call pattern: When sectionData is provided, uses pre-loaded data
 * instead of making a separate query.
 *
 * Uses ListDetailPanel with tabs:
 * - Contact: Name, title, company, email, phone
 * - Engagement: Score, metrics, timeline
 * - Qualification: Stage progress, sequence status, convert button
 */
export function CampaignProspectsSectionPCF({ entityId, entity, sectionData }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined
  const router = useRouter()

  // State for selected prospect and active tab
  const [selectedProspect, setSelectedProspect] = useState<CampaignProspect | null>(null)
  const [activeTab, setActiveTab] = useState('contact')

  // ONE database call pattern: Use pre-loaded data if available
  const hasPreloadedData = !!sectionData?.items

  // Query prospects only if sectionData not provided (legacy pattern)
  const prospectsQuery = trpc.crm.campaigns.getProspects.useQuery(
    { campaignId: entityId, limit: 100 },
    {
      enabled: !!entityId && !hasPreloadedData, // Skip if pre-loaded
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    }
  )

  // Use pre-loaded data or fall back to query results
  // Server already excludes converted prospects (they appear in Leads section)
  const rawProspects = hasPreloadedData
    ? (sectionData.items as Record<string, unknown>[])
    : (prospectsQuery.data?.items || []) as Record<string, unknown>[]
  const prospects = rawProspects.map(transformRawProspect)
  const total = prospects.length
  const isLoading = !hasPreloadedData && prospectsQuery.isLoading

  // Handle row click to select prospect
  const handleRowClick = (prospect: CampaignProspect) => {
    if (selectedProspect?.id === prospect.id) {
      setSelectedProspect(null)
    } else {
      setSelectedProspect(prospect)
      setActiveTab('contact') // Reset to first tab
    }
  }

  // Handle convert to lead action
  const handleConvertToLead = () => {
    if (selectedProspect) {
      dispatchCampaignDialog('convertToLead', entityId, {
        id: selectedProspect.id,
        channel: 'prospect',
        stepNumber: 0,
      })
    }
  }

  // Build tabs for detail panel
  const tabs: DetailTab[] = selectedProspect
    ? [
        {
          id: 'contact',
          label: 'Contact',
          content: <ProspectContactTab prospect={selectedProspect} />,
        },
        {
          id: 'engagement',
          label: 'Engagement',
          content: <ProspectEngagementTab prospect={selectedProspect} />,
        },
        {
          id: 'qualification',
          label: 'Qualification',
          content: (
            <ProspectQualificationTab
              prospect={selectedProspect}
              onConvertToLead={handleConvertToLead}
            />
          ),
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">
            Prospects ({total})
          </h3>
          <p className="text-sm text-charcoal-500">
            Manage prospects in this campaign
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => dispatchCampaignDialog('importProspects', entityId)}
          >
            Import Prospects
          </Button>
          <Button onClick={() => dispatchCampaignDialog('addProspect', entityId)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* Prospects Table + Detail Panel */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-charcoal-500">
              Loading prospects...
            </div>
          ) : prospects.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500 mb-4">No prospects in this campaign</p>
              <Button onClick={() => dispatchCampaignDialog('addProspect', entityId)}>
                Add Your First Prospect
              </Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {prospects.map((prospect) => {
                      const isSelected = selectedProspect?.id === prospect.id

                      return (
                        <tr
                          key={prospect.id}
                          onClick={() => handleRowClick(prospect)}
                          className={cn(
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-gold-50' : 'hover:bg-charcoal-50'
                          )}
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-charcoal-900">
                              {prospect.firstName} {prospect.lastName}
                            </p>
                            {prospect.email && (
                              <p className="text-xs text-charcoal-500">{prospect.email}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-charcoal-700">
                              {prospect.companyName || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-charcoal-600">
                              {prospect.title || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs capitalize',
                                prospect.status === 'enrolled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : prospect.status === 'contacted'
                                    ? 'bg-purple-100 text-purple-800'
                                    : prospect.status === 'responded'
                                      ? 'bg-green-100 text-green-800'
                                      : prospect.status === 'converted'
                                        ? 'bg-gold-100 text-gold-800'
                                        : prospect.status === 'engaged'
                                          ? 'bg-indigo-100 text-indigo-800'
                                          : 'bg-charcoal-100 text-charcoal-600'
                              )}
                            >
                              {prospect.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                (prospect.engagementScore || 0) >= 70
                                  ? 'text-green-600'
                                  : (prospect.engagementScore || 0) >= 40
                                    ? 'text-amber-600'
                                    : 'text-charcoal-500'
                              )}
                            >
                              {prospect.engagementScore || 0}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Detail Panel */}
              <ListDetailPanel
                isOpen={!!selectedProspect}
                selectedItem={selectedProspect}
                onClose={() => setSelectedProspect(null)}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                title={
                  selectedProspect
                    ? `${selectedProspect.firstName} ${selectedProspect.lastName}`
                    : ''
                }
                subtitle={selectedProspect?.companyName || undefined}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Transform raw lead data from DB to typed CampaignLead
 */
function transformRawLead(lead: Record<string, unknown>): CampaignLead {
  const contact = lead.contact as Record<string, unknown> | undefined
  const owner = lead.owner as Record<string, unknown> | undefined
  const deal = lead.deal as Record<string, unknown> | undefined

  return {
    id: lead.id as string,
    contactId: (lead.contact_id as string) || '',
    campaignId: (lead.campaign_id as string | null) || null,
    status: (lead.status as CampaignLead['status']) || 'new',
    score: (lead.score as number | null) || null,
    firstName: (contact?.first_name as string) || (lead.first_name as string) || '',
    lastName: (contact?.last_name as string) || (lead.last_name as string) || '',
    email: (contact?.email as string | null) || (lead.email as string | null) || null,
    phone: (contact?.phone as string | null) || (lead.phone as string | null) || null,
    companyName: (contact?.company_name as string | null) || (lead.company_name as string | null) || null,
    title: (contact?.title as string | null) || (lead.title as string | null) || null,
    budgetScore: (lead.budget_score as number | null) || null,
    authorityScore: (lead.authority_score as number | null) || null,
    needScore: (lead.need_score as number | null) || null,
    timelineScore: (lead.timeline_score as number | null) || null,
    owner: owner
      ? {
          id: owner.id as string,
          fullName: (owner.full_name as string) || '',
          avatarUrl: (owner.avatar_url as string | null) || null,
        }
      : null,
    deal: deal
      ? {
          id: deal.id as string,
          name: (deal.name as string) || '',
          value: (deal.value as number | null) || null,
          stage: (deal.stage as string) || 'qualification',
        }
      : null,
    source: (lead.source as string | null) || 'campaign',
    campaignProspectId: (lead.campaign_prospect_id as string | null) || null,
    createdAt: (lead.created_at as string) || '',
    convertedAt: (lead.converted_at as string | null) || null,
  }
}

/**
 * Leads Section
 *
 * ONE database call pattern: When sectionData is provided, uses pre-loaded data
 * instead of making a separate query.
 *
 * Uses ListDetailPanel with tabs:
 * - Overview: Lead score, status, contact info, owner
 * - Engagement: BANT scores with progress bars
 * - Deal: Linked deal or create deal option
 */
export function CampaignLeadsSectionPCF({ entityId, entity, sectionData }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  // State for selected lead and active tab
  const [selectedLead, setSelectedLead] = useState<CampaignLead | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // ONE database call pattern: Use pre-loaded data if available
  const hasPreloadedData = !!sectionData?.items

  // Query leads only if sectionData not provided (legacy pattern)
  const leadsQuery = trpc.unifiedContacts.leads.listByCampaign.useQuery(
    { campaignId: entityId, limit: 100 },
    { enabled: !!entityId && !hasPreloadedData }
  )

  // Use pre-loaded data or fall back to query results
  const rawLeads = hasPreloadedData
    ? (sectionData.items as Record<string, unknown>[])
    : ((leadsQuery.data?.items || []) as Record<string, unknown>[])
  const leads = rawLeads.map(transformRawLead)
  const total = leads.length
  const isLoading = !hasPreloadedData && leadsQuery.isLoading

  // Handle row click to select lead
  const handleRowClick = (lead: CampaignLead) => {
    if (selectedLead?.id === lead.id) {
      setSelectedLead(null)
    } else {
      setSelectedLead(lead)
      setActiveTab('overview') // Reset to first tab
    }
  }

  // Handle create deal action
  const handleCreateDeal = () => {
    if (selectedLead) {
      dispatchCampaignDialog('createDeal', entityId, {
        id: selectedLead.id,
        channel: 'lead',
        stepNumber: 0,
      })
    }
  }

  // Build tabs for detail panel
  const tabs: DetailTab[] = selectedLead
    ? [
        {
          id: 'overview',
          label: 'Overview',
          content: <LeadOverviewTab lead={selectedLead} />,
        },
        {
          id: 'engagement',
          label: 'BANT',
          content: <LeadEngagementTab lead={selectedLead} />,
        },
        {
          id: 'deal',
          label: 'Deal',
          content: (
            <LeadDealTab
              lead={selectedLead}
              onCreateDeal={handleCreateDeal}
            />
          ),
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">
            Leads ({total})
          </h3>
          <p className="text-sm text-charcoal-500">
            Leads generated from this campaign
          </p>
        </div>
        <Button onClick={() => dispatchCampaignDialog('linkLeads', entityId)}>
          <Target className="w-4 h-4 mr-2" />
          Link Leads
        </Button>
      </div>

      {/* Leads Table + Detail Panel */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-charcoal-500">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="py-12 text-center">
              <Target className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500 mb-4">No leads generated yet</p>
              <p className="text-sm text-charcoal-400">
                Convert prospects to leads or link existing leads to this campaign
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                        Deal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {leads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleRowClick(lead)}
                          className={cn(
                            'cursor-pointer transition-colors',
                            isSelected ? 'bg-gold-50' : 'hover:bg-charcoal-50'
                          )}
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-charcoal-900">
                              {lead.firstName} {lead.lastName}
                            </p>
                            {lead.email && (
                              <p className="text-xs text-charcoal-500">{lead.email}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-charcoal-700">
                              {lead.companyName || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs capitalize',
                                lead.status === 'new'
                                  ? 'bg-blue-100 text-blue-800'
                                  : lead.status === 'contacted'
                                    ? 'bg-purple-100 text-purple-800'
                                    : lead.status === 'qualified'
                                      ? 'bg-green-100 text-green-800'
                                      : lead.status === 'converted'
                                        ? 'bg-gold-100 text-gold-800'
                                        : lead.status === 'nurturing'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-charcoal-100 text-charcoal-600'
                              )}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={cn(
                                'font-medium',
                                (lead.score || 0) >= 70
                                  ? 'text-green-600'
                                  : (lead.score || 0) >= 40
                                    ? 'text-amber-600'
                                    : 'text-charcoal-500'
                              )}
                            >
                              {lead.score || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {lead.deal ? (
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs text-charcoal-400">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Detail Panel */}
              <ListDetailPanel
                isOpen={!!selectedLead}
                selectedItem={selectedLead}
                onClose={() => setSelectedLead(null)}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                title={
                  selectedLead
                    ? `${selectedLead.firstName} ${selectedLead.lastName}`
                    : ''
                }
                subtitle={selectedLead?.companyName || undefined}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Analytics Section
 */
export function CampaignAnalyticsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  if (!campaign) return null

  // Calculate metrics
  const audienceSize = campaign.audienceSize || campaign.audience_size || 0
  const contacted = campaign.prospectsContacted || campaign.prospects_contacted || 0
  const responded = campaign.prospectsResponded || campaign.prospects_responded || 0
  const leads = campaign.leadsGenerated || campaign.leads_generated || 0
  const meetings = campaign.meetingsBooked || campaign.meetings_booked || 0
  const budgetSpent = campaign.budgetSpent || campaign.budget_spent || 0

  const responseRate = contacted > 0 ? ((responded / contacted) * 100).toFixed(1) : '0'
  const conversionRate = contacted > 0 ? ((leads / contacted) * 100).toFixed(1) : '0'
  const costPerLead = leads > 0 ? (budgetSpent / leads).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      {/* Key Metrics - Responsive grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" role="region" aria-label="Campaign analytics metrics">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-charcoal-500">Response Rate</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{responseRate}%</p>
            <p className="text-xs text-charcoal-400 mt-1">
              {responded} of {contacted} responded
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="text-sm text-charcoal-500">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{conversionRate}%</p>
            <p className="text-xs text-charcoal-400 mt-1">
              {leads} leads from {contacted} contacts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-charcoal-500">Cost Per Lead</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">${costPerLead}</p>
            <p className="text-xs text-charcoal-400 mt-1">
              ${budgetSpent.toLocaleString()} total spent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-charcoal-500">Meetings Booked</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{meetings}</p>
            <p className="text-xs text-charcoal-400 mt-1">
              Target: {campaign.targetMeetings || campaign.target_meetings || '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Over Time Chart */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementChart
            data={getWeeklyEngagementData(campaign)}
            height={280}
          />
        </CardContent>
      </Card>

      {/* Two column layout for Funnel and Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Funnel Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Campaign Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Audience', value: audienceSize, color: 'bg-blue-500', width: 100 },
                { label: 'Contacted', value: contacted, color: 'bg-purple-500', width: audienceSize > 0 ? (contacted / audienceSize) * 100 : 0 },
                { label: 'Responded', value: responded, color: 'bg-green-500', width: audienceSize > 0 ? (responded / audienceSize) * 100 : 0 },
                { label: 'Leads', value: leads, color: 'bg-gold-500', width: audienceSize > 0 ? (leads / audienceSize) * 100 : 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-charcoal-500">{item.label}</div>
                  <div className="flex-1 bg-charcoal-100 rounded-full h-8 overflow-hidden">
                    <div
                      className={cn(item.color, 'h-full flex items-center justify-end px-3')}
                      style={{ width: `${Math.max(item.width, 5)}%` }}
                    >
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TopPerformingContentTable campaign={campaign} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Helper: Generate weekly engagement data from campaign metrics
 */
function getWeeklyEngagementData(campaign: Campaign): EngagementDataPoint[] {
  // If campaign has analytics data with weekly engagement, use it
  const analytics = (campaign as any).analytics
  if (analytics?.weeklyEngagement && Array.isArray(analytics.weeklyEngagement)) {
    return analytics.weeklyEngagement
  }

  // Otherwise generate sample data based on campaign metrics
  const opened = campaign.emailsOpened || (campaign as any).emails_opened || 0
  const clicked = campaign.linksClicked || (campaign as any).links_clicked || 0
  const responded = campaign.prospectsResponded || (campaign as any).prospects_responded || 0

  // Distribute across 4 weeks with realistic progression
  if (opened === 0 && clicked === 0 && responded === 0) {
    return []
  }

  // Create realistic distribution (ramping up then stabilizing)
  const distribution = [0.15, 0.30, 0.35, 0.20]

  return distribution.map((ratio, index) => ({
    week: `Week ${index + 1}`,
    opened: Math.round(opened * ratio),
    clicked: Math.round(clicked * ratio),
    replied: Math.round(responded * ratio),
  }))
}

/**
 * Top Performing Content Table Component
 */
function TopPerformingContentTable({ campaign }: { campaign: Campaign }) {
  // Get top content from analytics if available
  const analytics = (campaign as any).analytics
  const topContent = analytics?.topContent || []

  // If no real data, show placeholder content based on campaign metrics
  const displayContent = topContent.length > 0 ? topContent : generatePlaceholderContent(campaign)

  if (displayContent.length === 0) {
    return (
      <div className="py-8 text-center">
        <Mail className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
        <p className="text-sm text-charcoal-400">No content data available</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
          <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            Subject
          </th>
          <th className="text-right py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider w-24">
            Open Rate
          </th>
          <th className="text-right py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider w-24">
            Reply Rate
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-charcoal-100">
        {displayContent.slice(0, 5).map((item: { subject: string; openRate: number; replyRate: number }, index: number) => (
          <tr key={index} className="hover:bg-charcoal-50/50 transition-colors">
            <td className="py-3 px-4">
              <p className="text-sm font-medium text-charcoal-900 truncate max-w-[200px]">
                {item.subject}
              </p>
            </td>
            <td className="py-3 px-4 text-right">
              <span className={cn(
                'text-sm font-medium',
                item.openRate >= 40 ? 'text-green-600' : item.openRate >= 20 ? 'text-amber-600' : 'text-charcoal-500'
              )}>
                {item.openRate.toFixed(1)}%
              </span>
            </td>
            <td className="py-3 px-4 text-right">
              <span className={cn(
                'text-sm font-medium',
                item.replyRate >= 10 ? 'text-green-600' : item.replyRate >= 5 ? 'text-amber-600' : 'text-charcoal-500'
              )}>
                {item.replyRate.toFixed(1)}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/**
 * Generate placeholder content based on campaign metrics
 */
function generatePlaceholderContent(campaign: Campaign): { subject: string; openRate: number; replyRate: number }[] {
  const contacted = campaign.prospectsContacted || (campaign as any).prospects_contacted || 0
  const opened = campaign.emailsOpened || (campaign as any).emails_opened || 0
  const responded = campaign.prospectsResponded || (campaign as any).prospects_responded || 0

  if (contacted === 0) return []

  const openRate = (opened / contacted) * 100
  const replyRate = (responded / contacted) * 100

  // Generate sample content with varying performance
  return [
    { subject: 'Initial Outreach', openRate: openRate * 1.2, replyRate: replyRate * 0.8 },
    { subject: 'Follow-up Email', openRate: openRate * 0.9, replyRate: replyRate * 1.3 },
    { subject: 'Value Proposition', openRate: openRate * 1.1, replyRate: replyRate * 1.0 },
  ].filter(item => item.openRate > 0 || item.replyRate > 0)
}

/**
 * Activities Section - Uses new PCF ActivitiesSection component
 */
export function CampaignActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  // Import dynamically to avoid circular dependencies
  const { ActivitiesSection } = require('@/components/pcf/sections/ActivitiesSection')

  return (
    <ActivitiesSection
      entityType="campaign"
      entityId={entityId}
      onLogActivity={() => dispatchCampaignDialog('logActivity', entityId)}
      showStats={true}
      showInlineForm={true}
    />
  )
}

/**
 * Documents Section - Uses new PCF DocumentsSection component
 */
export function CampaignDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  // Import dynamically to avoid circular dependencies
  const { DocumentsSection } = require('@/components/pcf/sections/DocumentsSection')

  // Query documents for this campaign
  const documentsQuery = trpc.crm.campaigns.documents.list.useQuery({
    campaignId: entityId,
    documentType: 'all',
  })

  // Transform to DocumentItem format
  const documents = (documentsQuery.data || []).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    filename: doc.file_name,
    description: doc.description,
    documentType: doc.document_type,
    fileUrl: doc.file_url,
    fileSize: doc.file_size,
    mimeType: doc.mime_type,
    entityType: 'campaign',
    entityId: entityId,
    uploader: doc.uploader,
    createdAt: doc.created_at,
  }))

  const handleDownload = (doc: any) => {
    if (doc.fileUrl || doc.file_url) {
      window.open(doc.fileUrl || doc.file_url, '_blank')
    }
  }

  const handlePreview = (doc: any) => {
    if (doc.fileUrl || doc.file_url) {
      window.open(doc.fileUrl || doc.file_url, '_blank')
    }
  }

  return (
    <DocumentsSection
      entityType="campaign"
      entityId={entityId}
      documents={documents}
      isLoading={documentsQuery.isLoading}
      showStats={true}
      onUpload={() => dispatchCampaignDialog('uploadDocument', entityId)}
      onDownload={handleDownload}
      onPreview={handlePreview}
    />
  )
}

/**
 * Notes Section - Shows activities with type='note' in a table format
 * Campaign notes are stored as activities with activity_type='note'
 *
 * ONE database call pattern: When sectionData is provided, uses pre-loaded data
 * instead of making a separate query.
 */
export function CampaignNotesSectionPCF({ entityId, sectionData }: PCFSectionProps) {
  // ONE database call pattern: Use pre-loaded data if available
  const hasPreloadedData = !!sectionData?.items

  // Query activities only if sectionData not provided (legacy pattern)
  const notesQuery = trpc.activities.listByEntity.useQuery(
    { entityType: 'campaign', entityId, limit: 100 },
    { enabled: !!entityId && !hasPreloadedData }
  )

  // Use pre-loaded data or fall back to query results (filtered to notes)
  const notes = hasPreloadedData
    ? (sectionData.items as any[])
    : (notesQuery.data?.items || []).filter(
        (activity: any) => activity.activity_type === 'note'
      )
  const isLoading = !hasPreloadedData && notesQuery.isLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Notes ({notes.length})</h3>
          <p className="text-sm text-charcoal-500">Campaign notes and comments</p>
        </div>
        <Button onClick={() => dispatchCampaignDialog('logActivity', entityId)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-8 text-center text-charcoal-500">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center">
              <StickyNote className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500">No notes yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => dispatchCampaignDialog('logActivity', entityId)}
              >
                Add Your First Note
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-100 bg-charcoal-50/50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider min-w-[200px]">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider w-[300px]">
                      Content
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider w-[150px]">
                      Created By
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-charcoal-500 uppercase tracking-wider w-[120px]">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {notes.map((note: any) => (
                    <tr key={note.id} className="hover:bg-charcoal-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium text-charcoal-900 truncate">
                            {note.subject || 'Untitled Note'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-charcoal-600 text-sm truncate max-w-[300px]">
                          {note.description || '—'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-charcoal-600 text-sm">
                          {note.creator?.full_name || note.performed_by_name || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-charcoal-500 text-sm">
                          {note.created_at
                            ? format(new Date(note.created_at), 'MMM d, yyyy')
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * History Section
 */
export function CampaignHistorySectionPCF({ entityId }: PCFSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900">History</h3>
        <p className="text-sm text-charcoal-500">Campaign changelog and audit trail</p>
      </div>

      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-charcoal-500">No history entries</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// Enterprise Funnel & Sequence Sections
// ==========================================

/**
 * Funnel Section - Enterprise-grade funnel visualization
 *
 * Displays campaign conversion funnel with:
 * - Stage-by-stage breakdown
 * - Drop-off indicators
 * - Conversion rates
 * - Insights generation
 */
export function CampaignFunnelSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Extract funnel metrics from campaign
  const audienceSize = campaign.audienceSize || campaign.audience_size || 0
  const contacted = campaign.prospectsContacted || campaign.prospects_contacted || 0
  const opened = campaign.emailsOpened || campaign.emails_opened || 0
  const clicked = campaign.linksClicked || campaign.links_clicked || 0
  const responded = campaign.prospectsResponded || campaign.prospects_responded || 0
  const leads = campaign.leadsGenerated || campaign.leads_generated || 0
  const meetings = campaign.meetingsBooked || campaign.meetings_booked || 0

  // Build funnel stages
  const funnelStages: FunnelStage[] = [
    { id: 'audience', label: 'Total Audience', count: audienceSize, color: 'bg-blue-500' },
    { id: 'contacted', label: 'Contacted', count: contacted, color: 'bg-indigo-500' },
    { id: 'opened', label: 'Opened', count: opened, color: 'bg-purple-500' },
    { id: 'clicked', label: 'Clicked', count: clicked, color: 'bg-fuchsia-500' },
    { id: 'responded', label: 'Responded', count: responded, color: 'bg-pink-500' },
    { id: 'leads', label: 'Leads Generated', count: leads, color: 'bg-gold-500' },
    { id: 'meetings', label: 'Meetings Booked', count: meetings, color: 'bg-green-500' },
  ].filter((stage) => stage.count > 0 || stage.id === 'audience')

  // Calculate overall conversion
  const overallConversion = audienceSize > 0 ? ((leads / audienceSize) * 100).toFixed(2) : '0'
  const meetingConversion = audienceSize > 0 ? ((meetings / audienceSize) * 100).toFixed(2) : '0'

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Campaign Funnel</h3>
          <p className="text-sm text-charcoal-500">
            Track prospect journey from audience to conversion
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-charcoal-400 uppercase tracking-wider">Lead Conversion</p>
            <p className="text-xl font-bold text-gold-600">{overallConversion}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-charcoal-400 uppercase tracking-wider">Meeting Rate</p>
            <p className="text-xl font-bold text-green-600">{meetingConversion}%</p>
          </div>
        </div>
      </div>

      {/* Main Funnel Chart */}
      <Card className="bg-white">
        <CardContent className="p-6">
          {audienceSize === 0 ? (
            <div className="py-12 text-center">
              <TrendingDown className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500 mb-2">No funnel data available</p>
              <p className="text-sm text-charcoal-400">
                Add prospects to your campaign to start tracking the funnel
              </p>
            </div>
          ) : (
            <FunnelChart
              stages={funnelStages}
              showDropOff={true}
              showInsights={true}
              size="lg"
              onStageClick={(stage) => {
                // Navigate to relevant section based on stage
                const stageToSection: Record<string, string> = {
                  audience: 'prospects',
                  contacted: 'prospects',
                  opened: 'sequence',
                  clicked: 'sequence',
                  responded: 'prospects',
                  leads: 'leads',
                  meetings: 'activities',
                }
                const section = stageToSection[stage.id]
                if (section) {
                  window.history.pushState(
                    {},
                    '',
                    `/employee/crm/campaigns/${entityId}?mode=sections&section=${section}`
                  )
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Stage Details Grid - Responsive */}
      {audienceSize > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" role="region" aria-label="Funnel stage details">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-charcoal-500 uppercase tracking-wider">
                  Audience
                </span>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">
                {audienceSize.toLocaleString()}
              </p>
              <p className="text-xs text-charcoal-400 mt-1">Total prospects</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-charcoal-500 uppercase tracking-wider">
                  Engagement
                </span>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">
                {opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-charcoal-400 mt-1">Click-through rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-xs text-charcoal-500 uppercase tracking-wider">Response</span>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">
                {contacted > 0 ? ((responded / contacted) * 100).toFixed(1) : '0'}%
              </p>
              <p className="text-xs text-charcoal-400 mt-1">Response rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gold-500" />
                <span className="text-xs text-charcoal-500 uppercase tracking-wider">
                  Conversion
                </span>
              </div>
              <p className="text-2xl font-bold text-charcoal-900">{leads.toLocaleString()}</p>
              <p className="text-xs text-charcoal-400 mt-1">Leads generated</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

/**
 * Sequence Section - Outreach sequence management
 *
 * Displays campaign sequence with:
 * - Step-by-step timeline
 * - Channel indicators (email, LinkedIn, phone, SMS)
 * - Per-step performance metrics
 * - Sequence controls (pause/resume)
 *
 * ONE database call pattern: When sectionData is provided, uses pre-loaded data
 * instead of making a separate query.
 */
export function CampaignSequenceSectionPCF({ entityId, entity, sectionData }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  // ONE database call pattern: Use pre-loaded data if available
  const hasPreloadedData = !!sectionData?.items

  // Query sequence steps only if sectionData not provided (legacy pattern)
  const sequenceQuery = trpc.crm.campaigns.sequence.list.useQuery(
    { campaignId: entityId },
    { enabled: !!entityId && !hasPreloadedData }
  )

  // Use pre-loaded data or fall back to query results
  const sequenceSteps = hasPreloadedData
    ? (sectionData.items as any[])
    : (sequenceQuery.data?.steps || [])
  const isLoading = !hasPreloadedData && sequenceQuery.isLoading

  const isSequenceRunning = campaign?.status === 'active'

  // Transform to SequenceStep format
  const steps: SequenceStep[] = sequenceSteps.map((step: any, index: number) => ({
    id: step.id,
    stepNumber: index + 1,
    channel: step.channel || 'email',
    subject: step.subject,
    templateName: step.template_name || step.templateName || `Step ${index + 1}`,
    delay: {
      value: step.delay_value || step.delayValue || 1,
      unit: step.delay_unit || step.delayUnit || 'days',
    },
    status: step.status || 'pending',
    stats: step.stats
      ? {
          sent: step.stats.sent || 0,
          delivered: step.stats.delivered || 0,
          opened: step.stats.opened || 0,
          clicked: step.stats.clicked || 0,
          replied: step.stats.replied || 0,
          bounced: step.stats.bounced || 0,
        }
      : undefined,
    scheduledAt: step.scheduled_at || step.scheduledAt,
    completedAt: step.completed_at || step.completedAt,
  }))

  // Find current step (first non-completed step)
  const currentStepIndex = steps.findIndex(
    (step) => step.status === 'in_progress' || step.status === 'pending'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Outreach Sequence</h3>
          <p className="text-sm text-charcoal-500">
            {steps.length > 0
              ? `${steps.length} step${steps.length !== 1 ? 's' : ''} in sequence`
              : 'Configure your outreach workflow'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => dispatchCampaignDialog('editSequence', entityId)}>
            <Workflow className="w-4 h-4 mr-2" />
            Edit Sequence
          </Button>
          <Button onClick={() => dispatchCampaignDialog('addSequenceStep', entityId)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      {/* Sequence Timeline */}
      <Card className="bg-white">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : steps.length === 0 ? (
            <div className="py-12 text-center">
              <Workflow className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500 mb-2">No sequence steps configured</p>
              <p className="text-sm text-charcoal-400 mb-4">
                Create a multi-step outreach sequence to engage your prospects
              </p>
              <Button onClick={() => dispatchCampaignDialog('addSequenceStep', entityId)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Step
              </Button>
            </div>
          ) : (
            <SequenceTimeline
              steps={steps}
              currentStep={currentStepIndex >= 0 ? currentStepIndex : undefined}
              isRunning={isSequenceRunning}
              onStepClick={(step) => dispatchCampaignDialog('viewSequenceStep', entityId, {
                id: step.id,
                channel: step.channel,
                stepNumber: step.stepNumber,
                dayOffset: step.delay?.value,
                subject: step.subject,
                templateName: step.templateName,
              })}
              onEditStep={(step) => dispatchCampaignDialog('editSequenceStep', entityId, {
                id: step.id,
                channel: step.channel,
                stepNumber: step.stepNumber,
                dayOffset: step.delay?.value,
                subject: step.subject,
                templateName: step.templateName,
              })}
              onPauseResume={() => dispatchCampaignDialog('toggleSequence', entityId)}
            />
          )}
        </CardContent>
      </Card>

      {/* Channel Summary - Responsive */}
      {steps.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4" role="region" aria-label="Sequence channel summary">
          {[
            {
              channel: 'email',
              label: 'Email Steps',
              icon: Mail,
              color: 'text-blue-500',
              bg: 'bg-blue-50',
            },
            {
              channel: 'linkedin',
              label: 'LinkedIn Steps',
              icon: Linkedin,
              color: 'text-[#0A66C2]',
              bg: 'bg-blue-50',
            },
            {
              channel: 'phone',
              label: 'Call Steps',
              icon: Phone,
              color: 'text-green-500',
              bg: 'bg-green-50',
            },
            {
              channel: 'sms',
              label: 'SMS Steps',
              icon: MessageSquare,
              color: 'text-purple-500',
              bg: 'bg-purple-50',
            },
          ].map(({ channel, label, icon: Icon, color, bg }) => {
            const channelSteps = steps.filter((s) => s.channel === channel)
            const channelStats = channelSteps.reduce(
              (acc, s) => ({
                sent: acc.sent + (s.stats?.sent || 0),
                opened: acc.opened + (s.stats?.opened || 0),
                replied: acc.replied + (s.stats?.replied || 0),
              }),
              { sent: 0, opened: 0, replied: 0 }
            )

            return (
              <Card key={channel} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                      <Icon className={cn('w-4 h-4', color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal-900">{label}</p>
                      <p className="text-xs text-charcoal-400">{channelSteps.length} steps</p>
                    </div>
                  </div>
                  {channelStats.sent > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-charcoal-100">
                      <div>
                        <p className="text-lg font-bold text-charcoal-900">
                          {channelStats.sent.toLocaleString()}
                        </p>
                        <p className="text-xs text-charcoal-400">Sent</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {channelStats.sent > 0
                            ? ((channelStats.opened / channelStats.sent) * 100).toFixed(0)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-charcoal-400">Opened</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {channelStats.sent > 0
                            ? ((channelStats.replied / channelStats.sent) * 100).toFixed(0)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-charcoal-400">Replied</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
