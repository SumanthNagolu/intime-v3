'use client'

import React, { useRef, useEffect, useMemo } from 'react'
import { BookOpen } from 'lucide-react'

interface NarrationTeleprompterProps {
  text: string
  spokenCharIndex: number
  isPlaying: boolean
  isPaused: boolean
}

interface WordToken {
  word: string
  start: number
  end: number
}

export function NarrationTeleprompter({
  text,
  spokenCharIndex,
  isPlaying,
  isPaused,
}: NarrationTeleprompterProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLSpanElement>(null)

  // Tokenize text into words with character positions
  const words: WordToken[] = useMemo(() => {
    if (!text) return []
    const tokens: WordToken[] = []
    const regex = /\S+/g
    let match
    while ((match = regex.exec(text)) !== null) {
      tokens.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      })
    }
    return tokens
  }, [text])

  // Determine which word is currently being spoken
  const activeWordIndex = useMemo(() => {
    if (spokenCharIndex < 0) return -1
    for (let i = words.length - 1; i >= 0; i--) {
      if (words[i].start <= spokenCharIndex) return i
    }
    return 0
  }, [words, spokenCharIndex])

  // Whether to show progressive reveal
  const progressive = (isPlaying || isPaused) && spokenCharIndex >= 0

  // Auto-scroll to keep active word visible
  useEffect(() => {
    if (!activeRef.current || !scrollRef.current) return
    const container = scrollRef.current
    const el = activeRef.current
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()

    if (eRect.top < cRect.top + 8 || eRect.bottom > cRect.bottom - 8) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeWordIndex])

  // Reset scroll when text changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [text])

  if (!text) return null

  return (
    <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#101010]">
      <div className="flex items-center gap-2 px-5 lg:px-8 pt-3 pb-1.5">
        <BookOpen className="w-3 h-3 text-gold-500/50" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">
          Narration
        </span>
      </div>

      <div
        ref={scrollRef}
        className="px-5 lg:px-8 pb-4 max-h-[120px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
      >
        <p className="text-[14px] leading-[1.9] font-body">
          {words.map((w, i) => {
            let cls: string

            if (progressive) {
              if (i < activeWordIndex) {
                cls = 'text-white/75'
              } else if (i === activeWordIndex) {
                cls = 'text-gold-400 font-medium'
              } else {
                cls = 'text-white/15'
              }
            } else {
              cls = 'text-white/55'
            }

            return (
              <span
                key={i}
                ref={i === activeWordIndex ? activeRef : undefined}
                className={`${cls} transition-colors duration-200`}
              >
                {w.word}{' '}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}
