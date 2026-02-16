'use client'

import React from 'react'
import type { KnowledgeCheckBlock as KCBlockType } from '@/lib/academy/types'
import { KnowledgeCheckCard } from '../../KnowledgeCheckCard'

interface KnowledgeCheckSectionProps {
  block: KCBlockType
  lessonId: string
  index: number
  totalChecks: number
}

export function KnowledgeCheckSection({
  block,
  lessonId,
  index,
  totalChecks,
}: KnowledgeCheckSectionProps) {
  return (
    <div className="m-knowledge-block m-animate" id={`block-${block.id}`}>
      <KnowledgeCheckCard
        question={block.question}
        referenceAnswer={block.referenceAnswer}
        lessonId={lessonId}
        questionKey={block.questionKey}
        label={`Knowledge Check ${index + 1} of ${totalChecks}`}
      />
    </div>
  )
}
