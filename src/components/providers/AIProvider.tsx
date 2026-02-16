'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AIAssistant, useAIAssistant } from '@/components/ai/AIAssistant'
import { Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Context Types
// ============================================

interface AIContextType {
  isOpen: boolean
  context?: {
    entityType?: string
    entityId?: string
    entityData?: Record<string, unknown>
  }
  open: (ctx?: AIContextType['context']) => void
  close: () => void
  toggle: () => void
  setContext: (ctx: AIContextType['context']) => void
}

// ============================================
// Context
// ============================================

const AIContext = createContext<AIContextType | null>(null)

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

// ============================================
// Floating Button
// ============================================

function AIFloatingButton({
  onClick,
  isOpen,
}: {
  onClick: () => void
  isOpen: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg transition-all duration-300',
        'flex items-center justify-center',
        'hover:-translate-y-0.5 hover:shadow-xl',
        isOpen
          ? 'bg-charcoal-900 text-white'
          : 'bg-gradient-to-br from-gold-400 to-gold-600 text-white'
      )}
      title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <Sparkles className="w-6 h-6" />
      )}
    </button>
  )
}

// ============================================
// Provider Component
// ============================================

export function AIProvider({ children }: { children: ReactNode }) {
  const assistant = useAIAssistant()

  const contextValue: AIContextType = {
    isOpen: assistant.isOpen,
    context: assistant.context,
    open: assistant.open,
    close: assistant.close,
    toggle: assistant.toggle,
    setContext: assistant.setContext,
  }

  return (
    <AIContext.Provider value={contextValue}>
      {children}

      {/* Floating Button - Always visible */}
      <AIFloatingButton
        onClick={assistant.toggle}
        isOpen={assistant.isOpen}
      />

      {/* AI Assistant Panel */}
      <AIAssistant
        isOpen={assistant.isOpen}
        onClose={assistant.close}
        context={assistant.context}
        position="bottom-right"
      />
    </AIContext.Provider>
  )
}

export default AIProvider
