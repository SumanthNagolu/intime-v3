'use client'

import React, { useState } from 'react'
import { BookOpen, Table2, BarChart3, Image as ImageIcon, ZoomIn, Download } from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'
import { getSlideImageUrl } from '@/lib/academy/content-loader'

interface SlideCardProps {
  slide: SlideContent
  slideIndex: number
  chapterSlug: string
  lessonNumber: number
}

export function SlideCard({ slide, slideIndex, chapterSlug, lessonNumber }: SlideCardProps) {
  const [imgError, setImgError] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const hasTextContent = slide.notes || slide.bodyParagraphs.length > 0 || slide.hasTable
  const slideImagePath = getSlideImageUrl(chapterSlug, lessonNumber, slide.slideNumber)

  // Skip completely empty slides (no image, no text, no notes)
  if (!hasTextContent && !slide.hasImage && slideIndex === 0) return null

  return (
    <div className="group relative" id={`slide-${slide.slideNumber}`}>
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden transition-all duration-300 hover:shadow-elevation-md">
        {/* Slide number indicator */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-charcoal-100 bg-charcoal-50/50">
          <div className="w-7 h-7 rounded-lg bg-charcoal-900 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{slide.slideNumber}</span>
          </div>
          {slide.title && (
            <h3 className="font-heading font-semibold text-charcoal-900 text-sm">
              {slide.title}
            </h3>
          )}
          <div className="ml-auto flex items-center gap-2">
            {slide.hasImage && (
              <ImageIcon className="w-3.5 h-3.5 text-charcoal-400" />
            )}
            {slide.hasTable && (
              <Table2 className="w-3.5 h-3.5 text-charcoal-400" />
            )}
            {slide.hasChart && (
              <BarChart3 className="w-3.5 h-3.5 text-charcoal-400" />
            )}
          </div>
        </div>

        {/* Slide image */}
        {!imgError && (
          <div className="relative bg-charcoal-50 border-b border-charcoal-100">
            <img
              src={slideImagePath}
              alt={`Slide ${slide.slideNumber}${slide.title ? ` - ${slide.title}` : ''}`}
              className="w-full h-auto"
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <button
              onClick={() => setShowZoom(true)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Body paragraphs */}
          {slide.bodyParagraphs.length > 0 && (
            <div className="space-y-2">
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

          {/* Download files */}
          {slide.downloadFiles && slide.downloadFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slide.downloadFiles.map((file, i) => (
                <a
                  key={i}
                  href={file.path}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-charcoal-900 text-white text-sm font-medium hover:bg-charcoal-800 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  {file.label}
                </a>
              ))}
            </div>
          )}

          {/* Table data */}
          {slide.hasTable && slide.tableData && (
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
          )}

          {/* Speaker notes */}
          {slide.notes && (
            <div className="relative pl-4 border-l-2 border-gold-400/60">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-gold-600" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-600">
                  Instructor Notes
                </span>
              </div>
              <div className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
                {slide.notes}
              </div>
            </div>
          )}

          {/* No content at all fallback */}
          {!hasTextContent && imgError && (
            <div className="text-center py-4">
              <p className="text-sm text-charcoal-400">
                Slide {slide.slideNumber} — Visual content
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal */}
      {showZoom && !imgError && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setShowZoom(false)}
        >
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
