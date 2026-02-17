'use client'

import React, { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { GuruChat } from '@/components/academy/GuruChat'

interface GuruSlideOutProps {
  isOpen: boolean
  onClose: () => void
  compact?: boolean
}

export function GuruSlideOut({ isOpen, onClose, compact = false }: GuruSlideOutProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[420px] max-w-[90vw] bg-white shadow-elevation-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-charcoal-100 text-charcoal-500 flex items-center justify-center hover:bg-charcoal-200 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guru chat - only render when open to avoid unnecessary state */}
        {isOpen && (
          <div className="h-full">
            <GuruChat compact={compact} />
          </div>
        )}
      </div>
    </>
  )
}
