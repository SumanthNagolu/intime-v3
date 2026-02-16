'use client'

import React from 'react'
import { ArrowLeft, PanelRightClose, PanelRight, MessageCircle } from 'lucide-react'

interface PresentationHeaderProps {
  chapterNumber: number
  lessonNumber: number
  lessonTitle: string
  isChatOpen: boolean
  onBack: () => void
  onToggleChat: () => void
}

export function PresentationHeader({
  chapterNumber,
  lessonNumber,
  lessonTitle,
  isChatOpen,
  onBack,
  onToggleChat,
}: PresentationHeaderProps) {
  return (
    <div className="h-12 md:h-14 flex items-center gap-2 md:gap-3 px-3 md:px-5 flex-shrink-0 bg-white border-b border-warm-light/15">
      {/* Back */}
      <button
        onClick={onBack}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-muted hover:text-warm-primary hover:bg-warm-cream transition-all flex-shrink-0"
        title="Back to dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <span className="font-mono-warm text-[9px] font-medium uppercase text-copper-500" style={{ letterSpacing: '2.5px' }}>
          Ch{chapterNumber} &middot; L{lessonNumber}
        </span>
        <h1 className="font-display font-semibold text-sm md:text-base text-warm-primary truncate leading-tight -mt-0.5" style={{ letterSpacing: '-0.01em' }}>
          {lessonTitle}
        </h1>
      </div>

      {/* Chat panel toggle */}
      <button
        onClick={onToggleChat}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
          isChatOpen
            ? 'bg-warm-deep text-white'
            : 'text-warm-muted hover:text-warm-primary hover:bg-warm-cream'
        }`}
        title={isChatOpen ? 'Hide Sensei (N)' : 'Show Sensei (N)'}
      >
        {/* Mobile: chat icon, Desktop: panel icon */}
        <MessageCircle className="w-4 h-4 md:hidden" />
        <span className="hidden md:block">
          {isChatOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRight className="w-4 h-4" />
          )}
        </span>
      </button>
    </div>
  )
}
