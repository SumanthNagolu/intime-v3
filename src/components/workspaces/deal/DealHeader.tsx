'use client'

import * as React from 'react'
import { Briefcase, DollarSign, Building2, User, Calendar, Copy, Check, ExternalLink, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DealData, DealStage } from '@/types/deal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface DealHeaderProps {
  deal: DealData
  accountName?: string | null
}

const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; bg: string; text: string; dot: string; border: string }> = {
  discovery: { label: 'Discovery', bg: 'bg-charcoal-100', text: 'text-charcoal-700', dot: 'bg-charcoal-500', border: 'border-charcoal-200' },
  qualification: { label: 'Qualification', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  proposal: { label: 'Proposal', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  negotiation: { label: 'Negotiation', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  verbal_commit: { label: 'Verbal Commit', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  closed_won: { label: 'Closed Won', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
  closed_lost: { label: 'Closed Lost', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', border: 'border-error-200' },
}

const HEALTH_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof TrendingUp }> = {
  on_track: { label: 'On Track', bg: 'bg-success-50', text: 'text-success-700', icon: TrendingUp },
  slow: { label: 'Slow', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
  stale: { label: 'Stale', bg: 'bg-orange-50', text: 'text-orange-700', icon: Clock },
  urgent: { label: 'Urgent', bg: 'bg-error-50', text: 'text-error-700', icon: AlertTriangle },
  at_risk: { label: 'At Risk', bg: 'bg-error-50', text: 'text-error-700', icon: AlertTriangle },
}

const STAGES_ORDER: DealStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'verbal_commit']

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * DealHeader - Premium entity header with Hublot-inspired design
 *
 * Features:
 * - Clean information display (no action buttons - those are in sidebar)
 * - Visual stage progress indicator
 * - Premium card styling with gradient accents
 * - Key metrics display
 */
export function DealHeader({ deal, accountName }: DealHeaderProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || DEAL_STAGE_CONFIG.discovery
  const healthConfig = deal.healthStatus ? HEALTH_STATUS_CONFIG[deal.healthStatus] : null
  const currentStageIndex = STAGES_ORDER.indexOf(deal.stage)
  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'

  // Copy deal ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(deal.id)
    setCopied(true)
    toast({ title: 'Deal ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-500" />

      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-lg shadow-gold-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gold-500/30 group-hover:scale-105">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            {/* Health indicator */}
            {healthConfig && deal.healthStatus !== 'on_track' && (
              <div className={cn(
                "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg",
                deal.healthStatus === 'at_risk' || deal.healthStatus === 'urgent'
                  ? 'bg-gradient-to-br from-error-400 to-error-600 animate-pulse'
                  : 'bg-gradient-to-br from-amber-400 to-amber-600'
              )}>
                <healthConfig.icon className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {deal.title}
              </h1>
              <Badge className={cn(
                'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                stageConfig.bg,
                stageConfig.text,
                stageConfig.border
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", stageConfig.dot)} />
                {stageConfig.label}
              </Badge>
              {healthConfig && deal.healthStatus !== 'on_track' && (
                <Badge className={cn(
                  'capitalize font-medium px-2.5 py-0.5',
                  healthConfig.bg,
                  healthConfig.text
                )}>
                  {healthConfig.label}
                </Badge>
              )}
            </div>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {accountName && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="font-medium text-charcoal-600">{accountName}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-semibold text-charcoal-900">{formatCurrency(deal.value, deal.currency)}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                <TrendingUp className="h-3.5 w-3.5" />
                {deal.probability}% probability
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                Weighted: <span className="font-medium text-charcoal-700">{formatCurrency(deal.weightedValue, deal.currency)}</span>
              </span>
              {deal.owner && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <User className="h-3.5 w-3.5" />
                  {deal.owner.fullName}
                </span>
              )}
            </div>

            {/* Dates and ID row */}
            <div className="mt-2 flex items-center gap-4">
              {deal.expectedCloseDate && (
                <span className="flex items-center gap-1.5 text-xs text-charcoal-500">
                  <Calendar className="h-3 w-3" />
                  {isClosed
                    ? `Closed: ${format(new Date(deal.actualCloseDate || deal.expectedCloseDate), 'MMM d, yyyy')}`
                    : `Expected: ${format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}`}
                </span>
              )}
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">ID: {deal.id.slice(0, 8)}...</span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Days in Stage */}
          <div className="text-right flex-shrink-0">
            <div className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-1">
              Days in Stage
            </div>
            <div className="text-3xl font-bold text-charcoal-900 tracking-tight">
              {deal.daysInStage}
            </div>
          </div>
        </div>

        {/* Pipeline Progress */}
        {!isClosed && (
          <div className="mt-6 pt-6 border-t border-charcoal-100">
            <div className="flex items-center justify-between">
              {STAGES_ORDER.map((stage, index) => {
                const config = DEAL_STAGE_CONFIG[stage]
                const isCompleted = index < currentStageIndex
                const isCurrent = stage === deal.stage

                return (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                          isCompleted
                            ? 'bg-success-500 text-white shadow-sm'
                            : isCurrent
                              ? 'bg-gold-500 text-white shadow-md shadow-gold-500/30 ring-4 ring-gold-100'
                              : 'bg-charcoal-100 text-charcoal-400'
                        )}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <span
                        className={cn(
                          "text-xs mt-2 font-medium transition-colors",
                          isCurrent ? 'text-gold-700' : isCompleted ? 'text-charcoal-700' : 'text-charcoal-400'
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    {index < STAGES_ORDER.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-3 rounded-full transition-colors",
                          index < currentStageIndex ? 'bg-success-500' : 'bg-charcoal-200'
                        )}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DealHeader
