'use client'

import React, { useState } from 'react'
import { ZoomIn } from 'lucide-react'
import type { FigureRef } from '@/lib/academy/types'
import { getSlideImageUrl } from '@/lib/academy/content-loader'

interface FigureViewerProps {
  figure: FigureRef
  chapterSlug: string
  lessonNumber: number
}

export function FigureViewer({ figure, chapterSlug, lessonNumber }: FigureViewerProps) {
  const [imgError, setImgError] = useState(false)
  const [showZoom, setShowZoom] = useState(false)

  const slideImagePath = getSlideImageUrl(chapterSlug, lessonNumber, figure.slideNumber)

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
