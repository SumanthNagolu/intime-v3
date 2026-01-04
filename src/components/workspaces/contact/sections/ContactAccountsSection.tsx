'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Plus, Search, MoreVertical, ExternalLink,
  Star, UserMinus, Pencil, X, ChevronLeft, ChevronRight,
  Briefcase, Clock, TrendingUp, Building, Users, Globe
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContactAccount } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'
import { useContactWorkspace } from '../ContactWorkspaceProvider'
import { LinkContactToAccountDialog } from '../LinkContactToAccountDialog'

// Constants
const ITEMS_PER_PAGE = 10

interface ContactAccountsSectionProps {
  accounts: ContactAccount[]
  contactId: string
}

type StatusFilter = 'all' | 'active' | 'inactive'

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: 'Active', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  inactive: { label: 'Inactive', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  prospect: { label: 'Prospect', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  client: { label: 'Client', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
}

// Industry icons mapping
const INDUSTRY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  technology: Globe,
  finance: TrendingUp,
  healthcare: Building,
  default: Building2,
}

// Helper: Get time since linked
function getTimeSinceLinked(sinceDate: string | null): { label: string; days: number } {
  if (!sinceDate) return { label: '—', days: 0 }
  const days = differenceInDays(new Date(), new Date(sinceDate))
  if (days === 0) return { label: 'Today', days: 0 }
  if (days === 1) return { label: '1 day', days: 1 }
  if (days < 30) return { label: `${days} days`, days }
  if (days < 365) return { label: `${Math.floor(days / 30)} mo`, days }
  return { label: `${Math.floor(days / 365)}y`, days }
}

/**
 * ContactAccountsSection - Premium SaaS-level linked accounts display
 * Features: List view with info, bottom detail panel when selected, inline actions
 */
export function ContactAccountsSection({ accounts, contactId }: ContactAccountsSectionProps) {
  const { refreshData } = useContactWorkspace()

  const [selectedAccount, setSelectedAccount] = React.useState<ContactAccount | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false)

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    return {
      all: accounts.length,
      active: accounts.filter(a => a.status === 'active' || a.status === 'client').length,
      inactive: accounts.filter(a => a.status === 'inactive').length,
    }
  }, [accounts])

  // Filter accounts
  const filteredAccounts = React.useMemo(() => {
    let result = accounts

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter(a => a.status === 'active' || a.status === 'client')
    } else if (statusFilter === 'inactive') {
      result = result.filter(a => a.status === 'inactive')
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.industry?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q)
      )
    }

    return result
  }, [accounts, searchQuery, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE)
  const paginatedAccounts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAccounts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAccounts, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const handleRowClick = (account: ContactAccount) => {
    if (selectedAccount?.id === account.id) {
      setSelectedAccount(null)
    } else {
      setSelectedAccount(account)
    }
  }

  const getIndustryIcon = (industry: string | null) => {
    if (!industry) return INDUSTRY_ICONS.default
    const key = industry.toLowerCase()
    return INDUSTRY_ICONS[key] || INDUSTRY_ICONS.default
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Linked Accounts</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} linked to this contact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                />
              </div>
              <Button
                size="sm"
                onClick={() => setLinkDialogOpen(true)}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900 shadow-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Link Account
              </Button>
            </div>
          </div>

          {/* Status Filter Pills */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'active', label: 'Active', count: statusCounts.active },
                { key: 'inactive', label: 'Inactive', count: statusCounts.inactive },
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
        <div className="grid grid-cols-[40px_1fr_120px_120px_90px_90px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Account</div>
          <div>Role</div>
          <div>Industry</div>
          <div className="text-center">Status</div>
          <div className="text-center">Since</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedAccounts.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedAccounts.map((account, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const statusConfig = STATUS_CONFIG[account.status] || STATUS_CONFIG.active
              const timeSince = getTimeSinceLinked(account.sinceDate)
              const IndustryIcon = getIndustryIcon(account.industry)

              return (
                <div
                  key={account.id}
                  onClick={() => handleRowClick(account)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_120px_120px_90px_90px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedAccount?.id === account.id
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

                  {/* Account Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-charcoal-900">
                          {account.name}
                        </span>
                        {account.isPrimary && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold px-1.5 py-0 border-0 bg-gold-100 text-gold-700 flex-shrink-0"
                          >
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-gold-500" />
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="min-w-0">
                    <span className="text-xs text-charcoal-600 truncate block">
                      {account.role || '—'}
                    </span>
                  </div>

                  {/* Industry */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    {account.industry ? (
                      <>
                        <IndustryIcon className="h-3.5 w-3.5 text-charcoal-400 flex-shrink-0" />
                        <span className="text-xs text-charcoal-600 truncate">
                          {account.industry}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-charcoal-300">—</span>
                    )}
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

                  {/* Since Date */}
                  <div className="text-center">
                    <div className="text-xs text-charcoal-600">
                      <span className="font-semibold tabular-nums">{timeSince.label}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/employee/recruiting/accounts/${account.id}`}>
                            <ExternalLink className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                            View Account
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!account.isPrimary && (
                          <DropdownMenuItem>
                            <Star className="h-3.5 w-3.5 mr-2 text-gold-500" />
                            Set as Primary
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-error-600">
                          <UserMinus className="h-3.5 w-3.5 mr-2" />
                          Unlink Account
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
              <Building2 className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || statusFilter !== 'all' ? 'No accounts match your filters' : 'No linked accounts yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || statusFilter !== 'all' ? 'Try different search terms or filters' : 'Link this contact to an account to track the relationship'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => setLinkDialogOpen(true)}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-charcoal-900"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Link Account
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAccounts.length)}</span> of <span className="font-medium text-charcoal-700">{filteredAccounts.length}</span>
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

      {/* Premium Detail Panel - Slides up from bottom */}
      {selectedAccount && (
        <AccountDetailBottomPanel
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          contactId={contactId}
        />
      )}

      {/* Link Account Dialog */}
      <LinkContactToAccountDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        contactId={contactId}
        onSuccess={refreshData}
      />
    </div>
  )
}

// ============================================
// Account Detail Bottom Panel
// ============================================
interface AccountDetailBottomPanelProps {
  account: ContactAccount
  onClose: () => void
  contactId: string
}

function AccountDetailBottomPanel({
  account,
  onClose,
  contactId,
}: AccountDetailBottomPanelProps) {
  const statusConfig = STATUS_CONFIG[account.status] || STATUS_CONFIG.active
  const timeSince = getTimeSinceLinked(account.sinceDate)

  return (
    <div
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-gold-500" />

      {/* Floating close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
      >
        <span className="text-xs font-medium">Close</span>
        <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Header */}
      <div className="relative px-8 pt-6 pb-5 bg-gradient-to-br from-charcoal-50/80 via-transparent to-emerald-50/20">
        <div className="flex items-start gap-5">
          {/* Account icon with glow */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-40",
              account.status === 'active' ? 'bg-emerald-400' : 'bg-charcoal-400'
            )} />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg ring-4 ring-white/80">
              <Building2 className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">{account.name}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold border-0 shadow-sm",
                    statusConfig.bg,
                    statusConfig.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dot)} />
                  {statusConfig.label}
                </Badge>
                {account.isPrimary && (
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold border-0 shadow-sm bg-gold-100 text-gold-700"
                  >
                    <Star className="h-3 w-3 mr-1 fill-gold-500" />
                    Primary Account
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              {account.industry && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  {account.industry}
                </span>
              )}
              {account.role && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-charcoal-400" />
                  {account.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div
          className="grid grid-cols-3 gap-4 mb-8"
          style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
        >
          {/* Relationship Duration */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-emerald-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.02]" />
            <p className="text-3xl font-black tracking-tight text-emerald-600 relative">
              {timeSince.days > 0 ? timeSince.days : '—'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
              Days Linked
            </p>
          </div>

          {/* Role Status */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-gold-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-gold-500 opacity-[0.02]" />
            <p className={cn(
              "text-3xl font-black tracking-tight relative",
              account.isPrimary ? 'text-gold-600' : 'text-charcoal-400'
            )}>
              {account.isPrimary ? (
                <Star className="h-8 w-8 inline fill-gold-400 text-gold-500" />
              ) : '—'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
              {account.isPrimary ? 'Primary Contact' : 'Secondary'}
            </p>
          </div>

          {/* Account Status */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className={cn(
              "absolute inset-0 opacity-[0.03]",
              account.status === 'active' ? 'bg-success-500' : 'bg-charcoal-500'
            )} />
            <p className={cn(
              "text-lg font-bold tracking-tight relative capitalize",
              account.status === 'active' ? 'text-success-600' : 'text-charcoal-500'
            )}>
              {account.status || 'Unknown'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
              Account Status
            </p>
          </div>
        </div>

        {/* 3-Column Info Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Column 1 - Account Details */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Account Details</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRowEnhanced label="Name" value={account.name} />
              <DetailRowEnhanced label="Industry" value={account.industry} />
              <DetailRowEnhanced label="Status" value={statusConfig.label} isLast />
            </div>
          </div>

          {/* Column 2 - Relationship */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Relationship</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRowEnhanced label="Role" value={account.role || 'Contact'} />
              <DetailRowEnhanced label="Primary" value={account.isPrimary ? 'Yes' : 'No'} />
              <DetailRowEnhanced label="Type" value="Employee" isLast />
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
              <DetailRowEnhanced
                label="Linked Since"
                value={account.sinceDate ? format(new Date(account.sinceDate), 'MMM d, yyyy') : null}
              />
              <DetailRowEnhanced
                label="Duration"
                value={timeSince.label !== '—' ? timeSince.label : null}
                isLast
              />
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div
          className="flex items-center justify-between pt-6 border-t border-charcoal-100/50"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm font-medium"
              asChild
            >
              <Link href={`/employee/recruiting/accounts/${account.id}`}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                View Account
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit Role
            </Button>
            {!account.isPrimary && (
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-1.5 text-gold-500" />
                Set as Primary
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" className="text-error-600 hover:text-error-700 hover:bg-error-50 border-error-200">
            <UserMinus className="h-4 w-4 mr-1.5" />
            Unlink Account
          </Button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
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
  )
}

// ============================================
// Detail Row Component
// ============================================
interface DetailRowEnhancedProps {
  label: string
  value: string | null | undefined
  highlight?: boolean
  isLast?: boolean
}

function DetailRowEnhanced({ label, value, highlight, isLast }: DetailRowEnhancedProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2.5 bg-white/50",
      !isLast && "border-b border-charcoal-100/40"
    )}>
      <span className="text-xs text-charcoal-400 font-medium">{label}</span>
      <span className={cn(
        "text-sm font-semibold",
        highlight ? "text-error-600" : "text-charcoal-800"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

export default ContactAccountsSection
