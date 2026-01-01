'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Megaphone, ExternalLink } from 'lucide-react'
import type { ContactCampaign } from '@/types/workspace'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ContactCampaignsSectionProps {
  campaigns: ContactCampaign[]
  contactId: string
}

const SEQUENCE_STATUS_STYLES: Record<string, string> = {
  active: 'bg-success-100 text-success-700',
  pending: 'bg-amber-100 text-amber-700',
  paused: 'bg-charcoal-100 text-charcoal-600',
  completed: 'bg-blue-100 text-blue-700',
  converted: 'bg-gold-100 text-gold-700',
}

/**
 * ContactCampaignsSection - Shows campaign enrollments for prospects/leads
 */
export function ContactCampaignsSection({ campaigns, contactId }: ContactCampaignsSectionProps) {
  const activeCampaigns = campaigns.filter(c => c.sequenceStatus === 'active')
  const completedCampaigns = campaigns.filter(c => c.sequenceStatus !== 'active')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaign Enrollments ({campaigns.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Enroll in Campaign
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <Megaphone className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>Not enrolled in any campaigns</p>
              <p className="text-sm mt-1">Enroll this contact in a campaign to automate outreach.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Campaigns */}
              {activeCampaigns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-500 uppercase tracking-wider mb-2">Active</h4>
                  <div className="divide-y divide-charcoal-100">
                    {activeCampaigns.map((campaign) => (
                      <CampaignRow key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed/Other Campaigns */}
              {completedCampaigns.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-500 uppercase tracking-wider mb-2">History</h4>
                  <div className="divide-y divide-charcoal-100">
                    {completedCampaigns.map((campaign) => (
                      <CampaignRow key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CampaignRow({ campaign }: { campaign: ContactCampaign }) {
  const statusStyle = SEQUENCE_STATUS_STYLES[campaign.sequenceStatus] || 'bg-charcoal-100 text-charcoal-600'

  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <div className="font-medium text-charcoal-900">{campaign.campaignName}</div>
        <div className="text-sm text-charcoal-500">
          Step {campaign.sequenceStep}
          {campaign.engagementScore !== null && ` \u2022 Score: ${campaign.engagementScore}`}
          {' \u2022 '}
          Enrolled {formatDistanceToNow(new Date(campaign.enrolledAt), { addSuffix: true })}
        </div>
        {campaign.convertedAt && (
          <div className="text-xs text-success-600 mt-1">
            Converted {formatDistanceToNow(new Date(campaign.convertedAt), { addSuffix: true })}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusStyle}`}>
          {campaign.sequenceStatus}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/employee/crm/campaigns/${campaign.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ContactCampaignsSection
