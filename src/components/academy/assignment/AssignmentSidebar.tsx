'use client'

import React from 'react'
import { CheckCircle, Circle, Play } from 'lucide-react'
import type { ExerciseGroup, ExerciseWorkRecord } from '@/lib/academy/types'

interface AssignmentSidebarProps {
  exercises: ExerciseGroup[]
  exerciseRecords: Record<string, ExerciseWorkRecord>
  activeExerciseId: string | null
  onExerciseClick: (exerciseId: string) => void
}

export function AssignmentSidebar({
  exercises,
  exerciseRecords,
  activeExerciseId,
  onExerciseClick,
}: AssignmentSidebarProps) {
  return (
    <div>
      <div className="m-nav-label">Exercises</div>

      {exercises.map((ex) => {
        const record = exerciseRecords[ex.id]
        const status = record?.status ?? 'not_started'
        const isActive = activeExerciseId === ex.id
        const isCompleted = status === 'completed'
        const isInProgress = status === 'in_progress'

        return (
          <div key={ex.id} className="m-nav-item-wrapper">
            <div
              className={`m-nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onExerciseClick(ex.id)}
            >
              <div className="m-nav-dot">
                {isCompleted ? (
                  <CheckCircle className="w-3 h-3" />
                ) : isInProgress ? (
                  <Play className="w-2.5 h-2.5" style={{ marginLeft: 1 }} />
                ) : null}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="m-mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase' as const,
                    color: isActive
                      ? 'var(--m-accent-warm)'
                      : isCompleted
                        ? 'var(--m-accent-sage)'
                        : 'var(--m-text-light)',
                    marginBottom: 2,
                  }}
                >
                  {ex.variant ?? 'Exercise'} {ex.exerciseNumber}
                </div>
                <div className="m-nav-title" style={{ fontSize: 12 }}>
                  {ex.title.replace(/^(Lab|Activity|Exercise|Cookbook):\s*/i, '')}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
