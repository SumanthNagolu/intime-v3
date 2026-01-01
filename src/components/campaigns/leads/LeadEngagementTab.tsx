'use client'

/**
 * Lead Engagement Tab
 *
 * Displays BANT qualification scores and engagement metrics:
 * - Budget score with progress bar
 * - Authority score with progress bar
 * - Need score with progress bar
 * - Timeline score with progress bar
 * - Overall qualification status
 */

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Shield, Target, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CampaignLead } from '@/types/campaign'

interface LeadEngagementTabProps {
  lead: CampaignLead
}

export function LeadEngagementTab({ lead }: LeadEngagementTabProps) {
  // BANT scores (default to 0 if not set)
  const budgetScore = lead.budgetScore || 0
  const authorityScore = lead.authorityScore || 0
  const needScore = lead.needScore || 0
  const timelineScore = lead.timelineScore || 0

  // Calculate overall BANT score
  const overallScore = Math.round((budgetScore + authorityScore + needScore + timelineScore) / 4)

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-gold-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-charcoal-300'
  }

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-gold-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-charcoal-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Developing'
    if (score > 0) return 'Weak'
    return 'Not assessed'
  }

  // BANT criteria definitions
  const bantCriteria = [
    {
      key: 'budget',
      label: 'Budget',
      description: 'Financial capacity to proceed',
      score: budgetScore,
      icon: DollarSign,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100',
    },
    {
      key: 'authority',
      label: 'Authority',
      description: 'Decision-making power',
      score: authorityScore,
      icon: Shield,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-100',
    },
    {
      key: 'need',
      label: 'Need',
      description: 'Business problem fit',
      score: needScore,
      icon: Target,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
    },
    {
      key: 'timeline',
      label: 'Timeline',
      description: 'Urgency to implement',
      score: timelineScore,
      icon: Clock,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100',
    },
  ]

  // Qualification status based on overall score
  const getQualificationStatus = () => {
    if (overallScore >= 75) return { label: 'Highly Qualified', color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
    if (overallScore >= 50) return { label: 'Qualified', color: 'bg-gold-100 text-gold-700', icon: TrendingUp }
    if (overallScore >= 25) return { label: 'Needs Nurturing', color: 'bg-amber-100 text-amber-700', icon: TrendingUp }
    return { label: 'Not Qualified', color: 'bg-charcoal-100 text-charcoal-600', icon: Clock }
  }

  const qualStatus = getQualificationStatus()
  const QualIcon = qualStatus.icon

  return (
    <div className="space-y-4 p-4">
      {/* Overall Qualification Banner */}
      <div className={cn('rounded-lg p-4 flex items-center justify-between', qualStatus.color)}>
        <div className="flex items-center gap-3">
          <QualIcon className="w-5 h-5" />
          <div>
            <p className="font-semibold">{qualStatus.label}</p>
            <p className="text-sm opacity-80">BANT Score: {overallScore}%</p>
          </div>
        </div>
        <div className="text-2xl font-bold">{overallScore}%</div>
      </div>

      {/* BANT Criteria Grid */}
      <div className="space-y-3">
        <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium">BANT Qualification</p>

        {bantCriteria.map((criteria) => {
          const Icon = criteria.icon
          return (
            <Card key={criteria.key} className="bg-charcoal-50/50 border-0">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', criteria.iconBg)}>
                    <Icon className={cn('w-4 h-4', criteria.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-charcoal-900">{criteria.label}</p>
                        <p className="text-xs text-charcoal-400">{criteria.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn('text-sm font-bold', getScoreTextColor(criteria.score))}>
                          {criteria.score}%
                        </span>
                        <p className="text-xs text-charcoal-400">{getScoreLabel(criteria.score)}</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-charcoal-200 rounded-full overflow-hidden mt-2">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', getScoreColor(criteria.score))}
                        style={{ width: `${criteria.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Score Legend */}
      <Card className="bg-charcoal-50/50 border-0">
        <CardContent className="p-3">
          <p className="text-xs text-charcoal-400 uppercase tracking-wider font-medium mb-2">Score Legend</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-charcoal-600">80-100: Strong</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gold-500" />
              <span className="text-charcoal-600">60-79: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-charcoal-600">40-59: Developing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-charcoal-300" />
              <span className="text-charcoal-600">0-39: Weak</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
