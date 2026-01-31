'use client'

/**
 * Candidates Page - Ashby Style
 *
 * Features:
 * - Table view (default)
 * - Filters and search
 * - Bulk actions
 * - Quick preview panel
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  title: string
  location: string
  status: 'active' | 'passive' | 'placed' | 'not_looking' | 'do_not_contact'
  source: string
  skills: string[]
  experience: number
  submissions: number
  lastContacted?: string
  starred: boolean
}

// ============================================
// Mock Data
// ============================================

const mockCandidates: Candidate[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    title: 'Senior React Developer',
    location: 'San Francisco, CA',
    status: 'active',
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: 7,
    submissions: 3,
    lastContacted: '2025-01-28',
    starred: true,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    title: 'Product Manager',
    location: 'New York, NY',
    status: 'active',
    source: 'Referral',
    skills: ['Product Strategy', 'Agile', 'Data Analysis'],
    experience: 5,
    submissions: 2,
    lastContacted: '2025-01-27',
    starred: false,
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Kim',
    email: 'mkim@email.com',
    title: 'DevOps Engineer',
    location: 'Austin, TX',
    status: 'passive',
    source: 'Indeed',
    skills: ['AWS', 'Kubernetes', 'Terraform'],
    experience: 4,
    submissions: 1,
    starred: false,
  },
  {
    id: '4',
    firstName: 'Emily',
    lastName: 'Wilson',
    email: 'emily.w@email.com',
    phone: '(555) 345-6789',
    title: 'UX Designer',
    location: 'Seattle, WA',
    status: 'active',
    source: 'Portfolio',
    skills: ['Figma', 'User Research', 'Prototyping'],
    experience: 6,
    submissions: 4,
    lastContacted: '2025-01-25',
    starred: true,
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Chen',
    email: 'dchen@email.com',
    title: 'Data Scientist',
    location: 'Boston, MA',
    status: 'placed',
    source: 'LinkedIn',
    skills: ['Python', 'Machine Learning', 'SQL'],
    experience: 3,
    submissions: 5,
    lastContacted: '2025-01-20',
    starred: false,
  },
  {
    id: '6',
    firstName: 'Lisa',
    lastName: 'Martinez',
    email: 'lmartinez@email.com',
    title: 'Frontend Developer',
    location: 'Remote',
    status: 'not_looking',
    source: 'Referral',
    skills: ['Vue.js', 'CSS', 'JavaScript'],
    experience: 4,
    submissions: 0,
    starred: false,
  },
]

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: Candidate['status'] }) {
  const config = {
    active: { bg: 'bg-green-100', text: 'text-green-700' },
    passive: { bg: 'bg-amber-100', text: 'text-amber-700' },
    placed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    not_looking: { bg: 'bg-gray-100', text: 'text-gray-600' },
    do_not_contact: { bg: 'bg-red-100', text: 'text-red-700' },
  }
  const labels = {
    active: 'Active',
    passive: 'Passive',
    placed: 'Placed',
    not_looking: 'Not Looking',
    do_not_contact: 'Do Not Contact',
  }
  const c = config[status]

  return (
    <span className={cn('ashby-badge', c.bg, c.text)}>
      {labels[status]}
    </span>
  )
}

// ============================================
// Quick View Panel Component
// ============================================

function QuickViewPanel({
  candidate,
  onClose,
}: {
  candidate: Candidate
  onClose: () => void
}) {
  return (
    <div className="w-[400px] border-l border-[var(--ashby-border)] bg-[var(--ashby-bg)] h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--ashby-border)] flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--ashby-bg-tertiary)] flex items-center justify-center text-lg font-medium">
            {candidate.firstName[0]}{candidate.lastName[0]}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--ashby-text-primary)]">
              {candidate.firstName} {candidate.lastName}
            </h3>
            <p className="text-sm text-[var(--ashby-text-secondary)]">
              {candidate.title}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--ashby-bg-hover)]"
        >
          <X className="w-5 h-5 text-[var(--ashby-text-muted)]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Status */}
        <div>
          <p className="text-xs font-medium text-[var(--ashby-text-muted)] uppercase mb-2">
            Status
          </p>
          <StatusBadge status={candidate.status} />
        </div>

        {/* Contact */}
        <div>
          <p className="text-xs font-medium text-[var(--ashby-text-muted)] uppercase mb-2">
            Contact
          </p>
          <div className="space-y-2">
            <a
              href={`mailto:${candidate.email}`}
              className="flex items-center gap-2 text-sm text-[var(--ashby-accent)] hover:underline"
            >
              <Mail className="w-4 h-4" />
              {candidate.email}
            </a>
            {candidate.phone && (
              <a
                href={`tel:${candidate.phone}`}
                className="flex items-center gap-2 text-sm text-[var(--ashby-accent)] hover:underline"
              >
                <Phone className="w-4 h-4" />
                {candidate.phone}
              </a>
            )}
            <p className="flex items-center gap-2 text-sm text-[var(--ashby-text-secondary)]">
              <MapPin className="w-4 h-4" />
              {candidate.location}
            </p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <p className="text-xs font-medium text-[var(--ashby-text-muted)] uppercase mb-2">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs bg-[var(--ashby-bg-tertiary)] text-[var(--ashby-text-secondary)] rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-medium text-[var(--ashby-text-muted)] uppercase mb-2">
            Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--ashby-text-secondary)]">Experience</span>
              <span className="text-[var(--ashby-text-primary)]">{candidate.experience} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ashby-text-secondary)]">Source</span>
              <span className="text-[var(--ashby-text-primary)]">{candidate.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ashby-text-secondary)]">Submissions</span>
              <span className="text-[var(--ashby-text-primary)]">{candidate.submissions}</span>
            </div>
            {candidate.lastContacted && (
              <div className="flex justify-between">
                <span className="text-[var(--ashby-text-secondary)]">Last Contacted</span>
                <span className="text-[var(--ashby-text-primary)]">{candidate.lastContacted}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-[var(--ashby-border)] flex gap-2">
        <Link
          href={`/a/candidates/${candidate.id}`}
          className="ashby-btn ashby-btn-primary flex-1 justify-center"
        >
          View Full Profile
        </Link>
        <button className="ashby-btn ashby-btn-secondary">
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let result = mockCandidates

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.firstName.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.skills.some((s) => s.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    return result
  }, [searchQuery, statusFilter])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockCandidates.length }
    mockCandidates.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Header */}
        <div className="ashby-page-header">
          <div className="ashby-page-title">
            <User className="w-5 h-5 text-[var(--ashby-text-muted)]" />
            Candidates
            <span className="count">({filteredCandidates.length})</span>
          </div>
          <div className="ashby-page-actions">
            <Link href="/a/candidates/new" className="ashby-btn ashby-btn-primary">
              <Plus className="w-4 h-4" />
              Add Candidate
            </Link>
          </div>
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
              placeholder="Search candidates..."
              className="ashby-search-input"
            />
          </div>

          {/* Status filters */}
          <div className="ashby-filters">
            {(['all', 'active', 'passive', 'placed', 'not_looking'] as const).map((status) => (
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

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="ashby-table-container">
            <table className="ashby-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th style={{ width: 32 }}></th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Skills</th>
                  <th>Submissions</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={cn(
                      'cursor-pointer',
                      selectedCandidate?.id === candidate.id && 'selected'
                    )}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className={cn(
                          'p-0.5 rounded',
                          candidate.starred
                            ? 'text-amber-500'
                            : 'text-[var(--ashby-text-muted)] hover:text-amber-500'
                        )}
                      >
                        <Star
                          className="w-4 h-4"
                          fill={candidate.starred ? 'currentColor' : 'none'}
                        />
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--ashby-bg-tertiary)] flex items-center justify-center text-sm font-medium">
                          {candidate.firstName[0]}{candidate.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--ashby-text-primary)]">
                            {candidate.firstName} {candidate.lastName}
                          </p>
                          <p className="text-xs text-[var(--ashby-text-muted)]">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{candidate.title}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-[var(--ashby-text-secondary)]">
                        <MapPin className="w-3.5 h-3.5" />
                        {candidate.location}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={candidate.status} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {candidate.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="px-1.5 py-0.5 text-xs bg-[var(--ashby-bg-tertiary)] text-[var(--ashby-text-secondary)] rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <span className="text-xs text-[var(--ashby-text-muted)]">
                            +{candidate.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[var(--ashby-text-muted)]" />
                        {candidate.submissions}
                      </div>
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
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--ashby-bg)] border-t border-[var(--ashby-border)] text-sm text-[var(--ashby-text-muted)]">
          Showing {filteredCandidates.length} of {mockCandidates.length} candidates
        </div>
      </div>

      {/* Quick View Panel */}
      {selectedCandidate && (
        <QuickViewPanel
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}
