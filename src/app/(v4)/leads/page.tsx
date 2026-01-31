'use client'

/**
 * Leads Page - V4 Linear-style Redesign
 *
 * Split view: List on left, detail panel on right.
 * Connected to real tRPC data with full keyboard navigation.
 */

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  DollarSign,
  Flame,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Target,
  TrendingUp,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Leads, type V4Lead } from '@/lib/v4/hooks/useV4Data'
import { useV4LeadMutations } from '@/lib/v4/hooks/useV4Mutations'
import { toast } from 'sonner'

// ============================================
// Utility Components
// ============================================

function StatusBadge({ status }: { status: V4Lead['status'] }) {
  const config = {
    new: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    contacted: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
    qualified: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    unqualified: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', dot: 'bg-neutral-400' },
    nurture: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-400' },
    converted: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-400' },
  }
  const c = config[status] || config.new
  const labels = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    unqualified: 'Unqualified',
    nurture: 'Nurture',
    converted: 'Converted',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {labels[status] || status}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="px-2 py-0.5 text-xs font-medium bg-neutral-700 text-neutral-300 rounded">
      {source.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
    </span>
  )
}

function ScoreBar({ score }: { score: number }) {
  const maxScore = 100
  const percentage = Math.min((score / maxScore) * 100, 100)
  const color = percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-neutral-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-neutral-400 tabular-nums">{score}</span>
    </div>
  )
}

function InlineField({
  label,
  value,
  editable = true,
}: {
  label: string
  value: string | React.ReactNode
  editable?: boolean
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
      </div>
    </div>
  )
}

// ============================================
// Lead List Item
// ============================================

function LeadListItem({
  lead,
  isSelected,
  onSelect,
}: {
  lead: V4Lead
  isSelected: boolean
  onSelect: () => void
}) {
  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date()

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
        <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center text-sm font-semibold text-neutral-300">
          {lead.company.charAt(0)}
        </div>
        {isOverdue && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-neutral-900" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-100 truncate">{lead.company}</span>
          <StatusBadge status={lead.status} />
        </div>
        <p className="text-sm text-neutral-400 truncate">
          {lead.firstName} {lead.lastName} {lead.title && `• ${lead.title}`}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          <span>{lead.source}</span>
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end gap-1">
        <ScoreBar score={lead.score} />
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
// Lead Detail Panel
// ============================================

function LeadDetailPanel({
  lead,
  onClose,
  onConvert,
  isConverting,
}: {
  lead: V4Lead
  onClose: () => void
  onConvert: () => void
  isConverting: boolean
}) {
  const isOverdue = lead.nextFollowUp && new Date(lead.nextFollowUp) < new Date()
  const canConvert = lead.status !== 'converted' && lead.status !== 'unqualified'

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-lg bg-neutral-700 flex items-center justify-center text-2xl font-bold text-neutral-300">
                {lead.company.charAt(0)}
              </div>
              {lead.status === 'qualified' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                  <Flame className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">{lead.company}</h2>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-sm text-neutral-400 mt-0.5">
                {lead.firstName} {lead.lastName} {lead.title && `• ${lead.title}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {lead.firstName} {lead.lastName}
          </span>
          <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
            <Mail className="w-4 h-4" />
            {lead.email}
          </a>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <TrendingUp className="w-4 h-4" />
            Score:
            <ScoreBar score={lead.score} />
          </span>
          {lead.campaign && (
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Target className="w-4 h-4" />
              {lead.campaign.name}
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-5">
          {canConvert && (
            <button
              onClick={onConvert}
              disabled={isConverting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isConverting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              Convert to Deal
            </button>
          )}
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
        </div>
      </header>

      {/* Overdue Alert */}
      {isOverdue && (
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium">Follow-up overdue</span>
          </div>
          <p className="text-sm text-amber-400 mt-1">
            Scheduled for {lead.nextFollowUp}
          </p>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Lead Details */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Lead Details
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField label="Status" value={<StatusBadge status={lead.status} />} />
            <InlineField label="Source" value={<SourceBadge source={lead.source} />} />
            <InlineField
              label="Score"
              value={<ScoreBar score={lead.score} />}
              editable={false}
            />
            <InlineField label="Owner" value={lead.owner.name} />
          </div>
        </section>

        {/* Contact Info */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Contact Information
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField label="Name" value={`${lead.firstName} ${lead.lastName}`} />
            {lead.title && <InlineField label="Title" value={lead.title} />}
            <InlineField label="Company" value={lead.company} />
            <InlineField label="Email" value={lead.email} />
            {lead.phone && <InlineField label="Phone" value={lead.phone} />}
          </div>
        </section>

        {/* Follow-up */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Follow-up</h3>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Schedule
            </button>
          </div>
          <div className="divide-y divide-neutral-800/50">
            {lead.lastContactedAt && (
              <InlineField label="Last Contact" value={lead.lastContactedAt} editable={false} />
            )}
            {lead.nextFollowUp && (
              <InlineField
                label="Next Follow-up"
                value={
                  <span className={cn(isOverdue && 'text-amber-400')}>
                    {lead.nextFollowUp}
                  </span>
                }
              />
            )}
          </div>
        </section>

        {/* Notes */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Notes</h3>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Add note
            </button>
          </div>
          {lead.notes ? (
            <p className="text-sm text-neutral-300 leading-relaxed">{lead.notes}</p>
          ) : (
            <p className="text-sm text-neutral-500">No notes yet.</p>
          )}
        </section>

        {/* Activity */}
        <section className="px-6 py-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-3">
            {lead.lastContactedAt && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                  <Mail className="w-3 h-3 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-300">Last contacted</p>
                  <p className="text-xs text-neutral-500">{lead.lastContactedAt}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                <Plus className="w-3 h-3 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">Lead created</p>
                <p className="text-xs text-neutral-500">{lead.createdAt || 'Unknown'}</p>
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
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">C</kbd> Convert to Deal
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

export default function LeadsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Data fetching
  const { leads, isLoading, error, total, refetch } = useV4Leads({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const { convertLead, isConverting } = useV4LeadMutations()

  // Selected lead
  const selectedLead = leads[selectedIndex]

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: leads.length }
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1
    })
    return counts
  }, [leads])

  // Handle convert to deal
  const handleConvert = async () => {
    if (!selectedLead) return
    try {
      await convertLead({ id: selectedLead.id })
      refetch()
    } catch (err) {
      // Error handled by mutation
    }
  }

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
          setSelectedIndex(prev => Math.min(prev + 1, leads.length - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Escape':
          setSelectedIndex(-1)
          break
        case 'c':
          if (selectedLead && selectedLead.status !== 'converted' && selectedLead.status !== 'unqualified') {
            e.preventDefault()
            handleConvert()
          }
          break
        case 'e':
          if (selectedLead) {
            e.preventDefault()
            router.push(`/leads/${selectedLead.id}/edit`)
          }
          break
        case 'n':
          e.preventDefault()
          router.push('/leads/new')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [leads.length, selectedLead, router])

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
        <p className="text-white font-medium">Error loading leads</p>
        <p className="text-sm text-neutral-500 mt-1">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-neutral-950">
      {/* List Panel - hidden on mobile when detail is selected */}
      <div
        className={cn(
          'flex flex-col border-r border-neutral-800 transition-all duration-200',
          selectedLead ? 'hidden md:flex w-full md:w-[380px]' : 'flex-1 max-w-2xl'
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-neutral-800">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-neutral-400" />
              <h1 className="text-lg font-semibold text-white">Leads</h1>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
                {total}
              </span>
            </div>
            <button
              onClick={() => router.push('/leads/new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
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
                placeholder="Search leads..."
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
              {(['all', 'new', 'contacted', 'qualified', 'unqualified', 'nurture', 'converted'] as const).map((status) => (
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
                  {status.charAt(0).toUpperCase() + status.slice(1)}
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
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Target className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-white font-medium">No leads found</p>
              <p className="text-sm text-neutral-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div>
              {leads.map((lead, index) => (
                <LeadListItem
                  key={lead.id}
                  lead={lead}
                  isSelected={index === selectedIndex}
                  onSelect={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 px-4 py-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-500">
            {leads.length} of {total} leads
          </p>
        </footer>
      </div>

      {/* Detail Panel - full screen on mobile, side panel on desktop */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 md:relative md:inset-auto md:flex-1 md:min-w-0">
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedIndex(-1)}
            onConvert={handleConvert}
            isConverting={isConverting}
          />
        </div>
      )}

      {/* Empty state when no selection - desktop only */}
      {!selectedLead && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-900">
          <div className="text-center">
            <Target className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-400">Select a lead to view details</p>
            <p className="text-sm text-neutral-600 mt-1">
              Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">J</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">K</kbd> to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
