'use client'

/**
 * PCF-Compatible Section Components for Campaigns
 *
 * These components implement the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Campaign } from '../campaigns.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FileText,
  StickyNote,
  Clock,
  CheckCircle,
  Workflow,
  Eye,
  MousePointerClick,
  MessageSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { FunnelChart, FunnelStage } from '@/components/ui/funnel-chart'
import { SequenceTimeline, SequenceStep } from '@/components/ui/sequence-timeline'
import { ProgressRing, CampaignHealthRing } from '@/components/ui/progress-ring'
import { cn } from '@/lib/utils'

/**
 * Dispatch a dialog open event for the Campaign entity
 * The detail page listens for this and manages dialog state
 */
function dispatchCampaignDialog(dialogId: string, campaignId: string) {
  window.dispatchEvent(
    new CustomEvent('openCampaignDialog', {
      detail: { dialogId, campaignId },
    })
  )
}

// ==========================================
// PCF Section Components
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
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
export function CampaignOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  // Query recent activities
  const activitiesQuery = trpc.activities.listByEntity.useQuery(
    { entityType: 'campaign', entityId, limit: 5 },
    { enabled: !!entityId }
  )

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
      {/* Hero Section with Health Ring - Responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Health Ring */}
        <Card className="lg:col-span-3 bg-white" role="region" aria-label="Campaign health score">
          <CardContent className="p-4 lg:p-6 flex flex-col items-center justify-center h-full min-h-[180px]">
            <CampaignHealthRing metrics={healthMetrics} size="lg" />
          </CardContent>
        </Card>

        {/* Key Metrics Grid - Responsive */}
        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
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
            {activitiesQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (activitiesQuery.data?.items || []).length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-400">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(activitiesQuery.data?.items || []).slice(0, 5).map((activity: any) => (
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
 * Prospects Section
 */
export function CampaignProspectsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined
  const router = useRouter()

  // Query prospects from the campaign using existing getProspects procedure
  const prospectsQuery = trpc.crm.campaigns.getProspects.useQuery(
    { campaignId: entityId, limit: 100 },
    { enabled: !!entityId }
  )

  const prospects = prospectsQuery.data?.prospects || []
  const total = prospectsQuery.data?.total || campaign?.audienceSize || campaign?.audience_size || 0

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

      {/* Prospects List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {prospectsQuery.isLoading ? (
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
            <div className="divide-y">
              {prospects.map((prospect: any) => (
                <Link
                  key={prospect.id}
                  href={`/employee/crm/campaigns/${entityId}/prospects/${prospect.id}`}
                  className="flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {prospect.first_name} {prospect.last_name}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {prospect.company_name || prospect.email || '—'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs',
                        prospect.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : prospect.status === 'contacted'
                            ? 'bg-purple-100 text-purple-800'
                            : prospect.status === 'responded'
                              ? 'bg-green-100 text-green-800'
                              : prospect.status === 'converted'
                                ? 'bg-gold-100 text-gold-800'
                                : 'bg-charcoal-100 text-charcoal-600'
                      )}
                    >
                      {prospect.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Leads Section
 */
export function CampaignLeadsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  // Query leads linked to this campaign
  const leadsQuery = trpc.crm.leads.list.useQuery({
    campaignId: entityId,
    limit: 100,
    status: 'all',
  })

  const leads = leadsQuery.data?.items || []
  const total = leadsQuery.data?.total || 0

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

      {/* Leads List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {leadsQuery.isLoading ? (
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
            <div className="divide-y">
              {leads.map((lead: any) => (
                <Link
                  key={lead.id}
                  href={`/employee/crm/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {lead.company_name ||
                        `${lead.first_name || ''} ${lead.last_name || ''}`.trim()}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {lead.email || lead.phone || '—'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs',
                        lead.status === 'new'
                          ? 'bg-charcoal-100 text-charcoal-700'
                          : lead.status === 'qualified'
                            ? 'bg-green-100 text-green-800'
                            : lead.status === 'converted'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                      )}
                    >
                      {lead.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
    </div>
  )
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
 */
export function CampaignNotesSectionPCF({ entityId }: PCFSectionProps) {
  // Query activities filtered to notes only
  const notesQuery = trpc.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId,
    limit: 100,
  })

  // Filter to only note-type activities
  const notes = (notesQuery.data?.items || []).filter(
    (activity: any) => activity.activity_type === 'note'
  )

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
          {notesQuery.isLoading ? (
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
 */
export function CampaignSequenceSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  // Query sequence steps from the new sequence.list procedure
  const sequenceQuery = trpc.crm.campaigns.sequence.list.useQuery(
    { campaignId: entityId },
    { enabled: !!entityId }
  )
  const sequenceSteps = sequenceQuery.data?.steps || []
  const isLoading = sequenceQuery.isLoading

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
              onStepClick={(step) => dispatchCampaignDialog('viewSequenceStep', step.id)}
              onEditStep={(step) => dispatchCampaignDialog('editSequenceStep', step.id)}
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
