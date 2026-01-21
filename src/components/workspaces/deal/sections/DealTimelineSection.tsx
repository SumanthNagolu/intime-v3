'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, Clock, CheckCircle2, ArrowRight, Zap, Target,
  AlertTriangle, TrendingUp, Flag, Plus
} from 'lucide-react'
import type { DealData, DealStageHistoryEntry, DealStage } from '@/types/deal'
import { format, formatDistanceToNow, differenceInDays, isPast, isFuture } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealTimelineSectionProps {
  deal: DealData
  stageHistory: DealStageHistoryEntry[]
  onAddMilestone?: () => void
  onUpdateNextStep?: () => void
}

const STAGES_ORDER: DealStage[] = ['discovery', 'qualification', 'proposal', 'negotiation', 'verbal_commit', 'closed_won']

/**
 * DealTimelineSection - Key dates, milestones, and stage progression
 *
 * Displays:
 * - Next Steps card with due date
 * - Key dates (expected close, contract dates)
 * - Stage history timeline with duration metrics
 */
export function DealTimelineSection({
  deal,
  stageHistory,
  onAddMilestone,
  onUpdateNextStep
}: DealTimelineSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'

  // Calculate days until expected close
  const daysUntilClose = deal.expectedCloseDate
    ? differenceInDays(new Date(deal.expectedCloseDate), new Date())
    : null

  return (
    <div className="space-y-6">
      {/* Next Steps Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(0)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Next Steps</h3>
                <p className="text-xs text-charcoal-500">Upcoming actions to advance the deal</p>
              </div>
            </div>
            {onUpdateNextStep && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                onClick={onUpdateNextStep}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Update
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          {deal.nextStep ? (
            <div className={cn(
              "p-4 rounded-lg border",
              deal.nextStepDate && isPast(new Date(deal.nextStepDate))
                ? "bg-error-50 border-error-200"
                : "bg-charcoal-50 border-charcoal-100"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  deal.nextStepDate && isPast(new Date(deal.nextStepDate))
                    ? "bg-error-100"
                    : "bg-charcoal-100"
                )}>
                  {deal.nextStepDate && isPast(new Date(deal.nextStepDate)) ? (
                    <AlertTriangle className="h-5 w-5 text-error-600" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-charcoal-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-900">{deal.nextStep}</p>
                  {deal.nextStepDate && (
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
                      <span className={cn(
                        "text-xs font-medium",
                        isPast(new Date(deal.nextStepDate)) ? "text-error-600" : "text-charcoal-600"
                      )}>
                        {isPast(new Date(deal.nextStepDate))
                          ? `Overdue by ${formatDistanceToNow(new Date(deal.nextStepDate))}`
                          : `Due ${format(new Date(deal.nextStepDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm font-medium text-charcoal-700">No next step defined</p>
              <p className="text-xs text-charcoal-500 mt-0.5">Add a next step to keep momentum</p>
              {onUpdateNextStep && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={onUpdateNextStep}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Next Step
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Key Dates Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Key Dates</h3>
              <p className="text-xs text-charcoal-500">Important milestones and deadlines</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Expected Close Date */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Expected Close</p>
              {deal.expectedCloseDate ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-charcoal-900">
                    {format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                  </p>
                  {!isClosed && daysUntilClose !== null && (
                    <Badge className={cn(
                      "font-medium",
                      daysUntilClose < 0 ? "bg-error-50 text-error-700" :
                        daysUntilClose < 14 ? "bg-amber-50 text-amber-700" :
                          "bg-charcoal-100 text-charcoal-700"
                    )}>
                      {daysUntilClose < 0
                        ? `${Math.abs(daysUntilClose)} days overdue`
                        : daysUntilClose === 0
                          ? 'Due today'
                          : `${daysUntilClose} days remaining`}
                    </Badge>
                  )}
                </div>
              ) : (
                <p className="text-sm text-charcoal-400 italic">Not set</p>
              )}
            </div>

            {/* Actual Close Date (if closed) */}
            {isClosed && deal.actualCloseDate && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actual Close</p>
                <p className="text-lg font-semibold text-charcoal-900">
                  {format(new Date(deal.actualCloseDate), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Contract Dates (if closed won) */}
            {deal.stage === 'closed_won' && (
              <>
                {deal.contractSignedDate && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Contract Signed</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {format(new Date(deal.contractSignedDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                {deal.contractStartDate && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Contract Start</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {format(new Date(deal.contractStartDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Created Date */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Created</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {format(new Date(deal.createdAt), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-charcoal-500">
                {formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Last Activity */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Last Activity</p>
              {deal.lastActivityAt ? (
                <>
                  <p className="text-lg font-semibold text-charcoal-900">
                    {format(new Date(deal.lastActivityAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-charcoal-500">
                    {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-charcoal-400 italic">No activity logged</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stage History Timeline */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Stage History</h3>
              <p className="text-xs text-charcoal-500">Pipeline progression timeline</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {stageHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-charcoal-200" />

              <div className="space-y-6">
                {stageHistory.map((entry, idx) => {
                  const isCurrentStage = entry.stage === deal.stage && !entry.exitedAt
                  const isCompleted = !!entry.exitedAt

                  return (
                    <div key={entry.id} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        isCurrentStage
                          ? "bg-gold-500 ring-4 ring-gold-100"
                          : isCompleted
                            ? "bg-success-500"
                            : "bg-charcoal-200"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : isCurrentStage ? (
                          <Target className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-charcoal-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-charcoal-900">
                              {formatStage(entry.stage)}
                            </p>
                            <p className="text-xs text-charcoal-500">
                              Entered {format(new Date(entry.enteredAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {entry.durationDays !== null && (
                            <Badge variant="outline" className="text-charcoal-600">
                              {entry.durationDays} day{entry.durationDays !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        {isCurrentStage && (
                          <div className="mt-2">
                            <Badge className="bg-gold-50 text-gold-700 border-gold-200">
                              Current Stage • {deal.daysInStage} days
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm font-medium text-charcoal-700">No stage history</p>
              <p className="text-xs text-charcoal-500 mt-0.5">Stage changes will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(3)}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                <Flag className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Current Status</p>
                <p className="text-lg font-semibold text-charcoal-900">{formatStage(deal.stage)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Total Pipeline Time</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {differenceInDays(new Date(), new Date(deal.createdAt))} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function
function formatStage(stage: string): string {
  const stages: Record<string, string> = {
    discovery: 'Discovery',
    qualification: 'Qualification',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    verbal_commit: 'Verbal Commit',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  }
  return stages[stage] || stage
}

export default DealTimelineSection
