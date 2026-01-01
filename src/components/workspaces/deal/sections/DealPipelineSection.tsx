'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Clock } from 'lucide-react'
import type { DealData, DealStageHistoryEntry, DealStage } from '@/types/deal'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealPipelineSectionProps {
  deal: DealData
  stageHistory: DealStageHistoryEntry[]
  onMoveStage?: () => void
  onCloseWon?: () => void
  onCloseLost?: () => void
}

const STAGES: { key: DealStage; label: string; probability: number }[] = [
  { key: 'discovery', label: 'Discovery', probability: 20 },
  { key: 'qualification', label: 'Qualification', probability: 40 },
  { key: 'proposal', label: 'Proposal', probability: 60 },
  { key: 'negotiation', label: 'Negotiation', probability: 70 },
  { key: 'verbal_commit', label: 'Verbal Commit', probability: 90 },
]

export function DealPipelineSection({
  deal,
  stageHistory,
  onMoveStage,
  onCloseWon,
  onCloseLost,
}: DealPipelineSectionProps) {
  const currentStageIndex = STAGES.findIndex(s => s.key === deal.stage)
  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'

  return (
    <div className="space-y-6">
      {/* Pipeline Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {isClosed ? (
            <div className="text-center py-8">
              <div
                className={cn(
                  'w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4',
                  deal.stage === 'closed_won' ? 'bg-green-100' : 'bg-red-100'
                )}
              >
                <Check
                  className={cn(
                    'w-8 h-8',
                    deal.stage === 'closed_won' ? 'text-green-600' : 'text-red-600'
                  )}
                />
              </div>
              <h3 className={cn(
                'text-xl font-semibold mb-2',
                deal.stage === 'closed_won' ? 'text-green-600' : 'text-red-600'
              )}>
                {deal.stage === 'closed_won' ? 'Deal Won!' : 'Deal Lost'}
              </h3>
              {deal.actualCloseDate && (
                <p className="text-sm text-charcoal-500">
                  Closed on {format(new Date(deal.actualCloseDate), 'MMMM d, yyyy')}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Stage Progress Bar */}
              <div className="flex items-center justify-between mb-6">
                {STAGES.map((stage, index) => {
                  const isCompleted = index < currentStageIndex
                  const isCurrent = stage.key === deal.stage

                  return (
                    <React.Fragment key={stage.key}>
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2',
                            isCompleted && 'bg-green-500 text-white',
                            isCurrent && 'bg-gold-500 text-white ring-4 ring-gold-100',
                            !isCompleted && !isCurrent && 'bg-charcoal-100 text-charcoal-500'
                          )}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                        </div>
                        <span
                          className={cn(
                            'text-xs text-center',
                            isCurrent ? 'font-medium text-gold-600' : 'text-charcoal-500'
                          )}
                        >
                          {stage.label}
                        </span>
                        <span className="text-xs text-charcoal-400 mt-0.5">
                          {stage.probability}%
                        </span>
                      </div>
                      {index < STAGES.length - 1 && (
                        <div
                          className={cn(
                            'flex-1 h-1 mx-2 rounded',
                            isCompleted ? 'bg-green-500' : 'bg-charcoal-200'
                          )}
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Current Stage Info */}
              <div className="p-4 bg-charcoal-50 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-charcoal-500">Current Stage</p>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {STAGES[currentStageIndex]?.label || deal.stage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-charcoal-500">Days in Stage</p>
                    <p className="text-lg font-semibold text-charcoal-900 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {deal.daysInStage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={onCloseLost}>
                  Mark Lost
                </Button>
                {currentStageIndex < STAGES.length - 1 ? (
                  <Button onClick={onMoveStage}>
                    Advance Stage
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={onCloseWon} className="bg-green-600 hover:bg-green-700">
                    Mark Won
                    <Check className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stage History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Stage History</CardTitle>
        </CardHeader>
        <CardContent>
          {stageHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-charcoal-200" />

              {/* History items */}
              <div className="space-y-4">
                {stageHistory.map((entry, index) => {
                  const stageConfig = STAGES.find(s => s.key === entry.stage)
                  const isLast = index === stageHistory.length - 1

                  return (
                    <div key={entry.id} className="flex items-start gap-4 relative">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                          index === 0 && !isClosed && 'bg-gold-500 text-white',
                          (index > 0 || isClosed) && 'bg-green-500 text-white'
                        )}
                      >
                        {index === 0 && !isClosed ? (
                          <span className="text-xs font-medium">
                            {STAGES.findIndex(s => s.key === entry.stage) + 1}
                          </span>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-charcoal-900">
                            {stageConfig?.label || entry.stage}
                          </p>
                          {entry.durationDays !== null && (
                            <span className="text-xs text-charcoal-500">
                              {entry.durationDays} {entry.durationDays === 1 ? 'day' : 'days'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {format(new Date(entry.enteredAt), 'MMM d, yyyy')}
                          {entry.changedBy && ` • by ${entry.changedBy}`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-sm text-charcoal-500">No stage history recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DealPipelineSection
