'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

// ============================================
// Types
// ============================================

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  context?: {
    entityType?: string
    entityId?: string
    entityData?: Record<string, unknown>
  }
  position?: 'bottom-right' | 'sidebar'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  interactionType?: string
  suggestedActions?: Array<{
    type: string
    label: string
    payload: Record<string, unknown>
  }>
}

// ============================================
// Message Component
// ============================================

function ChatMessage({
  message,
  onFeedback,
  onAction,
}: {
  message: Message
  onFeedback?: (helpful: boolean) => void
  onAction?: (action: { type: string; payload: Record<string, unknown> }) => void
}) {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <div
      className={cn(
        'flex gap-3',
        message.role === 'user' ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          message.role === 'assistant'
            ? 'bg-gradient-to-br from-gold-400 to-gold-600'
            : 'bg-charcoal-200'
        )}
      >
        {message.role === 'assistant' ? (
          <Sparkles className="w-4 h-4 text-white" />
        ) : (
          <MessageSquare className="w-4 h-4 text-charcoal-600" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 max-w-[85%]',
          message.role === 'user' ? 'text-right' : ''
        )}
      >
        <div
          className={cn(
            'inline-block px-4 py-2.5 rounded-2xl text-sm',
            message.role === 'assistant'
              ? 'bg-charcoal-100 text-charcoal-900 rounded-tl-sm'
              : 'bg-charcoal-900 text-white rounded-tr-sm'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Suggested actions */}
        {message.role === 'assistant' && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestedActions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-700 bg-white border border-charcoal-200 rounded-full hover:bg-charcoal-50 transition-colors"
              >
                {action.label}
                <ExternalLink className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Feedback */}
        {message.role === 'assistant' && (
          <div className="mt-2">
            {!showFeedback ? (
              <button
                onClick={() => setShowFeedback(true)}
                className="text-xs text-charcoal-400 hover:text-charcoal-600"
              >
                Was this helpful?
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFeedback?.(true)}
                  className="p-1 text-charcoal-400 hover:text-success-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onFeedback?.(false)}
                  className="p-1 text-charcoal-400 hover:text-error-600 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-1 text-[10px] text-charcoal-400">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// ============================================
// Suggestions Panel
// ============================================

function SuggestionsPanel({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (suggestion: string) => void
}) {
  const suggestions = [
    'What candidates match my open jobs?',
    'Show me overdue follow-ups',
    'Summarize recent activity',
    'What should I prioritize today?',
  ]

  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
        Try asking
      </p>
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelectSuggestion(suggestion)}
          className="block w-full text-left px-3 py-2 text-sm text-charcoal-700 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function AIAssistant({
  isOpen,
  onClose,
  context,
  position = 'bottom-right',
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatMutation = trpc.ai.chat.useMutation()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')

      try {
        const result = await chatMutation.mutateAsync({
          conversationId: conversationId ?? undefined,
          message: content,
          context: context ? {
            entityType: context.entityType,
            entityId: context.entityId,
            entityData: context.entityData,
          } : undefined,
        })

        if (!conversationId) {
          setConversationId(result.conversationId)
        }

        const assistantMessage: Message = {
          id: result.message.id,
          role: 'assistant',
          content: result.message.content,
          timestamp: new Date(result.message.created_at),
          interactionType: result.message.interaction_type,
          suggestedActions: result.suggestedActions,
        }

        setMessages((prev) => [...prev, assistantMessage])
      } catch (error) {
        console.error('Failed to send message:', error)
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    },
    [conversationId, context, chatMutation]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = useCallback(() => {
    setMessages([])
    setConversationId(null)
  }, [])

  const handleAction = useCallback((action: { type: string; payload: Record<string, unknown> }) => {
    // Handle suggested actions
    console.log('Action clicked:', action)
  }, [])

  if (!isOpen) return null

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 w-[400px] h-[600px]',
    'sidebar': 'w-full h-full',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-elevation-xl border border-charcoal-200 flex flex-col overflow-hidden z-50',
        positionClasses[position],
        isMinimized && position === 'bottom-right' && 'h-14'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50 to-gold-50/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">InTime AI</h3>
            {context?.entityType && (
              <p className="text-xs text-charcoal-500">
                Context: {context.entityType}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded"
              title="New conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {position === 'bottom-right' && (
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gold-600" />
                </div>
                <h4 className="text-lg font-semibold text-charcoal-900 mb-2">
                  Hi! I&apos;m your AI assistant
                </h4>
                <p className="text-sm text-charcoal-500 mb-4">
                  I can help you find candidates, track activities, and more.
                </p>
                <SuggestionsPanel onSelectSuggestion={sendMessage} />
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onAction={handleAction}
                />
              ))
            )}

            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-charcoal-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-charcoal-100">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={chatMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-full border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || chatMutation.isPending}
                className={cn(
                  'p-2.5 rounded-full transition-colors',
                  input.trim() && !chatMutation.isPending
                    ? 'bg-charcoal-900 text-white hover:bg-charcoal-800'
                    : 'bg-charcoal-100 text-charcoal-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

// ============================================
// Hook for managing AI Assistant state
// ============================================

export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<AIAssistantProps['context']>()

  const open = useCallback((ctx?: AIAssistantProps['context']) => {
    setContext(ctx)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return {
    isOpen,
    context,
    open,
    close,
    toggle,
    setContext,
  }
}

export default AIAssistant
