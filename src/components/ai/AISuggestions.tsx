'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  X,
  ChevronRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

// ============================================
// Types
// ============================================

interface Suggestion {
  id: string
  type: string
  title: string
  description: string
  reasoning: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  score: number
  entity_type?: string
  entity_id?: string
  action_type?: string
  action_payload?: Record<string, unknown>
  status: string
}

interface AISuggestionsProps {
  variant?: 'inline' | 'panel' | 'card'
  limit?: number
  className?: string
  onAction?: (suggestion: Suggestion) => void
}

// ============================================
// Type Icons
// ============================================

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Sparkles; color: string; label: string }
> = {
  follow_up: {
    icon: Clock,
    color: 'text-amber-600 bg-amber-50',
    label: 'Follow Up',
  },
  candidate_match: {
    icon: Users,
    color: 'text-success-600 bg-success-50',
    label: 'Candidate Match',
  },
  risk_alert: {
    icon: AlertTriangle,
    color: 'text-error-600 bg-error-50',
    label: 'Risk Alert',
  },
  opportunity: {
    icon: TrendingUp,
    color: 'text-blue-600 bg-blue-50',
    label: 'Opportunity',
  },
  metric_improvement: {
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50',
    label: 'Improvement',
  },
  default: {
    icon: Sparkles,
    color: 'text-gold-600 bg-gold-50',
    label: 'Suggestion',
  },
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'border-l-4 border-l-error-500',
  high: 'border-l-4 border-l-amber-500',
  medium: 'border-l-4 border-l-blue-500',
  low: 'border-l-4 border-l-charcoal-300',
}

const ACTION_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  schedule: Calendar,
  navigate: ChevronRight,
}

// ============================================
// Single Suggestion Card
// ============================================

function SuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
  onFeedback,
  showActions = true,
}: {
  suggestion: Suggestion
  onAccept?: () => void
  onDismiss?: () => void
  onFeedback?: (helpful: boolean) => void
  showActions?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const config = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG.default
  const Icon = config.icon
  const ActionIcon = ACTION_ICONS[suggestion.action_type ?? 'navigate'] ?? ChevronRight

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-charcoal-200 overflow-hidden transition-all duration-200',
        PRIORITY_STYLES[suggestion.priority],
        isHovered && 'shadow-md'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                config.color
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-wider',
                    config.color.replace('bg-', 'text-').replace('-50', '-700')
                  )}
                >
                  {config.label}
                </span>
                {suggestion.priority === 'critical' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-error-100 text-error-700 rounded">
                    Urgent
                  </span>
                )}
              </div>
              <h4 className="text-sm font-medium text-charcoal-900 mt-1">
                {suggestion.title}
              </h4>
            </div>
          </div>

          {showActions && onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-charcoal-600 pl-11">
          {suggestion.description}
        </p>

        {/* Reasoning (collapsed by default) */}
        {isHovered && suggestion.reasoning && (
          <p className="mt-2 text-xs text-charcoal-500 pl-11 italic">
            {suggestion.reasoning}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex items-center justify-between pl-11">
            <div className="flex items-center gap-2">
              <button
                onClick={onAccept}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-charcoal-900 text-white rounded-md hover:bg-charcoal-800 transition-colors"
              >
                <ActionIcon className="w-3.5 h-3.5" />
                Take Action
              </button>

              {!showFeedback ? (
                <button
                  onClick={() => setShowFeedback(true)}
                  className="text-xs text-charcoal-500 hover:text-charcoal-700"
                >
                  Helpful?
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFeedback?.(true)}
                    className="p-1 text-charcoal-400 hover:text-success-600"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onFeedback?.(false)}
                    className="p-1 text-charcoal-400 hover:text-error-600"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <span className="text-xs text-charcoal-400">
              {Math.round(suggestion.score * 100)}% confidence
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Inline Suggestions (for sidebar/dashboard)
// ============================================

function InlineSuggestions({
  suggestions,
  onAccept,
  onDismiss,
  className,
}: {
  suggestions: Suggestion[]
  onAccept: (suggestion: Suggestion) => void
  onDismiss: (suggestion: Suggestion) => void
  className?: string
}) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      {suggestions.map((suggestion) => {
        const config = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG.default
        const Icon = config.icon

        return (
          <div
            key={suggestion.id}
            className="flex items-center gap-2 p-2 bg-charcoal-50 rounded-lg"
          >
            <div className={cn('p-1.5 rounded', config.color)}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="flex-1 text-xs text-charcoal-700 truncate">
              {suggestion.title}
            </span>
            <button
              onClick={() => onAccept(suggestion)}
              className="p-1 text-charcoal-400 hover:text-charcoal-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDismiss(suggestion)}
              className="p-1 text-charcoal-400 hover:text-charcoal-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function AISuggestions({
  variant = 'card',
  limit = 5,
  className,
  onAction,
}: AISuggestionsProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const { data: suggestions, isLoading } = trpc.ai.suggestions.list.useQuery({
    status: ['pending'],
    limit,
  })

  const acceptMutation = trpc.ai.suggestions.accept.useMutation({
    onSuccess: () => utils.ai.suggestions.invalidate(),
  })

  const dismissMutation = trpc.ai.suggestions.dismiss.useMutation({
    onSuccess: () => utils.ai.suggestions.invalidate(),
  })

  const feedbackMutation = trpc.ai.suggestions.feedback.useMutation()

  const handleAccept = useCallback(
    async (suggestion: Suggestion) => {
      await acceptMutation.mutateAsync({ id: suggestion.id })

      if (onAction) {
        onAction(suggestion)
        return
      }

      // Default action handling
      if (suggestion.action_type === 'navigate' && suggestion.entity_type && suggestion.entity_id) {
        router.push(`/employee/${suggestion.entity_type}s/${suggestion.entity_id}`)
      } else if (suggestion.action_type === 'email' && suggestion.action_payload?.email) {
        // Open email compose - would integrate with email system
        console.log('Open email compose:', suggestion.action_payload)
      } else if (suggestion.action_type === 'call' && suggestion.action_payload?.phone) {
        // Initiate call - would integrate with phone system
        window.location.href = `tel:${suggestion.action_payload.phone}`
      }
    },
    [acceptMutation, onAction, router]
  )

  const handleDismiss = useCallback(
    async (suggestion: Suggestion) => {
      await dismissMutation.mutateAsync({ id: suggestion.id })
    },
    [dismissMutation]
  )

  const handleFeedback = useCallback(
    async (suggestion: Suggestion, helpful: boolean) => {
      await feedbackMutation.mutateAsync({
        id: suggestion.id,
        wasHelpful: helpful,
      })
    },
    [feedbackMutation]
  )

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-charcoal-100 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success-50 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-success-600" />
        </div>
        <p className="text-sm text-charcoal-600">All caught up!</p>
        <p className="text-xs text-charcoal-400 mt-1">
          No AI suggestions at the moment
        </p>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <InlineSuggestions
        suggestions={suggestions as Suggestion[]}
        onAccept={handleAccept}
        onDismiss={handleDismiss}
        className={className}
      />
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-charcoal-900">
            AI Suggestions
          </h3>
          <span className="px-1.5 py-0.5 text-xs font-medium bg-charcoal-100 text-charcoal-600 rounded">
            {suggestions.length}
          </span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {(suggestions as Suggestion[]).map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onAccept={() => handleAccept(suggestion)}
            onDismiss={() => handleDismiss(suggestion)}
            onFeedback={(helpful) => handleFeedback(suggestion, helpful)}
          />
        ))}
      </div>
    </div>
  )
}

export default AISuggestions
