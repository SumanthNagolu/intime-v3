'use client'

import React from 'react'
import { FlaskConical, BookOpen, ClipboardList, CookingPot } from 'lucide-react'
import type { ExerciseGroup } from '@/lib/academy/types'

interface ExerciseGroupCardProps {
  block: ExerciseGroup
  exerciseStatus: 'not_started' | 'in_progress' | 'completed'
}

const VARIANT_CONFIG = {
  lab: { icon: FlaskConical, label: 'Lab' },
  activity: { icon: ClipboardList, label: 'Activity' },
  exercise: { icon: BookOpen, label: 'Exercise' },
  cookbook: { icon: CookingPot, label: 'Cookbook' },
} as const

export function ExerciseGroupCard({ block, exerciseStatus }: ExerciseGroupCardProps) {
  const variant = block.variant ?? 'exercise'
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  return (
    <div id={`block-${block.id}`} className="m-content-block" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              exerciseStatus === 'completed'
                ? 'var(--m-accent-sage-soft)'
                : exerciseStatus === 'in_progress'
                  ? 'rgba(192,104,48,0.08)'
                  : 'var(--m-bg-cream)',
            border: `1px solid ${
              exerciseStatus === 'completed'
                ? 'rgba(90,122,90,0.2)'
                : exerciseStatus === 'in_progress'
                  ? 'var(--m-border-warm)'
                  : 'var(--m-border)'
            }`,
          }}
        >
          <Icon
            className="w-[18px] h-[18px]"
            style={{
              color:
                exerciseStatus === 'completed'
                  ? 'var(--m-accent-sage)'
                  : exerciseStatus === 'in_progress'
                    ? 'var(--m-accent-warm)'
                    : 'var(--m-text-muted)',
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span
              className="m-mono"
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '1.5px',
                textTransform: 'uppercase' as const,
                color: 'var(--m-accent-warm)',
              }}
            >
              {config.label} {block.exerciseNumber}
            </span>
            {exerciseStatus === 'completed' && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: 'var(--m-accent-sage)',
                  padding: '2px 8px',
                  background: 'var(--m-accent-sage-soft)',
                  borderRadius: 10,
                }}
              >
                Complete
              </span>
            )}
          </div>
          <h3 className="m-block-heading" style={{ fontSize: 20, marginBottom: 0 }}>
            {block.title}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 14, color: 'var(--m-text-secondary)', lineHeight: 1.85, margin: 0 }}>
        {block.description}
      </p>
    </div>
  )
}
