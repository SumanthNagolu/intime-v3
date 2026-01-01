'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './KanbanCard'
import type { StageDefinition, SubmissionStatus } from '@/lib/pipeline/stages'
import type { Submission } from '@/configs/entities/submissions.config'

interface KanbanColumnProps {
  stage: StageDefinition
  submissions: Submission[]
  maxVisible?: number
  onViewSubmission: (id: string) => void
  onStatusChange: (id: string, status: SubmissionStatus) => void
}

export function KanbanColumn({
  stage,
  submissions,
  maxVisible = 5,
  onViewSubmission,
  onStatusChange,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stage },
  })

  const Icon = stage.icon
  const visibleSubmissions = submissions.slice(0, maxVisible)
  const hiddenCount = submissions.length - visibleSubmissions.length

  return (
    <div className="w-72 flex-shrink-0">
      {/* Column Header */}
      <div className={cn('flex items-center gap-2 p-3 rounded-t-lg', stage.color)}>
        <Icon className={cn('w-4 h-4', stage.textColor)} />
        <span className={cn('font-medium', stage.textColor)}>{stage.label}</span>
        <Badge variant="secondary" className="ml-auto">
          {submissions.length}
        </Badge>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'bg-white border border-t-0 border-charcoal-200 rounded-b-lg min-h-[300px] p-2 space-y-2 transition-colors',
          isOver && 'bg-gold-50 border-gold-300'
        )}
      >
        {visibleSubmissions.length === 0 ? (
          <div className="text-center py-8 text-charcoal-400 text-sm">
            No candidates
          </div>
        ) : (
          <>
            {visibleSubmissions.map((submission) => (
              <KanbanCard
                key={submission.id}
                submission={submission}
                onView={() => onViewSubmission(submission.id)}
                onStatusChange={(status) => onStatusChange(submission.id, status)}
              />
            ))}
            {hiddenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-charcoal-500 hover:text-gold-600"
              >
                Show {hiddenCount} more...
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
