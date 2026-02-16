'use client'

import React, { useState, useMemo } from 'react'
import { BookCheck, ZoomIn, X } from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'

interface ReviewSlideProps {
  slide: SlideContent
  chapterSlug: string
  lessonNumber: number
  slideKey: number
}

function formatExplanation(text: string): string[] {
  const rawParagraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)
  if (rawParagraphs.length > 1) return rawParagraphs.map((p) => p.trim())

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  if (sentences.length <= 3) return [text.trim()]

  const paragraphs: string[] = []
  let current = ''
  for (let i = 0; i < sentences.length; i++) {
    current += sentences[i]
    if ((i + 1) % 3 === 0 || i === sentences.length - 1) {
      paragraphs.push(current.trim())
      current = ''
    }
  }
  if (current.trim()) paragraphs.push(current.trim())
  return paragraphs
}

export function ReviewSlide({ slide, chapterSlug, lessonNumber, slideKey }: ReviewSlideProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const slideImagePath = `/academy/guidewire/slides/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}/slide-${String(slide.slideNumber).padStart(2, '0')}.png`

  const narrationText = slide.narration || slide.notes || ''
  const explanationParagraphs = useMemo(
    () => (narrationText ? formatExplanation(narrationText) : []),
    [narrationText]
  )

  React.useEffect(() => {
    setImgError(false)
    setImgLoaded(false)
  }, [slideKey])

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-gradient-to-br from-sage-50/40 via-[#faf6f0] to-sage-50/20">
      <div
        className="flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 py-4 sm:py-5 relative overflow-y-auto scrollbar-warm"
      >
        {/* Review badge */}
        <div className="w-full max-w-3xl mb-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-50 border border-sage-200/60 flex items-center justify-center">
              <BookCheck className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <p className="font-mono-warm text-[9px] font-medium uppercase text-sage-600" style={{ letterSpacing: '2.5px' }}>
                Lesson Review
              </p>
              <h2 className="font-display font-semibold text-lg text-warm-primary" style={{ letterSpacing: '-0.01em' }}>
                {slide.title || 'Key Takeaways'}
              </h2>
            </div>
          </div>
        </div>

        {/* Slide image */}
        {!imgError ? (
          <div className="relative w-full max-w-3xl group/slide animate-fade-in-fast flex-shrink-0" key={slideKey}>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-elevation-md ring-1 ring-sage-200/40">
              <img
                src={slideImagePath}
                alt={slide.title || `Review Slide ${slide.slideNumber}`}
                className={`w-full h-auto transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
              {!imgLoaded && (
                <div className="aspect-[16/9] w-full animate-pulse" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }} />
              )}
              <button
                onClick={() => setShowZoom(true)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-md bg-black/40 backdrop-blur-sm text-white/80 flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-all duration-200 hover:bg-black/60 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Warm separator */}
        {explanationParagraphs.length > 0 && (
          <div className="w-16 mx-auto mt-3 md:mt-4 mb-1 divider-warm" />
        )}

        {/* Key takeaways text */}
        {explanationParagraphs.length > 0 && (
          <div className="mt-2 md:mt-3 max-w-3xl w-full space-y-3 md:space-y-4 animate-fade-in px-1" key={`expl-${slideKey}`}>
            {explanationParagraphs.map((para, i) => (
              <p
                key={i}
                className={`font-serif text-[15px] md:text-base ${
                  i === 0 ? 'text-warm-secondary' : 'text-warm-muted'
                }`}
                style={{ lineHeight: '1.85' }}
              >
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Instructor notes below */}
        {slide.notes && slide.narration && slide.notes !== slide.narration && (
          <div className="w-full max-w-3xl mt-4 animate-fade-in">
            <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-sage-50/80 border border-sage-200/40">
              <span className="text-sage-500 text-sm mt-px flex-shrink-0">&#x1F4A1;</span>
              <p className="font-serif text-[13px] leading-relaxed text-sage-800/70 italic">
                {slide.notes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {showZoom && !imgError && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={slideImagePath}
            alt={slide.title || `Review Slide ${slide.slideNumber}`}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
