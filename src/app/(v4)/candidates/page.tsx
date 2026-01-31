'use client'

/**
 * Candidates Page - V4 Linear-style Redesign
 *
 * Split view: List on left, detail panel on right.
 * Connected to real tRPC data with full keyboard navigation.
 */

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  Briefcase,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Send,
  Upload,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Candidates, type V4Candidate } from '@/lib/v4/hooks/useV4Data'
import { useV4CandidateMutations, useV4SubmissionMutations } from '@/lib/v4/hooks/useV4Mutations'

// ============================================
// Utility Components
// ============================================

function StatusBadge({ status }: { status: V4Candidate['status'] }) {
  const config = {
    active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    passive: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    placed: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    not_looking: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', dot: 'bg-neutral-400' },
    do_not_contact: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  }
  const c = config[status] || config.active
  const labels = {
    active: 'Active',
    passive: 'Passive',
    placed: 'Placed',
    not_looking: 'Not Looking',
    do_not_contact: 'Do Not Contact',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {labels[status] || status}
    </span>
  )
}

function AvailabilityBadge({ availability }: { availability: V4Candidate['availability'] }) {
  const labels = {
    immediate: 'Immediately',
    two_weeks: '2 Weeks',
    one_month: '1 Month',
    not_available: 'Not Available',
  }
  const isUrgent = availability === 'immediate'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded',
        isUrgent ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-700 text-neutral-300'
      )}
    >
      {labels[availability] || availability}
    </span>
  )
}

function InlineField({
  label,
  value,
  editable = true,
  warning,
  onEdit,
}: {
  label: string
  value: string | React.ReactNode
  editable?: boolean
  warning?: string
  onEdit?: () => void
}) {
  return (
    <div className="flex items-start justify-between py-2 group">
      <span className="text-sm text-neutral-500 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        {editable ? (
          <button
            onClick={onEdit}
            className="text-sm text-neutral-200 hover:text-white transition-colors text-left"
          >
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
// Candidate List Item
// ============================================

function CandidateListItem({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: V4Candidate
  isSelected: boolean
  onSelect: () => void
}) {
  const initials = `${candidate.firstName?.[0] || '?'}${candidate.lastName?.[0] || ''}`
  const hasResume = !!candidate.resumeUrl

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
      {/* Avatar */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium text-neutral-300">
          {initials}
        </div>
        {!hasResume && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-neutral-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-100 truncate">
            {candidate.firstName} {candidate.lastName}
          </span>
          <StatusBadge status={candidate.status} />
        </div>
        <p className="text-sm text-neutral-400 truncate">
          {candidate.title || 'No title'}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          <span>{candidate.location || 'Unknown location'}</span>
          {candidate.rate > 0 && (
            <span>
              ${candidate.rate}{candidate.rateType === 'hourly' ? '/hr' : 'k'}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        className={cn(
          'w-4 h-4 text-neutral-600 transition-transform',
          isSelected && 'text-indigo-400 translate-x-0.5'
        )}
      />
    </button>
  )
}

// ============================================
// Submit to Job Modal
// ============================================

function SubmitToJobModal({
  candidate,
  onClose,
  onSubmit,
}: {
  candidate: V4Candidate
  onClose: () => void
  onSubmit: (jobId: string, notes?: string) => Promise<void>
}) {
  const [jobId, setJobId] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!jobId) return
    setIsSubmitting(true)
    try {
      await onSubmit(jobId, notes)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 rounded-lg border border-neutral-700 w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Submit {candidate.firstName} {candidate.lastName} to Job
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Job ID</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Enter job ID..."
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add submission notes..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!jobId || isSubmitting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Candidate Detail Panel
// ============================================

function CandidateDetailPanel({
  candidate,
  onClose,
  onSubmitToJob,
}: {
  candidate: V4Candidate
  onClose: () => void
  onSubmitToJob: () => void
}) {
  const router = useRouter()
  
  const handleClose = () => {
    onClose()
    // Clear ID param from URL without refreshing
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('id')
    window.history.pushState({}, '', newUrl.toString())
  }
  const initials = `${candidate.firstName?.[0] || '?'}${candidate.lastName?.[0] || ''}`
  const hasResume = !!candidate.resumeUrl

  const formatRate = () => {
    if (candidate.rate <= 0) return 'Not specified'
    const symbol = candidate.currency === 'CAD' ? 'C$' : '$'
    return candidate.rateType === 'hourly'
      ? `${symbol}${candidate.rate}/hr`
      : `${symbol}${(candidate.rate / 1000).toFixed(0)}k/year`
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center text-xl font-medium text-neutral-300">
                {initials}
              </div>
              {!hasResume && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-neutral-900">!</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">
                  {candidate.firstName} {candidate.lastName}
                </h2>
                <StatusBadge status={candidate.status} />
              </div>
              <p className="text-sm text-neutral-400 mt-0.5 max-w-md">
                {candidate.title || 'No title'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            {candidate.location || 'Unknown'}
          </span>
          {candidate.email && (
            <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
              {candidate.email}
            </a>
          )}
          {candidate.phone && (
            <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <Phone className="w-4 h-4" />
              {candidate.phone}
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Send className="w-4 h-4" />
            <span className="text-white font-medium">{candidate.submissions}</span> Submissions
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Briefcase className="w-4 h-4" />
            <span className="text-white font-medium">{candidate.placements}</span> Placements
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <DollarSign className="w-4 h-4" />
            <span className="text-white font-medium">{formatRate()}</span>
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onSubmitToJob}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
            Submit to Job
          </button>
          {candidate.email && (
            <a
              href={`mailto:${candidate.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}
          {candidate.phone && (
            <a
              href={`tel:${candidate.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
          {candidate.linkedinUrl && (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Link2 className="w-4 h-4" />
              LinkedIn
            </a>
          )}
        </div>
      </header>

      {/* Warning Alert (no resume) */}
      {!hasResume && (
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium">1 Warning</span>
          </div>
          <p className="text-sm text-amber-400 flex items-center gap-2 mt-2">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            No resume on file
          </p>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Profile Details */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Profile Details
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField label="Status" value={<StatusBadge status={candidate.status} />} />
            <InlineField label="Availability" value={<AvailabilityBadge availability={candidate.availability} />} />
            <InlineField label="Desired Rate" value={formatRate()} />
            <InlineField label="Experience" value={candidate.experience > 0 ? `${candidate.experience} years` : 'Not specified'} />
            {candidate.workAuthorization && (
              <InlineField label="Work Auth" value={candidate.workAuthorization} />
            )}
            <InlineField label="Location" value={candidate.location || 'Unknown'} />
          </div>
        </section>

        {/* Skills */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Skills</h3>
          </div>
          {candidate.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-sm bg-neutral-800 text-neutral-200 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No skills listed</p>
          )}
        </section>

        {/* Resume */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Resume</h3>
          {hasResume ? (
            <a
              href={candidate.resumeUrl}
              className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <FileText className="w-5 h-5 text-neutral-400" />
              <div className="flex-1">
                <p className="text-sm text-neutral-200">
                  {candidate.firstName}_{candidate.lastName}_Resume.pdf
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </a>
          ) : (
            <button className="flex items-center gap-3 p-3 w-full bg-neutral-800/50 border border-dashed border-neutral-700 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-colors">
              <Upload className="w-5 h-5 text-neutral-500" />
              <span className="text-sm text-neutral-400">Upload resume</span>
            </button>
          )}
        </section>

        {/* Activity */}
        <section className="px-6 py-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-3">
            {candidate.lastContacted && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                  <Clock className="w-3 h-3 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-300">Last contacted</p>
                  <p className="text-xs text-neutral-500">{candidate.lastContacted}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                <Plus className="w-3 h-3 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">Profile created</p>
                <p className="text-xs text-neutral-500">{candidate.createdAt || 'Unknown'}</p>
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
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">S</kbd> Submit to Job
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
// Main Component
// ============================================

function CandidatesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Data fetching
  const { candidates, isLoading, error, total } = useV4Candidates({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  // Initialize selection from URL
  useEffect(() => {
    if (initialId && candidates.length > 0) {
      const index = candidates.findIndex(c => c.id === initialId)
      if (index !== -1) {
        setSelectedIndex(index)
      }
    }
  }, [initialId, candidates])

  const { createSubmission } = useV4SubmissionMutations()

  // Selected candidate
  const selectedCandidate = candidates[selectedIndex]

  // Filter candidates locally for status (since API might not filter perfectly)
  const filteredCandidates = useMemo(() => {
    if (statusFilter === 'all') return candidates
    return candidates.filter(c => c.status === statusFilter)
  }, [candidates, statusFilter])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: candidates.length }
    candidates.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [candidates])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredCandidates.length - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Escape':
          setSelectedIndex(-1)
          break
        case 's':
          if (selectedCandidate) {
            e.preventDefault()
            setShowSubmitModal(true)
          }
          break
        case 'e':
          if (selectedCandidate) {
            e.preventDefault()
            router.push(`/candidates/${selectedCandidate.id}/edit`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredCandidates.length, selectedCandidate, router])

  // Handle submit to job
  const handleSubmitToJob = async (jobId: string, notes?: string) => {
    if (!selectedCandidate) return
    await createSubmission({
      jobId,
      candidateId: selectedCandidate.id,
      notes,
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-neutral-950">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-white font-medium">Error loading candidates</p>
        <p className="text-sm text-neutral-500 mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-neutral-950">
      {/* Submit Modal */}
      {showSubmitModal && selectedCandidate && (
        <SubmitToJobModal
          candidate={selectedCandidate}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={handleSubmitToJob}
        />
      )}

      {/* List Panel - hidden on mobile when detail is selected */}
      <div
        className={cn(
          'flex flex-col border-r border-neutral-800 transition-all duration-200',
          selectedCandidate ? 'hidden md:flex w-full md:w-[340px]' : 'flex-1 max-w-xl'
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-neutral-800">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neutral-400" />
              <h1 className="text-lg font-semibold text-white">Candidates</h1>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
                {total}
              </span>
            </div>
            <button
              onClick={() => router.push('/candidates/new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
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
              {(['all', 'active', 'passive', 'placed', 'not_looking'] as const).map((status) => (
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
                  {status === 'all' ? 'All' : status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
          {filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <User className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-white font-medium">No candidates found</p>
              <p className="text-sm text-neutral-500 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div>
              {filteredCandidates.map((candidate, index) => (
                <CandidateListItem
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={index === selectedIndex}
                  onSelect={() => {
                    setSelectedIndex(index)
                    // Update URL
                    const newUrl = new URL(window.location.href)
                    newUrl.searchParams.set('id', candidate.id)
                    window.history.pushState({}, '', newUrl.toString())
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 py-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            {filteredCandidates.length} of {total} candidates
          </p>
        </footer>
      </div>

      {/* Detail Panel - full screen on mobile, side panel on desktop */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-40 md:relative md:inset-auto md:flex-1 md:min-w-0">
          <CandidateDetailPanel
            candidate={selectedCandidate}
            onClose={() => setSelectedIndex(-1)}
            onSubmitToJob={() => setShowSubmitModal(true)}
          />
        </div>
      )}

      {/* Empty state when no selection - desktop only */}
      {!selectedCandidate && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-900">
          <div className="text-center">
            <User className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-400">Select a candidate to view details</p>
            <p className="text-sm text-neutral-600 mt-1">
              Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">J</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">K</kbd> to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap in Suspense for useSearchParams
export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-neutral-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    }>
      <CandidatesPageContent />
    </Suspense>
  )
}
