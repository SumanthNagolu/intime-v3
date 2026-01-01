'use client'

/**
 * Lead Overview Tab
 *
 * Displays lead core information in ListDetailPanel:
 * - Lead score with visual indicator
 * - Status badge
 * - Contact information
 * - Owner assignment
 * - Source tracking
 */

import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Phone, Building2, Briefcase, Star, Target, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CampaignLead } from '@/types/campaign'

interface LeadOverviewTabProps {
  lead: CampaignLead
}

export function LeadOverviewTab({ lead }: LeadOverviewTabProps) {
  const score = lead.score || 0

  // Score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-gold-600 bg-gold-100'
    if (score >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-charcoal-500 bg-charcoal-100'
  }

  // Status config
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: 'New', color: 'text-blue-600', bg: 'bg-blue-100' },
    contacted: { label: 'Contacted', color: 'text-purple-600', bg: 'bg-purple-100' },
    qualified: { label: 'Qualified', color: 'text-green-600', bg: 'bg-green-100' },
    nurturing: { label: 'Nurturing', color: 'text-amber-600', bg: 'bg-amber-100' },
    converted: { label: 'Converted', color: 'text-gold-600', bg: 'bg-gold-100' },
    lost: { label: 'Lost', color: 'text-charcoal-500', bg: 'bg-charcoal-100' },
    disqualified: { label: 'Disqualified', color: 'text-red-600', bg: 'bg-red-100' },
  }

  const status = statusConfig[lead.status] || statusConfig.new

  return (
    <div className="space-y-4 p-4">
      {/* Score & Status Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', getScoreColor(score))}>
            <span className="text-lg font-bold">{score}</span>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Lead Score</p>
            <p className="text-xs text-charcoal-400">
              {score >= 80 ? 'Hot lead' : score >= 60 ? 'Warm lead' : score >= 40 ? 'Developing' : 'Cold lead'}
            </p>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', status.bg, status.color)}>
          {status.label}
        </span>
      </div>

      {/* Contact Info Card */}
      <Card className="bg-charcoal-50/50 border-0">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium">Contact Information</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-charcoal-400" />
              <span className="font-medium text-charcoal-900">
                {lead.firstName} {lead.lastName}
              </span>
            </div>

            {lead.title && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-charcoal-400" />
                <span className="text-charcoal-600">{lead.title}</span>
              </div>
            )}

            {lead.companyName && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-charcoal-400" />
                <span className="text-charcoal-600">{lead.companyName}</span>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-charcoal-400" />
                <a href={`mailto:${lead.email}`} className="text-gold-600 hover:underline">
                  {lead.email}
                </a>
              </div>
            )}

            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-charcoal-400" />
                <a href={`tel:${lead.phone}`} className="text-gold-600 hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Owner & Source */}
      <div className="grid grid-cols-2 gap-3">
        {/* Owner */}
        <Card className="bg-charcoal-50/50 border-0">
          <CardContent className="p-3">
            <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-2">Owner</p>
            {lead.owner ? (
              <div className="flex items-center gap-2">
                {lead.owner.avatarUrl ? (
                  <img
                    src={lead.owner.avatarUrl}
                    alt={lead.owner.fullName}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gold-100 text-gold-600 flex items-center justify-center text-xs font-medium">
                    {lead.owner.fullName.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-charcoal-900">{lead.owner.fullName}</span>
              </div>
            ) : (
              <span className="text-sm text-charcoal-400">Unassigned</span>
            )}
          </CardContent>
        </Card>

        {/* Source */}
        <Card className="bg-charcoal-50/50 border-0">
          <CardContent className="p-3">
            <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-2">Source</p>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-charcoal-400" />
              <span className="text-sm font-medium text-charcoal-900 capitalize">
                {lead.source || 'Campaign'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card className="bg-charcoal-50/50 border-0">
        <CardContent className="p-3">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-2">Timeline</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="text-charcoal-700">
                {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : '—'}
              </span>
            </div>
            {lead.convertedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-500">Converted</span>
                <span className="text-green-600 font-medium">
                  {format(new Date(lead.convertedAt), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
