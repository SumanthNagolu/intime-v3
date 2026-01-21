'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Megaphone, Target, Globe, Linkedin, Phone, Mail,
  Users, Calendar, TrendingUp, ExternalLink, ArrowRight,
  CheckCircle2, Clock, XCircle, DollarSign, Tag,
} from 'lucide-react'
import type { LeadData, LeadCampaign } from '@/types/lead'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface LeadSourceSectionProps {
  lead: LeadData
  campaigns: LeadCampaign[]
}

/**
 * LeadSourceSection - Campaign, referral source, and channel tracking
 * Displays lead source information, marketing campaigns, and attribution data
 */
export function LeadSourceSection({
  lead,
  campaigns,
}: LeadSourceSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Source Overview Card */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-fade-in"
        style={getDelay(0)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Lead Source</h3>
              <p className="text-xs text-charcoal-500">How this lead was acquired</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Primary Source */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Source</p>
              <div className="flex items-center gap-2">
                <SourceIcon source={lead.source} />
                <span className="text-lg font-semibold text-charcoal-900">
                  {formatSource(lead.source)}
                </span>
              </div>
            </div>

            {/* Estimated Value */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Estimated Value</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-charcoal-400" />
                <span className="text-lg font-semibold text-charcoal-900">
                  {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '—'}
                </span>
              </div>
            </div>

            {/* Probability */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Probability</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-charcoal-400" />
                <span className="text-lg font-semibold text-charcoal-900">
                  {lead.probability ? `${lead.probability}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Expected Close Date */}
          {lead.estimatedCloseDate && (
            <div className="mt-6 pt-6 border-t border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Expected Close Date</p>
                  <p className="text-sm text-charcoal-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-charcoal-400" />
                    {format(new Date(lead.estimatedCloseDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge variant="outline" className="text-charcoal-600">
                  {formatDistanceToNow(new Date(lead.estimatedCloseDate), { addSuffix: true })}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns Section */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(1)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Marketing Campaigns</h3>
                <p className="text-xs text-charcoal-500">Campaigns this lead is enrolled in</p>
              </div>
            </div>
            <Badge variant="outline" className="text-charcoal-600">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {campaigns.length > 0 ? (
            campaigns.map((campaign, idx) => (
              <CampaignRow key={campaign.id} campaign={campaign} index={idx} />
            ))
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Megaphone className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No campaigns</p>
              <p className="text-xs text-charcoal-400 mt-0.5">This lead is not enrolled in any campaigns</p>
            </div>
          )}
        </div>
      </div>

      {/* Source Channel Breakdown */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(2)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Channel Attribution</h3>
              <p className="text-xs text-charcoal-500">Marketing channels that contributed to this lead</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <ChannelCard
              icon={Globe}
              label="Website"
              isActive={lead.source === 'website' || lead.source === 'inbound'}
            />
            <ChannelCard
              icon={Linkedin}
              label="LinkedIn"
              isActive={lead.source === 'linkedin'}
            />
            <ChannelCard
              icon={Phone}
              label="Phone"
              isActive={lead.source === 'cold_call' || lead.source === 'phone'}
            />
            <ChannelCard
              icon={Mail}
              label="Email"
              isActive={lead.source === 'email' || lead.source === 'outbound'}
            />
            <ChannelCard
              icon={Users}
              label="Referral"
              isActive={lead.source === 'referral'}
            />
            <ChannelCard
              icon={Megaphone}
              label="Campaign"
              isActive={lead.source === 'campaign' || campaigns.length > 0}
            />
            <ChannelCard
              icon={Target}
              label="Event"
              isActive={lead.source === 'conference' || lead.source === 'event'}
            />
            <ChannelCard
              icon={Users}
              label="Partner"
              isActive={lead.source === 'partner'}
            />
          </div>
        </div>
      </div>

      {/* Conversion Tracking */}
      {lead.convertedToDealId && (
        <div
          className="rounded-xl border border-success-200 bg-success-50 shadow-elevation-sm overflow-hidden animate-slide-up"
          style={getDelay(3)}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-success-900">Lead Converted</h3>
                  <p className="text-xs text-success-700">
                    {lead.convertedAt
                      ? `Converted ${formatDistanceToNow(new Date(lead.convertedAt), { addSuffix: true })}`
                      : 'This lead has been converted to a deal'
                    }
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-success-300 text-success-700 hover:bg-success-100">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View Deal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SourceIcon({ source }: { source: string | null }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    website: Globe,
    linkedin: Linkedin,
    cold_call: Phone,
    phone: Phone,
    email: Mail,
    referral: Users,
    campaign: Megaphone,
    conference: Target,
    event: Target,
    partner: Users,
    inbound: Globe,
    outbound: Mail,
  }
  const Icon = source ? iconMap[source.toLowerCase()] || Target : Target

  return (
    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
      <Icon className="h-5 w-5 text-charcoal-600" />
    </div>
  )
}

function CampaignRow({ campaign, index }: { campaign: LeadCampaign; index: number }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    active: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    completed: {
      bg: 'bg-charcoal-100',
      text: 'text-charcoal-700',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    },
    paused: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <Clock className="h-3.5 w-3.5" />,
    },
    ended: {
      bg: 'bg-charcoal-100',
      text: 'text-charcoal-600',
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  }
  const config = statusConfig[campaign.status.toLowerCase()] || statusConfig.active

  return (
    <div
      className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50/50 transition-colors group cursor-pointer"
      style={{ animationDelay: `${(index + 1) * 50}ms` }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center">
        <Megaphone className="h-5 w-5 text-charcoal-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">{campaign.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className={cn("text-xs", config.bg, config.text)}>
            {config.icon}
            <span className="ml-1 capitalize">{campaign.status}</span>
          </Badge>
          {campaign.type && (
            <Badge variant="outline" className="text-xs text-charcoal-600">
              {campaign.type}
            </Badge>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-charcoal-500">
          Enrolled {formatDistanceToNow(new Date(campaign.enrolledAt), { addSuffix: true })}
        </p>
        {campaign.convertedAt && (
          <p className="text-xs text-success-600 mt-0.5">
            Converted {format(new Date(campaign.convertedAt), 'MMM d')}
          </p>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  )
}

function ChannelCard({
  icon: Icon,
  label,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border text-center transition-all",
        isActive
          ? "border-success-200 bg-success-50"
          : "border-charcoal-200/60 bg-charcoal-50/50"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center",
          isActive ? "bg-success-100" : "bg-charcoal-100"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isActive ? "text-success-600" : "text-charcoal-400"
          )}
        />
      </div>
      <p
        className={cn(
          "text-sm font-medium",
          isActive ? "text-success-700" : "text-charcoal-500"
        )}
      >
        {label}
      </p>
      {isActive && (
        <Badge className="mt-2 bg-success-100 text-success-700 text-xs">
          Active
        </Badge>
      )}
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatSource(source: string | null): string {
  if (!source) return 'Unknown'
  const sourceMap: Record<string, string> = {
    referral: 'Referral',
    website: 'Website',
    cold_call: 'Cold Call',
    linkedin: 'LinkedIn',
    conference: 'Conference',
    partner: 'Partner',
    campaign: 'Campaign',
    inbound: 'Inbound',
    outbound: 'Outbound',
    email: 'Email',
    phone: 'Phone',
    event: 'Event',
  }
  return sourceMap[source.toLowerCase()] || source.replace(/_/g, ' ')
}

export default LeadSourceSection
