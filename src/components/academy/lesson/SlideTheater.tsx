'use client'

import React, { useState, useMemo } from 'react'
import { ZoomIn, X, Download } from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'

interface SlideTheaterProps {
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

export function SlideTheater({ slide, chapterSlug, lessonNumber, slideKey }: SlideTheaterProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const slideImagePath = `/academy/guidewire/slides/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}/slide-${String(slide.slideNumber).padStart(2, '0')}.png`

  const notesText = slide.notes || ''
  const narrationText = slide.narration || ''
  const hasTip = notesText && narrationText && notesText !== narrationText
  const explanationText = narrationText || notesText || ''

  const explanationParagraphs = useMemo(
    () => (explanationText ? formatExplanation(explanationText) : []),
    [explanationText]
  )

  React.useEffect(() => {
    setImgError(false)
    setImgLoaded(false)
  }, [slideKey])

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden" style={{ backgroundColor: 'var(--al-bg, #faf6f0)' }}>
      {/* Content area */}
      <div
        className="flex-1 flex flex-col items-center px-3 sm:px-6 lg:px-8 py-4 sm:py-5 relative overflow-y-auto scrollbar-warm"
      >
        {/* Slide title */}
        {slide.title && (
          <div className="max-w-3xl w-full mb-3 animate-fade-in" key={`title-${slideKey}`}>
            <h2 className="font-display font-semibold text-lg md:text-xl lg:text-2xl text-center text-warm-primary" style={{ letterSpacing: '-0.01em' }}>
              {slide.title}
            </h2>
          </div>
        )}

        {/* Slide image */}
        {!imgError ? (
          <div className="relative w-full max-w-3xl group/slide animate-fade-in-fast flex-shrink-0" key={slideKey}>
            <div className="relative rounded-lg overflow-hidden bg-white shadow-elevation-md ring-1 ring-warm-light/20">
              <img
                src={slideImagePath}
                alt={slide.title || `Slide ${slide.slideNumber}`}
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

        {/* Instructor tip — below slide image */}
        {hasTip && (
          <div className="w-full max-w-3xl mt-4 animate-fade-in" key={`tip-${slideKey}`}>
            <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-copper-50 border border-copper-200/40">
              <span className="text-copper-500 text-sm mt-px flex-shrink-0">&#x1F4A1;</span>
              <p className="text-[13px] leading-relaxed text-copper-800/70 italic font-serif">
                {notesText}
              </p>
            </div>
          </div>
        )}

        {/* Warm separator */}
        {explanationParagraphs.length > 0 && (
          <div className="w-16 mx-auto mt-3 md:mt-4 mb-1 divider-warm" />
        )}

        {/* Well-formatted explanation */}
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

        {/* Body paragraphs from slide data */}
        {slide.bodyParagraphs.length > 0 && (
          <div className="mt-4 max-w-3xl w-full space-y-1.5" key={`body-${slideKey}`}>
            {slide.bodyParagraphs.map((para, i) => (
              <div
                key={i}
                className="flex items-start gap-2"
                style={{ paddingLeft: `${para.level * 20}px` }}
              >
                {para.level > 0 && (
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-copper-300 flex-shrink-0" />
                )}
                <p
                  className={`font-serif text-sm leading-relaxed ${
                    para.bold ? 'font-semibold text-warm-primary' : 'text-warm-muted'
                  }`}
                  style={{ lineHeight: '1.85' }}
                >
                  {para.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Download files */}
        {slide.downloadFiles && slide.downloadFiles.length > 0 && (
          <div className="mt-5 max-w-3xl w-full flex flex-wrap gap-2.5" key={`downloads-${slideKey}`}>
            {slide.downloadFiles.map((file, i) => (
              <a
                key={i}
                href={file.path}
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warm-deep text-white text-sm font-medium hover:bg-warm-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-elevation-sm"
              >
                <Download className="w-4 h-4" />
                {file.label}
              </a>
            ))}
          </div>
        )}

        {/* Table data */}
        {slide.hasTable && slide.tableData && (
          <div className="mt-5 max-w-3xl w-full overflow-x-auto">
            <div className="rounded-lg overflow-hidden border border-warm-light/20">
              <table className="w-full text-sm font-serif">
                <thead>
                  <tr style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
                    {slide.tableData[0]?.map((cell, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-left font-semibold text-warm-primary border-b border-warm-light/20"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slide.tableData.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b border-warm-light/10 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-warm-secondary">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Fallback: no image, no content */}
        {imgError && slide.bodyParagraphs.length === 0 && !slide.hasTable && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--al-cream, #f5efe5)' }}>
              <span className="text-2xl font-display font-bold text-warm-light">
                {slide.slideNumber}
              </span>
            </div>
            <p className="text-sm text-warm-muted">Visual content</p>
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
            alt={slide.title || `Slide ${slide.slideNumber}`}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
