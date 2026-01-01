'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, Clock, User, Users, Shield, FileText,
  Plus, Search, MoreVertical, CheckCircle, XCircle, 
  ArrowRight, X, ChevronLeft, ChevronRight, AlertCircle,
  Target, Zap, MessageSquare, Lightbulb, Timer,
  ExternalLink, BarChart3, TrendingUp, CalendarClock, Pencil
} from 'lucide-react'
import { EditEscalationDialog } from '@/components/recruiting/accounts/EditEscalationDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountEscalation, EscalationSeverity, EscalationStatus, EscalationType, ClientSatisfaction } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, isPast } from 'date-fns'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountEscalationsSectionProps {
  escalations: AccountEscalation[]
  accountId: string
}

type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved'

// Severity configuration with escalating urgency
const SEVERITY_CONFIG: Record<EscalationSeverity, { 
  label: string
  bg: string
  text: string
  dot: string
  ringColor: string
  icon: React.ElementType
}> = {
  low: { 
    label: 'Low', 
    bg: 'bg-charcoal-100', 
    text: 'text-charcoal-600', 
    dot: 'bg-charcoal-400',
    ringColor: 'ring-charcoal-200',
    icon: AlertCircle
  },
  medium: { 
    label: 'Medium', 
    bg: 'bg-blue-50', 
    text: 'text-blue-700', 
    dot: 'bg-blue-500',
    ringColor: 'ring-blue-200',
    icon: AlertCircle
  },
  high: { 
    label: 'High', 
    bg: 'bg-amber-50', 
    text: 'text-amber-700', 
    dot: 'bg-amber-500',
    ringColor: 'ring-amber-200',
    icon: AlertTriangle
  },
  critical: { 
    label: 'Critical', 
    bg: 'bg-red-50', 
    text: 'text-red-700', 
    dot: 'bg-red-500',
    ringColor: 'ring-red-300',
    icon: Zap
  },
}

// Status configuration
const STATUS_CONFIG: Record<EscalationStatus, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: 'Open', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  pending_client: { label: 'Pending Client', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  resolved: { label: 'Resolved', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  closed: { label: 'Closed', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
}

// Type configuration
const TYPE_CONFIG: Record<EscalationType, { label: string; icon: React.ElementType }> = {
  service_issue: { label: 'Service Issue', icon: Shield },
  billing_dispute: { label: 'Billing Dispute', icon: FileText },
  quality_concern: { label: 'Quality Concern', icon: Target },
  communication_breakdown: { label: 'Communication', icon: MessageSquare },
  contract_violation: { label: 'Contract Violation', icon: FileText },
  resource_issue: { label: 'Resource Issue', icon: Users },
  timeline_delay: { label: 'Timeline Delay', icon: Clock },
  other: { label: 'Other', icon: AlertCircle },
}

// Client satisfaction config
const SATISFACTION_CONFIG: Record<ClientSatisfaction, { color: string; label: string }> = {
  very_satisfied: { color: 'text-green-600', label: 'Very Satisfied' },
  satisfied: { color: 'text-green-500', label: 'Satisfied' },
  neutral: { color: 'text-charcoal-500', label: 'Neutral' },
  dissatisfied: { color: 'text-amber-600', label: 'Dissatisfied' },
  very_dissatisfied: { color: 'text-red-600', label: 'Very Dissatisfied' },
}

// Calculate SLA status
function getSlaStatus(slaDue: string | null): { 
  status: 'safe' | 'warning' | 'danger' | 'breached'
  label: string
  color: string
  bgColor: string
  hoursRemaining: number | null
} {
  if (!slaDue) return { status: 'safe', label: 'No SLA', color: 'text-charcoal-500', bgColor: '', hoursRemaining: null }
  
  const now = new Date()
  const due = new Date(slaDue)
  const hoursRemaining = differenceInHours(due, now)
  const minutesRemaining = differenceInMinutes(due, now)
  
  if (isPast(due)) {
    return { 
      status: 'breached', 
      label: 'SLA Breached', 
      color: 'text-red-700', 
      bgColor: 'bg-red-50',
      hoursRemaining: -Math.abs(hoursRemaining)
    }
  }
  
  if (hoursRemaining <= 4) {
    return { 
      status: 'danger', 
      label: minutesRemaining < 60 ? `${minutesRemaining}m left` : `${hoursRemaining}h left`, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      hoursRemaining 
    }
  }
  
  if (hoursRemaining <= 24) {
    return { 
      status: 'warning', 
      label: `${hoursRemaining}h left`, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50',
      hoursRemaining 
    }
  }
  
  return { 
    status: 'safe', 
    label: `${Math.floor(hoursRemaining / 24)}d ${hoursRemaining % 24}h`, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    hoursRemaining 
  }
}

/**
 * AccountEscalationsSection - Premium SaaS-level escalation management
 * Features: SLA tracking, severity indicators, urgency banner, detail panel
 */
export function AccountEscalationsSection({ escalations, accountId }: AccountEscalationsSectionProps) {
  const [selectedEscalation, setSelectedEscalation] = React.useState<AccountEscalation | null>(null)
  const [editingEscalation, setEditingEscalation] = React.useState<AccountEscalation | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Sync selectedEscalation with updated data when escalations prop changes
  React.useEffect(() => {
    if (selectedEscalation) {
      const updated = escalations.find(e => e.id === selectedEscalation.id)
      if (updated) {
        setSelectedEscalation(updated)
      }
    }
    if (editingEscalation) {
      const updated = escalations.find(e => e.id === editingEscalation.id)
      if (updated) {
        setEditingEscalation(updated)
      }
    }
  }, [escalations, selectedEscalation?.id, editingEscalation?.id])

  // Calculate status counts and critical alerts
  const { statusCounts, criticalAlerts } = React.useMemo(() => {
    const open = escalations.filter(e => e.status === 'open').length
    const inProgress = escalations.filter(e => e.status === 'in_progress' || e.status === 'pending_client').length
    const resolved = escalations.filter(e => e.status === 'resolved' || e.status === 'closed').length
    
    // Find critical/high escalations with SLA breaching soon
    const alerts = escalations.filter(e => {
      if (e.status === 'resolved' || e.status === 'closed') return false
      if (e.severity === 'critical' || e.severity === 'high') {
        if (e.slaResponseDue) {
          const slaStatus = getSlaStatus(e.slaResponseDue)
          return slaStatus.status === 'breached' || slaStatus.status === 'danger'
        }
        if (e.slaResolutionDue) {
          const slaStatus = getSlaStatus(e.slaResolutionDue)
          return slaStatus.status === 'breached' || slaStatus.status === 'danger'
        }
      }
      return e.severity === 'critical'
    })
    
    return {
      statusCounts: { all: escalations.length, open, in_progress: inProgress, resolved },
      criticalAlerts: alerts
    }
  }, [escalations])

  // Filter escalations based on search and status
  const filteredEscalations = React.useMemo(() => {
    let result = escalations
    
    // Status filter
    if (statusFilter === 'open') {
      result = result.filter(e => e.status === 'open')
    } else if (statusFilter === 'in_progress') {
      result = result.filter(e => e.status === 'in_progress' || e.status === 'pending_client')
    } else if (statusFilter === 'resolved') {
      result = result.filter(e => e.status === 'resolved' || e.status === 'closed')
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e => 
        e.subject.toLowerCase().includes(q) ||
        e.escalationNumber.toLowerCase().includes(q) ||
        e.issueSummary.toLowerCase().includes(q) ||
        e.createdBy?.name.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [escalations, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredEscalations.length / ITEMS_PER_PAGE)
  const paginatedEscalations = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEscalations.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEscalations, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (escalation: AccountEscalation) => {
    if (selectedEscalation?.id === escalation.id) {
      setSelectedEscalation(null)
    } else {
      setSelectedEscalation(escalation)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-red-50/50 to-amber-50/30 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-800">
                {criticalAlerts.length} Critical Escalation{criticalAlerts.length > 1 ? 's' : ''} Requiring Attention
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {criticalAlerts.slice(0, 3).map(alert => (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedEscalation(alert)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <span className="font-mono">{alert.escalationNumber}</span>
                    <span className="text-red-400">·</span>
                    <span className="truncate max-w-[150px]">{alert.subject}</span>
                  </button>
                ))}
                {criticalAlerts.length > 3 && (
                  <span className="text-xs text-red-600 font-medium px-2 py-1">
                    +{criticalAlerts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient - Red/Amber urgency theme */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-red-50/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-sm">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Escalations</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredEscalations.length} escalation{filteredEscalations.length !== 1 ? 's' : ''} for this account
                  {statusCounts.open > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">{statusCounts.open} open</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search escalations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-red-400 focus:ring-red-400/20"
                />
              </div>
              <Button 
                size="sm"
                variant="destructive"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm font-medium"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                    detail: { dialogId: 'createEscalation', accountId } 
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Escalation
              </Button>
            </div>
          </div>

          {/* Status Filter Pills */}
          {escalations.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'open', label: 'Open', count: statusCounts.open },
                { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key as StatusFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    statusFilter === filter.key
                      ? "bg-charcoal-900 text-white shadow-sm"
                      : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[90px_1fr_80px_90px_100px_100px_70px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div>ID</div>
          <div>Issue</div>
          <div className="text-center">Severity</div>
          <div className="text-center">Status</div>
          <div className="text-center">SLA</div>
          <div className="text-center">Assigned</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedEscalations.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedEscalations.map((escalation) => {
              const severityConfig = SEVERITY_CONFIG[escalation.severity] || SEVERITY_CONFIG.medium
              const statusConfig = STATUS_CONFIG[escalation.status] || STATUS_CONFIG.open
              const typeConfig = TYPE_CONFIG[escalation.escalationType] || TYPE_CONFIG.other
              const SeverityIcon = severityConfig.icon
              const TypeIcon = typeConfig.icon
              const slaStatus = getSlaStatus(escalation.slaResponseDue || escalation.slaResolutionDue)

              return (
                <div
                  key={escalation.id}
                  onClick={() => handleRowClick(escalation)}
                  className={cn(
                    'group grid grid-cols-[90px_1fr_80px_90px_100px_100px_70px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedEscalation?.id === escalation.id 
                      ? 'bg-red-50/60 border-l-2 border-l-red-500' 
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent',
                    escalation.severity === 'critical' && escalation.status !== 'resolved' && 'bg-red-50/30'
                  )}
                >
                  {/* Escalation Number */}
                  <div>
                    <span className="font-mono text-xs font-bold text-charcoal-700">
                      {escalation.escalationNumber}
                    </span>
                  </div>

                  {/* Issue Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-2",
                      severityConfig.bg,
                      severityConfig.ringColor
                    )}>
                      <SeverityIcon className={cn("h-4 w-4", severityConfig.text, escalation.severity === 'critical' && 'animate-pulse')} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-charcoal-900 truncate">{escalation.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {typeConfig.label}
                        </span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Severity Badge */}
                  <div className="text-center">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 border-0",
                        severityConfig.bg,
                        severityConfig.text
                      )}
                    >
                      {severityConfig.label.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Status */}
                  <div className="text-center">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  {/* SLA Countdown */}
                  <div className="text-center">
                    {slaStatus.hoursRemaining !== null ? (
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        slaStatus.bgColor,
                        slaStatus.color
                      )}>
                        <Timer className="h-3 w-3" />
                        {slaStatus.label}
                      </div>
                    ) : (
                      <span className="text-xs text-charcoal-400">—</span>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="text-center">
                    {escalation.assignedTo ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-charcoal-400 to-charcoal-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {escalation.assignedTo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-charcoal-600 truncate max-w-[60px]">
                          {escalation.assignedTo.name.split(' ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Unassigned</span>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* View */ }}>
                          <ExternalLink className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          View Details
                        </DropdownMenuItem>
                        {escalation.status !== 'resolved' && escalation.status !== 'closed' && (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Assign */ }}>
                              <User className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Assign / Reassign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); /* Resolve */ }}>
                              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                              Mark Resolved
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || statusFilter !== 'all' ? 'No escalations match your filters' : 'No escalations - that\'s great!'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'All issues have been resolved'}
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEscalations.length)}</span> of <span className="font-medium text-charcoal-700">{filteredEscalations.length}</span>
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

      {/* Premium Detail Panel */}
      {selectedEscalation && (
        <EscalationDetailPanel 
          escalation={selectedEscalation} 
          onClose={() => setSelectedEscalation(null)}
          onEdit={() => setEditingEscalation(selectedEscalation)}
        />
      )}

      {/* Edit Escalation Dialog */}
      {editingEscalation && (
        <EditEscalationDialog
          open={!!editingEscalation}
          onOpenChange={(open) => !open && setEditingEscalation(null)}
          escalation={editingEscalation}
          accountId={accountId}
          onSuccess={() => setSelectedEscalation(null)}
        />
      )}
    </div>
  )
}

// Detail Panel Component
function EscalationDetailPanel({ escalation, onClose, onEdit }: { escalation: AccountEscalation; onClose: () => void; onEdit: () => void }) {
  const severityConfig = SEVERITY_CONFIG[escalation.severity] || SEVERITY_CONFIG.medium
  const statusConfig = STATUS_CONFIG[escalation.status] || STATUS_CONFIG.open
  const typeConfig = TYPE_CONFIG[escalation.escalationType] || TYPE_CONFIG.other
  const SeverityIcon = severityConfig.icon
  const TypeIcon = typeConfig.icon
  
  const responseSlsStatus = getSlaStatus(escalation.slaResponseDue)
  const resolutionSlaStatus = getSlaStatus(escalation.slaResolutionDue)

  // Determine header gradient based on severity
  const headerGradient = escalation.severity === 'critical' 
    ? 'from-red-50/80 via-transparent to-amber-50/20'
    : escalation.severity === 'high'
    ? 'from-amber-50/80 via-transparent to-red-50/20'
    : 'from-charcoal-50/80 via-transparent to-blue-50/20'

  const accentColor = escalation.severity === 'critical' 
    ? 'from-red-400 via-red-500 to-amber-500'
    : escalation.severity === 'high'
    ? 'from-amber-400 via-amber-500 to-red-500'
    : 'from-blue-400 via-blue-500 to-purple-500'

  return (
    <div 
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-red-50/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", accentColor)} />
      
      {/* Floating action buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {escalation.status !== 'resolved' && escalation.status !== 'closed' && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 hover:bg-green-500/20 backdrop-blur-sm border border-green-200/50 text-green-600 hover:text-green-700 transition-all duration-200"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Resolve</span>
          </button>
        )}
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm border border-red-200/50 text-red-600 hover:text-red-700 transition-all duration-200 group"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Edit</span>
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
        >
          <span className="text-xs font-medium">Close</span>
          <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Header */}
      <div className={cn("relative px-8 pt-6 pb-5 bg-gradient-to-br", headerGradient)}>
        <div className="flex items-start gap-5">
          {/* Severity Icon with glow effect */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-40",
              escalation.severity === 'critical' ? 'bg-red-400' :
              escalation.severity === 'high' ? 'bg-amber-400' :
              escalation.severity === 'medium' ? 'bg-blue-400' : 'bg-charcoal-300'
            )} />
            <div className={cn(
              "relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-white/80",
              severityConfig.bg,
              "border-2",
              escalation.severity === 'critical' ? 'border-red-300' :
              escalation.severity === 'high' ? 'border-amber-300' : 'border-charcoal-200'
            )}>
              <SeverityIcon className={cn(
                "h-8 w-8 drop-shadow-sm",
                severityConfig.text,
                escalation.severity === 'critical' && 'animate-pulse'
              )} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-sm font-bold text-charcoal-500">{escalation.escalationNumber}</span>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-bold border-0 shadow-sm",
                  severityConfig.bg,
                  severityConfig.text
                )}
              >
                {severityConfig.label.toUpperCase()}
              </Badge>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-semibold border-0 shadow-sm",
                  statusConfig.bg,
                  statusConfig.text
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", escalation.status === 'in_progress' ? 'animate-pulse' : '', statusConfig.dot)} />
                {statusConfig.label}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-charcoal-900 tracking-tight mt-2">{escalation.subject}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <TypeIcon className="h-3.5 w-3.5 text-charcoal-400" />
                {typeConfig.label}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-charcoal-400" />
                {escalation.createdBy.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-charcoal-400" />
                {formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Status Cards */}
      {(escalation.slaResponseDue || escalation.slaResolutionDue) && (
        <div className="px-8 py-4 bg-charcoal-50/50 border-b border-charcoal-100">
          <div className="grid grid-cols-2 gap-4">
            {/* Response SLA */}
            <div className={cn(
              "rounded-xl p-4 border",
              responseSlsStatus.status === 'breached' ? 'bg-red-50 border-red-200' :
              responseSlsStatus.status === 'danger' ? 'bg-red-50 border-red-200' :
              responseSlsStatus.status === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-white border-charcoal-200/60'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className={cn("h-4 w-4", responseSlsStatus.color)} />
                  <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Response SLA</span>
                </div>
                {escalation.slaResponseMet !== null && (
                  <Badge className={escalation.slaResponseMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {escalation.slaResponseMet ? 'Met' : 'Missed'}
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                {escalation.slaResponseDue ? (
                  <>
                    <p className={cn("text-lg font-bold", responseSlsStatus.color)}>
                      {responseSlsStatus.label}
                    </p>
                    <p className="text-xs text-charcoal-400 mt-0.5">
                      Due {format(new Date(escalation.slaResponseDue), 'MMM d, h:mm a')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-charcoal-400">Not set</p>
                )}
              </div>
            </div>

            {/* Resolution SLA */}
            <div className={cn(
              "rounded-xl p-4 border",
              resolutionSlaStatus.status === 'breached' ? 'bg-red-50 border-red-200' :
              resolutionSlaStatus.status === 'danger' ? 'bg-red-50 border-red-200' :
              resolutionSlaStatus.status === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-white border-charcoal-200/60'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className={cn("h-4 w-4", resolutionSlaStatus.color)} />
                  <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Resolution SLA</span>
                </div>
                {escalation.slaResolutionMet !== null && (
                  <Badge className={escalation.slaResolutionMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {escalation.slaResolutionMet ? 'Met' : 'Missed'}
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                {escalation.slaResolutionDue ? (
                  <>
                    <p className={cn("text-lg font-bold", resolutionSlaStatus.color)}>
                      {resolutionSlaStatus.label}
                    </p>
                    <p className="text-xs text-charcoal-400 mt-0.5">
                      Due {format(new Date(escalation.slaResolutionDue), 'MMM d, h:mm a')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-charcoal-400">Not set</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content - Hybrid Layout */}
      <div className="px-8 py-6">
        {/* Two columns for compact data */}
        <div className="grid grid-cols-2 gap-8">
          {/* Column 1 - Issue Summary & Client Impact */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Issue Summary</h4>
              </div>
              <div className="rounded-2xl border border-charcoal-100/50 p-4 bg-white min-h-[100px]">
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {escalation.issueSummary || escalation.subject}
                </p>
              </div>
            </div>

            {escalation.clientImpact && escalation.clientImpact.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-amber-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Client Impact</h4>
                </div>
                <div className="rounded-2xl border border-amber-100 p-4 bg-amber-50/50">
                  <ul className="space-y-2">
                    {escalation.clientImpact.map((impact, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Column 2 - Assignment */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-blue-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Assignment</h4>
              </div>
              <div className="space-y-3">
                {/* Created By */}
                <div className="rounded-xl border border-charcoal-100/50 p-3 bg-white flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-charcoal-400 to-charcoal-600 flex items-center justify-center text-white text-xs font-bold">
                    {escalation.createdBy.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-medium">Created By</p>
                    <p className="text-sm font-semibold text-charcoal-800 truncate">{escalation.createdBy.name}</p>
                  </div>
                </div>

                {/* Assigned To */}
                <div className="rounded-xl border border-charcoal-100/50 p-3 bg-white flex items-center gap-3">
                  {escalation.assignedTo ? (
                    <>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {escalation.assignedTo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-medium">Assigned To</p>
                        <p className="text-sm font-semibold text-charcoal-800 truncate">{escalation.assignedTo.name}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-medium">Assigned To</p>
                        <p className="text-sm font-medium text-amber-600">Not Assigned</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Escalated To */}
                {escalation.escalatedTo && (
                  <div className="rounded-xl border border-purple-100 p-3 bg-purple-50/50 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {escalation.escalatedTo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-purple-600 uppercase tracking-wider font-medium">Escalated To</p>
                      <p className="text-sm font-semibold text-charcoal-800 truncate">{escalation.escalatedTo.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width sections for text-heavy content */}
        <div className="mt-8 space-y-5">
          {/* Detailed Description */}
          {escalation.detailedDescription && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Detailed Description</h4>
              </div>
              <div className="rounded-2xl border border-charcoal-100/50 p-4 bg-white">
                <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                  {escalation.detailedDescription}
                </p>
              </div>
            </div>
          )}

          {/* Root Cause */}
          {escalation.rootCause && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Root Cause Analysis</h4>
              </div>
              <div className="rounded-2xl border border-purple-100 p-4 bg-purple-50/30">
                <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                  {escalation.rootCause}
                </p>
              </div>
            </div>
          )}

          {/* Immediate Actions */}
          {escalation.immediateActions && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Immediate Actions Taken</h4>
              </div>
              <div className="rounded-2xl border border-amber-100 p-4 bg-amber-50/30">
                <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-relaxed">
                  {escalation.immediateActions}
                </p>
              </div>
            </div>
          )}

          {/* Resolution Plan */}
          {escalation.resolutionPlan && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Resolution Plan</h4>
              </div>
              <div className="rounded-2xl border border-green-100 p-4 bg-green-50/30">
                <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">
                  {escalation.resolutionPlan}
                </p>
              </div>
            </div>
          )}

          {/* Resolution Summary (if resolved) */}
          {(escalation.status === 'resolved' || escalation.status === 'closed') && escalation.resolutionSummary && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Resolution Summary</h4>
              </div>
              <div className="rounded-2xl border border-green-200 p-4 bg-green-50/50">
                <p className="text-sm text-charcoal-700 leading-relaxed">{escalation.resolutionSummary}</p>
                {escalation.resolvedAt && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Resolved {formatDistanceToNow(new Date(escalation.resolvedAt), { addSuffix: true })}
                    {escalation.resolvedBy && ` by ${escalation.resolvedBy.name}`}
                  </p>
                )}
                {escalation.timeToResolve && (
                  <p className="text-xs text-charcoal-500 mt-1">
                    Time to resolve: {escalation.timeToResolve}
                  </p>
                )}
                {escalation.clientSatisfaction && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-charcoal-500">
                      Client Satisfaction: <span className={cn("font-medium", SATISFACTION_CONFIG[escalation.clientSatisfaction].color)}>{SATISFACTION_CONFIG[escalation.clientSatisfaction].label}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lessons Learned */}
          {escalation.lessonsLearned && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Lessons Learned</h4>
              </div>
              <div className="rounded-2xl border border-amber-100 p-4 bg-amber-50/30">
                <p className="text-sm text-charcoal-600 leading-relaxed">{escalation.lessonsLearned}</p>
              </div>
            </div>
          )}

          {/* Preventive Measures */}
          {escalation.preventiveMeasures && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-blue-500" />
                <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Preventive Measures</h4>
              </div>
              <div className="rounded-2xl border border-blue-100 p-4 bg-blue-50/30">
                <p className="text-sm text-charcoal-600 leading-relaxed">{escalation.preventiveMeasures}</p>
              </div>
            </div>
          )}

          {/* No Analysis Placeholder */}
          {!escalation.detailedDescription && !escalation.rootCause && !escalation.immediateActions && !escalation.resolutionPlan && (
            <div className="rounded-2xl border border-charcoal-100/50 p-8 bg-charcoal-50/50 flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 text-charcoal-300 mb-3" />
              <p className="text-sm text-charcoal-500 font-medium">Analysis Pending</p>
              <p className="text-xs text-charcoal-400 mt-1">Click &quot;Edit Escalation&quot; to add details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-charcoal-100/40 flex items-center justify-center">
          <p className="text-xs text-charcoal-400">
            Last updated {escalation.updatedAt ? formatDistanceToNow(new Date(escalation.updatedAt), { addSuffix: true }) : formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default AccountEscalationsSection
