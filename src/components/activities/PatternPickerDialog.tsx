'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatternPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string
  entityId: string
  onPatternSelected?: (activityId: string) => void
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const CATEGORY_ICONS: Record<string, string> = {
  sales: '💼',
  recruiting: '🎯',
  support: '💬',
  onboarding: '🚀',
  compliance: '📋',
  follow_up: '🔔',
  default: '📝',
}

/**
 * PatternPickerDialog - Select an activity pattern to create a new activity
 * Shows available patterns filtered by entity type with quick create functionality
 */
export function PatternPickerDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  onPatternSelected,
}: PatternPickerDialogProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState('')

  // Fetch patterns
  const { data: patterns, isLoading } = trpc.activities.listPatterns.useQuery(
    { entityType, isActive: true },
    { enabled: open }
  )

  // Create activity mutation
  const createActivityMutation = trpc.activities.createFromPattern.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Activity created',
        description: `"${data.subject}" has been added to your tasks`,
      })
      onOpenChange(false)
      onPatternSelected?.(data.id)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSelectPattern = (patternId: string) => {
    createActivityMutation.mutate({
      patternId,
      entityType,
      entityId,
    })
  }

  // Filter patterns by search
  const filteredPatterns = React.useMemo(() => {
    if (!patterns) return []
    if (!searchQuery) return patterns

    const query = searchQuery.toLowerCase()
    return patterns.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    )
  }, [patterns, searchQuery])

  // Group patterns by category
  const patternsByCategory = React.useMemo(() => {
    const groups: Record<string, typeof filteredPatterns> = {}
    
    filteredPatterns.forEach(p => {
      const category = p.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(p)
    })

    return groups
  }, [filteredPatterns])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Activity from Pattern</DialogTitle>
          <DialogDescription>
            Select a pattern to quickly create a structured activity with predefined settings
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Patterns list */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-charcoal-500">
                {searchQuery 
                  ? 'No patterns match your search' 
                  : 'No patterns available for this entity type'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-charcoal-600 mb-3 flex items-center gap-2">
                    <span>{CATEGORY_ICONS[category] || CATEGORY_ICONS.default}</span>
                    {category}
                    <span className="text-charcoal-400">({categoryPatterns.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {categoryPatterns.map((pattern) => (
                      <PatternCard
                        key={pattern.id}
                        pattern={pattern}
                        onSelect={() => handleSelectPattern(pattern.id)}
                        isLoading={createActivityMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface PatternCardProps {
  pattern: {
    id: string
    code: string
    name: string
    description: string | null
    icon: string | null
    color: string | null
    targetDays: number | null
    escalationDays: number | null
    priority: string | null
    hasChecklist: boolean
    checklistCount: number
    isSystem: boolean
  }
  onSelect: () => void
  isLoading: boolean
}

function PatternCard({ pattern, onSelect, isLoading }: PatternCardProps) {
  return (
    <button
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all",
        "hover:border-primary-300 hover:bg-primary-50",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onClick={onSelect}
      disabled={isLoading}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{pattern.icon || '📋'}</span>
            <h4 className="font-medium truncate">{pattern.name}</h4>
            {pattern.isSystem && (
              <Badge variant="outline" className="text-xs py-0">
                System
              </Badge>
            )}
          </div>
          
          {pattern.description && (
            <p className="text-sm text-charcoal-500 line-clamp-2 mb-2">
              {pattern.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-charcoal-500">
            {pattern.targetDays && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {pattern.targetDays} day{pattern.targetDays > 1 ? 's' : ''}
              </span>
            )}
            {pattern.escalationDays && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Escalates in {pattern.escalationDays}d
              </span>
            )}
            {pattern.hasChecklist && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {pattern.checklistCount} items
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {pattern.priority && (
            <Badge className={cn('capitalize text-xs', PRIORITY_STYLES[pattern.priority])}>
              {pattern.priority}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-charcoal-400" />
        </div>
      </div>
    </button>
  )
}

export default PatternPickerDialog

