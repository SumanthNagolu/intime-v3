'use client'

/**
 * Jobs Page - V4 Linear-style Redesign
 *
 * Split view: List on left, detail panel on right.
 * Connected to real data via tRPC.
 */

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Search,
  Send,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Jobs, type V4Job } from '@/lib/v4/hooks'
import { useV4JobMutations, useV4SubmissionMutations } from '@/lib/v4/hooks'
import { toast } from 'sonner'

// ============================================
// Utility Components
// ============================================

function StatusBadge({ status }: { status: V4Job['status'] }) {
  const config = {
    draft: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', dot: 'bg-neutral-400' },
    open: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    on_hold: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    filled: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    closed: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', dot: 'bg-neutral-400' },
  }
  const c = config[status]
  const labels = {
    draft: 'Draft',
    open: 'Open',
    on_hold: 'On Hold',
    filled: 'Filled',
    closed: 'Closed',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {labels[status]}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: V4Job['priority'] }) {
  const config = {
    urgent: { bg: 'bg-red-500/15', text: 'text-red-400' },
    high: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
    medium: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    low: { bg: 'bg-neutral-500/15', text: 'text-neutral-400' },
  }
  const c = config[priority]
  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded', c.bg, c.text)}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

function LocationBadge({ type }: { type: V4Job['locationType'] }) {
  const labels = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' }
  return (
    <span className="px-2 py-0.5 text-xs font-medium bg-neutral-700 text-neutral-300 rounded">
      {labels[type]}
    </span>
  )
}

function InlineField({
  label,
  value,
  editable = true,
  warning,
}: {
  label: string
  value: string | React.ReactNode
  editable?: boolean
  warning?: string
}) {
  return (
    <div className="flex items-start justify-between py-2 group">
      <span className="text-sm text-neutral-500 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        {editable ? (
          <button className="text-sm text-neutral-200 hover:text-white transition-colors text-left">
            {value}
          </button>
        ) : (
          <span className="text-sm text-neutral-200">{value}</span>
        )}
        {warning && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            {warning}
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================
// Job List Item
// ============================================

function JobListItem({
  job,
  isSelected,
  onSelect,
}: {
  job: V4Job
  isSelected: boolean
  onSelect: () => void
}) {
  const formatRate = () => {
    const symbol = job.currency === 'CAD' ? 'C$' : '$'
    if (job.rateType === 'hourly') {
      return job.rateMin && job.rateMax ? `${symbol}${job.rateMin}-${job.rateMax}/hr` : 'Rate TBD'
    }
    return job.rateMin && job.rateMax
      ? `${symbol}${(job.rateMin / 1000).toFixed(0)}-${(job.rateMax / 1000).toFixed(0)}k`
      : 'Salary TBD'
  }

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-100',
        'border-l-2',
        isSelected
          ? 'bg-indigo-500/10 border-l-indigo-500'
          : 'border-l-transparent hover:bg-neutral-800/50'
      )}
    >
      {/* Icon */}
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-neutral-400" />
        </div>
        {job.hasIssues && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-neutral-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-100 truncate">{job.title}</span>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-sm text-neutral-400 truncate">{job.accountName}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location.split(',')[0]}
            </span>
          )}
          <span>{formatRate()}</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {job.positionsFilled}/{job.positions}
          </span>
        </div>
      </div>

      {/* Stats mini */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-neutral-500">{job.submissions} subs</span>
        <ChevronRight
          className={cn(
            'w-4 h-4 text-neutral-600 transition-transform',
            isSelected && 'text-indigo-400 translate-x-0.5'
          )}
        />
      </div>
    </button>
  )
}

// ============================================
// Job Detail Panel
// ============================================

function JobDetailPanel({
  job,
  onClose,
  onSubmitCandidate,
  onPublish,
  isPublishing,
}: {
  job: V4Job
  onClose: () => void
  onSubmitCandidate: () => void
  onPublish: () => void
  isPublishing: boolean
}) {
  const router = useRouter()

  const formatRate = () => {
    const symbol = job.currency === 'CAD' ? 'C$' : '$'
    if (job.rateType === 'hourly') {
      return job.rateMin && job.rateMax ? `${symbol}${job.rateMin}-${job.rateMax}/hr` : 'Rate TBD'
    }
    return job.rateMin && job.rateMax
      ? `${symbol}${(job.rateMin / 1000).toFixed(0)}k - ${symbol}${(job.rateMax / 1000).toFixed(0)}k/year`
      : 'Salary TBD'
  }

  const handleViewAccount = () => {
    router.push(`/accounts?id=${job.accountId}`)
  }

  const handleEdit = () => {
    router.push(`/jobs/${job.id}/edit`)
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-lg bg-neutral-700 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-neutral-400" />
              </div>
              {job.hasIssues && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-neutral-900">!</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                <StatusBadge status={job.status} />
                <PriorityBadge priority={job.priority} />
              </div>
              <button
                onClick={handleViewAccount}
                className="text-sm text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                {job.accountName}
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Location & Rate row */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
          )}
          <LocationBadge type={job.locationType} />
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            {formatRate()}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Users className="w-4 h-4" />
            <span className="text-white font-medium">{job.positionsFilled}/{job.positions}</span> Positions
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Send className="w-4 h-4" />
            <span className="text-white font-medium">{job.submissions}</span> Submissions
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Clock className="w-4 h-4" />
            <span className="text-white font-medium">{job.interviews}</span> Interviews
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span className="text-white font-medium">{job.offers}</span> Offers
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onSubmitCandidate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Submit Candidate
          </button>
          {job.status === 'draft' && (
            <button
              onClick={onPublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Publish Job
            </button>
          )}
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            Edit
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors">
            <ExternalLink className="w-4 h-4" />
            View Job Board
          </button>
        </div>
      </header>

      {/* Issues Alert */}
      {job.hasIssues && job.issues && (
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium">{job.issues.length} Issue{job.issues.length > 1 ? 's' : ''}</span>
          </div>
          <div className="mt-2 space-y-1">
            {job.issues.map((issue, idx) => (
              <p key={idx} className="text-sm text-amber-400 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                {issue}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Job Details */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Job Details
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField label="Status" value={<StatusBadge status={job.status} />} />
            <InlineField label="Priority" value={<PriorityBadge priority={job.priority} />} />
            <InlineField label="Rate" value={formatRate()} />
            <InlineField label="Location" value={job.location || 'Not specified'} />
            <InlineField label="Work Type" value={<LocationBadge type={job.locationType} />} />
            <InlineField label="Positions" value={`${job.positions} (${job.positionsFilled} filled)`} />
            <InlineField label="Owner" value={job.owner.name} />
            {job.dueDate && (
              <InlineField
                label="Due Date"
                value={new Date(job.dueDate).toLocaleDateString()}
                warning={new Date(job.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'Due soon' : undefined}
              />
            )}
          </div>
        </section>

        {/* Skills */}
        {job.skills.length > 0 && (
          <section className="px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Required Skills</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-sm bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {job.description && (
          <section className="px-6 py-4 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Description
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{job.description}</p>
          </section>
        )}

        {/* Pipeline / Submissions */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Pipeline ({job.submissions})
            </h3>
            <button
              onClick={onSubmitCandidate}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Submit Candidate
            </button>
          </div>

          {/* Pipeline stages */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div className="flex h-full">
                <div className="bg-blue-500 h-full" style={{ width: `${job.submissions > 0 ? 40 : 0}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${job.interviews > 0 ? 25 : 0}%` }} />
                <div className="bg-emerald-500 h-full" style={{ width: `${job.offers > 0 ? 10 : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Submitted ({job.submissions})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Interview ({job.interviews})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Offer ({job.offers})
            </span>
          </div>

          {job.submissions === 0 && (
            <p className="text-sm text-neutral-500 mt-4">
              No submissions yet. Submit a candidate to start tracking.
            </p>
          )}
        </section>

        {/* Activity */}
        <section className="px-6 py-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                <User className="w-3 h-3 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">Job updated by {job.owner.name}</p>
                <p className="text-xs text-neutral-500">{job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                <Plus className="w-3 h-3 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">Created by {job.owner.name}</p>
                <p className="text-xs text-neutral-500">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer with keyboard hints */}
      <footer className="flex-shrink-0 px-6 py-2 border-t border-neutral-800 bg-neutral-900/80">
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">E</kbd> Edit
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">S</kbd> Submit Candidate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">Esc</kbd> Close
          </span>
        </div>
      </footer>
    </div>
  )
}

// ============================================
// Submit Candidate Modal
// ============================================

function SubmitCandidateModal({
  jobId,
  jobTitle,
  onClose,
}: {
  jobId: string
  jobTitle: string
  onClose: () => void
}) {
  const router = useRouter()

  const handleFindCandidates = () => {
    // Navigate to candidates page with job context
    router.push(`/candidates?submitToJob=${jobId}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 rounded-xl border border-neutral-800 w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Submit Candidate</h2>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded">
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <p className="text-sm text-neutral-400 mb-4">
          Select a candidate to submit to <span className="text-white font-medium">{jobTitle}</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={handleFindCandidates}
            className="w-full flex items-center gap-3 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">Find & Submit Candidate</p>
              <p className="text-xs text-neutral-500">Browse candidates and submit to this job</p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-500 ml-auto" />
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

function JobsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<V4Job['status'] | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Fetch jobs data
  const { jobs, isLoading, error, total } = useV4Jobs({
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 100,
  })

  // Initialize selection from URL
  useEffect(() => {
    if (initialId && jobs.length > 0) {
      const job = jobs.find(j => j.id === initialId)
      if (job) {
        setSelectedId(initialId)
        const index = jobs.findIndex(j => j.id === initialId)
        if (index !== -1) setSelectedIndex(index)
      }
    }
  }, [initialId, jobs])

  // Mutations
  const { updateJobStatus, isUpdating } = useV4JobMutations()

  // Filter jobs locally for instant UI feedback
  const filteredJobs = useMemo(() => {
    if (!searchQuery && statusFilter === 'all') return jobs

    return jobs.filter((job) => {
      const matchesSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [jobs, searchQuery, statusFilter])

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedId),
    [jobs, selectedId]
  )

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length }
    jobs.forEach((job) => {
      counts[job.status] = (counts[job.status] || 0) + 1
    })
    return counts
  }, [jobs])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => {
            const next = Math.min(prev + 1, filteredJobs.length - 1)
            if (filteredJobs[next]) {
              setSelectedId(filteredJobs[next].id)
            }
            return next
          })
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => {
            const next = Math.max(prev - 1, 0)
            if (filteredJobs[next]) {
              setSelectedId(filteredJobs[next].id)
            }
            return next
          })
          break
        case 'Enter':
          if (selectedJob) {
            router.push(`/jobs/${selectedJob.id}`)
          }
          break
        case 'Escape':
          setSelectedId(null)
          setSelectedIndex(-1)
          break
        case 's':
          if (selectedJob && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            setShowSubmitModal(true)
          }
          break
        case 'e':
          if (selectedJob && !e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            router.push(`/jobs/${selectedJob.id}/edit`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredJobs, selectedJob, router])

  // Handlers
  const handlePublishJob = useCallback(async () => {
    if (!selectedJob) return
    try {
      await updateJobStatus({ id: selectedJob.id, status: 'open' })
      toast.success('Job published successfully')
    } catch {
      // Error handled by mutation hook
    }
  }, [selectedJob, updateJobStatus])

  const handleNewJob = () => {
    router.push('/jobs/new')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-neutral-400">Loading jobs...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-white font-medium">Failed to load jobs</p>
          <p className="text-sm text-neutral-500">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-neutral-950">
      {/* List Panel - hidden on mobile when detail is selected */}
      <div
        className={cn(
          'flex flex-col border-r border-neutral-800 transition-all duration-200',
          selectedJob ? 'hidden md:flex w-full md:w-[380px]' : 'flex-1 max-w-2xl'
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-neutral-800">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-neutral-400" />
              <h1 className="text-lg font-semibold text-white">Jobs</h1>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
                {total}
              </span>
            </div>
            <button
              onClick={handleNewJob}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Job
            </button>
          </div>

          {/* Search & Filters */}
          <div className="px-3 pb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-9 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['all', 'open', 'on_hold', 'draft', 'filled', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
                    statusFilter === status
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-neutral-400 hover:bg-neutral-800'
                  )}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  {statusCounts[status] !== undefined && (
                    <span className="ml-1 text-neutral-500">({statusCounts[status]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* List */}
        <div className="flex-1 overflow-auto">
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Briefcase className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-white font-medium">No jobs found</p>
              <p className="text-sm text-neutral-500 mt-1">
                {jobs.length === 0 ? 'Create your first job to get started' : 'Try adjusting your filters'}
              </p>
              {jobs.length === 0 && (
                <button
                  onClick={handleNewJob}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Create Job
                </button>
              )}
            </div>
          ) : (
            <div>
              {filteredJobs.map((job, index) => (
                <JobListItem
                  key={job.id}
                  job={job}
                  isSelected={job.id === selectedId}
                  onSelect={() => {
                    setSelectedId(job.id === selectedId ? null : job.id)
                    setSelectedIndex(index)
                    // Update URL
                    const newUrl = new URL(window.location.href)
                    if (job.id !== selectedId) {
                      newUrl.searchParams.set('id', job.id)
                    } else {
                      newUrl.searchParams.delete('id')
                    }
                    window.history.pushState({}, '', newUrl.toString())
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 py-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              {filteredJobs.length} of {total} jobs
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-[10px]">J</kbd>
              <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-[10px]">K</kbd>
              <span>to navigate</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Detail Panel - full screen on mobile, side panel on desktop */}
      {selectedJob && (
        <div className="fixed inset-0 z-40 md:relative md:inset-auto md:flex-1 md:min-w-0">
          <JobDetailPanel
            job={selectedJob}
            onClose={() => {
              setSelectedId(null)
              setSelectedIndex(-1)
              const newUrl = new URL(window.location.href)
              newUrl.searchParams.delete('id')
              window.history.pushState({}, '', newUrl.toString())
            }}
            onSubmitCandidate={() => setShowSubmitModal(true)}
            onPublish={handlePublishJob}
            isPublishing={isUpdating}
          />
        </div>
      )}

      {/* Empty state when no selection - desktop only */}
      {!selectedJob && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-900">
          <div className="text-center">
            <Briefcase className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-400">Select a job to view details</p>
            <p className="text-sm text-neutral-600 mt-1">
              Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">J</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">K</kbd> to navigate
            </p>
          </div>
        </div>
      )}

      {/* Submit Candidate Modal */}
      {showSubmitModal && selectedJob && (
        <SubmitCandidateModal
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          onClose={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-neutral-400">Loading jobs...</p>
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  )
}
