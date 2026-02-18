'use client'

import React from 'react'
import { Target, Clock, Layers, CheckCircle } from 'lucide-react'
import type { AssignmentHeader } from '@/lib/academy/types'

interface AssignmentHeaderCardProps {
  block: AssignmentHeader
}

const LEVEL_CONFIG = {
  exploratory: { label: 'Exploratory', color: 'var(--m-accent-sage)' },
  configuration: { label: 'Configuration', color: 'var(--m-accent-gold)' },
  development: { label: 'Development', color: 'var(--m-accent-warm)' },
} as const

export function AssignmentHeaderCard({ block }: AssignmentHeaderCardProps) {
  const levelConfig = LEVEL_CONFIG[block.complexityLevel]

  return (
    <div className="m-animate" id={`block-${block.id}`}>
      {/* Scenario */}
      <div
        className="m-assignment-intro"
        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #fef3e8, #fef9f4)' }}
      >
        <div className="m-assignment-badge">
          <Layers className="w-4 h-4" />
          <span>Assignment Scenario</span>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--m-text-secondary)', margin: 0 }}>
          {block.scenario}
        </p>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Complexity badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            background: `${levelConfig.color}15`,
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 500,
            color: levelConfig.color,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: levelConfig.color }} />
          {levelConfig.label}
        </div>

        {/* Duration */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--m-text-muted)',
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          ~{block.estimatedMinutes} minutes
        </div>
      </div>

      {/* Prerequisites */}
      {block.prerequisites.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="m-aside-label" style={{ marginBottom: 10 }}>Prerequisites</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {block.prerequisites.map((prereq, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 14,
                  color: 'var(--m-text-secondary)',
                  lineHeight: 1.7,
                }}
              >
                <CheckCircle
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--m-accent-sage)', marginTop: 3 }}
                />
                {prereq}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objectives */}
      {block.objectives.length > 0 && (
        <div className="m-objectives">
          <div className="m-objectives-header">
            <Target className="w-5 h-5" style={{ color: 'var(--m-accent-sage)' }} />
            <span className="m-objectives-label">Learning Objectives</span>
          </div>
          <ul className="m-objectives-list">
            {block.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills tested */}
      {block.skillsTested.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="m-concept-tags">
            {block.skillsTested.map((skill, i) => (
              <span key={i} className="m-concept-pill">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
