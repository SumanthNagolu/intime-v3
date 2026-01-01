'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Award, 
  MoreVertical, 
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Briefcase,
  ExternalLink,
  User,
  Building2,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Activity,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountPlacement } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// Constants
const ITEMS_PER_PAGE = 10

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending_start: { label: 'Pending Start', bg: 'bg-charcoal-100', text: 'text-charcoal-700', dot: 'bg-charcoal-500' },
  active: { label: 'Active', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  extended: { label: 'Extended', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  completed: { label: 'Completed', bg: 'bg-gold-100', text: 'text-gold-800', dot: 'bg-gold-600' },
  terminated: { label: 'Terminated', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  on_hold: { label: 'On Hold', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
}

const HEALTH_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  healthy: { label: 'Healthy', icon: CheckCircle2, color: 'text-success-600' },
  at_risk: { label: 'At Risk', icon: AlertCircle, color: 'text-amber-600' },
  critical: { label: 'Critical', icon: AlertCircle, color: 'text-error-600' },
}

interface AccountPlacementsSectionProps {
  placements: AccountPlacement[]
  accountId: string
}

// Simple editable field for detail panel
function DetailField({ 
  label, 
  value, 
  icon: Icon,
  href,
  formatValue,
}: { 
  label: string
  value: string | number | null | undefined
  icon?: React.ElementType
  href?: string
  formatValue?: (val: string | number) => string
}) {
  const displayValue = value !== null && value !== undefined 
    ? (formatValue ? formatValue(value) : String(value))
    : null

  const content = (
    <div className="py-2.5 border-b border-charcoal-100/60 last:border-b-0 hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg transition-colors grid grid-cols-[110px_1fr] gap-3 items-center">
      <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Icon && displayValue && (
          <div className="w-6 h-6 rounded-md bg-charcoal-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-3.5 w-3.5 text-charcoal-500" />
          </div>
        )}
        <span className={cn(
          "text-sm",
          displayValue ? "text-charcoal-900 font-medium" : "text-charcoal-400 italic"
        )}>
          {displayValue || '—'}
        </span>
      </div>
    </div>
  )

  if (href && displayValue) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

/**
 * AccountPlacementsSection - Premium SaaS-level placements list
 * Matches Contacts section aesthetic with table, pagination, and inline detail panel
 */
export function AccountPlacementsSection({ placements, accountId }: AccountPlacementsSectionProps) {
  const router = useRouter()
  
  const [selectedPlacement, setSelectedPlacement] = React.useState<AccountPlacement | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter placements based on search
  const filteredPlacements = React.useMemo(() => {
    if (!searchQuery.trim()) return placements
    const q = searchQuery.toLowerCase()
    return placements.filter(p => 
      p.consultantName.toLowerCase().includes(q) ||
      p.jobTitle.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    )
  }, [placements, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filteredPlacements.length / ITEMS_PER_PAGE)
  const paginatedPlacements = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPlacements.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPlacements, currentPage])

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleRowClick = (placement: AccountPlacement) => {
    if (selectedPlacement?.id === placement.id) {
      setSelectedPlacement(null)
    } else {
      setSelectedPlacement(placement)
    }
  }

  const handleQuickAction = (action: string, placement: AccountPlacement, e: React.MouseEvent) => {
    e.stopPropagation()
    switch (action) {
      case 'viewPlacement':
        router.push(`/employee/recruiting/placements/${placement.id}`)
        break
      case 'logActivity':
        window.dispatchEvent(new CustomEvent('openEntityDialog', { 
          detail: { dialogId: 'logActivity', entityType: 'placement', entityId: placement.id } 
        }))
        break
    }
  }

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.active
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '—'
    return `$${value.toLocaleString()}/hr`
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    try {
      return format(new Date(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const calculateMargin = (placement: AccountPlacement): string => {
    if (!placement.billRate || !placement.payRate) return '—'
    const margin = ((placement.billRate - placement.payRate) / placement.billRate) * 100
    return `${margin.toFixed(1)}%`
  }

  const calculateDaysActive = (placement: AccountPlacement): number => {
    const start = new Date(placement.startDate)
    const end = placement.endDate ? new Date(placement.endDate) : new Date()
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-sm">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Placements</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredPlacements.length} placement{filteredPlacements.length !== 1 ? 's' : ''} • Active revenue stream
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search placements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              {/* Guide to workflow instead of direct add */}
              {placements.length === 0 && (
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white shadow-sm"
                  onClick={() => router.push(`/employee/recruiting/jobs/new?accountId=${accountId}`)}
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Create Job
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table Header - Premium styling */}
        {paginatedPlacements.length > 0 && (
          <div className="grid grid-cols-[1fr_180px_120px_110px_110px_90px] gap-3 px-5 py-3 bg-charcoal-50/50 border-b border-charcoal-200/60 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
            <div>Consultant</div>
            <div>Job Title</div>
            <div>Status</div>
            <div>Start Date</div>
            <div className="text-right">Bill Rate</div>
            <div className="text-right">Actions</div>
          </div>
        )}

        {/* Table Body */}
        {paginatedPlacements.length > 0 ? (
          <div className="divide-y divide-charcoal-100/60">
            {paginatedPlacements.map((placement, idx) => {
              const statusConfig = getStatusConfig(placement.status)
              const margin = calculateMargin(placement)
              const isActive = ['active', 'extended'].includes(placement.status)
              
              return (
                <div
                  key={placement.id}
                  onClick={() => handleRowClick(placement)}
                  className={cn(
                    'group grid grid-cols-[1fr_180px_120px_110px_110px_90px] gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 items-center',
                    selectedPlacement?.id === placement.id 
                      ? 'bg-gold-50/70 hover:bg-gold-50' 
                      : 'hover:bg-charcoal-50/50'
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Consultant Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105",
                      isActive 
                        ? "bg-gradient-to-br from-success-400 to-success-600" 
                        : "bg-gradient-to-br from-charcoal-300 to-charcoal-500"
                    )}>
                      <span className="text-sm font-semibold text-white">
                        {placement.consultantName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-charcoal-900 truncate block">
                        {placement.consultantName}
                      </span>
                      <p className="text-xs text-charcoal-500">
                        {placement.endDate ? (
                          <>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {calculateDaysActive(placement)} days
                          </>
                        ) : (
                          <span className="text-charcoal-400">No end date</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Job Title */}
                  <div className="text-sm text-charcoal-600 truncate">
                    {placement.jobTitle}
                  </div>
                  
                  {/* Status */}
                  <div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 border-0",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dot)} />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  {/* Start Date */}
                  <div className="text-sm text-charcoal-600">
                    {formatDate(placement.startDate)}
                  </div>
                  
                  {/* Bill Rate */}
                  <div className="text-sm text-charcoal-900 font-semibold text-right">
                    {formatCurrency(placement.billRate)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gold-100 transition-colors"
                      onClick={(e) => handleQuickAction('viewPlacement', placement, e)}
                      title="View placement"
                    >
                      <ExternalLink className="h-4 w-4 text-charcoal-400 hover:text-gold-600" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => handleQuickAction('logActivity', placement, e as unknown as React.MouseEvent)}>
                          <div className="w-7 h-7 rounded-md bg-charcoal-100 flex items-center justify-center mr-2">
                            <Activity className="h-3.5 w-3.5 text-charcoal-600" />
                          </div>
                          Log Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickAction('viewPlacement', placement, e as unknown as React.MouseEvent) }}>
                          <div className="w-7 h-7 rounded-md bg-gold-100 flex items-center justify-center mr-2">
                            <ExternalLink className="h-3.5 w-3.5 text-gold-700" />
                          </div>
                          View Full Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-gold-600" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery ? 'No placements match your search' : 'No placements yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1 mb-4 max-w-md mx-auto">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Placements are created when candidates accept offers and start working. Begin by creating a job opening for this account.'
              }
            </p>
            {!searchQuery && (
              <>
                <Button 
                  size="sm" 
                  className="mt-2 bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white"
                  onClick={() => router.push(`/employee/recruiting/jobs/new?accountId=${accountId}`)}
                >
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Create Job Opening
                </Button>
                <div className="mt-6 pt-6 border-t border-charcoal-100 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3 text-left text-sm text-charcoal-600">
                    <Sparkles className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-charcoal-700 mb-1">The Placement Workflow</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-charcoal-400" />
                          <span><strong>1. Create Job</strong> → Define the opening at this account</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-charcoal-400" />
                          <span><strong>2. Submit Candidate</strong> → Match candidates to the job</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-charcoal-400" />
                          <span><strong>3. Interview & Offer</strong> → Evaluate and extend offer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3 w-3 text-charcoal-400" />
                          <span><strong>4. Accept & Start</strong> → Placement created! 🎉</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPlacements.length)}</span> of <span className="font-medium text-charcoal-700">{filteredPlacements.length}</span>
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
      {selectedPlacement && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-md overflow-hidden animate-slide-up">
          {/* Header with gradient */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-charcoal-50 via-white to-gold-50/40 border-b border-charcoal-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                  ['active', 'extended'].includes(selectedPlacement.status)
                    ? "bg-gradient-to-br from-success-400 to-success-600"
                    : "bg-gradient-to-br from-charcoal-300 to-charcoal-500"
                )}>
                  <span className="text-lg font-bold text-white">
                    {selectedPlacement.consultantName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-900">{selectedPlacement.consultantName}</h3>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border-0",
                        getStatusConfig(selectedPlacement.status).bg,
                        getStatusConfig(selectedPlacement.status).text
                      )}
                    >
                      {getStatusConfig(selectedPlacement.status).label}
                    </Badge>
                  </div>
                  <p className="text-sm text-charcoal-500 mt-0.5">
                    <span className="font-medium text-charcoal-600">{selectedPlacement.jobTitle}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/employee/recruiting/placements/${selectedPlacement.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Full Details
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedPlacement(null)} 
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Three Column Layout */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Column 1 - Assignment Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Assignment</h4>
                  </div>
                  <div className="space-y-0">
                    <DetailField label="Job Title" value={selectedPlacement.jobTitle} icon={Briefcase} />
                    <DetailField label="Start Date" value={formatDate(selectedPlacement.startDate)} icon={Calendar} />
                    <DetailField label="End Date" value={formatDate(selectedPlacement.endDate)} icon={Calendar} />
                    <DetailField 
                      label="Duration" 
                      value={`${calculateDaysActive(selectedPlacement)} days`} 
                      icon={Clock} 
                    />
                  </div>
                </div>
              </div>

              {/* Column 2 - Financial Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Financial</h4>
                  </div>
                  <div className="space-y-0">
                    <DetailField 
                      label="Bill Rate" 
                      value={selectedPlacement.billRate} 
                      icon={TrendingUp}
                      formatValue={(v) => `$${Number(v).toLocaleString()}/hr`}
                    />
                    <DetailField 
                      label="Pay Rate" 
                      value={selectedPlacement.payRate}
                      icon={DollarSign}
                      formatValue={(v) => `$${Number(v).toLocaleString()}/hr`}
                    />
                    <DetailField 
                      label="Margin" 
                      value={calculateMargin(selectedPlacement)}
                      icon={BarChart3}
                    />
                  </div>
                </div>

                {/* Revenue Projection (if active) */}
                {['active', 'extended'].includes(selectedPlacement.status) && selectedPlacement.billRate && (
                  <div className="p-4 bg-gradient-to-br from-success-50 to-white rounded-lg border border-success-200/60">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success-600" />
                      <span className="text-xs font-semibold text-success-900 uppercase tracking-wider">
                        Revenue Projection
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-success-700">
                      ${((selectedPlacement.billRate * 40 * 4) || 0).toLocaleString()}
                      <span className="text-sm font-normal text-success-600">/month</span>
                    </p>
                    <p className="text-xs text-success-600 mt-1">Based on 40 hrs/week</p>
                  </div>
                )}
              </div>

              {/* Column 3 - Quick Links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Related</h4>
                </div>
                <div className="space-y-2">
                  <Link 
                    href={`/employee/recruiting/placements/${selectedPlacement.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-charcoal-200/60 hover:border-gold-300 hover:bg-gold-50/50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
                      <Award className="h-4 w-4 text-gold-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 group-hover:text-gold-700">
                        View Placement
                      </p>
                      <p className="text-xs text-charcoal-500">Full details & history</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-charcoal-300 group-hover:text-gold-600" />
                  </Link>
                  
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openEntityDialog', { 
                      detail: { dialogId: 'logActivity', entityType: 'placement', entityId: selectedPlacement.id } 
                    }))}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-charcoal-200/60 hover:border-forest-300 hover:bg-forest-50/50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-forest-700" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-charcoal-900 group-hover:text-forest-700">
                        Log Activity
                      </p>
                      <p className="text-xs text-charcoal-500">Check-in or note</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-forest-600" />
                  </button>
                </div>

                {/* Status Info */}
                <div className="mt-6 p-4 bg-gradient-to-br from-charcoal-50 to-white rounded-lg border border-charcoal-100/60">
                  <p className="text-xs font-semibold text-charcoal-900 uppercase tracking-wider mb-2">
                    Placement Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getStatusConfig(selectedPlacement.status).dot)} />
                    <span className="text-sm font-medium text-charcoal-700">
                      {getStatusConfig(selectedPlacement.status).label}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    {['active', 'extended'].includes(selectedPlacement.status) && 'Currently billing and generating revenue'}
                    {selectedPlacement.status === 'completed' && 'Successfully completed assignment'}
                    {selectedPlacement.status === 'pending_start' && 'Awaiting start date'}
                    {selectedPlacement.status === 'terminated' && 'Assignment ended early'}
                    {selectedPlacement.status === 'on_hold' && 'Temporarily paused'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
              <p className="text-xs text-charcoal-500">
                View complete placement details for timesheets, compliance, and check-ins
              </p>
              <Link 
                href={`/employee/recruiting/placements/${selectedPlacement.id}`} 
                className="group inline-flex items-center gap-2 text-sm font-medium text-gold-700 hover:text-gold-800 transition-colors"
              >
                Go to Full Placement 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPlacementsSection
