'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, TrendingUp, Calendar, User, Building2,
  ArrowRight, Plus, ExternalLink, Target, Clock,
  CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import type { LeadDeal, LeadData } from '@/types/lead'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface LeadDealsSectionProps {
  deals: LeadDeal[]
  lead: LeadData
  onCreateDeal?: () => void
}

/**
 * LeadDealsSection - Associated opportunities/deals
 * Displays linked deals, pipeline progress, and allows creating new deals
 */
export function LeadDealsSection({
  deals,
  lead,
  onCreateDeal,
}: LeadDealsSectionProps) {
  // Calculate totals
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0)
  const avgProbability = deals.length > 0
    ? Math.round(deals.reduce((sum, d) => sum + (d.probability || 0), 0) / deals.length)
    : 0

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Deals</h2>
          <p className="text-sm text-charcoal-500">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} associated with this lead
          </p>
        </div>
        {onCreateDeal && !lead.convertedToDealId && (
          <Button onClick={onCreateDeal} className="bg-charcoal-900 hover:bg-charcoal-800">
            <Plus className="h-4 w-4 mr-1" />
            Convert to Deal
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      {deals.length > 0 && (
        <div
          className="grid grid-cols-3 gap-4 animate-fade-in"
          style={getDelay(0)}
        >
          <div className="rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Total Value</p>
                <p className="text-xl font-bold text-charcoal-900">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Avg Probability</p>
                <p className="text-xl font-bold text-charcoal-900">{avgProbability}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Deals</p>
                <p className="text-xl font-bold text-charcoal-900">{deals.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deals List */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(1)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Associated Deals</h3>
                <p className="text-xs text-charcoal-500">Opportunities linked to this lead</p>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {deals.length > 0 ? (
            deals.map((deal, idx) => (
              <DealRow key={deal.id} deal={deal} index={idx} />
            ))
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No deals yet</p>
              <p className="text-xs text-charcoal-400 mt-0.5">
                {lead.status === 'qualified'
                  ? 'This lead is qualified and ready to be converted to a deal'
                  : 'Qualify this lead to convert it to a deal'
                }
              </p>
              {onCreateDeal && lead.status === 'qualified' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onCreateDeal}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Convert to Deal
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversion Status */}
      {lead.convertedToDealId && (
        <div
          className="rounded-xl border border-success-200 bg-success-50 shadow-elevation-sm overflow-hidden animate-slide-up"
          style={getDelay(2)}
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
              <Button
                variant="outline"
                size="sm"
                className="border-success-300 text-success-700 hover:bg-success-100"
                onClick={() => {
                  // Navigate to deal
                  window.location.href = `/employee/crm/deals/${lead.convertedToDealId}`
                }}
              >
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

function DealRow({ deal, index }: { deal: LeadDeal; index: number }) {
  const stageConfig = getDealStageConfig(deal.stage)

  return (
    <div
      className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50/50 transition-colors group cursor-pointer"
      style={{ animationDelay: `${(index + 1) * 50}ms` }}
      onClick={() => {
        window.location.href = `/employee/crm/deals/${deal.id}`
      }}
    >
      {/* Deal Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        stageConfig.iconBg
      )}>
        {stageConfig.icon}
      </div>

      {/* Deal Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">{deal.name}</p>
        <div className="flex items-center gap-3 mt-1">
          <Badge className={cn("text-xs", stageConfig.bg, stageConfig.text)}>
            {deal.stage.replace(/_/g, ' ')}
          </Badge>
          {deal.owner && (
            <span className="text-xs text-charcoal-500 flex items-center gap-1">
              <User className="h-3 w-3" />
              {deal.owner.fullName}
            </span>
          )}
        </div>
      </div>

      {/* Value & Probability */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-charcoal-900">
          {deal.value ? `$${deal.value.toLocaleString()}` : '—'}
        </p>
        <p className="text-xs text-charcoal-500">
          {deal.probability}% probability
        </p>
      </div>

      {/* Expected Close */}
      {deal.expectedCloseDate && (
        <div className="text-right shrink-0">
          <p className="text-xs text-charcoal-500">Close Date</p>
          <p className="text-sm text-charcoal-900">
            {format(new Date(deal.expectedCloseDate), 'MMM d')}
          </p>
        </div>
      )}

      <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  )
}

function getDealStageConfig(stage: string): {
  bg: string
  text: string
  icon: React.ReactNode
  iconBg: string
} {
  const stageConfigs: Record<string, {
    bg: string
    text: string
    icon: React.ReactNode
    iconBg: string
  }> = {
    discovery: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: <Target className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
    },
    qualification: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      icon: <AlertTriangle className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-100',
    },
    proposal: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <Building2 className="h-5 w-5 text-amber-600" />,
      iconBg: 'bg-amber-100',
    },
    negotiation: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      iconBg: 'bg-orange-100',
    },
    closed_won: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: <CheckCircle2 className="h-5 w-5 text-success-600" />,
      iconBg: 'bg-success-100',
    },
    closed_lost: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      icon: <XCircle className="h-5 w-5 text-error-600" />,
      iconBg: 'bg-error-100',
    },
  }

  return stageConfigs[stage.toLowerCase()] || {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-700',
    icon: <DollarSign className="h-5 w-5 text-charcoal-600" />,
    iconBg: 'bg-charcoal-100',
  }
}

export default LeadDealsSection
