'use client'

import React from 'react'
import {
  Lightbulb,
  Target,
  BrainCircuit,
  BookOpen,
  Play,
  FlaskConical,
  HelpCircle,
  Award,
  ClipboardList,
} from 'lucide-react'
import type { LessonBlock, LessonBlockType } from '@/lib/academy/types'

const BLOCK_TYPE_CONFIG: Record<LessonBlockType, { icon: React.ElementType; label: string }> = {
  hook: { icon: Lightbulb, label: 'Hook' },
  objectives: { icon: Target, label: 'Objectives' },
  activate: { icon: BrainCircuit, label: 'Prior Knowledge' },
  concept: { icon: BookOpen, label: 'Concept' },
  demo: { icon: Play, label: 'Demo' },
  practice: { icon: FlaskConical, label: 'Practice' },
  knowledge_check: { icon: HelpCircle, label: 'Knowledge Check' },
  summary: { icon: Award, label: 'Summary' },
  assignment: { icon: ClipboardList, label: 'Assignment' },
}

interface SynthesizedSidebarProps {
  blocks: LessonBlock[]
  activeBlockId: string | null
  visitedBlocks: Set<string>
  onBlockClick: (blockId: string) => void
}

export function SynthesizedSidebar({
  blocks,
  activeBlockId,
  visitedBlocks,
  onBlockClick,
}: SynthesizedSidebarProps) {
  return (
    <>
      <div className="m-nav-label">Lesson Journey</div>
      {blocks.map((block) => {
        const config = BLOCK_TYPE_CONFIG[block.type]
        const Icon = config.icon
        const isActive = activeBlockId === block.id
        const isVisited = visitedBlocks.has(block.id)

        // For concept blocks, show heading; for others, show type label
        const label = block.type === 'concept'
          ? block.heading
          : config.label

        return (
          <div key={block.id} className="m-nav-item-wrapper">
            <div
              className={`m-nav-item ${isActive ? 'active' : ''} ${isVisited ? 'completed' : ''}`}
              onClick={() => onBlockClick(block.id)}
            >
              <div className="m-nav-dot">
                {isVisited ? '✓' : ''}
              </div>
              <div className="m-nav-title">
                {label.length > 35 ? label.slice(0, 35) + '...' : label}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
