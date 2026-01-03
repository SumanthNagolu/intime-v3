'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SelectedPattern } from './types'

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const CATEGORY_ICONS: Record<string, string> = {
  communication: '📞',
  calendar: '📅',
  workflow: '⚙️',
  documentation: '📄',
  research: '🔍',
  administrative: '📋',
  sales: '💼',
  recruiting: '🎯',
  support: '💬',
  onboarding: '🚀',
  compliance: '✅',
  follow_up: '🔔',
  default: '📝',
}

interface InlinePatternPickerProps {
  entityType: string
  selectedPattern: SelectedPattern | null
  onSelect: (pattern: SelectedPattern | null) => void
}

export function InlinePatternPicker({
  entityType,
  selectedPattern,
  onSelect,
}: InlinePatternPickerProps) {
  const [isExpanded, setIsExpanded] = React.useState(!selectedPattern)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set())

  // Fetch patterns
  const { data: patterns, isLoading } = trpc.activities.listPatterns.useQuery(
    { entityType, isActive: true },
    { staleTime: 30000 }
  )

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Filter patterns by search
  const filteredPatterns = React.useMemo(() => {
    if (!patterns) return []
    if (!searchQuery) return patterns

    const query = searchQuery.toLowerCase()
    return patterns.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
    )
  }, [patterns, searchQuery])

  // Group patterns by category
  const patternsByCategory = React.useMemo(() => {
    const groups: Record<string, typeof filteredPatterns> = {}

    filteredPatterns.forEach((p) => {
      const category = p.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(p)
    })

    return groups
  }, [filteredPatterns])

  // Auto-expand first category when expanded and no categories are expanded
  React.useEffect(() => {
    if (isExpanded && patterns && patterns.length > 0 && expandedCategories.size === 0) {
      const categories = Object.keys(patternsByCategory)
      if (categories.length > 0) {
        setExpandedCategories(new Set([categories[0]]))
      }
    }
  }, [isExpanded, patterns, patternsByCategory, expandedCategories.size])

  const handleSelectPattern = (pattern: typeof filteredPatterns[0]) => {
    onSelect({
      id: pattern.id,
      code: pattern.code,
      name: pattern.name,
      description: pattern.description,
      icon: pattern.icon,
      color: pattern.color,
      targetDays: pattern.targetDays,
      escalationDays: pattern.escalationDays,
      priority: pattern.priority,
      hasChecklist: pattern.hasChecklist,
      checklistCount: pattern.checklistCount,
      isSystem: pattern.isSystem,
      category: pattern.category,
      instructions: pattern.instructions,
      checklist: pattern.checklist,
    })
    setIsExpanded(false)
  }

  const handleClearPattern = () => {
    onSelect(null)
    setIsExpanded(true)
  }

  // Selected pattern compact view
  if (selectedPattern && !isExpanded) {
    return (
      <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="text-lg">{selectedPattern.icon || '📋'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-charcoal-900 truncate">
                  {selectedPattern.name}
                </h4>
                <Badge variant="outline" className="text-xs bg-white flex-shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Pattern
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-charcoal-500 mt-1">
                {selectedPattern.targetDays && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {selectedPattern.targetDays}d target
                  </span>
                )}
                {selectedPattern.hasChecklist && (
                  <span className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    {selectedPattern.checklistCount} items
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setIsExpanded(true)}
            >
              Change
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-charcoal-400 hover:text-charcoal-600"
              onClick={handleClearPattern}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Expanded pattern picker
  return (
    <div className="border border-charcoal-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-charcoal-50 border-b border-charcoal-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-charcoal-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-500" />
            Select Pattern
          </h4>
          {selectedPattern && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-charcoal-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Patterns list - scrollable with max height */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredPatterns.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">
              {searchQuery
                ? 'No patterns match your search'
                : 'No patterns available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => {
              const isExpanded = expandedCategories.has(category)
              return (
                <div key={category}>
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2 text-left transition-colors',
                      'hover:bg-charcoal-50',
                      isExpanded ? 'bg-charcoal-50' : 'bg-white'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-charcoal-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-charcoal-400" />
                      )}
                      <span className="text-sm">
                        {CATEGORY_ICONS[category] || CATEGORY_ICONS.default}
                      </span>
                      <span className="text-sm font-medium text-charcoal-700 capitalize">
                        {category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categoryPatterns.length}
                    </Badge>
                  </button>

                  {/* Category Patterns */}
                  {isExpanded && (
                    <div className="divide-y divide-charcoal-50 bg-white">
                      {categoryPatterns.map((pattern) => (
                        <PatternRow
                          key={pattern.id}
                          pattern={pattern}
                          isSelected={selectedPattern?.id === pattern.id}
                          onSelect={() => handleSelectPattern(pattern)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface PatternRowProps {
  pattern: {
    id: string
    name: string
    description: string | null
    icon: string | null
    targetDays: number | null
    priority: string | null
    hasChecklist: boolean
    checklistCount: number
  }
  isSelected: boolean
  onSelect: () => void
}

function PatternRow({ pattern, isSelected, onSelect }: PatternRowProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left px-4 py-3 transition-colors',
        'hover:bg-gold-50',
        isSelected && 'bg-gold-50 border-l-2 border-gold-500'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-base flex-shrink-0">{pattern.icon || '📋'}</span>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{pattern.name}</div>
            <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-0.5">
              {pattern.targetDays && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {pattern.targetDays}d
                </span>
              )}
              {pattern.hasChecklist && (
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  {pattern.checklistCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {pattern.priority && (
            <Badge className={cn('text-xs capitalize', PRIORITY_STYLES[pattern.priority])}>
              {pattern.priority}
            </Badge>
          )}
          {isSelected && <Check className="h-4 w-4 text-gold-600" />}
        </div>
      </div>
    </button>
  )
}
