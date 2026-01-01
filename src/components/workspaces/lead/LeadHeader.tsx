'use client'

import * as React from 'react'
import { Target, Building2, Calendar, User, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { LeadData } from '@/types/lead'
import { formatDistanceToNow } from 'date-fns'

interface LeadHeaderProps {
  lead: LeadData
}

const LEAD_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-charcoal-100 text-charcoal-700' },
  contacted: { label: 'Contacted', className: 'bg-blue-100 text-blue-700' },
  warm: { label: 'Warm', className: 'bg-amber-100 text-amber-700' },
  hot: { label: 'Hot', className: 'bg-orange-100 text-orange-700' },
  qualified: { label: 'Qualified', className: 'bg-green-100 text-green-700' },
  unqualified: { label: 'Unqualified', className: 'bg-red-100 text-red-700' },
  converted: { label: 'Converted', className: 'bg-purple-100 text-purple-700' },
  nurture: { label: 'Nurture', className: 'bg-amber-100 text-amber-700' },
  lost: { label: 'Lost', className: 'bg-charcoal-100 text-charcoal-500' },
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-blue-600'
  if (score >= 25) return 'text-amber-600'
  return 'text-charcoal-500'
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Hot'
  if (score >= 50) return 'Warm'
  if (score >= 25) return 'Cool'
  return 'Cold'
}

export function LeadHeader({ lead }: LeadHeaderProps) {
  const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG.new
  const score = lead.bantTotalScore || lead.score || 0

  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Lead Icon */}
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
            <Target className="w-6 h-6 text-gold-600" />
          </div>

          {/* Lead Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
                {lead.fullName}
              </h1>
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-600">
              {lead.title && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {lead.title}
                </span>
              )}
              {lead.companyName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {lead.companyName}
                </span>
              )}
              {lead.estimatedValue && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${lead.estimatedValue.toLocaleString()}
                </span>
              )}
            </div>

            {lead.lastContactedAt && (
              <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last contacted {formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* Lead Score */}
        <div className="text-right">
          <div className="text-sm text-charcoal-500 mb-1">Lead Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <div className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
        </div>
      </div>
    </div>
  )
}
