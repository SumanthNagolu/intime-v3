'use client'

import * as React from 'react'
import { Briefcase, Building2, Calendar, DollarSign, TrendingUp, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DealData, DealStage } from '@/types/deal'
import { formatDistanceToNow, format } from 'date-fns'

interface DealHeaderProps {
  deal: DealData
  accountName?: string | null
}

const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; className: string; probability: number }> = {
  discovery: { label: 'Discovery', className: 'bg-charcoal-100 text-charcoal-700', probability: 20 },
  qualification: { label: 'Qualification', className: 'bg-blue-100 text-blue-700', probability: 40 },
  proposal: { label: 'Proposal', className: 'bg-amber-100 text-amber-700', probability: 60 },
  negotiation: { label: 'Negotiation', className: 'bg-orange-100 text-orange-700', probability: 70 },
  verbal_commit: { label: 'Verbal Commit', className: 'bg-green-100 text-green-700', probability: 90 },
  closed_won: { label: 'Closed Won', className: 'bg-green-600 text-white', probability: 100 },
  closed_lost: { label: 'Closed Lost', className: 'bg-red-100 text-red-700', probability: 0 },
}

const STAGES_ORDER: DealStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'verbal_commit', 'closed_won']

function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function DealHeader({ deal, accountName }: DealHeaderProps) {
  const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || DEAL_STAGE_CONFIG.discovery
  const currentStageIndex = STAGES_ORDER.indexOf(deal.stage)
  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'

  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Deal Icon */}
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gold-600" />
          </div>

          {/* Deal Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
                {deal.title}
              </h1>
              <Badge className={stageConfig.className}>
                {stageConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-600">
              {accountName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {accountName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatCurrency(deal.value)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {deal.probability}% • Weighted: {formatCurrency(deal.weightedValue)}
              </span>
              {deal.owner && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {deal.owner.fullName}
                </span>
              )}
            </div>

            {deal.expectedCloseDate && (
              <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {isClosed
                  ? `Closed ${format(new Date(deal.actualCloseDate || deal.expectedCloseDate), 'MMM d, yyyy')}`
                  : `Expected close: ${format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}`}
              </p>
            )}
          </div>
        </div>

        {/* Days in Stage */}
        <div className="text-right">
          <div className="text-sm text-charcoal-500 mb-1">Days in Stage</div>
          <div className="text-3xl font-bold text-charcoal-900">
            {deal.daysInStage}
          </div>
          <div className="text-sm text-charcoal-500">
            {deal.daysInStage === 1 ? 'day' : 'days'}
          </div>
        </div>
      </div>

      {/* Pipeline Progress */}
      {!isClosed && (
        <div className="mt-6 pt-6 border-t border-charcoal-100">
          <div className="flex items-center justify-between">
            {STAGES_ORDER.slice(0, -1).map((stage, index) => {
              const config = DEAL_STAGE_CONFIG[stage]
              const isCompleted = index < currentStageIndex
              const isCurrent = stage === deal.stage

              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-gold-500 text-white'
                            : 'bg-charcoal-100 text-charcoal-500'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isCurrent ? 'font-medium text-gold-600' : 'text-charcoal-500'
                      }`}
                    >
                      {config.label}
                    </span>
                  </div>
                  {index < STAGES_ORDER.length - 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-charcoal-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
