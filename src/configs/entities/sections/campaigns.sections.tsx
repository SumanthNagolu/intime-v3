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
} from 'lucide-react'
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
 * Overview Section
 */
export function CampaignOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const campaign = entity as Campaign | undefined

  if (!campaign) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const channels = campaign.channels || []
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    phone: <Phone className="w-4 h-4" />,
  }

  return (
    <div className="space-y-6">
      {/* Campaign Info Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-charcoal-500">Type</p>
            <p className="font-medium text-charcoal-900 capitalize">
              {campaign.campaignType || campaign.campaign_type || '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Channels</p>
            <div className="flex gap-2 mt-1">
              {channels.length > 0 ? (
                channels.map((channel: string) => (
                  <span
                    key={channel}
                    className="flex items-center gap-1 px-2 py-1 bg-charcoal-100 rounded text-xs"
                  >
                    {channelIcons[channel]}
                    {channel}
                  </span>
                ))
              ) : (
                <span className="text-charcoal-400">—</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Start Date</p>
            <p className="font-medium text-charcoal-900">
              {campaign.startDate || campaign.start_date
                ? format(new Date(campaign.startDate || campaign.start_date!), 'MMM d, yyyy')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">End Date</p>
            <p className="font-medium text-charcoal-900">
              {campaign.endDate || campaign.end_date
                ? format(new Date(campaign.endDate || campaign.end_date!), 'MMM d, yyyy')
                : '—'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-charcoal-500">Description</p>
            <p className="text-charcoal-700 mt-1">
              {campaign.description || 'No description provided.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Targets Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Targets</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-charcoal-500">Target Leads</p>
            <p className="text-xl font-bold text-charcoal-900">
              {campaign.targetLeads || campaign.target_leads || '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Target Meetings</p>
            <p className="text-xl font-bold text-charcoal-900">
              {campaign.targetMeetings || campaign.target_meetings || '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Budget</p>
            <p className="text-xl font-bold text-charcoal-900">
              ${(campaign.budgetTotal || campaign.budget_total || 0).toLocaleString()}
            </p>
          </div>
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

  // Query prospects for this campaign
  const prospectsQuery = trpc.crm.prospects.listByCampaign.useQuery({
    campaignId: entityId,
    limit: 100,
  })

  const prospects = prospectsQuery.data?.items || []
  const total = prospectsQuery.data?.total || 0

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
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
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
 * Activities Section
 */
export function CampaignActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  const activitiesQuery = trpc.activities.listByEntity.useQuery({
    entityType: 'campaign',
    entityId,
    limit: 50,
  })

  const activities = activitiesQuery.data?.items || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Activities</h3>
          <p className="text-sm text-charcoal-500">Recent activity for this campaign</p>
        </div>
        <Button onClick={() => dispatchCampaignDialog('logActivity', entityId)}>
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Activities List */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {activitiesQuery.isLoading ? (
            <div className="py-8 text-center text-charcoal-500">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500">No activities recorded</p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity: any) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-charcoal-100 rounded-lg">
                      <Activity className="w-4 h-4 text-charcoal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900">{activity.subject}</p>
                      <p className="text-sm text-charcoal-500 mt-1">{activity.description}</p>
                      <p className="text-xs text-charcoal-400 mt-2">
                        {activity.created_at && format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {activity.activity_type}
                    </Badge>
                  </div>
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
 * Documents Section
 */
export function CampaignDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Documents</h3>
          <p className="text-sm text-charcoal-500">Files and attachments</p>
        </div>
        <Button onClick={() => dispatchCampaignDialog('uploadDocument', entityId)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents List - Placeholder */}
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-charcoal-500">No documents uploaded</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => dispatchCampaignDialog('uploadDocument', entityId)}
          >
            Upload Your First Document
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Notes Section
 */
export function CampaignNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900">Notes</h3>
          <p className="text-sm text-charcoal-500">Campaign notes and comments</p>
        </div>
        <Button onClick={() => dispatchCampaignDialog('addNote', entityId)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes List - Placeholder */}
      <Card className="bg-white">
        <CardContent className="py-12 text-center">
          <StickyNote className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <p className="text-charcoal-500">No notes yet</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => dispatchCampaignDialog('addNote', entityId)}
          >
            Add Your First Note
          </Button>
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
