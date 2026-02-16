'use client'

import React, { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileText, SkipForward } from 'lucide-react'

type EndTab = 'quiz' | 'assignment'

interface NextLessonInfo {
  title: string
  chapterSlug: string
  lessonNumber: number
}

interface NavigationBarProps {
  currentIndex: number
  totalSlides: number
  visitedCount: number
  onPrev: () => void
  onNext: () => void
  onGoToSlide?: (index: number) => void
  isLastSlide: boolean
  hasEndSection: boolean
  showEndSection: boolean
  endTab?: EndTab
  onEndTabChange?: (tab: EndTab) => void
  hasAssignment?: boolean
  hasCheckpoints?: boolean
  nextLesson?: NextLessonInfo | null
  onNextLesson?: () => void
}

export function NavigationBar({
  currentIndex,
  totalSlides,
  visitedCount,
  onPrev,
  onNext,
  onGoToSlide,
  isLastSlide,
  hasEndSection,
  showEndSection,
  endTab,
  hasAssignment,
  nextLesson,
  onNextLesson,
}: NavigationBarProps) {
  const progressPct =
    totalSlides > 0 ? Math.round((visitedCount / totalSlides) * 100) : 0
  const dotsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll dots to keep current dot visible
  useEffect(() => {
    if (!dotsRef.current) return
    const dot = dotsRef.current.children[currentIndex] as HTMLElement
    if (dot) {
      dot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentIndex])

  return (
    <div className="flex-shrink-0 bg-white border-t border-warm-light/15">
      {/* Interactive slide dots */}
      {totalSlides > 1 && onGoToSlide && !showEndSection && (
        <div className="px-3 md:px-6 pt-2.5 pb-0.5">
          <div
            ref={dotsRef}
            className="flex items-center justify-center gap-[5px] overflow-x-auto py-1 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => onGoToSlide(i)}
                className={`flex-shrink-0 rounded-full transition-all duration-200 cursor-pointer ${
                  i === currentIndex
                    ? 'w-7 h-2 bg-copper-500'
                    : i < visitedCount
                      ? 'w-2 h-2 bg-sage-400 hover:bg-sage-500 hover:scale-125'
                      : 'w-2 h-2 bg-warm-light/40 hover:bg-warm-light/60 hover:scale-125'
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls row */}
      <div className="h-10 flex items-center px-3 md:px-6 gap-3">
        {/* Progress */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="w-20 md:w-32 h-1.5 rounded-full bg-warm-cream overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full transition-all duration-500 bg-copper-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono-warm text-[10px] font-medium text-warm-muted tabular-nums whitespace-nowrap">
            {progressPct}%<span className="hidden sm:inline"> viewed</span>
          </span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0 && !showEndSection}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-muted hover:text-warm-primary hover:bg-warm-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-serif text-xs font-medium text-warm-muted tabular-nums whitespace-nowrap min-w-[50px] md:min-w-[70px] text-center flex items-center justify-center gap-1.5">
            {showEndSection ? (
              <>
                <FileText className="w-3.5 h-3.5" />
                Assignment
              </>
            ) : (
              `${currentIndex + 1} / ${totalSlides}`
            )}
          </span>

          {isLastSlide && hasEndSection && !showEndSection ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper-500 text-white text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Assignment
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (showEndSection || (currentIndex >= totalSlides - 1 && !hasEndSection)) && nextLesson && onNextLesson ? (
            <button
              onClick={onNextLesson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm-deep text-white text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Next Lesson
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={(showEndSection) || (currentIndex >= totalSlides - 1 && !hasEndSection)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-muted hover:text-warm-primary hover:bg-warm-cream transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
