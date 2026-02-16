'use client'

import React, { useState } from 'react'
import { ZoomIn, Download } from 'lucide-react'
import type { SlideContent } from '@/lib/academy/types'

interface MentorshipSlideProps {
  slide: SlideContent
  chapterSlug: string
  lessonNumber: number
  slideIndex: number
}

export function MentorshipSlide({ slide, chapterSlug, lessonNumber, slideIndex }: MentorshipSlideProps) {
  const [imgError, setImgError] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const hasTextContent = slide.notes || slide.bodyParagraphs.length > 0 || slide.hasTable
  const slideImagePath = `/academy/guidewire/slides/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}/slide-${String(slide.slideNumber).padStart(2, '0')}.png`

  // Skip completely empty slides (no image, no text, no notes)
  if (!hasTextContent && !slide.hasImage && slideIndex === 0) return null

  return (
    <div className="m-content-block m-animate" id={`slide-${slide.slideNumber}`}>
      {/* Section heading from slide title */}
      {slide.title && (
        <h2 className="m-block-heading">{slide.title}</h2>
      )}

      {/* Narrative text from notes — this is the Sensei's voice */}
      {slide.notes && (
        <div className="m-block-text">{slide.notes}</div>
      )}

      {/* Slide image as figure — preserves all infographics, screenshots, diagrams */}
      {!imgError && (
        <figure className="m-slide-figure" onClick={() => setShowZoom(true)}>
          <img
            src={slideImagePath}
            alt={`Slide ${slide.slideNumber}${slide.title ? ` — ${slide.title}` : ''}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <button className="m-zoom-btn" type="button">
            <ZoomIn size={16} />
          </button>
          <figcaption>
            Slide {slide.slideNumber}{slide.title ? ` — ${slide.title}` : ''}
          </figcaption>
        </figure>
      )}

      {/* Body paragraphs — supplementary text extracted from slides */}
      {slide.bodyParagraphs.length > 0 && (
        <div className="m-body-paras">
          {slide.bodyParagraphs.map((para, i) => (
            <div
              key={i}
              className="m-body-para"
              style={{ paddingLeft: `${para.level * 20}px` }}
            >
              {para.level > 0 && <span className="m-body-bullet" />}
              <p style={para.bold ? { fontWeight: 600, color: 'var(--m-text-primary)' } : undefined}>
                {para.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table data — warm styled */}
      {slide.hasTable && slide.tableData && (
        <div className="m-table-wrapper">
          <table className="m-table">
            <thead>
              <tr>
                {slide.tableData[0]?.map((cell, i) => (
                  <th key={i}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slide.tableData.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download files */}
      {slide.downloadFiles && slide.downloadFiles.length > 0 && (
        <div className="m-download-links">
          {slide.downloadFiles.map((file, i) => (
            <a key={i} href={file.path} download className="m-download-btn">
              <Download size={14} />
              {file.label}
            </a>
          ))}
        </div>
      )}

      {/* No content fallback */}
      {!hasTextContent && imgError && (
        <p className="m-block-text" style={{ textAlign: 'center', opacity: 0.5 }}>
          Slide {slide.slideNumber} — Visual content
        </p>
      )}

      {/* Zoom modal */}
      {showZoom && !imgError && (
        <div className="m-zoom-overlay" onClick={() => setShowZoom(false)}>
          <img
            src={slideImagePath}
            alt={`Slide ${slide.slideNumber}`}
          />
        </div>
      )}
    </div>
  )
}
