'use client'

/**
 * Lead Deal Tab
 *
 * Displays deal information or "Create Deal" option:
 * - If deal exists: Deal card with stage, value, and link
 * - If no deal: Empty state with Create Deal button
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Briefcase, TrendingUp, ArrowRight, Plus, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CampaignLead } from '@/types/campaign'

interface LeadDealTabProps {
  lead: CampaignLead
  onCreateDeal?: () => void
}

export function LeadDealTab({ lead, onCreateDeal }: LeadDealTabProps) {
  const deal = lead.deal

  // Stage config for visual styling
  const stageConfig: Record<string, { color: string; bg: string; progress: number }> = {
    qualification: { color: 'text-blue-600', bg: 'bg-blue-100', progress: 20 },
    discovery: { color: 'text-purple-600', bg: 'bg-purple-100', progress: 40 },
    proposal: { color: 'text-amber-600', bg: 'bg-amber-100', progress: 60 },
    negotiation: { color: 'text-gold-600', bg: 'bg-gold-100', progress: 80 },
    closed_won: { color: 'text-green-600', bg: 'bg-green-100', progress: 100 },
    closed_lost: { color: 'text-red-600', bg: 'bg-red-100', progress: 100 },
  }

  if (!deal) {
    // Empty state - no deal linked
    return (
      <div className="p-4">
        <Card className="bg-charcoal-50/50 border-0">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-charcoal-400" />
            </div>
            <h4 className="text-sm font-medium text-charcoal-900 mb-1">No Deal Linked</h4>
            <p className="text-xs text-charcoal-500 mb-4">
              Create a deal to track this opportunity through your sales pipeline
            </p>
            <Button onClick={onCreateDeal} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Deal
            </Button>
          </CardContent>
        </Card>

        {/* Quick stats about lead */}
        <Card className="bg-charcoal-50/50 border-0 mt-4">
          <CardContent className="p-4">
            <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-3">Lead Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Lead Score</span>
                <span className={cn(
                  'font-medium',
                  (lead.score || 0) >= 70 ? 'text-green-600' : (lead.score || 0) >= 40 ? 'text-amber-600' : 'text-charcoal-600'
                )}>
                  {lead.score || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500">Status</span>
                <span className="font-medium text-charcoal-900 capitalize">{lead.status}</span>
              </div>
              {lead.companyName && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Company</span>
                  <span className="font-medium text-charcoal-900">{lead.companyName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Deal exists - show deal card
  const stageStyle = stageConfig[deal.stage] || stageConfig.qualification

  return (
    <div className="p-4 space-y-4">
      {/* Deal Card */}
      <Card className="bg-white border border-charcoal-200 shadow-sm">
        <CardContent className="p-4">
          {/* Deal Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-charcoal-900">{deal.name}</h4>
              <p className={cn('text-sm capitalize', stageStyle.color)}>{deal.stage.replace('_', ' ')}</p>
            </div>
            <Link
              href={`/employee/crm/deals/${deal.id}`}
              className="text-gold-600 hover:text-gold-700 flex items-center gap-1 text-sm"
            >
              View Deal <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Deal Value */}
          {deal.value !== null && deal.value !== undefined && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">${deal.value.toLocaleString()}</p>
                <p className="text-sm text-green-600">Deal Value</p>
              </div>
            </div>
          )}

          {/* Stage Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-charcoal-500">Pipeline Progress</span>
              <span className={cn('font-medium', stageStyle.color)}>{stageStyle.progress}%</span>
            </div>
            <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  deal.stage === 'closed_won' ? 'bg-green-500' :
                  deal.stage === 'closed_lost' ? 'bg-red-500' :
                  'bg-gold-500'
                )}
                style={{ width: `${stageStyle.progress}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/employee/crm/deals/${deal.id}`}>
                <Briefcase className="w-4 h-4 mr-2" />
                Open Deal
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deal Progress Stages */}
      <Card className="bg-charcoal-50/50 border-0">
        <CardContent className="p-4">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-3">Pipeline Stages</p>
          <div className="flex items-center gap-1">
            {['qualification', 'discovery', 'proposal', 'negotiation', 'closed_won'].map((stage, index) => {
              const isCurrentOrPast = stageConfig[deal.stage]?.progress >= stageConfig[stage]?.progress
              const isCurrent = deal.stage === stage
              return (
                <div key={stage} className="flex-1">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      isCurrentOrPast ? 'bg-gold-500' : 'bg-charcoal-200',
                      isCurrent && 'ring-2 ring-gold-300'
                    )}
                  />
                  <p className={cn(
                    'text-xs mt-1 text-center capitalize',
                    isCurrent ? 'text-gold-600 font-medium' : 'text-charcoal-400'
                  )}>
                    {stage.replace('_', ' ').split(' ')[0]}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
