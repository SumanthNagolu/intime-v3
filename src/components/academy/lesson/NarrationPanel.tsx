'use client'

import React from 'react'
import { ChevronDown, ChevronUp, Mic } from 'lucide-react'

interface NarrationPanelProps {
  narration?: string
  notes?: string
  isOpen: boolean
  onToggle: () => void
}

export function NarrationPanel({ narration, notes, isOpen, onToggle }: NarrationPanelProps) {
  const text = narration || notes
  if (!text) return null

  return (
    <div className="border-t border-charcoal-200/60 bg-white flex-shrink-0">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-charcoal-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gold-100 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-gold-600" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
            {narration ? 'Narration' : 'Instructor Notes'}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-charcoal-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-charcoal-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-4">
          <div className="relative pl-4 border-l-2 border-gold-400/60">
            <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
              {text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
