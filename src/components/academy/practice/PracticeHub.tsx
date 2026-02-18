'use client'

import React, { useState } from 'react'
import {
  MessageSquare,
  Target,
  Code2,
  Mic,
  FlaskConical,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { GuruChat } from '../GuruChat'
import { CardsMode } from './CardsMode'
import { CodeMode } from './CodeMode'
import { MockMode } from './MockMode'
import { LabsMode } from './LabsMode'

type PracticeMode = 'guru' | 'cards' | 'code' | 'mock' | 'labs'

const MODES = [
  { id: 'guru' as const, label: 'Guru', icon: MessageSquare },
  { id: 'cards' as const, label: 'Cards', icon: Target },
  { id: 'code' as const, label: 'Code', icon: Code2 },
  { id: 'mock' as const, label: 'Mock', icon: Mic },
  { id: 'labs' as const, label: 'Labs', icon: FlaskConical },
]

export function PracticeHub() {
  const [activeMode, setActiveMode] = useState<PracticeMode>('guru')
  const { streak } = useAcademyStore()

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 py-2.5 border-b border-charcoal-200/60 bg-white shrink-0">
        {/* Streak badge */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200/80 mr-3">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 tabular-nums">
              {streak}d
            </span>
          </div>
        )}

        {/* Mode tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-100/60">
          {MODES.map((mode) => {
            const isActive = activeMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-white/60'
                )}
              >
                <mode.icon className={cn('w-4 h-4', isActive && 'text-gold-400')} />
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeMode === 'guru' && <GuruChat fullScreen />}
        {activeMode === 'cards' && <CardsMode />}
        {activeMode === 'code' && <CodeMode />}
        {activeMode === 'mock' && <MockMode />}
        {activeMode === 'labs' && <LabsMode />}
      </div>
    </div>
  )
}
