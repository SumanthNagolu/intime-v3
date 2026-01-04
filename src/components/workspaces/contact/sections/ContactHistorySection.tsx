'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  History,
  UserCircle,
  FileText,
  MessageSquare,
  Activity,
  Settings,
  Bot,
  ChevronRight,
  Search,
  ChevronLeft,
  Filter,
  X,
} from 'lucide-react'
import type { HistoryEntry } from '@/types/workspace'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// Constants
const ITEMS_PER_PAGE = 10

type ChangeTypeFilter = 'all' | 'status_change' | 'owner_change' | 'field_update' | 'related'

interface ContactHistorySectionProps {
  history: HistoryEntry[]
}

/**
 * ContactHistorySection - Premium audit trail with table-based list view
 * Follows the same pattern as AccountHistorySection for consistency
 */
export function ContactHistorySection({ history }: ContactHistorySectionProps) {
  const [selectedEntry, setSelectedEntry] = React.useState<HistoryEntry | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [changeTypeFilter, setChangeTypeFilter] = React.useState<ChangeTypeFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter history based on search and type
  const filteredHistory = React.useMemo(() => {
    let result = history

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(entry => {
        const userName = entry.changedBy?.name?.toLowerCase() || ''
        const field = entry.field?.toLowerCase() || ''
        const oldValue = entry.oldValue?.toLowerCase() || ''
        const newValue = entry.newValue?.toLowerCase() || ''
        const reason = entry.reason?.toLowerCase() || ''
        return userName.includes(q) || field.includes(q) || oldValue.includes(q) || newValue.includes(q) || reason.includes(q)
      })
    }

    // Change type filter
    if (changeTypeFilter !== 'all') {
      if (changeTypeFilter === 'related') {
        result = result.filter(entry => {
          const metadata = entry.metadata as { relatedEntity?: { type?: string } } | null
          return !!metadata?.relatedEntity
        })
      } else {
        result = result.filter(entry => entry.changeType === changeTypeFilter)
      }
    }

    return result
  }, [history, searchQuery, changeTypeFilter])

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)
  const paginatedHistory = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredHistory, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, changeTypeFilter])

  // Calculate type counts for filter badges
  const typeCounts = React.useMemo(() => {
    return {
      all: history.length,
      status_change: history.filter(e => e.changeType === 'status_change').length,
      owner_change: history.filter(e => e.changeType === 'owner_change').length,
      field_update: history.filter(e => !['status_change', 'owner_change'].includes(e.changeType || '') && !(e.metadata as { relatedEntity?: unknown } | null)?.relatedEntity).length,
      related: history.filter(e => !!(e.metadata as { relatedEntity?: unknown } | null)?.relatedEntity).length,
    }
  }, [history])

  const handleRowClick = (entry: HistoryEntry) => {
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null)
    } else {
      setSelectedEntry(entry)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-charcoal-50/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-charcoal-600 to-charcoal-800 flex items-center justify-center shadow-sm">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">History</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredHistory.length} {filteredHistory.length === 1 ? 'change' : 'changes'} recorded
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              {/* Filter */}
              <Select value={changeTypeFilter} onValueChange={(v) => setChangeTypeFilter(v as ChangeTypeFilter)}>
                <SelectTrigger className="h-9 w-44 text-sm border-charcoal-200 focus:border-gold-400">
                  <Filter className="h-4 w-4 mr-2 text-charcoal-400" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      All Changes
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{typeCounts.all}</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="status_change">
                    <span className="flex items-center gap-2">
                      Status Changes
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{typeCounts.status_change}</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="owner_change">
                    <span className="flex items-center gap-2">
                      Owner Changes
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{typeCounts.owner_change}</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="field_update">
                    <span className="flex items-center gap-2">
                      Field Updates
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{typeCounts.field_update}</Badge>
                    </span>
                  </SelectItem>
                  <SelectItem value="related">
                    <span className="flex items-center gap-2">
                      Related Items
                      <Badge variant="secondary" className="text-xs py-0 px-1.5">{typeCounts.related}</Badge>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_140px_140px_100px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Change</div>
          <div>Changed By</div>
          <div className="text-center">Date</div>
          <div className="text-center">Time Ago</div>
        </div>

        {/* Table Body */}
        {paginatedHistory.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedHistory.map((entry, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const icon = getChangeIcon(entry)
              const iconBg = getIconBackground(entry)
              const changedByName = entry.changedBy?.name ?? (entry.isAutomated ? 'System' : 'Unknown')
              const initials = getInitials(changedByName)

              return (
                <div
                  key={entry.id}
                  onClick={() => handleRowClick(entry)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_140px_140px_100px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedEntry?.id === entry.id
                      ? 'bg-gold-50/80 border-l-2 border-l-gold-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent'
                  )}
                >
                  {/* Row Number */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-charcoal-300 tabular-nums">
                      {rowNumber}
                    </span>
                  </div>

                  {/* Change Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                      iconBg
                    )}>
                      {entry.isAutomated ? (
                        <Bot className="h-4 w-4 text-charcoal-500" />
                      ) : (
                        icon
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-charcoal-900 truncate">
                          {getActionDescription(entry)}
                        </span>
                        {entry.isAutomated && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-charcoal-100 flex-shrink-0">
                            <Bot className="h-3 w-3 mr-0.5" />
                            Auto
                          </Badge>
                        )}
                      </div>
                      {/* Value change preview */}
                      {shouldShowValueChange(entry) && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px]">
                          {(entry.oldValueLabel || entry.oldValue) && (
                            <>
                              <span className="text-charcoal-400 line-through truncate max-w-[100px]">
                                {truncateValue(entry.oldValueLabel || entry.oldValue || '', 20)}
                              </span>
                              <ChevronRight className="h-3 w-3 text-charcoal-300 flex-shrink-0" />
                            </>
                          )}
                          <span className="text-success-600 font-medium truncate max-w-[100px]">
                            {truncateValue(entry.newValueLabel || entry.newValue || '', 20)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Changed By */}
                  <div className="flex items-center gap-2">
                    {entry.isAutomated ? (
                      <div className="w-6 h-6 rounded-full bg-charcoal-100 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-charcoal-500" />
                      </div>
                    ) : entry.changedBy?.avatarUrl ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={entry.changedBy.avatarUrl} alt={changedByName} />
                        <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-[10px] font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className="text-xs text-charcoal-600 truncate">
                      {changedByName.split(' ')[0]}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-center">
                    <div className="text-xs text-charcoal-700 font-medium tabular-nums">
                      {format(new Date(entry.changedAt), 'MMM d, yyyy')}
                    </div>
                    <div className="text-[10px] text-charcoal-400">
                      {format(new Date(entry.changedAt), 'h:mm a')}
                    </div>
                  </div>

                  {/* Time Ago */}
                  <div className="text-center">
                    <span className="text-xs text-charcoal-500">
                      {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || changeTypeFilter !== 'all' ? 'No matching history' : 'No history recorded'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || changeTypeFilter !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Changes to this contact will appear here'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredHistory.length)}</span> of <span className="font-medium text-charcoal-700">{filteredHistory.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedEntry && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-md overflow-hidden animate-slide-up">
          {/* Header with gradient */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-charcoal-50 via-white to-charcoal-50/40 border-b border-charcoal-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-charcoal-400 via-charcoal-600 to-charcoal-400" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                  getIconBackground(selectedEntry)
                )}>
                  {selectedEntry.isAutomated ? (
                    <Bot className="h-6 w-6 text-charcoal-500" />
                  ) : (
                    getDetailPanelIcon(selectedEntry)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-900">
                      {getActionDescription(selectedEntry)}
                    </h3>
                    {selectedEntry.isAutomated && (
                      <Badge variant="secondary" className="text-xs bg-charcoal-100">
                        <Bot className="h-3 w-3 mr-1" />
                        Automated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-500 mt-0.5">
                    by {selectedEntry.changedBy?.name || (selectedEntry.isAutomated ? 'System' : 'Unknown')} • {format(new Date(selectedEntry.changedAt), 'MMM d, yyyy \'at\' h:mm a')}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedEntry(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content - Three Column Layout */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Column 1 - Change Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Change Details</h4>
                </div>
                <DetailField label="Change Type" value={formatChangeType(selectedEntry.changeType)} />
                {selectedEntry.field && (
                  <DetailField label="Field" value={selectedEntry.field.replace(/_/g, ' ')} />
                )}
                {selectedEntry.timeInPreviousState && (
                  <DetailField label="Time in Previous State" value={selectedEntry.timeInPreviousState} />
                )}
              </div>

              {/* Column 2 - Value Change */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Value Change</h4>
                </div>
                {(selectedEntry.oldValue || selectedEntry.oldValueLabel) && (
                  <DetailField
                    label="Previous Value"
                    value={selectedEntry.oldValueLabel || selectedEntry.oldValue}
                    variant="old"
                  />
                )}
                {(selectedEntry.newValue || selectedEntry.newValueLabel) && (
                  <DetailField
                    label="New Value"
                    value={selectedEntry.newValueLabel || selectedEntry.newValue}
                    variant="new"
                  />
                )}
                {!selectedEntry.oldValue && !selectedEntry.oldValueLabel && !selectedEntry.newValue && !selectedEntry.newValueLabel && (
                  <p className="text-sm text-charcoal-400 italic">No value change recorded</p>
                )}
              </div>

              {/* Column 3 - Additional Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Additional Info</h4>
                </div>
                {selectedEntry.reason && (
                  <div className="p-3 bg-charcoal-50 rounded-lg border border-charcoal-100">
                    <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-sm text-charcoal-700">{selectedEntry.reason}</p>
                  </div>
                )}
                {selectedEntry.comment && (
                  <div className="p-3 bg-charcoal-50 rounded-lg border border-charcoal-100">
                    <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-1">Comment</p>
                    <p className="text-sm text-charcoal-700">{selectedEntry.comment}</p>
                  </div>
                )}
                {!selectedEntry.reason && !selectedEntry.comment && (
                  <p className="text-sm text-charcoal-400 italic">No additional info</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Detail field component for the detail panel
 */
function DetailField({
  label,
  value,
  variant
}: {
  label: string
  value: string | null | undefined
  variant?: 'old' | 'new'
}) {
  if (!value) return null

  return (
    <div className="py-2 border-b border-charcoal-100/60 last:border-b-0">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn(
        "text-sm font-medium",
        variant === 'old' && "text-charcoal-500 line-through",
        variant === 'new' && "text-success-600",
        !variant && "text-charcoal-900"
      )}>
        {value}
      </p>
    </div>
  )
}

/**
 * Format change type for display
 */
function formatChangeType(changeType: string | null | undefined): string {
  if (!changeType) return 'Update'
  return changeType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get larger icon for detail panel
 */
function getDetailPanelIcon(entry: HistoryEntry): React.ReactElement {
  const metadata = entry.metadata as { action?: string; relatedEntity?: { type?: string } } | null
  const relatedType = metadata?.relatedEntity?.type

  // Related object icons
  if (relatedType === 'note') {
    return <MessageSquare className="h-6 w-6 text-blue-500" />
  }
  if (relatedType === 'document') {
    return <FileText className="h-6 w-6 text-amber-500" />
  }
  if (relatedType === 'activity') {
    return <Activity className="h-6 w-6 text-purple-500" />
  }

  // Change type icons
  switch (entry.changeType) {
    case 'status_change':
      return <Settings className="h-6 w-6 text-emerald-500" />
    case 'owner_change':
    case 'assignment_change':
      return <UserCircle className="h-6 w-6 text-blue-500" />
    default:
      return <History className="h-6 w-6 text-charcoal-500" />
  }
}

/**
 * Get icon for change type
 */
function getChangeIcon(entry: HistoryEntry): React.ReactElement {
  const metadata = entry.metadata as { action?: string; relatedEntity?: { type?: string } } | null
  const relatedType = metadata?.relatedEntity?.type

  // Related object icons
  if (relatedType === 'note') {
    return <MessageSquare className="h-4 w-4 text-blue-500" />
  }
  if (relatedType === 'document') {
    return <FileText className="h-4 w-4 text-amber-500" />
  }
  if (relatedType === 'activity') {
    return <Activity className="h-4 w-4 text-purple-500" />
  }

  // Change type icons
  switch (entry.changeType) {
    case 'status_change':
      return <Settings className="h-4 w-4 text-emerald-500" />
    case 'owner_change':
    case 'assignment_change':
      return <UserCircle className="h-4 w-4 text-blue-500" />
    default:
      return <History className="h-4 w-4 text-charcoal-500" />
  }
}

/**
 * Get icon background color
 */
function getIconBackground(entry: HistoryEntry): string {
  const metadata = entry.metadata as { action?: string; relatedEntity?: { type?: string } } | null
  const relatedType = metadata?.relatedEntity?.type

  if (relatedType === 'note') return 'bg-blue-100'
  if (relatedType === 'document') return 'bg-amber-100'
  if (relatedType === 'activity') return 'bg-purple-100'

  switch (entry.changeType) {
    case 'status_change':
      return 'bg-emerald-100'
    case 'owner_change':
    case 'assignment_change':
      return 'bg-blue-100'
    default:
      return 'bg-charcoal-100'
  }
}

/**
 * Generate action description from entry
 */
function getActionDescription(entry: HistoryEntry): string {
  const metadata = entry.metadata as { action?: string; relatedEntity?: { type?: string; label?: string; action?: string } } | null

  // Handle related object actions
  if (metadata?.relatedEntity) {
    const { type, label, action } = metadata.relatedEntity
    const typeName = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Item'

    if (action === 'added') {
      return `Added ${typeName}: ${label || 'item'}`
    }
    if (action === 'updated') {
      return `Updated ${typeName}: ${label || 'item'}`
    }
    if (action === 'removed') {
      return `Removed ${typeName}: ${label || 'item'}`
    }
  }

  // Handle entity lifecycle
  if (metadata?.action === 'entity_created') {
    return entry.newValueLabel || 'Created this contact'
  }

  // Handle field changes using labels
  if (entry.newValueLabel) {
    return entry.newValueLabel
  }

  // Fallback to change type
  switch (entry.changeType) {
    case 'status_change':
      return `Changed status`
    case 'owner_change':
      return 'Changed owner'
    case 'assignment_change':
      return 'Changed assignment'
    case 'stage_change':
      return 'Changed stage'
    case 'score_change':
      return `Updated ${entry.field?.replace(/_/g, ' ') || 'score'}`
    case 'category_change':
      return `Changed ${entry.field?.replace(/_/g, ' ') || 'category'}`
    default:
      if (entry.field) {
        return `Updated ${entry.field.replace(/_/g, ' ')}`
      }
      return 'Made a change'
  }
}

/**
 * Check if we should show value change badges
 */
function shouldShowValueChange(entry: HistoryEntry): boolean {
  const metadata = entry.metadata as { action?: string } | null

  // Don't show for entity creation (the description is enough)
  if (metadata?.action === 'entity_created') return false

  // Don't show for related object actions
  if (metadata?.action?.startsWith('related_')) return false

  // Show if we have actual value changes
  return !!(entry.newValue || entry.newValueLabel)
}

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Truncate long values
 */
function truncateValue(value: string, maxLength: number = 50): string {
  if (value.length <= maxLength) return value
  return value.slice(0, maxLength) + '...'
}

export default ContactHistorySection
