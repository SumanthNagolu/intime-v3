'use client'

import * as React from 'react'
import {
  Megaphone, Copy, Check, ExternalLink, Play, Pause,
  Calendar, User, Mail, Linkedin, Phone, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { CampaignData, CampaignStatus } from '@/types/campaign'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

interface CampaignHeaderProps {
  campaign: CampaignData
}

const STATUS_CONFIG: Record<CampaignStatus, { bg: string; text: string; dot: string; border: string; icon: typeof Play }> = {
  draft: {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-700',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200',
    icon: Megaphone
  },
  scheduled: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
    icon: Calendar
  },
  active: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    border: 'border-success-200',
    icon: Play
  },
  paused: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
    icon: Pause
  },
  completed: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
    icon: Check
  },
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  lead_generation: { label: 'Lead Generation', color: 'bg-blue-100 text-blue-700' },
  re_engagement: { label: 'Re-engagement', color: 'bg-amber-100 text-amber-700' },
  event_promotion: { label: 'Event Promotion', color: 'bg-purple-100 text-purple-700' },
  brand_awareness: { label: 'Brand Awareness', color: 'bg-emerald-100 text-emerald-700' },
  candidate_sourcing: { label: 'Candidate Sourcing', color: 'bg-forest-100 text-forest-700' },
  talent_sourcing: { label: 'Talent Sourcing', color: 'bg-forest-100 text-forest-700' },
}

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  phone: Phone,
  sms: MessageSquare,
}

/**
 * CampaignHeader - Premium entity header with visual hierarchy
 *
 * Hublot-inspired design: Clean information display only.
 * All actions are centralized in the sidebar Quick Actions panel.
 */
export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft
  const typeConfig = TYPE_CONFIG[campaign.campaignType || 'lead_generation'] || TYPE_CONFIG.lead_generation

  // Format dates
  const startDate = campaign.startDate
    ? format(new Date(campaign.startDate), 'MMM d, yyyy')
    : null
  const endDate = campaign.endDate
    ? format(new Date(campaign.endDate), 'MMM d, yyyy')
    : null

  // Copy campaign ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(campaign.id)
    setCopied(true)
    toast({ title: 'Campaign ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Get channel icons
  const channels = campaign.channels || []

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500" />

      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gold-500/30 group-hover:scale-105">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            {/* Status indicator */}
            {campaign.status === 'active' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-success-400 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/40">
                <Play className="h-3 w-3 text-white fill-current" />
              </div>
            )}
            {campaign.status === 'paused' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Pause className="h-3 w-3 text-white fill-current" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {campaign.name}
              </h1>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                statusConfig.bg,
                statusConfig.text,
                statusConfig.border
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
                {campaign.status?.replace(/_/g, ' ')}
              </Badge>
              <Badge className={cn(
                'font-medium px-2.5 py-0.5',
                typeConfig.color
              )}>
                {typeConfig.label}
              </Badge>
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {/* Channels */}
              {channels.length > 0 && (
                <span className="flex items-center gap-1.5">
                  {channels.slice(0, 4).map((channel) => {
                    const ChannelIcon = CHANNEL_ICONS[channel] || Mail
                    return (
                      <ChannelIcon key={channel} className="h-3.5 w-3.5 text-charcoal-400" />
                    )
                  })}
                  <span className="capitalize text-charcoal-600 font-medium">
                    {channels.length} channel{channels.length > 1 ? 's' : ''}
                  </span>
                </span>
              )}
              {/* Date range */}
              {startDate && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
                  {startDate}
                  {endDate && ` - ${endDate}`}
                </span>
              )}
              {/* Owner */}
              {campaign.owner && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <User className="h-3.5 w-3.5 text-charcoal-400" />
                  Owner: <span className="font-medium text-charcoal-700">{campaign.owner.full_name}</span>
                </span>
              )}
            </div>

            {/* ID row */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">ID: {campaign.id.slice(0, 8)}...</span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {campaign.goal && (
                <span className="text-xs text-charcoal-500 bg-charcoal-50 px-2 py-0.5 rounded">
                  Goal: {campaign.goal}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignHeader
