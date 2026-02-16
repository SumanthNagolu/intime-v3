'use client'

import React, { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import type { FigureRef } from '@/lib/academy/types'

interface FigureViewerProps {
  figure: FigureRef
  chapterSlug: string
  lessonNumber: number
}

export function FigureViewer({ figure, chapterSlug, lessonNumber }: FigureViewerProps) {
  const [imgError, setImgError] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const slideImagePath = `/academy/guidewire/slides/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}/slide-${String(figure.slideNumber).padStart(2, '0')}.png`

  if (imgError) return null

  return (
    <>
      <figure className="m-slide-figure" onClick={() => setShowZoom(true)}>
        <img
          src={slideImagePath}
          alt={figure.caption || `Slide ${figure.slideNumber}`}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <button className="m-zoom-btn" type="button">
          <ZoomIn size={16} />
        </button>
        <figcaption>{figure.caption || `Slide ${figure.slideNumber}`}</figcaption>
      </figure>

      {showZoom && (
        <div className="m-zoom-overlay" onClick={() => setShowZoom(false)}>
          <img
            src={slideImagePath}
            alt={figure.caption || `Slide ${figure.slideNumber}`}
          />
        </div>
      )}
    </>
  )
}
