'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'

interface PresentationControlsProps {
  currentIndex: number
  totalSlides: number
  visitedCount: number
  onPrev: () => void
  onNext: () => void
  isLastSlide: boolean
  hasEndSection: boolean
}

export function PresentationControls({
  currentIndex,
  totalSlides,
  visitedCount,
  onPrev,
  onNext,
  isLastSlide,
  hasEndSection,
}: PresentationControlsProps) {
  const progressPct = totalSlides > 0 ? Math.round((visitedCount / totalSlides) * 100) : 0

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-charcoal-200/60 bg-white flex-shrink-0">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-charcoal-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {/* Center: slide counter + progress */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium text-charcoal-600 tabular-nums">
          Slide {currentIndex + 1} of {totalSlides}
        </span>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Next */}
      <button
        onClick={onNext}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-charcoal-900 hover:bg-charcoal-800 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        {isLastSlide && hasEndSection ? (
          <>
            <ShieldCheck className="w-4 h-4" />
            Quiz
          </>
        ) : isLastSlide ? (
          <>
            Finish
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Next
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  )
}
