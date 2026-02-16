'use client'

import React, { useState } from 'react'
import { ZoomIn, Table2, X } from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'

interface SlideViewportProps {
  slide: SlideContent
  chapterSlug: string
  lessonNumber: number
}

export function SlideViewport({ slide, chapterSlug, lessonNumber }: SlideViewportProps) {
  const [imgError, setImgError] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const slideImagePath = `/academy/guidewire/slides/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}/slide-${String(slide.slideNumber).padStart(2, '0')}.png`

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Slide title bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-charcoal-100 bg-charcoal-50/50 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-charcoal-900 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{slide.slideNumber}</span>
        </div>
        {slide.title && (
          <h3 className="font-heading font-semibold text-charcoal-900 text-sm truncate">
            {slide.title}
          </h3>
        )}
        <div className="ml-auto flex items-center gap-2">
          {slide.hasTable && (
            <Table2 className="w-3.5 h-3.5 text-charcoal-400" />
          )}
        </div>
      </div>

      {/* Slide image area */}
      <div className="flex-1 overflow-y-auto">
        {!imgError ? (
          <div className="relative bg-charcoal-50 group/img">
            <img
              src={slideImagePath}
              alt={`Slide ${slide.slideNumber}${slide.title ? ` - ${slide.title}` : ''}`}
              className="w-full h-auto"
              onError={() => setImgError(true)}
            />
            <button
              onClick={() => setShowZoom(true)}
              className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        {/* Body paragraphs */}
        {slide.bodyParagraphs.length > 0 && (
          <div className="px-6 py-4 space-y-2">
            {slide.bodyParagraphs.map((para, i) => (
              <div
                key={i}
                className="flex items-start gap-2"
                style={{ paddingLeft: `${para.level * 16}px` }}
              >
                {para.level > 0 && (
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-charcoal-400 flex-shrink-0" />
                )}
                <p
                  className={`text-sm leading-relaxed ${
                    para.bold
                      ? 'font-semibold text-charcoal-900'
                      : 'text-charcoal-700'
                  }`}
                >
                  {para.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table data */}
        {slide.hasTable && slide.tableData && (
          <div className="px-6 py-4">
            <div className="overflow-x-auto rounded-lg border border-charcoal-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-charcoal-50">
                    {slide.tableData[0]?.map((cell, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-left font-semibold text-charcoal-900 border-b border-charcoal-200"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slide.tableData.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b border-charcoal-100 last:border-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2.5 text-charcoal-700">
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

        {/* Fallback when no image and no content */}
        {imgError && slide.bodyParagraphs.length === 0 && !slide.hasTable && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-charcoal-400">
              Slide {slide.slideNumber} — Visual content
            </p>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {showZoom && !imgError && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={slideImagePath}
            alt={`Slide ${slide.slideNumber}`}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
