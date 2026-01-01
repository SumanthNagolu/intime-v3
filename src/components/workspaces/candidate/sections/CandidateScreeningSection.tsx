'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardCheck,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Briefcase,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidateScreening, ScreeningScoreCategory } from '@/types/candidate-workspace'
import { formatDistanceToNow, format } from 'date-fns'

interface CandidateScreeningSectionProps {
  screenings: CandidateScreening[]
  candidateId: string
  onStartScreening?: () => void
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-charcoal-100 text-charcoal-700' },
  in_progress: { label: 'In Progress', icon: Play, color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-success-100 text-success-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-charcoal-100 text-charcoal-500' },
}

const RESULT_CONFIG: Record<string, { label: string; color: string }> = {
  pass: { label: 'Pass', color: 'bg-success-100 text-success-700' },
  fail: { label: 'Fail', color: 'bg-error-100 text-error-700' },
  conditional: { label: 'Conditional', color: 'bg-warning-100 text-warning-700' },
}

const TYPE_CONFIG: Record<string, { label: string; description: string }> = {
  technical: { label: 'Technical Screening', description: 'Skills and technical assessment' },
  background: { label: 'Background Check', description: 'Employment and credential verification' },
  phone: { label: 'Phone Screen', description: 'Initial phone interview' },
  general: { label: 'General Screening', description: 'Overall candidate evaluation' },
}

/**
 * CandidateScreeningSection - Displays screening history and allows starting new screenings
 */
export function CandidateScreeningSection({
  screenings,
  candidateId,
  onStartScreening,
}: CandidateScreeningSectionProps) {
  // Separate active/in-progress from completed
  const inProgressScreenings = screenings.filter((s) => s.status === 'in_progress')
  const completedScreenings = screenings.filter((s) => s.status === 'completed')
  const pendingScreenings = screenings.filter((s) => s.status === 'pending')

  const handleStartScreening = () => {
    if (onStartScreening) {
      onStartScreening()
    } else {
      window.dispatchEvent(
        new CustomEvent('openCandidateDialog', {
          detail: { dialogId: 'startScreening', candidateId },
        })
      )
    }
  }

  const handleResumeScreening = (screeningId: string) => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'resumeScreening', candidateId, screeningId },
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Screenings</h2>
          <p className="text-sm text-charcoal-500">
            {screenings.length} total screening{screenings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleStartScreening}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Start New Screening
        </Button>
      </div>

      {/* In-Progress Screenings */}
      {inProgressScreenings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            In Progress
          </h3>
          {inProgressScreenings.map((screening) => (
            <InProgressScreeningCard
              key={screening.id}
              screening={screening}
              onResume={() => handleResumeScreening(screening.id)}
            />
          ))}
        </div>
      )}

      {/* Pending Screenings */}
      {pendingScreenings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Pending
          </h3>
          {pendingScreenings.map((screening) => (
            <ScreeningCard key={screening.id} screening={screening} />
          ))}
        </div>
      )}

      {/* Completed Screenings */}
      {completedScreenings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Completed ({completedScreenings.length})
          </h3>
          {completedScreenings.map((screening) => (
            <CompletedScreeningCard key={screening.id} screening={screening} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {screenings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Screenings Yet
            </h3>
            <p className="text-sm text-charcoal-500 mb-4 max-w-md mx-auto">
              Start a screening to assess the candidate&apos;s skills, qualifications, and fit for roles.
            </p>
            <Button onClick={handleStartScreening}>
              <Play className="h-4 w-4 mr-2" />
              Start First Screening
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// In-Progress Screening Card
function InProgressScreeningCard({
  screening,
  onResume,
}: {
  screening: CandidateScreening
  onResume: () => void
}) {
  const typeConfig = TYPE_CONFIG[screening.screeningType] || TYPE_CONFIG.general

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700">
                <Play className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
              <span className="text-sm font-medium text-charcoal-900">
                {typeConfig.label}
              </span>
            </div>
            {screening.job && (
              <div className="flex items-center gap-1.5 text-sm text-charcoal-600 mb-2">
                <Briefcase className="h-3.5 w-3.5" />
                {screening.job.title}
              </div>
            )}
            {screening.startedAt && (
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <Clock className="h-3 w-3" />
                Started {formatDistanceToNow(new Date(screening.startedAt), { addSuffix: true })}
              </div>
            )}
          </div>
          <Button size="sm" onClick={onResume}>
            <Play className="h-4 w-4 mr-1" />
            Resume
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Screening Card (for pending)
function ScreeningCard({ screening }: { screening: CandidateScreening }) {
  const statusConfig = STATUS_CONFIG[screening.status] || STATUS_CONFIG.pending
  const typeConfig = TYPE_CONFIG[screening.screeningType] || TYPE_CONFIG.general
  const StatusIcon = statusConfig.icon

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-charcoal-100">
              <ClipboardCheck className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <div className="font-medium text-charcoal-900">{typeConfig.label}</div>
              {screening.job && (
                <div className="text-sm text-charcoal-500">
                  For: {screening.job.title}
                </div>
              )}
            </div>
          </div>
          <Badge className={statusConfig.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Completed Screening Card (with scorecard)
function CompletedScreeningCard({ screening }: { screening: CandidateScreening }) {
  const [expanded, setExpanded] = React.useState(false)
  const typeConfig = TYPE_CONFIG[screening.screeningType] || TYPE_CONFIG.general
  const resultConfig = screening.result ? RESULT_CONFIG[screening.result] : null

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              screening.result === 'pass' ? 'bg-success-100' :
              screening.result === 'fail' ? 'bg-error-100' : 'bg-charcoal-100'
            )}>
              {screening.result === 'pass' ? (
                <CheckCircle className="h-5 w-5 text-success-600" />
              ) : screening.result === 'fail' ? (
                <XCircle className="h-5 w-5 text-error-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning-600" />
              )}
            </div>
            <div>
              <div className="font-medium text-charcoal-900">{typeConfig.label}</div>
              <div className="flex items-center gap-3 text-sm text-charcoal-500">
                {screening.job && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {screening.job.title}
                  </span>
                )}
                {screening.completedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(screening.completedAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {screening.overallScore !== null && (
              <div className="text-right">
                <div className="text-2xl font-semibold text-charcoal-900">
                  {screening.overallScore}
                </div>
                <div className="text-xs text-charcoal-500 uppercase">Score</div>
              </div>
            )}
            {resultConfig && (
              <Badge className={resultConfig.color}>
                {resultConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-charcoal-100 space-y-4">
            {/* Screener */}
            {screening.screener && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-charcoal-400" />
                <span className="text-charcoal-600">Screened by:</span>
                <span className="text-charcoal-900 font-medium">
                  {screening.screener.fullName}
                </span>
              </div>
            )}

            {/* Scorecard Categories */}
            {screening.scorecard?.categories && screening.scorecard.categories.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-charcoal-700 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" />
                  Scorecard
                </h4>
                <div className="grid gap-2">
                  {screening.scorecard.categories.map((category, idx) => (
                    <ScoreCategory key={idx} category={category} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {screening.scorecard?.recommendation && (
              <div className="p-3 rounded-lg bg-charcoal-50">
                <div className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                  Recommendation
                </div>
                <div className={cn(
                  'text-sm font-medium capitalize',
                  screening.scorecard.recommendation === 'hire' && 'text-success-700',
                  screening.scorecard.recommendation === 'no_hire' && 'text-error-700',
                  screening.scorecard.recommendation === 'consider' && 'text-warning-700',
                )}>
                  {screening.scorecard.recommendation.replace('_', ' ')}
                </div>
              </div>
            )}

            {/* Notes */}
            {screening.notes && (
              <div className="p-3 rounded-lg bg-charcoal-50">
                <div className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                  Notes
                </div>
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                  {screening.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Score Category Component
function ScoreCategory({ category }: { category: ScreeningScoreCategory }) {
  const scoreColor =
    category.score >= 80 ? 'bg-success-500' :
    category.score >= 60 ? 'bg-blue-500' :
    category.score >= 40 ? 'bg-warning-500' : 'bg-error-500'

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-charcoal-700 truncate">{category.name}</div>
      <div className="flex-1 h-2 bg-charcoal-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all', scoreColor)}
          style={{ width: `${category.score}%` }}
        />
      </div>
      <div className="w-12 text-right text-sm font-medium text-charcoal-900">
        {category.score}%
      </div>
    </div>
  )
}

export default CandidateScreeningSection
