'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardCheck, Edit, DollarSign, UserCheck, Target,
  Clock, AlertTriangle, CheckCircle2, Star, TrendingUp,
  Calendar, User, ExternalLink,
} from 'lucide-react'
import type { LeadData } from '@/types/lead'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface LeadQualificationSectionProps {
  lead: LeadData
  onUpdateBANT?: () => void
}

/**
 * LeadQualificationSection - Dedicated BANT scoring breakdown
 * Displays Budget, Authority, Need, Timeline scores with notes and qualification history
 */
export function LeadQualificationSection({
  lead,
  onUpdateBANT,
}: LeadQualificationSectionProps) {
  const bantScore = lead.bantTotalScore ?? 0
  const qualificationLevel = getQualificationLevel(bantScore)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-fade-in"
        style={getDelay(0)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">BANT Qualification Score</h3>
                <p className="text-xs text-charcoal-500">Budget, Authority, Need, Timeline assessment</p>
              </div>
            </div>
            {onUpdateBANT && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUpdateBANT}
                className="text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Update Score
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-8">
            {/* Large Score Display */}
            <div className="text-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={getScoreColor(bantScore)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(bantScore / 100) * 351.86} 351.86`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-charcoal-900">{bantScore}</span>
                  <span className="text-sm text-charcoal-500">/100</span>
                </div>
              </div>
              <Badge
                className={cn(
                  "mt-3",
                  qualificationLevel.bg,
                  qualificationLevel.text
                )}
              >
                {qualificationLevel.icon}
                {qualificationLevel.label}
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="flex-1 space-y-4">
              <BANTScoreBar label="Budget" score={lead.bantBudget ?? 0} icon={DollarSign} />
              <BANTScoreBar label="Authority" score={lead.bantAuthority ?? 0} icon={UserCheck} />
              <BANTScoreBar label="Need" score={lead.bantNeed ?? 0} icon={Target} />
              <BANTScoreBar label="Timeline" score={lead.bantTimeline ?? 0} icon={Clock} />
            </div>
          </div>
        </div>
      </div>

      {/* BANT Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Budget */}
        <BANTDetailCard
          title="Budget"
          subtitle="Financial capacity to purchase"
          icon={DollarSign}
          score={lead.bantBudget ?? 0}
          notes={lead.bantBudgetNotes}
          delay={1}
          questions={[
            'Has budget been allocated?',
            'Is budget sufficient for solution?',
            'What is the procurement process?',
          ]}
        />

        {/* Authority */}
        <BANTDetailCard
          title="Authority"
          subtitle="Decision-making power"
          icon={UserCheck}
          score={lead.bantAuthority ?? 0}
          notes={lead.bantAuthorityNotes}
          delay={2}
          questions={[
            'Is this the final decision maker?',
            'Who else is involved in decision?',
            'What is the approval process?',
          ]}
        />

        {/* Need */}
        <BANTDetailCard
          title="Need"
          subtitle="Business requirement alignment"
          icon={Target}
          score={lead.bantNeed ?? 0}
          notes={lead.bantNeedNotes}
          delay={3}
          questions={[
            'What problem are they solving?',
            'Is there urgency to solve it?',
            'How does our solution fit?',
          ]}
        />

        {/* Timeline */}
        <BANTDetailCard
          title="Timeline"
          subtitle="Purchase timeframe"
          icon={Clock}
          score={lead.bantTimeline ?? 0}
          notes={lead.bantTimelineNotes}
          delay={4}
          questions={[
            'When do they need to implement?',
            'Are there hard deadlines?',
            'What drives the timeline?',
          ]}
        />
      </div>

      {/* Qualification History */}
      {(lead.qualifiedAt || lead.qualificationResult) && (
        <div
          className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
          style={getDelay(5)}
        >
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Qualification Status</h3>
                <p className="text-xs text-charcoal-500">Current qualification and history</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {lead.qualificationResult && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Result</p>
                  <QualificationResultBadge result={lead.qualificationResult} />
                </div>
              )}
              {lead.qualifiedAt && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Qualified At</p>
                  <p className="text-sm text-charcoal-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-charcoal-400" />
                    {format(new Date(lead.qualifiedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {lead.qualifiedBy && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Qualified By</p>
                  <p className="text-sm text-charcoal-900 flex items-center gap-2">
                    <User className="h-4 w-4 text-charcoal-400" />
                    {lead.qualifiedBy}
                  </p>
                </div>
              )}
            </div>
            {lead.qualificationNotes && (
              <div className="mt-4 pt-4 border-t border-charcoal-100">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-charcoal-700 bg-charcoal-50 rounded-lg p-3">
                  {lead.qualificationNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Qualification Guide */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(6)}
      >
        <div className="px-6 py-4 border-b border-charcoal-200/60">
          <h3 className="font-semibold text-charcoal-900 text-sm">Scoring Guide</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <ScoreGuideItem score="0-6" label="Not Qualified" color="text-error-600" />
            <ScoreGuideItem score="7-12" label="Low" color="text-charcoal-500" />
            <ScoreGuideItem score="13-19" label="Medium" color="text-amber-600" />
            <ScoreGuideItem score="20-25" label="High" color="text-success-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function BANTScoreBar({
  label,
  score,
  icon: Icon,
}: {
  label: string
  score: number
  icon: React.ComponentType<{ className?: string }>
}) {
  const percentage = (score / 25) * 100
  const color = score >= 20 ? 'bg-success-500' : score >= 13 ? 'bg-amber-500' : 'bg-charcoal-400'

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 flex items-center gap-2">
        <Icon className="h-4 w-4 text-charcoal-400" />
        <span className="text-sm font-medium text-charcoal-700">{label}</span>
      </div>
      <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-charcoal-900 w-12 text-right">{score}/25</span>
    </div>
  )
}

interface BANTDetailCardProps {
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  score: number
  notes: string | null
  delay: number
  questions: string[]
}

function BANTDetailCard({
  title,
  subtitle,
  icon: Icon,
  score,
  notes,
  delay,
  questions,
}: BANTDetailCardProps) {
  const getScoreLabel = (score: number) => {
    if (score >= 20) return { label: 'Strong', color: 'text-success-600', bg: 'bg-success-50' }
    if (score >= 13) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50' }
    if (score >= 7) return { label: 'Weak', color: 'text-charcoal-600', bg: 'bg-charcoal-100' }
    return { label: 'Not Assessed', color: 'text-charcoal-400', bg: 'bg-charcoal-50' }
  }

  const scoreConfig = getScoreLabel(score)

  return (
    <div
      className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay * 75}ms` }}
    >
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Icon className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">{title}</h3>
              <p className="text-xs text-charcoal-500">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-charcoal-900">{score}</span>
            <span className="text-sm text-charcoal-400">/25</span>
            <Badge className={cn("ml-2", scoreConfig.bg, scoreConfig.color)}>
              {scoreConfig.label}
            </Badge>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-charcoal-500">
            <span>Score</span>
            <span>{Math.round((score / 25) * 100)}%</span>
          </div>
          <Progress value={(score / 25) * 100} className="h-2" />
        </div>

        {/* Notes */}
        {notes && (
          <div className="p-3 bg-charcoal-50 rounded-lg">
            <p className="text-sm text-charcoal-700">{notes}</p>
          </div>
        )}

        {/* Discovery Questions */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Key Questions</p>
          <ul className="space-y-1">
            {questions.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-charcoal-600">
                <span className="w-1.5 h-1.5 rounded-full bg-charcoal-300 mt-2 shrink-0" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function QualificationResultBadge({ result }: { result: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    qualified: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
    },
    disqualified: {
      bg: 'bg-error-50',
      text: 'text-error-700',
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <Clock className="h-3.5 w-3.5 mr-1" />,
    },
  }
  const resultConfig = config[result.toLowerCase()] || config.pending

  return (
    <Badge className={cn(resultConfig.bg, resultConfig.text, "capitalize")}>
      {resultConfig.icon}
      {result.replace(/_/g, ' ')}
    </Badge>
  )
}

function ScoreGuideItem({ score, label, color }: { score: string; label: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-white border border-charcoal-200/60">
      <p className={cn("text-lg font-bold", color)}>{score}</p>
      <p className="text-xs text-charcoal-500">{label}</p>
    </div>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 75) return '#0A8754' // success
  if (score >= 50) return '#D97706' // amber
  if (score >= 25) return '#6B7280' // gray
  return '#DC2626' // error
}

function getQualificationLevel(score: number): {
  label: string
  bg: string
  text: string
  icon: React.ReactNode
} {
  if (score >= 75) {
    return {
      label: 'Hot Lead',
      bg: 'bg-success-50',
      text: 'text-success-700',
      icon: <Star className="h-3.5 w-3.5 mr-1 fill-success-500" />,
    }
  }
  if (score >= 50) {
    return {
      label: 'Warm Lead',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: <TrendingUp className="h-3.5 w-3.5 mr-1" />,
    }
  }
  if (score >= 25) {
    return {
      label: 'Cool Lead',
      bg: 'bg-charcoal-100',
      text: 'text-charcoal-700',
      icon: <Target className="h-3.5 w-3.5 mr-1" />,
    }
  }
  return {
    label: 'Cold Lead',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
  }
}

export default LeadQualificationSection
