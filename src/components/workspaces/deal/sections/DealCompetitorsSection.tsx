'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Target, Users, Shield, Trophy, XCircle, Plus, Edit,
  Building2, DollarSign, AlertTriangle, CheckCircle2, Lightbulb
} from 'lucide-react'
import type { DealData } from '@/types/deal'
import { cn } from '@/lib/utils'

interface DealCompetitorsSectionProps {
  deal: DealData
  onEdit?: () => void
  onAddCompetitor?: () => void
}

/**
 * DealCompetitorsSection - Competitive landscape and positioning
 *
 * Displays:
 * - Active competitors list
 * - Our competitive advantages
 * - Win/Loss analysis (if deal is closed)
 * - Competitors beaten or lost to
 */
export function DealCompetitorsSection({
  deal,
  onEdit,
  onAddCompetitor
}: DealCompetitorsSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
  const hasCompetitors = deal.competitors && deal.competitors.length > 0

  return (
    <div className="space-y-6">
      {/* Competitors List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(0)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Competitors</h3>
                <p className="text-xs text-charcoal-500">Other vendors in the running</p>
              </div>
            </div>
            {onAddCompetitor && !isClosed && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                onClick={onAddCompetitor}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          {hasCompetitors ? (
            <div className="space-y-3">
              {deal.competitors!.map((competitor, idx) => (
                <div
                  key={idx}
                  className="group flex items-center gap-3 p-4 rounded-lg border border-charcoal-100 bg-charcoal-50/50 hover:bg-charcoal-50 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900">{competitor}</p>
                  </div>
                  {/* Show status if closed */}
                  {deal.stage === 'closed_won' && deal.competitorsBeat?.includes(competitor) && (
                    <Badge className="bg-success-50 text-success-700 border-success-200">
                      <Trophy className="h-3 w-3 mr-1" />
                      Beat
                    </Badge>
                  )}
                  {deal.stage === 'closed_lost' && deal.competitorWon === competitor && (
                    <Badge className="bg-error-50 text-error-700 border-error-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      Lost to
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Target className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm font-medium text-charcoal-700">No competitors identified</p>
              <p className="text-xs text-charcoal-500 mt-0.5">Add competitors to track competitive landscape</p>
              {onAddCompetitor && !isClosed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onAddCompetitor}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Competitor
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Competitive Advantage Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Our Competitive Advantage</h3>
                <p className="text-xs text-charcoal-500">Why we should win this deal</p>
              </div>
            </div>
            {onEdit && !isClosed && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          {deal.competitiveAdvantage ? (
            <div className="p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-success-600" />
                </div>
                <p className="text-sm text-success-900 leading-relaxed">{deal.competitiveAdvantage}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm font-medium text-charcoal-700">No competitive advantage documented</p>
              <p className="text-xs text-charcoal-500 mt-0.5">Document why you should win this deal</p>
            </div>
          )}
        </div>
      </div>

      {/* Win Analysis (if closed won) */}
      {deal.stage === 'closed_won' && (deal.winReason || deal.winDetails || (deal.competitorsBeat && deal.competitorsBeat.length > 0)) && (
        <div className="rounded-xl border border-success-200 bg-success-50/50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
          <div className="px-6 py-4 border-b border-success-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-success-900">Win Analysis</h3>
                <p className="text-xs text-success-700">Why we won this deal</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {deal.winReason && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-success-700 uppercase tracking-wider">Win Reason</p>
                <Badge className="bg-success-100 text-success-800 border-success-200">
                  {formatWinReason(deal.winReason)}
                </Badge>
              </div>
            )}
            {deal.winDetails && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-success-700 uppercase tracking-wider">Details</p>
                <p className="text-sm text-success-900">{deal.winDetails}</p>
              </div>
            )}
            {deal.competitorsBeat && deal.competitorsBeat.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-success-700 uppercase tracking-wider">Competitors Beat</p>
                <div className="flex flex-wrap gap-2">
                  {deal.competitorsBeat.map((competitor, idx) => (
                    <Badge key={idx} variant="outline" className="text-success-700 border-success-300 bg-success-50">
                      <Trophy className="h-3 w-3 mr-1" />
                      {competitor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loss Analysis (if closed lost) */}
      {deal.stage === 'closed_lost' && (deal.lossReason || deal.lossReasonCategory || deal.lossDetails || deal.competitorWon) && (
        <div className="rounded-xl border border-error-200 bg-error-50/50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
          <div className="px-6 py-4 border-b border-error-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <h3 className="font-semibold text-error-900">Loss Analysis</h3>
                <p className="text-xs text-error-700">Understanding why we lost</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {deal.lossReasonCategory && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-error-700 uppercase tracking-wider">Loss Category</p>
                <Badge className="bg-error-100 text-error-800 border-error-200">
                  {formatLossCategory(deal.lossReasonCategory)}
                </Badge>
              </div>
            )}
            {deal.lossReason && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-error-700 uppercase tracking-wider">Reason</p>
                <p className="text-sm text-error-900">{deal.lossReason}</p>
              </div>
            )}
            {deal.lossDetails && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-error-700 uppercase tracking-wider">Details</p>
                <p className="text-sm text-error-900">{deal.lossDetails}</p>
              </div>
            )}
            {deal.competitorWon && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-error-700 uppercase tracking-wider">Lost To</p>
                <div className="flex items-center gap-3 p-3 bg-error-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-error-600" />
                  <span className="text-sm font-medium text-error-900">{deal.competitorWon}</span>
                  {deal.competitorPrice && (
                    <Badge variant="outline" className="ml-auto text-error-700 border-error-300">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {formatCurrency(deal.competitorPrice)}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lessons Learned (if closed lost and documented) */}
      {deal.stage === 'closed_lost' && deal.lessonsLearned && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(3)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Lessons Learned</h3>
                <p className="text-xs text-charcoal-500">Insights for future opportunities</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-charcoal-700 leading-relaxed">{deal.lessonsLearned}</p>
          </div>
        </div>
      )}

      {/* Future Potential (if closed lost) */}
      {deal.stage === 'closed_lost' && deal.futurePotential && (
        <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Future Potential</p>
                <Badge className={cn(
                  "mt-2",
                  deal.futurePotential === 'yes' ? "bg-success-50 text-success-700 border-success-200" :
                    deal.futurePotential === 'maybe' ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-charcoal-100 text-charcoal-700 border-charcoal-200"
                )}>
                  {deal.futurePotential === 'yes' ? 'Yes - Re-engage' :
                    deal.futurePotential === 'maybe' ? 'Maybe - Monitor' : 'No - Do Not Re-engage'}
                </Badge>
              </div>
              {deal.reengagementDate && (
                <div className="text-right">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Re-engagement Date</p>
                  <p className="text-sm font-semibold text-charcoal-900 mt-1">
                    {new Date(deal.reengagementDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatWinReason(reason: string): string {
  const reasons: Record<string, string> = {
    price_value: 'Price/Value',
    expertise_speed: 'Expertise & Speed',
    relationship_trust: 'Relationship & Trust',
    candidate_quality: 'Candidate Quality',
    response_time: 'Response Time',
    other: 'Other',
  }
  return reasons[reason] || reason
}

function formatLossCategory(category: string): string {
  const categories: Record<string, string> = {
    competitor: 'Lost to Competitor',
    no_budget: 'No Budget',
    project_cancelled: 'Project Cancelled',
    hired_internally: 'Hired Internally',
    went_dark: 'Went Dark',
    price_too_high: 'Price Too High',
    requirements_changed: 'Requirements Changed',
    other: 'Other',
  }
  return categories[category] || category
}

export default DealCompetitorsSection
