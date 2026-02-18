'use client'

import React from 'react'
import type { InteractiveAssignmentBlock, ExerciseWorkRecord } from '@/lib/academy/types'
import { AssignmentHeaderCard } from './blocks/AssignmentHeaderCard'
import { ExerciseGroupCard } from './blocks/ExerciseGroupCard'
import { StepCard } from './blocks/StepCard'
import { WriteItDownCard } from './blocks/WriteItDownCard'
import { DataTableCard } from './blocks/DataTableCard'
import { CodeTaskCard } from './blocks/CodeTaskCard'
import { CalloutCard } from './blocks/CalloutCard'
import { VerificationCard } from './blocks/VerificationCard'
import { SolutionRevealCard } from './blocks/SolutionRevealCard'
import { ReferenceCard } from './blocks/ReferenceCard'

interface AssignmentBlockRendererProps {
  block: InteractiveAssignmentBlock
  assignmentId: string
  exerciseRecords: Record<string, ExerciseWorkRecord>
  revealedSolutionSteps: Set<string>
  onStepToggle: (exerciseId: string, stepId: string, done: boolean) => void
  onWriteItDownSubmit: (exerciseId: string, blockId: string, answer: string, correct?: boolean, feedback?: string) => void
  onCodeSubmit: (exerciseId: string, blockId: string, code: string, feedback?: string, score?: number) => void
  onVerificationToggle: (exerciseId: string, stepId: string, checked: boolean) => void
  onRevealHint: (exerciseId: string) => void
  onRevealSolution: (exerciseId: string, blockId: string) => void
}

export function AssignmentBlockRenderer({
  block,
  assignmentId,
  exerciseRecords,
  revealedSolutionSteps,
  onStepToggle,
  onWriteItDownSubmit,
  onCodeSubmit,
  onVerificationToggle,
  onRevealHint,
  onRevealSolution,
}: AssignmentBlockRendererProps) {
  switch (block.type) {
    case 'assignment_header':
      return <AssignmentHeaderCard block={block} />

    case 'exercise_group': {
      const record = exerciseRecords[block.id]
      return (
        <ExerciseGroupCard
          block={block}
          exerciseStatus={record?.status ?? 'not_started'}
        />
      )
    }

    case 'step': {
      const record = exerciseRecords[block.exerciseId]
      const isDone = record?.stepsCompleted.includes(block.id) ?? false
      return (
        <StepCard
          block={block}
          isDone={isDone}
          onToggle={(stepId, done) => onStepToggle(block.exerciseId, stepId, done)}
        />
      )
    }

    case 'write_it_down': {
      const record = exerciseRecords[block.exerciseId]
      const existing = record?.writeItDownAnswers[block.id]
      return (
        <WriteItDownCard
          block={block}
          assignmentId={assignmentId}
          existingAnswer={existing}
          hintsRevealed={record?.hintsRevealed ?? 0}
          onSubmit={(blockId, answer, correct, feedback) =>
            onWriteItDownSubmit(block.exerciseId, blockId, answer, correct, feedback)
          }
          onRevealHint={() => onRevealHint(block.exerciseId)}
        />
      )
    }

    case 'data_table':
      return <DataTableCard block={block} />

    case 'code_task': {
      const record = exerciseRecords[block.exerciseId]
      const existing = record?.codeSubmissions[block.id]
      return (
        <CodeTaskCard
          block={block}
          assignmentId={assignmentId}
          existingSubmission={existing}
          hintsRevealed={record?.hintsRevealed ?? 0}
          onSubmit={(blockId, code, feedback, score) =>
            onCodeSubmit(block.exerciseId, blockId, code, feedback, score)
          }
          onRevealHint={() => onRevealHint(block.exerciseId)}
        />
      )
    }

    case 'callout':
      return <CalloutCard block={block} />

    case 'verification': {
      const record = exerciseRecords[block.exerciseId]
      return (
        <VerificationCard
          block={block}
          checkedSteps={record?.verificationChecks ?? []}
          onToggle={(stepId, checked) =>
            onVerificationToggle(block.exerciseId, stepId, checked)
          }
        />
      )
    }

    case 'solution_step': {
      const isRevealed = revealedSolutionSteps.has(block.id)
      return (
        <SolutionRevealCard
          block={block}
          isRevealed={isRevealed}
          onReveal={() => onRevealSolution(block.exerciseId, block.id)}
        />
      )
    }

    case 'reference':
      return <ReferenceCard block={block} />

    default:
      return null
  }
}
