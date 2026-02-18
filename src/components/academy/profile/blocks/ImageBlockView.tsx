'use client'

import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import type { ImageBlock } from '@/lib/academy/implementation-blocks'

interface ImageBlockViewProps {
  block: ImageBlock
}

export function ImageBlockView({ block }: ImageBlockViewProps) {
  const [expanded, setExpanded] = useState(false)

  if (!block.dataUrl) return null

  return (
    <>
      <div className="rounded-lg overflow-hidden border border-charcoal-200/60">
        <div
          className="relative group cursor-pointer bg-charcoal-50"
          onClick={() => setExpanded(true)}
        >
          <img
            src={block.dataUrl}
            alt={block.caption || 'Screenshot'}
            className="w-full max-h-[400px] object-contain"
          />
          <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
        {block.caption && (
          <div className="px-3 py-2 bg-charcoal-50 border-t border-charcoal-100">
            <p className="text-xs text-charcoal-500 italic text-center">{block.caption}</p>
          </div>
        )}
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-charcoal-900/90 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setExpanded(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={block.dataUrl}
            alt={block.caption || 'Screenshot'}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
