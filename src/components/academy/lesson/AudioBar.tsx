'use client'

import React from 'react'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react'
import type { NarrationState, NarrationSpeed } from '@/hooks/useNarration'

interface AudioBarProps {
  narration: NarrationState & {
    rate: NarrationSpeed
    isSupported: boolean
  }
  hasNarration: boolean
  onPlayPause: () => void
  onCycleSpeed: () => void
  currentIndex: number
  totalSlides: number
  visitedCount: number
  onPrev: () => void
  onNext: () => void
  isLastSlide: boolean
  hasEndSection: boolean
  showEndSection: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioBar({
  narration,
  hasNarration,
  onPlayPause,
  onCycleSpeed,
  currentIndex,
  totalSlides,
  visitedCount,
  onPrev,
  onNext,
  isLastSlide,
  hasEndSection,
  showEndSection,
}: AudioBarProps) {
  const progressPct = totalSlides > 0 ? Math.round((visitedCount / totalSlides) * 100) : 0

  return (
    <div className="h-16 flex-shrink-0 bg-charcoal-900 border-t border-charcoal-800 flex items-center px-4 lg:px-6 gap-4">
      {/* Audio controls (left) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          disabled={!hasNarration || !narration.isSupported}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-gold-500 hover:bg-gold-400 text-charcoal-900"
          title={narration.isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {narration.isPlaying ? (
            <Pause className="w-4.5 h-4.5" fill="currentColor" />
          ) : (
            <Play className="w-4.5 h-4.5 ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Progress bar + time */}
        <div className="flex-1 min-w-0 max-w-md flex items-center gap-3">
          {/* Progress bar */}
          <div className="flex-1 h-1 bg-charcoal-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${narration.progress}%` }}
            />
          </div>
          {/* Time */}
          <span className="text-[11px] font-mono text-charcoal-400 tabular-nums whitespace-nowrap">
            {formatTime(narration.currentTime)} / {formatTime(narration.duration)}
          </span>
        </div>

        {/* Speed */}
        <button
          onClick={onCycleSpeed}
          disabled={!narration.isSupported}
          className="px-2 py-1 rounded-md text-[11px] font-semibold text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors disabled:opacity-30 tabular-nums"
          title="Change narration speed"
        >
          {narration.rate}x
        </button>

        {/* Volume indicator */}
        <div className="hidden sm:flex items-center">
          {narration.isPlaying ? (
            <Volume2 className="w-4 h-4 text-gold-500/60" />
          ) : (
            <VolumeX className="w-4 h-4 text-charcoal-600" />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-charcoal-700" />

      {/* Overall progress bar (center) */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="w-24 h-1 bg-charcoal-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-charcoal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] text-charcoal-500 tabular-nums">{progressPct}%</span>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-8 bg-charcoal-700" />

      {/* Navigation (right) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0 && !showEndSection}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-medium text-charcoal-400 tabular-nums whitespace-nowrap min-w-[70px] text-center">
          {showEndSection ? 'Quiz' : `${currentIndex + 1} / ${totalSlides}`}
        </span>

        <button
          onClick={onNext}
          disabled={showEndSection}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed text-charcoal-400 hover:text-white hover:bg-charcoal-700"
        >
          {isLastSlide && hasEndSection && !showEndSection ? (
            <ShieldCheck className="w-4 h-4 text-gold-500" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
