'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  ChevronRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
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

// ============================================
// Type Icons
// ============================================

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Sparkles; color: string; bgColor: string }
> = {
  follow_up: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  candidate_match: {
    icon: Users,
    color: 'text-success-600',
    bgColor: 'bg-success-50',
  },
  risk_alert: {
    icon: AlertTriangle,
    color: 'text-error-600',
    bgColor: 'bg-error-50',
  },
  opportunity: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  default: {
    icon: Sparkles,
    color: 'text-gold-600',
    bgColor: 'bg-gold-50',
  },
}

const PRIORITY_INDICATOR: Record<string, string> = {
  critical: 'bg-error-500',
  high: 'bg-amber-500',
  medium: 'bg-blue-500',
  low: 'bg-charcoal-300',
}

// ============================================
// Suggestion Item
// ============================================

function SuggestionItem({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: Suggestion
  onAccept: () => void
  onDismiss: () => void
}) {
  const router = useRouter()
  const config = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG.default
  const Icon = config.icon

  const handleClick = () => {
    onAccept()
    if (suggestion.entity_type && suggestion.entity_id) {
      router.push(`/employee/${suggestion.entity_type}s/${suggestion.entity_id}`)
    }
  }

  return (
    <div className="group flex items-start gap-3 py-3 border-b border-charcoal-100 last:border-b-0">
      {/* Priority Indicator */}
      <div
        className={cn(
          'w-1 h-12 rounded-full flex-shrink-0',
          PRIORITY_INDICATOR[suggestion.priority]
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}
      >
        <Icon className={cn('w-4 h-4', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 line-clamp-1">
          {suggestion.title}
        </p>
        <p className="text-xs text-charcoal-500 line-clamp-2 mt-0.5">
          {suggestion.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleClick}
          className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Main Widget
// ============================================

export function AISuggestionsWidget({ className }: { className?: string }) {
  const utils = trpc.useUtils()

  const { data: suggestions, isLoading, refetch } = trpc.ai.suggestions.list.useQuery({
    status: ['pending'],
    limit: 5,
  })

  const acceptMutation = trpc.ai.suggestions.accept.useMutation({
    onSuccess: () => utils.ai.suggestions.invalidate(),
  })

  const dismissMutation = trpc.ai.suggestions.dismiss.useMutation({
    onSuccess: () => utils.ai.suggestions.invalidate(),
  })

  const generateMutation = trpc.ai.suggestions.generate.useMutation({
    onSuccess: () => utils.ai.suggestions.invalidate(),
  })

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-charcoal-200 bg-white p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-charcoal-100 rounded-lg" />
            <div className="h-5 w-32 bg-charcoal-100 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1 h-12 bg-charcoal-100 rounded-full" />
              <div className="w-8 h-8 bg-charcoal-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-charcoal-100 rounded" />
                <div className="h-3 w-1/2 bg-charcoal-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-charcoal-200 bg-white overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900">AI Suggestions</h3>
            {suggestions && suggestions.length > 0 && (
              <p className="text-xs text-charcoal-500">
                {suggestions.length} actionable insight{suggestions.length !== 1 && 's'}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => generateMutation.mutate({})}
          disabled={generateMutation.isPending}
          className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', generateMutation.isPending && 'animate-spin')} />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        {!suggestions || suggestions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success-50 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-success-600" />
            </div>
            <p className="text-sm text-charcoal-600">All caught up!</p>
            <p className="text-xs text-charcoal-400 mt-1">
              No AI suggestions at the moment
            </p>
            <button
              onClick={() => generateMutation.mutate({})}
              disabled={generateMutation.isPending}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-600 hover:bg-charcoal-100 rounded-lg"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', generateMutation.isPending && 'animate-spin')} />
              Generate suggestions
            </button>
          </div>
        ) : (
          suggestions.map((suggestion: Suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              onAccept={() => acceptMutation.mutate({ id: suggestion.id })}
              onDismiss={() => dismissMutation.mutate({ id: suggestion.id })}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {suggestions && suggestions.length > 0 && (
        <div className="px-6 py-3 border-t border-charcoal-100 bg-charcoal-50/50">
          <button
            onClick={() => {/* Navigate to full suggestions view */}}
            className="w-full text-center text-xs font-medium text-charcoal-500 hover:text-charcoal-700"
          >
            View all suggestions
          </button>
        </div>
      )}
    </div>
  )
}

export default AISuggestionsWidget
