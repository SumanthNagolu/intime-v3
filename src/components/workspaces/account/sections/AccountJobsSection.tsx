'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, Users, Calendar, Clock, AlertCircle,
  Plus, Search, MoreVertical, MapPin, DollarSign, Target, User,
  ArrowRight, X, ChevronLeft, ChevronRight, TrendingUp,
  Mail, Phone, Building2, FileText, Globe, ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountJob } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { differenceInDays, format } from 'date-fns'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountJobsSectionProps {
  jobs: AccountJob[]
  accountId: string
}

type StatusFilter = 'all' | 'active' | 'on_hold' | 'filled' | 'closed'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: 'Open', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  active: { label: 'Active', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  draft: { label: 'Draft', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  on_hold: { label: 'On Hold', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  closed: { label: 'Closed', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  filled: { label: 'Filled', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
}

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  critical: { label: 'Critical', bg: 'bg-error-50', text: 'text-error-700' },
  high: { label: 'High', bg: 'bg-amber-50', text: 'text-amber-700' },
  medium: { label: 'Medium', bg: 'bg-blue-50', text: 'text-blue-700' },
  low: { label: 'Low', bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  contract: 'Contract',
  contract_to_hire: 'Contract to Hire',
  part_time: 'Part Time',
}

// Days open color coding
function getDaysOpenIndicator(daysOpen: number | null): { color: string; urgency: string; bgColor: string } {
  if (daysOpen === null) return { color: 'text-charcoal-400', urgency: '', bgColor: '' }
  if (daysOpen > 60) return { color: 'text-error-600', urgency: 'Urgent', bgColor: 'bg-error-50' }
  if (daysOpen > 30) return { color: 'text-amber-600', urgency: 'Aging', bgColor: 'bg-amber-50' }
  return { color: 'text-success-600', urgency: '', bgColor: '' }
}

// Pipeline progress calculation
function calculatePipelineProgress(job: AccountJob): { stage: string; percentage: number; color: string } {
  if (job.status === 'filled') return { stage: 'Filled', percentage: 100, color: 'bg-blue-500' }
  if (job.status === 'closed' || job.status === 'cancelled') return { stage: 'Closed', percentage: 0, color: 'bg-charcoal-300' }
  
  const hasSubmissions = job.submissionCount > 0
  const hasInterviews = job.interviewCount > 0
  
  if (hasInterviews) return { stage: 'Interview', percentage: 75, color: 'bg-purple-500' }
  if (hasSubmissions) return { stage: 'Submitted', percentage: 50, color: 'bg-gold-500' }
  return { stage: 'Sourcing', percentage: 25, color: 'bg-forest-500' }
}

// Format rate range
function formatRateRange(min: number | null, max: number | null, fixed: number | null): string {
  if (fixed) return `$${fixed.toLocaleString()}`
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  if (min) return `$${min.toLocaleString()}+`
  if (max) return `Up to $${max.toLocaleString()}`
  return '—'
}

/**
 * AccountJobsSection - Premium SaaS-level job list
 * Features: List view with info, detail panel at bottom when selected, link to full wizard
 */
export function AccountJobsSection({ jobs, accountId }: AccountJobsSectionProps) {
  const router = useRouter()
  
  const [selectedJob, setSelectedJob] = React.useState<AccountJob | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    return {
      all: jobs.length,
      active: jobs.filter(j => j.status === 'open' || j.status === 'active').length,
      on_hold: jobs.filter(j => j.status === 'on_hold').length,
      filled: jobs.filter(j => j.status === 'filled').length,
      closed: jobs.filter(j => j.status === 'closed' || j.status === 'cancelled').length,
    }
  }, [jobs])

  // Filter jobs based on search and status
  const filteredJobs = React.useMemo(() => {
    let result = jobs
    
    // Status filter
    if (statusFilter === 'active') {
      result = result.filter(j => j.status === 'open' || j.status === 'active')
    } else if (statusFilter === 'closed') {
      result = result.filter(j => j.status === 'closed' || j.status === 'cancelled')
    } else if (statusFilter !== 'all') {
      result = result.filter(j => j.status === statusFilter)
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.jobType?.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [jobs, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)
  const paginatedJobs = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredJobs, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (job: AccountJob) => {
    if (selectedJob?.id === job.id) {
      setSelectedJob(null)
    } else {
      setSelectedJob(job)
    }
  }

  const handleViewJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    router.push(`/employee/recruiting/jobs/${jobId}`)
  }

  const getJobIconColors = (status: string) => {
    if (status === 'filled') return 'from-blue-400 to-blue-600'
    if (status === 'open' || status === 'active') return 'from-forest-400 to-forest-600'
    if (status === 'on_hold') return 'from-amber-400 to-amber-600'
    return 'from-charcoal-400 to-charcoal-500'
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
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Jobs</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} for this account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900 shadow-sm font-medium"
                onClick={() => {
                  router.push(`/employee/recruiting/jobs/intake?accountId=${accountId}`)
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Job
              </Button>
            </div>
          </div>

          {/* Status Filter Pills */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'active', label: 'Active', count: statusCounts.active },
                { key: 'on_hold', label: 'On Hold', count: statusCounts.on_hold },
                { key: 'filled', label: 'Filled', count: statusCounts.filled },
                { key: 'closed', label: 'Closed', count: statusCounts.closed },
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

        {/* Table Header - Compact for daily use */}
        <div className="grid grid-cols-[40px_1fr_90px_80px_70px_90px_70px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Job</div>
          <div className="text-center">Pipeline</div>
          <div className="text-center">Age</div>
          <div className="text-center">Priority</div>
          <div className="text-center">Created</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body - Compact rows for daily scanning */}
        {paginatedJobs.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedJobs.map((job, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const daysOpen = job.postedDate 
                ? differenceInDays(new Date(), new Date(job.postedDate))
                : job.createdAt
                  ? differenceInDays(new Date(), new Date(job.createdAt))
                  : null
              const daysIndicator = getDaysOpenIndicator(daysOpen)
              const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft
              const createdDate = job.createdAt ? new Date(job.createdAt) : null

              return (
                <div
                  key={job.id}
                  onClick={() => handleRowClick(job)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_90px_80px_70px_90px_70px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedJob?.id === job.id 
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

                  {/* Job Info - Compact */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      getJobIconColors(job.status)
                    )}>
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-charcoal-900 truncate">{job.title}</span>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0 border-0 flex-shrink-0",
                            statusConfig.bg,
                            statusConfig.text
                          )}
                        >
                          <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                        <span>{job.jobType ? JOB_TYPE_LABELS[job.jobType] || job.jobType : '—'}</span>
                        {job.location && (
                          <>
                            <span className="text-charcoal-300">•</span>
                            <span className="truncate">{job.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pipeline - Compact counts */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-forest-600 tabular-nums">{job.submissionCount}</span>
                      <span className="text-charcoal-300">/</span>
                      <span className="font-bold text-purple-600 tabular-nums">{job.interviewCount}</span>
                    </div>
                    <div className="text-[9px] text-charcoal-400 mt-0.5">S / I</div>
                  </div>
                  
                  {/* Days Open - Color coded */}
                  <div className="text-center">
                    {daysOpen !== null ? (
                      <div className={cn(
                        "inline-flex items-center justify-center gap-1 text-sm font-bold tabular-nums",
                        daysIndicator.color
                      )}>
                        {daysOpen}
                        <span className="text-[10px] font-medium">d</span>
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>
                  
                  {/* Priority - Compact */}
                  <div className="text-center">
                    {job.priority ? (
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wide",
                        job.priority === 'critical' ? 'text-error-600' :
                        job.priority === 'high' ? 'text-amber-600' :
                        job.priority === 'medium' ? 'text-blue-600' :
                        'text-charcoal-400'
                      )}>
                        {job.priority.slice(0, 3)}
                      </span>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="text-center">
                    {createdDate ? (
                      <div className="text-xs text-charcoal-600">
                        <div className="font-semibold tabular-nums">{format(createdDate, 'MMM d')}</div>
                        <div className="text-[10px] text-charcoal-400">{format(createdDate, 'yyyy')}</div>
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>
                  
                  {/* Actions - Minimal */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={(e) => handleViewJob(job.id, e as unknown as React.MouseEvent)}>
                          <ExternalLink className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Open Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/employee/recruiting/jobs/${job.id}/submissions`) }}>
                          <Users className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/employee/recruiting/jobs/${job.id}?tab=interviews`) }}>
                          <Calendar className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Interviews
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || statusFilter !== 'all' ? 'No jobs match your filters' : 'No jobs yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Create your first job to start sourcing candidates'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button 
                size="sm" 
                className="mt-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                onClick={() => router.push(`/employee/recruiting/jobs/intake?accountId=${accountId}`)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Job
              </Button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}</span> of <span className="font-medium text-charcoal-700">{filteredJobs.length}</span>
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

      {/* Premium Detail Panel - Redesigned with luxury aesthetics */}
      {selectedJob && (
        <div 
          className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
          style={{
            animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Decorative top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-forest-500" />
          
          {/* Floating close button */}
          <button
            onClick={() => setSelectedJob(null)}
            className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
          >
            <span className="text-xs font-medium">Close</span>
            <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Header with enhanced gradient */}
          <div className="relative px-8 pt-6 pb-5 bg-gradient-to-br from-charcoal-50/80 via-transparent to-gold-50/20">
            <div className="flex items-start gap-5">
              {/* Enhanced job icon with glow effect */}
              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-40",
                  selectedJob.status === 'filled' ? 'bg-blue-400' :
                  selectedJob.status === 'open' || selectedJob.status === 'active' ? 'bg-forest-400' :
                  selectedJob.status === 'on_hold' ? 'bg-amber-400' : 'bg-charcoal-300'
                )} />
                <div className={cn(
                  "relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-4 ring-white/80",
                  getJobIconColors(selectedJob.status)
                )}>
                  <Briefcase className="h-8 w-8 text-white drop-shadow-sm" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">{selectedJob.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold border-0 shadow-sm",
                        STATUS_CONFIG[selectedJob.status]?.bg || 'bg-charcoal-100',
                        STATUS_CONFIG[selectedJob.status]?.text || 'text-charcoal-600'
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse", STATUS_CONFIG[selectedJob.status]?.dot)} />
                      {STATUS_CONFIG[selectedJob.status]?.label || selectedJob.status}
                    </Badge>
                    {selectedJob.priority && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold border-0 shadow-sm",
                          PRIORITY_CONFIG[selectedJob.priority]?.bg,
                          PRIORITY_CONFIG[selectedJob.priority]?.text
                        )}
                      >
                        {PRIORITY_CONFIG[selectedJob.priority]?.label}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
                  {selectedJob.jobType && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                      {JOB_TYPE_LABELS[selectedJob.jobType] || selectedJob.jobType}
                    </span>
                  )}
                  {selectedJob.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-charcoal-400" />
                      {selectedJob.location}
                    </span>
                  )}
                  {selectedJob.positionsAvailable && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-charcoal-400" />
                      {selectedJob.positionsFilled || 0}/{selectedJob.positionsAvailable} filled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content - Redesigned Premium Layout */}
          <div className="px-8 py-6">
            {/* Key Metrics Row - Refined stat cards */}
            <div 
              className="grid grid-cols-4 gap-4 mb-8"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
            >
              {/* Days Open */}
              {(() => {
                const daysOpen = selectedJob.postedDate 
                  ? differenceInDays(new Date(), new Date(selectedJob.postedDate))
                  : selectedJob.createdAt
                    ? differenceInDays(new Date(), new Date(selectedJob.createdAt))
                    : null
                const isUrgent = daysOpen !== null && daysOpen > 30
                const isCritical = daysOpen !== null && daysOpen > 60
                return (
                  <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
                    <div className={cn(
                      "absolute inset-0 opacity-[0.03]",
                      isCritical ? "bg-error-500" : isUrgent ? "bg-amber-500" : "bg-forest-500"
                    )} />
                    <p className={cn(
                      "text-4xl font-black tracking-tight relative",
                      isCritical ? "text-error-500" : isUrgent ? "text-amber-500" : "text-forest-500"
                    )}>
                      {daysOpen ?? '—'}
                    </p>
                    <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Days Open</p>
                    {isCritical && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error-500 animate-pulse" />}
                  </div>
                )
              })()}
              
              {/* Submissions */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-blue-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-blue-500 opacity-[0.02]" />
                <p className="text-4xl font-black text-blue-500 tracking-tight relative">{selectedJob.submissionCount}</p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Submissions</p>
              </div>
              
              {/* Interviews */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-purple-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-purple-500 opacity-[0.02]" />
                <p className="text-4xl font-black text-purple-500 tracking-tight relative">{selectedJob.interviewCount}</p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Interviews</p>
              </div>
              
              {/* Positions */}
              <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-gold-200/60 transition-all duration-300">
                <div className="absolute inset-0 bg-gold-500 opacity-[0.02]" />
                <p className="text-4xl font-black text-gold-600 tracking-tight relative">
                  {selectedJob.positionsAvailable 
                    ? <><span className="text-gold-600">{selectedJob.positionsFilled || 0}</span><span className="text-charcoal-300 font-normal text-2xl">/{selectedJob.positionsAvailable}</span></>
                    : '—'
                  }
                </p>
                <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Filled</p>
              </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Column 1 - Position Details */}
              <div 
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gold-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Position</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Type" value={selectedJob.jobType ? JOB_TYPE_LABELS[selectedJob.jobType] || selectedJob.jobType : null} />
                  <DetailRowEnhanced label="Location" value={selectedJob.location} />
                  <DetailRowEnhanced label="SLA" value={selectedJob.slaDays ? `${selectedJob.slaDays} days` : null} isLast />
                </div>
              </div>

              {/* Column 2 - Compensation */}
              <div 
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Compensation</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Bill Rate" value={formatRateRange(selectedJob.billRateMin, selectedJob.billRateMax, selectedJob.billingRate)} highlight />
                  <DetailRowEnhanced label="Pay Rate" value={formatRateRange(selectedJob.payRateMin, selectedJob.payRateMax, null)} isLast />
                </div>
              </div>

              {/* Column 3 - Timeline */}
              <div 
                className="space-y-4"
                style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Timeline</h4>
                </div>
                <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
                  <DetailRowEnhanced label="Created" value={selectedJob.createdAt ? format(new Date(selectedJob.createdAt), 'MMM d, yyyy') : null} />
                  <DetailRowEnhanced label="Target Start" value={selectedJob.targetStartDate ? format(new Date(selectedJob.targetStartDate), 'MMM d, yyyy') : null} />
                  <DetailRowEnhanced label="Target End" value={selectedJob.targetEndDate ? format(new Date(selectedJob.targetEndDate), 'MMM d, yyyy') : null} isLast />
                </div>
              </div>
            </div>

            {/* People Section - Refined elegant cards */}
            <div 
              className="grid grid-cols-2 gap-5 mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.3s forwards', opacity: 0 }}
            >
              {/* Job Owner */}
              <div className="group relative rounded-2xl border border-charcoal-100/50 p-5 overflow-hidden hover:border-blue-200/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4">
                  {selectedJob.owner ? (
                    <>
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {selectedJob.owner.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold mb-0.5">Job Owner</p>
                        <p className="font-semibold text-sm text-charcoal-900 truncate">{selectedJob.owner.name}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-charcoal-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold mb-0.5">Job Owner</p>
                        <p className="text-sm text-charcoal-400 font-medium">Not assigned</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Hiring Manager */}
              <div className="group relative rounded-2xl border border-charcoal-100/50 p-5 overflow-hidden hover:border-amber-200/60 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-4">
                  {selectedJob.hiringManager ? (
                    <>
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {selectedJob.hiringManager.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold mb-0.5">Hiring Manager</p>
                        <p className="font-semibold text-sm text-charcoal-900 truncate">{selectedJob.hiringManager.name}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-charcoal-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-charcoal-400 uppercase tracking-wider font-semibold mb-0.5">Hiring Manager</p>
                        <p className="text-sm text-charcoal-400 font-medium">Not assigned</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Full Width Description Section - Refined */}
            <div 
              className="mb-8"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center shadow-sm ring-1 ring-violet-200/50">
                    <FileText className="h-4 w-4 text-violet-600" />
                  </div>
                  <h4 className="text-sm font-bold text-charcoal-800 tracking-wide uppercase">Description</h4>
                </div>
                {selectedJob.description && selectedJob.description.length > 600 && (
                  <span className="text-[10px] text-charcoal-400 uppercase tracking-wider font-medium">Preview</span>
                )}
              </div>
              <div className="relative rounded-2xl border border-charcoal-100/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/40 via-white to-violet-50/10" />
                <div className="relative p-6 min-h-[120px] max-h-[180px] overflow-y-auto">
                  {selectedJob.description ? (
                    <p className="text-sm text-charcoal-600 whitespace-pre-wrap leading-[1.7] tracking-wide">
                      {selectedJob.description.slice(0, 600)}{selectedJob.description.length > 600 ? '...' : ''}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[100px] gap-3">
                      <div className="w-12 h-12 rounded-full bg-charcoal-50 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-charcoal-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-charcoal-500 text-sm font-medium">No description yet</p>
                        <p className="text-charcoal-400 text-xs mt-0.5">Add details in the full job editor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Reference - Elegant minimal */}
            <div 
              className="flex items-center justify-center gap-6 mb-8 text-charcoal-400"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.4s forwards', opacity: 0 }}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">ID</span>
                <span className="text-charcoal-300">•</span>
                <code className="font-mono text-charcoal-500">{selectedJob.id.slice(0, 8)}</code>
              </div>
              {selectedJob.priorityRank && (
                <>
                  <div className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-medium">Rank</span>
                    <span className="text-charcoal-300">•</span>
                    <span className="font-semibold text-charcoal-500">#{selectedJob.priorityRank}</span>
                  </div>
                </>
              )}
            </div>

            {/* Elegant Footer */}
            <div 
              className="pt-6 border-t border-charcoal-100/40 flex items-center justify-center"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.45s forwards', opacity: 0 }}
            >
              <Link 
                href={`/employee/recruiting/jobs/${selectedJob.id}`} 
                className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-900 to-charcoal-800 text-white text-sm font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-500 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gold-500/0 via-gold-500/20 to-gold-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative tracking-wide">View Full Details</span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
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
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}

// Refined detail row component
function DetailRowEnhanced({ 
  label, 
  value, 
  highlight = false,
  isLast = false
}: { 
  label: string
  value: string | null | undefined
  highlight?: boolean
  isLast?: boolean
}) {
  const hasValue = value && value !== '—'
  
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 bg-white",
      !isLast && "border-b border-charcoal-50"
    )}>
      <span className="text-xs font-medium text-charcoal-400">{label}</span>
      {hasValue ? (
        <span className={cn(
          "text-sm font-semibold",
          highlight ? "text-emerald-600" : "text-charcoal-800"
        )}>
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-charcoal-300 font-medium">
          —
        </span>
      )}
    </div>
  )
}

export default AccountJobsSection
