'use client'

import React from 'react'
import type { LessonBlock, VideoRef } from '@/lib/academy/types'
import { HookCard } from './blocks/HookCard'
import { ObjectivesList } from './blocks/ObjectivesList'
import { ActivateCard } from './blocks/ActivateCard'
import { ConceptSection } from './blocks/ConceptSection'
import { DemoSection } from './blocks/DemoSection'
import { PracticeCard } from './blocks/PracticeCard'
import { KnowledgeCheckSection } from './blocks/KnowledgeCheckSection'
import { SummaryCard } from './blocks/SummaryCard'
import { AssignmentSection } from './blocks/AssignmentSection'

interface BlockRendererProps {
  block: LessonBlock
  chapterSlug: string
  lessonNumber: number
  lessonId: string
  videos: VideoRef[]
  onVideoWatched: (filename: string) => void
  watchedVideos: string[]
  assignmentPdf?: string
  solutionPdf?: string
  onAssignmentSubmit: (lessonId: string, response: string) => void
  isAssignmentSubmitted: boolean
  assignmentResponse?: string
  kcIndex: number
  totalKCs: number
}

export function BlockRenderer({
  block,
  chapterSlug,
  lessonNumber,
  lessonId,
  videos,
  onVideoWatched,
  watchedVideos,
  assignmentPdf,
  solutionPdf,
  onAssignmentSubmit,
  isAssignmentSubmitted,
  assignmentResponse,
  kcIndex,
  totalKCs,
}: BlockRendererProps) {
  switch (block.type) {
    case 'hook':
      return <HookCard block={block} />

    case 'objectives':
      return <ObjectivesList block={block} />

    case 'activate':
      return <ActivateCard block={block} />

    case 'concept':
      return (
        <ConceptSection
          block={block}
          chapterSlug={chapterSlug}
          lessonNumber={lessonNumber}
        />
      )

    case 'demo':
      return (
        <DemoSection
          block={block}
          videos={videos}
          chapterSlug={chapterSlug}
          onVideoWatched={onVideoWatched}
          watchedVideos={watchedVideos}
        />
      )

    case 'practice':
      return <PracticeCard block={block} />

    case 'knowledge_check':
      return (
        <KnowledgeCheckSection
          block={block}
          lessonId={lessonId}
          index={kcIndex}
          totalChecks={totalKCs}
        />
      )

    case 'summary':
      return <SummaryCard block={block} />

    case 'assignment':
      return (
        <AssignmentSection
          block={block}
          lessonId={lessonId}
          assignmentPdf={assignmentPdf}
          solutionPdf={solutionPdf}
          onSubmit={onAssignmentSubmit}
          isSubmitted={isAssignmentSubmitted}
          previousResponse={assignmentResponse}
        />
      )

    default: {
      const _exhaustive: never = block
      return null
    }
  }
}
