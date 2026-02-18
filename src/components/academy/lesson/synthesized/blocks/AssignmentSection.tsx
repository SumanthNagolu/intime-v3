'use client'

import React from 'react'
import { ClipboardList } from 'lucide-react'
import type { AssignmentBlock as AssignmentBlockType, SubmissionBlock } from '@/lib/academy/types'
import { AssignmentBlock } from '../../AssignmentBlock'

interface AssignmentSectionProps {
  block: AssignmentBlockType
  lessonId: string
  assignmentPdf?: string
  solutionPdf?: string
  onSubmit: (lessonId: string, response: string, blocks?: SubmissionBlock[]) => void
  isSubmitted: boolean
  previousResponse?: string
  previousBlocks?: SubmissionBlock[]
}

export function AssignmentSection({
  block,
  lessonId,
  assignmentPdf,
  solutionPdf,
  onSubmit,
  isSubmitted,
  previousResponse,
  previousBlocks,
}: AssignmentSectionProps) {
  return (
    <div id={`block-${block.id}`}>
      {/* Assignment intro */}
      <div className="m-assignment-intro m-animate">
        <div className="m-assignment-badge">
          <ClipboardList className="w-4 h-4" />
          <span>Hands-On Assignment</span>
        </div>
        <p className="m-assignment-desc">{block.description}</p>
        {block.objectives.length > 0 && (
          <ul className="m-assignment-objectives">
            {block.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Reuse existing AssignmentBlock */}
      <div id="assignment-section">
        <AssignmentBlock
          lessonId={lessonId}
          assignmentPdf={assignmentPdf}
          solutionPdf={solutionPdf}
          onSubmit={onSubmit}
          isSubmitted={isSubmitted}
          previousResponse={previousResponse}
          previousBlocks={previousBlocks}
        />
      </div>
    </div>
  )
}
