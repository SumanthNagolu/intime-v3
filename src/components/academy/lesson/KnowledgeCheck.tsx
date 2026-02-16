'use client'

import React from 'react'
import type { SlideContent } from '@/lib/academy/types'
import { KnowledgeCheckCard } from './KnowledgeCheckCard'

interface KnowledgeCheckProps {
  slide: SlideContent
  slideKey: number
  lessonId: string
}

export function KnowledgeCheck({ slide, slideKey, lessonId }: KnowledgeCheckProps) {
  const qd = slide.questionData
  if (!qd) return null

  const questionKey = `slide-${slide.slideNumber}`

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-2xl animate-fade-in">
          <KnowledgeCheckCard
            key={slideKey}
            question={qd.question}
            referenceAnswer={qd.answer}
            lessonId={lessonId}
            questionKey={questionKey}
          />
        </div>
      </div>
    </div>
  )
}
