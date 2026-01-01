'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/client'
import { PIPELINE_STAGES, getStageFromStatus, getStatusForStage, type PipelineStage, type SubmissionStatus } from '@/lib/pipeline/stages'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import type { Submission } from '@/configs/entities/submissions.config'

interface JobPipelineKanbanProps {
  jobId: string
  submissions: Submission[]
  onRefresh?: () => void
}

export function JobPipelineKanban({ jobId, submissions, onRefresh }: JobPipelineKanbanProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Group submissions by stage
  const groupedSubmissions = useMemo(() => {
    const groups: Record<PipelineStage, Submission[]> = {
      sourced: [],
      screening: [],
      submitted: [],
      client_review: [],
      interview: [],
      offer: [],
      placed: [],
    }

    submissions
      .filter((s) => !['rejected', 'withdrawn'].includes(s.status))
      .forEach((submission) => {
        const stage = getStageFromStatus(submission.status)
        groups[stage].push(submission)
      })

    return groups
  }, [submissions])

  // Status update mutation
  const updateStatusMutation = trpc.ats.submissions.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: 'Status updated', description: 'Submission moved to new stage' })
      onRefresh?.()
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'error' })
    },
  })

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const submission = event.active.data.current?.submission as Submission
    setActiveSubmission(submission)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveSubmission(null)

    const { active, over } = event
    if (!over) return

    const submissionId = active.id as string
    const targetStage = over.id as PipelineStage

    const submission = submissions.find((s) => s.id === submissionId)
    if (!submission) return

    const currentStage = getStageFromStatus(submission.status)
    if (currentStage === targetStage) return

    // Get the status for the target stage
    const newStatus = getStatusForStage(targetStage) as SubmissionStatus

    updateStatusMutation.mutate({
      id: submissionId,
      status: newStatus,
    })
  }, [submissions, updateStatusMutation])

  const handleViewSubmission = useCallback((submissionId: string) => {
    router.push(`/employee/recruiting/submissions/${submissionId}`)
  }, [router])

  const handleStatusChange = useCallback((submissionId: string, status: SubmissionStatus) => {
    updateStatusMutation.mutate({ id: submissionId, status })
  }, [updateStatusMutation])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-min">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              submissions={groupedSubmissions[stage.id]}
              maxVisible={5}
              onViewSubmission={handleViewSubmission}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {/* Drag Overlay - Shows card being dragged */}
      <DragOverlay>
        {activeSubmission && (
          <KanbanCard
            submission={activeSubmission}
            onView={() => {}}
            onStatusChange={() => {}}
          />
        )}
      </DragOverlay>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-charcoal-500 mt-4">
        <span>Drag cards to change stage</span>
        <span>Total: {submissions.filter(s => !['rejected', 'withdrawn'].includes(s.status)).length} in pipeline</span>
      </div>
    </DndContext>
  )
}
