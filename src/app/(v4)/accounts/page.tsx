'use client'

/**
 * Accounts Page - V4 Linear-style Redesign
 *
 * Split view: List on left, detail panel on right.
 * Connected to real tRPC data with full keyboard navigation.
 */

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Briefcase,
  Building2,
  ChevronRight,
  DollarSign,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useV4Accounts, type V4Account } from '@/lib/v4/hooks/useV4Data'
import { useV4AccountMutations } from '@/lib/v4/hooks/useV4Mutations'

// ============================================
// Utility Components
// ============================================

function StatusBadge({ status }: { status: V4Account['status'] }) {
  const config = {
    active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    prospect: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
    inactive: { bg: 'bg-neutral-500/15', text: 'text-neutral-400', dot: 'bg-neutral-400' },
    on_hold: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  }
  const c = config[status] || config.active
  const labels = { active: 'Active', prospect: 'Prospect', inactive: 'Inactive', on_hold: 'On Hold' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {labels[status] || status}
    </span>
  )
}

function TierBadge({ tier }: { tier: V4Account['tier'] }) {
  if (!tier) return null
  const config = {
    platinum: { bg: 'bg-purple-500/15', text: 'text-purple-400', icon: Star },
    gold: { bg: 'bg-amber-500/15', text: 'text-amber-400', icon: Star },
    silver: { bg: 'bg-neutral-500/15', text: 'text-neutral-300', icon: Star },
    bronze: { bg: 'bg-orange-500/15', text: 'text-orange-400', icon: Star },
  }
  const c = config[tier] || config.bronze
  const Icon = c.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded', c.bg, c.text)}>
      <Icon className="w-3 h-3" />
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  )
}

function TypeBadge({ type }: { type: V4Account['type'] }) {
  const config = {
    enterprise: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
    mid_market: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    smb: { bg: 'bg-neutral-500/15', text: 'text-neutral-400' },
    startup: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  }
  const labels = { enterprise: 'Enterprise', mid_market: 'Mid-Market', smb: 'SMB', startup: 'Startup' }
  const c = config[type] || config.smb
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded', c.bg, c.text)}>
      {labels[type] || type}
    </span>
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
// Account List Item
// ============================================

function AccountListItem({
  account,
  isSelected,
  onSelect,
}: {
  account: V4Account
  isSelected: boolean
  onSelect: () => void
}) {
  const formatRevenue = (amount?: number) => {
    if (!amount || amount <= 0) return null
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
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
      <div className="w-10 h-10 rounded-lg bg-neutral-700 flex items-center justify-center text-lg font-semibold text-neutral-300">
        {account.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-100 truncate">{account.name}</span>
          <StatusBadge status={account.status} />
        </div>
        <p className="text-sm text-neutral-400 truncate">{account.industry || 'No industry'}</p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-neutral-500">
          {account.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {account.location.split(',')[0]}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {account.jobsCount} jobs
          </span>
          {formatRevenue(account.revenue) && (
            <span>{formatRevenue(account.revenue)} YTD</span>
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
// Account Detail Panel
// ============================================

function AccountDetailPanel({
  account,
  onClose,
  onNewJob,
}: {
  account: V4Account
  onClose: () => void
  onNewJob: () => void
}) {
  const formatRevenue = (amount?: number) => {
    if (!amount || amount <= 0) return '$0'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-5 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-neutral-700 flex items-center justify-center text-2xl font-bold text-neutral-300">
              {account.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">{account.name}</h2>
                <StatusBadge status={account.status} />
                <TypeBadge type={account.type} />
                {account.tier && <TierBadge tier={account.tier} />}
              </div>
              <p className="text-sm text-neutral-400 mt-0.5">{account.industry || 'No industry'}</p>
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
          {account.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {account.location}
            </span>
          )}
          {account.website && (
            <a
              href={account.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {account.phone && (
            <a href={`tel:${account.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
              <Phone className="w-4 h-4" />
              {account.phone}
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <DollarSign className="w-4 h-4" />
            <span className="text-white font-medium">{formatRevenue(account.revenue)}</span> YTD
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Briefcase className="w-4 h-4" />
            <span className="text-white font-medium">{account.jobsCount}</span> Active Jobs
          </span>
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Users className="w-4 h-4" />
            <span className="text-white font-medium">{account.placementsCount}</span> Placements
          </span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={onNewJob}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors">
            <Users className="w-4 h-4" />
            Add Contact
          </button>
          {account.primaryContact?.email && (
            <a
              href={`mailto:${account.primaryContact.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
          )}
        </div>
      </header>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {/* Account Details */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Account Details
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField label="Status" value={<StatusBadge status={account.status} />} />
            <InlineField label="Type" value={<TypeBadge type={account.type} />} />
            {account.tier && <InlineField label="Tier" value={<TierBadge tier={account.tier} />} />}
            <InlineField label="Industry" value={account.industry || 'Not specified'} />
            <InlineField label="Location" value={account.location || 'Not specified'} />
            <InlineField label="Owner" value={account.owner.name} />
          </div>
        </section>

        {/* Financial Summary */}
        <section className="px-6 py-4 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Financial Summary
          </h3>
          <div className="divide-y divide-neutral-800/50">
            <InlineField
              label="Revenue YTD"
              value={<span className="font-semibold text-emerald-400">{formatRevenue(account.revenue)}</span>}
              editable={false}
            />
            <InlineField label="Jobs" value={`${account.jobsCount} active`} editable={false} />
            <InlineField label="Placements" value={`${account.placementsCount} total`} editable={false} />
          </div>
        </section>

        {/* Primary Contact */}
        {account.primaryContact && (
          <section className="px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Primary Contact</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Change
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-medium text-neutral-300">
                {account.primaryContact.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-200 font-medium">{account.primaryContact.name}</p>
                <p className="text-xs text-neutral-500">{account.primaryContact.title || 'No title'}</p>
              </div>
              <a
                href={`mailto:${account.primaryContact.email}`}
                className="p-2 rounded-md hover:bg-neutral-700 transition-colors"
              >
                <Mail className="w-4 h-4 text-neutral-400" />
              </a>
            </div>
          </section>
        )}

        {/* Activity */}
        <section className="px-6 py-4">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
            Activity
          </h3>
          <div className="space-y-3">
            {account.lastContactDate && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                  <Mail className="w-3 h-3 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-300">Last contacted</p>
                  <p className="text-xs text-neutral-500">{account.lastContactDate}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center mt-0.5">
                <Plus className="w-3 h-3 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-300">Account created</p>
                <p className="text-xs text-neutral-500">{account.createdAt || 'Unknown'}</p>
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
            <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px]">J</kbd> New Job
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

export default function AccountsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Data fetching
  const { accounts, isLoading, error, total } = useV4Accounts({
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  // Selected account
  const selectedAccount = accounts[selectedIndex]

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: accounts.length }
    accounts.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1
    })
    return counts
  }, [accounts])

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
          setSelectedIndex(prev => Math.min(prev + 1, accounts.length - 1))
          break
        case 'k':
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Escape':
          setSelectedIndex(-1)
          break
        case 'n':
          e.preventDefault()
          router.push('/accounts/new')
          break
        case 'e':
          if (selectedAccount) {
            e.preventDefault()
            router.push(`/accounts/${selectedAccount.id}/edit`)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [accounts.length, selectedAccount, router])

  // Handle new job
  const handleNewJob = () => {
    if (selectedAccount) {
      router.push(`/jobs/new?accountId=${selectedAccount.id}`)
    }
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
        <p className="text-white font-medium">Error loading accounts</p>
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
          selectedAccount ? 'hidden md:flex w-full md:w-[380px]' : 'flex-1 max-w-2xl'
        )}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-neutral-800">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neutral-400" />
              <h1 className="text-lg font-semibold text-white">Accounts</h1>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 rounded">
                {total}
              </span>
            </div>
            <button
              onClick={() => router.push('/accounts/new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Account
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
                placeholder="Search accounts..."
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
              {(['all', 'active', 'prospect', 'inactive', 'on_hold'] as const).map((status) => (
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
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <Building2 className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-white font-medium">No accounts found</p>
              <p className="text-sm text-neutral-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div>
              {accounts.map((account, index) => (
                <AccountListItem
                  key={account.id}
                  account={account}
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
            {accounts.length} of {total} accounts
          </p>
        </footer>
      </div>

      {/* Detail Panel - full screen on mobile, side panel on desktop */}
      {selectedAccount && (
        <div className="fixed inset-0 z-40 md:relative md:inset-auto md:flex-1 md:min-w-0">
          <AccountDetailPanel
            account={selectedAccount}
            onClose={() => setSelectedIndex(-1)}
            onNewJob={handleNewJob}
          />
        </div>
      )}

      {/* Empty state when no selection - desktop only */}
      {!selectedAccount && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-900">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-400">Select an account to view details</p>
            <p className="text-sm text-neutral-600 mt-1">
              Use <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">J</kbd> / <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-xs">K</kbd> to navigate
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
