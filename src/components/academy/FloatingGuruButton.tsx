'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { useGuruUI } from '@/lib/academy/guru-ui-store'
import { GuruSlideOut } from '@/components/academy/lesson/GuruSlideOut'

export function FloatingGuruButton() {
  const { isOpen, open, close } = useGuruUI()

  return (
    <>
      {/* Floating button - hidden when panel is open */}
      {!isOpen && (
        <button
          onClick={open}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-charcoal-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <Sparkles className="w-5 h-5 text-gold-400" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium text-sm whitespace-nowrap">
            Ask Guru
          </span>
        </button>
      )}

      {/* Slide-out panel */}
      <GuruSlideOut isOpen={isOpen} onClose={close} compact />
    </>
  )
}
