'use client'

/**
 * Jobs Page - Ashby Style
 *
 * Features:
 * - Table view (default)
 * - Kanban view for pipeline
 * - Filters and search
 * - Bulk actions
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Filter,
  Grid3X3,
  LayoutList,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full_time' | 'contract' | 'part_time'
  status: 'draft' | 'open' | 'on_hold' | 'filled' | 'closed'
  candidates: number
  interviews: number
  daysOpen: number
  owner: string
  createdAt: string
}

// ============================================
// Mock Data
// ============================================

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Acme Corp',
    location: 'San Francisco, CA',
    type: 'full_time',
    status: 'open',
    candidates: 24,
    interviews: 5,
    daysOpen: 14,
    owner: 'John Recruiter',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'TechStart Inc',
    location: 'Remote',
    type: 'full_time',
    status: 'open',
    candidates: 18,
    interviews: 3,
    daysOpen: 7,
    owner: 'Jane Smith',
    createdAt: '2025-01-22',
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudSoft',
    location: 'New York, NY',
    type: 'contract',
    status: 'open',
    candidates: 12,
    interviews: 2,
    daysOpen: 21,
    owner: 'John Recruiter',
    createdAt: '2025-01-08',
  },
  {
    id: '4',
    title: 'UX Designer',
    company: 'DesignHub',
    location: 'Austin, TX',
    type: 'full_time',
    status: 'on_hold',
    candidates: 8,
    interviews: 1,
    daysOpen: 30,
    owner: 'Sarah Wilson',
    createdAt: '2024-12-31',
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'DataCo',
    location: 'Boston, MA',
    type: 'full_time',
    status: 'filled',
    candidates: 45,
    interviews: 8,
    daysOpen: 45,
    owner: 'Jane Smith',
    createdAt: '2024-12-15',
  },
  {
    id: '6',
    title: 'Frontend Developer',
    company: 'WebAgency',
    location: 'Remote',
    type: 'contract',
    status: 'draft',
    candidates: 0,
    interviews: 0,
    daysOpen: 2,
    owner: 'John Recruiter',
    createdAt: '2025-01-28',
  },
]

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: Job['status'] }) {
  const config = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
    open: { bg: 'bg-green-100', text: 'text-green-700' },
    on_hold: { bg: 'bg-amber-100', text: 'text-amber-700' },
    filled: { bg: 'bg-blue-100', text: 'text-blue-700' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-600' },
  }
  const labels = {
    draft: 'Draft',
    open: 'Open',
    on_hold: 'On Hold',
    filled: 'Filled',
    closed: 'Closed',
  }
  const c = config[status]

  return (
    <span className={cn('ashby-badge', c.bg, c.text)}>
      {labels[status]}
    </span>
  )
}

function TypeBadge({ type }: { type: Job['type'] }) {
  const labels = {
    full_time: 'Full-time',
    contract: 'Contract',
    part_time: 'Part-time',
  }
  return (
    <span className="ashby-badge ashby-badge-default">
      {labels[type]}
    </span>
  )
}

// ============================================
// Table View Component
// ============================================

function TableView({ jobs, onSelect }: { jobs: Job[]; onSelect: (job: Job) => void }) {
  return (
    <div className="ashby-table-container">
      <table className="ashby-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th>Job Title</th>
            <th>Company</th>
            <th>Location</th>
            <th>Status</th>
            <th>Candidates</th>
            <th>Days Open</th>
            <th>Owner</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="cursor-pointer"
              onClick={() => onSelect(job)}
            >
              <td onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" className="rounded border-gray-300" />
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[var(--ashby-bg-tertiary)] flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-[var(--ashby-text-muted)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--ashby-text-primary)]">
                      {job.title}
                    </p>
                    <p className="text-xs text-[var(--ashby-text-muted)]">
                      <TypeBadge type={job.type} />
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--ashby-text-muted)]" />
                  {job.company}
                </div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--ashby-text-muted)]" />
                  {job.location}
                </div>
              </td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--ashby-text-muted)]" />
                  {job.candidates}
                </div>
              </td>
              <td>
                <span className={cn(
                  job.daysOpen > 30 && 'text-[var(--ashby-error)]'
                )}>
                  {job.daysOpen}d
                </span>
              </td>
              <td className="text-[var(--ashby-text-secondary)]">
                {job.owner}
              </td>
              <td onClick={(e) => e.stopPropagation()}>
                <button className="p-1 rounded hover:bg-[var(--ashby-bg-hover)]">
                  <MoreHorizontal className="w-4 h-4 text-[var(--ashby-text-muted)]" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// Kanban View Component
// ============================================

function KanbanView({ jobs }: { jobs: Job[] }) {
  const columns = [
    { id: 'draft', label: 'Draft', color: 'var(--ashby-text-muted)' },
    { id: 'open', label: 'Open', color: 'var(--ashby-success)' },
    { id: 'on_hold', label: 'On Hold', color: 'var(--ashby-warning)' },
    { id: 'filled', label: 'Filled', color: 'var(--ashby-info)' },
    { id: 'closed', label: 'Closed', color: 'var(--ashby-text-muted)' },
  ]

  const jobsByStatus = useMemo(() => {
    const grouped: Record<string, Job[]> = {}
    columns.forEach((col) => {
      grouped[col.id] = jobs.filter((j) => j.status === col.id)
    })
    return grouped
  }, [jobs])

  return (
    <div className="ashby-kanban">
      {columns.map((column) => (
        <div key={column.id} className="ashby-kanban-column">
          <div className="ashby-kanban-column-header">
            <div className="ashby-kanban-column-title">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              {column.label}
            </div>
            <span className="ashby-kanban-column-count">
              {jobsByStatus[column.id]?.length || 0}
            </span>
          </div>
          <div className="ashby-kanban-column-body">
            {jobsByStatus[column.id]?.map((job) => (
              <Link
                key={job.id}
                href={`/a/jobs/${job.id}`}
                className="ashby-kanban-card"
              >
                <div className="ashby-kanban-card-title">{job.title}</div>
                <div className="ashby-kanban-card-subtitle">{job.company}</div>
                <div className="ashby-kanban-card-meta">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {job.candidates}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {job.interviews}
                  </span>
                  <span>{job.daysOpen}d</span>
                </div>
              </Link>
            ))}
            {jobsByStatus[column.id]?.length === 0 && (
              <div className="text-center py-8 text-sm text-[var(--ashby-text-muted)]">
                No jobs
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function JobsPage() {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let result = mockJobs

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          j.company.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((j) => j.status === statusFilter)
    }

    return result
  }, [searchQuery, statusFilter])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockJobs.length }
    mockJobs.forEach((j) => {
      counts[j.status] = (counts[j.status] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="ashby-page-header">
        <div className="ashby-page-title">
          <Briefcase className="w-5 h-5 text-[var(--ashby-text-muted)]" />
          Jobs
          <span className="count">({filteredJobs.length})</span>
        </div>
        <div className="ashby-page-actions">
          <Link href="/a/jobs/new" className="ashby-btn ashby-btn-primary">
            <Plus className="w-4 h-4" />
            New Job
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="ashby-tabs">
        <button
          className={cn('ashby-tab', view === 'table' && 'active')}
          onClick={() => setView('table')}
        >
          <LayoutList className="w-4 h-4 mr-2 inline" />
          Table
        </button>
        <button
          className={cn('ashby-tab', view === 'kanban' && 'active')}
          onClick={() => setView('kanban')}
        >
          <Grid3X3 className="w-4 h-4 mr-2 inline" />
          Board
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4 bg-[var(--ashby-bg)] border-b border-[var(--ashby-border)]">
        {/* Search */}
        <div className="ashby-search">
          <Search className="ashby-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs..."
            className="ashby-search-input"
          />
        </div>

        {/* Status filters */}
        <div className="ashby-filters">
          {(['all', 'open', 'on_hold', 'draft', 'filled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'ashby-filter-pill',
                statusFilter === status && 'active'
              )}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              <span className="ml-1 text-[var(--ashby-text-muted)]">
                ({statusCounts[status] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* More filters */}
        <button className="ashby-btn ashby-btn-secondary ashby-btn-sm ml-auto">
          <Filter className="w-4 h-4" />
          More filters
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'table' ? (
          <div className="p-6">
            <TableView jobs={filteredJobs} onSelect={setSelectedJob} />
          </div>
        ) : (
          <KanbanView jobs={filteredJobs} />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-[var(--ashby-bg)] border-t border-[var(--ashby-border)] text-sm text-[var(--ashby-text-muted)]">
        Showing {filteredJobs.length} of {mockJobs.length} jobs
      </div>
    </div>
  )
}
