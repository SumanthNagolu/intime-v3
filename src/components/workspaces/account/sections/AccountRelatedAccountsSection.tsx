'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Link2, Phone, Globe, MoreVertical, ExternalLink,
  ChevronLeft, ChevronRight, Search, X, Pencil, Check, Loader2,
  Building2, Unlink, Calendar, FileText
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AccountRelatedAccount } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '@/components/workspaces/account/AccountWorkspaceProvider'

// Constants
const ITEMS_PER_PAGE = 10

// Matches company_relationship_category enum in database
const RELATIONSHIP_CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  parent_child: { label: 'Parent/Child', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  msp_client: { label: 'MSP/Client', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  prime_sub: { label: 'Prime/Sub', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500' },
  referral_partner: { label: 'Referral Partner', bg: 'bg-gold-50', text: 'text-gold-700', dot: 'bg-gold-500' },
  competitor: { label: 'Competitor', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  affiliate: { label: 'Affiliate', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  merger_acquisition: { label: 'M&A', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: 'bg-success-50', text: 'text-success-700' },
  inactive: { label: 'Inactive', bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  prospect: { label: 'Prospect', bg: 'bg-blue-50', text: 'text-blue-700' },
  on_hold: { label: 'On Hold', bg: 'bg-orange-50', text: 'text-orange-700' },
}

interface AccountRelatedAccountsSectionProps {
  relatedAccounts: AccountRelatedAccount[]
  accountId: string
  onNavigate?: (section: string) => void
}

// Display field component
function DisplayField({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ElementType
  href?: string
}) {
  const content = (
    <div className={cn(
      "py-2.5 border-b border-charcoal-100/60 last:border-b-0 transition-colors",
      "grid grid-cols-[100px_1fr] gap-3 items-center hover:bg-charcoal-50/50 -mx-2 px-2 rounded-lg"
    )}>
      <span className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {Icon && value && (
          <div className="w-6 h-6 rounded-md bg-charcoal-100 flex items-center justify-center flex-shrink-0">
            <Icon className="h-3.5 w-3.5 text-charcoal-500" />
          </div>
        )}
        <span className={cn(
          "text-sm",
          value ? "text-charcoal-900 font-medium" : "text-charcoal-400 italic"
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )

  if (href && value) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

/**
 * AccountRelatedAccountsSection - Premium SaaS-level related accounts list
 * Shows account-to-account relationships (vendor, client, partner, etc.)
 */
export function AccountRelatedAccountsSection({ relatedAccounts, accountId }: AccountRelatedAccountsSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()

  const [selectedAccount, setSelectedAccount] = React.useState<AccountRelatedAccount | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all')

  // Edit form state
  const [editForm, setEditForm] = React.useState({
    relationshipCategory: '',
    notes: '',
  })

  // Update relationship mutation
  const updateMutation = trpc.crm.accounts.updateAccountRelationship.useMutation({
    onSuccess: () => {
      toast({ title: 'Relationship updated successfully' })
      refreshData()
      setIsEditing(false)
      setSelectedAccount(null)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Unlink account mutation
  const unlinkMutation = trpc.crm.accounts.unlinkAccount.useMutation({
    onSuccess: () => {
      toast({ title: 'Account relationship removed' })
      refreshData()
      setSelectedAccount(null)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Initialize edit form when account is selected
  React.useEffect(() => {
    if (selectedAccount) {
      setEditForm({
        relationshipCategory: selectedAccount.relationshipCategory,
        notes: selectedAccount.notes || '',
      })
    }
  }, [selectedAccount])

  // Filter accounts based on search and category
  const filteredAccounts = React.useMemo(() => {
    let filtered = relatedAccounts

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.industry?.toLowerCase().includes(q) ||
        a.relationshipCategory.toLowerCase().includes(q)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.relationshipCategory === categoryFilter)
    }

    return filtered
  }, [relatedAccounts, searchQuery, categoryFilter])

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / ITEMS_PER_PAGE)
  const paginatedAccounts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAccounts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAccounts, currentPage])

  // Reset page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter])

  const handleSave = async () => {
    if (!selectedAccount) return

    await updateMutation.mutateAsync({
      relationshipId: selectedAccount.relationshipId,
      relationshipCategory: editForm.relationshipCategory as 'parent_child' | 'msp_client' | 'prime_sub' | 'referral_partner' | 'competitor' | 'affiliate' | 'merger_acquisition',
      notes: editForm.notes.trim() || undefined,
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (selectedAccount) {
      setEditForm({
        relationshipCategory: selectedAccount.relationshipCategory,
        notes: selectedAccount.notes || '',
      })
    }
  }

  const handleRowClick = (account: AccountRelatedAccount) => {
    if (selectedAccount?.relationshipId === account.relationshipId) {
      setSelectedAccount(null)
      setIsEditing(false)
    } else {
      setSelectedAccount(account)
      setIsEditing(false)
    }
  }

  const handleUnlink = async (relationshipId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to remove this account relationship?')) {
      await unlinkMutation.mutateAsync({ relationshipId })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getAvatarColors = (name: string) => {
    const colors = [
      'from-forest-400 to-forest-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Related Accounts</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredAccounts.length} relationship{filteredAccounts.length !== 1 ? 's' : ''} with other accounts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-charcoal-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(RELATIONSHIP_CATEGORY_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'linkAccount', accountId }
                  }))
                }}
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Link Account
              </Button>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_120px_100px_140px_100px_90px] gap-3 px-5 py-3 bg-charcoal-50/50 border-b border-charcoal-200/60 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
          <div>Account</div>
          <div>Industry</div>
          <div>Status</div>
          <div>Relationship</div>
          <div>Since</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedAccounts.length > 0 ? (
          <div className="divide-y divide-charcoal-100/60">
            {paginatedAccounts.map((account, idx) => (
              <div
                key={account.relationshipId}
                onClick={() => handleRowClick(account)}
                className={cn(
                  'group grid grid-cols-[1fr_120px_100px_140px_100px_90px] gap-3 px-5 py-3.5 cursor-pointer transition-all duration-200 items-center',
                  selectedAccount?.relationshipId === account.relationshipId
                    ? 'bg-gold-50/70 hover:bg-gold-50'
                    : 'hover:bg-charcoal-50/50'
                )}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Account Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "relative w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105",
                    getAvatarColors(account.name)
                  )}>
                    <span className="text-sm font-semibold text-white">
                      {account.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-charcoal-900 truncate block">{account.name}</span>
                    {account.tier && (
                      <p className="text-xs text-charcoal-500 truncate capitalize">{account.tier} tier</p>
                    )}
                  </div>
                </div>

                {/* Industry */}
                <div className="text-sm text-charcoal-600 truncate">
                  {account.industry || <span className="text-charcoal-300">—</span>}
                </div>

                {/* Status */}
                <div>
                  {account.status ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 border-0 capitalize",
                        STATUS_CONFIG[account.status]?.bg || 'bg-charcoal-100',
                        STATUS_CONFIG[account.status]?.text || 'text-charcoal-600'
                      )}
                    >
                      {STATUS_CONFIG[account.status]?.label || account.status}
                    </Badge>
                  ) : (
                    <span className="text-charcoal-300 text-sm">—</span>
                  )}
                </div>

                {/* Relationship Category */}
                <div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 border-0",
                      RELATIONSHIP_CATEGORY_CONFIG[account.relationshipCategory]?.bg || 'bg-charcoal-100',
                      RELATIONSHIP_CATEGORY_CONFIG[account.relationshipCategory]?.text || 'text-charcoal-600'
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      RELATIONSHIP_CATEGORY_CONFIG[account.relationshipCategory]?.dot || 'bg-charcoal-400'
                    )} />
                    {RELATIONSHIP_CATEGORY_CONFIG[account.relationshipCategory]?.label || account.relationshipCategory}
                  </Badge>
                </div>

                {/* Since Date */}
                <div className="text-sm text-charcoal-600">
                  {formatDate(account.startedDate) || <span className="text-charcoal-300">—</span>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-charcoal-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/employee/recruiting/accounts/${account.id}`}>
                          <div className="w-7 h-7 rounded-md bg-gold-100 flex items-center justify-center mr-2">
                            <ExternalLink className="h-3.5 w-3.5 text-gold-700" />
                          </div>
                          View Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => handleUnlink(account.relationshipId, e as unknown as React.MouseEvent)}
                        className="text-error-600"
                      >
                        <div className="w-7 h-7 rounded-md bg-error-100 flex items-center justify-center mr-2">
                          <Unlink className="h-3.5 w-3.5 text-error-600" />
                        </div>
                        Remove Relationship
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || categoryFilter !== 'all' ? 'No matching related accounts' : 'No related accounts yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Link accounts to track vendor, client, or partner relationships'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button
                size="sm"
                className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', {
                    detail: { dialogId: 'linkAccount', accountId }
                  }))
                }}
              >
                <Link2 className="h-4 w-4 mr-1.5" />
                Link First Account
              </Button>
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

      {/* Premium Detail Panel */}
      {selectedAccount && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-md overflow-hidden animate-slide-up">
          {/* Header with gradient */}
          <div className="relative px-6 py-4 bg-gradient-to-r from-charcoal-50 via-white to-gold-50/40 border-b border-charcoal-100">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-gold-500 to-purple-500" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "relative w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  getAvatarColors(selectedAccount.name)
                )}>
                  <span className="text-lg font-bold text-white">
                    {selectedAccount.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-900">{selectedAccount.name}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium border-0",
                        RELATIONSHIP_CATEGORY_CONFIG[selectedAccount.relationshipCategory]?.bg,
                        RELATIONSHIP_CATEGORY_CONFIG[selectedAccount.relationshipCategory]?.text
                      )}
                    >
                      {RELATIONSHIP_CATEGORY_CONFIG[selectedAccount.relationshipCategory]?.label || selectedAccount.relationshipCategory}
                    </Badge>
                  </div>
                  <p className="text-sm text-charcoal-500 mt-0.5">
                    {selectedAccount.industry && <span className="font-medium text-charcoal-600">{selectedAccount.industry}</span>}
                    {selectedAccount.industry && selectedAccount.tier && <span className="mx-1.5">•</span>}
                    {selectedAccount.tier && <span className="capitalize">{selectedAccount.tier} tier</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleCancel} disabled={updateMutation.isPending}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    >
                      {updateMutation.isPending
                        ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        : <Check className="h-4 w-4 mr-1" />
                      }
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => { setSelectedAccount(null); setIsEditing(false) }} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Three Column Layout */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-8">
              {/* Column 1 - Company Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-charcoal-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Company Info</h4>
                  </div>
                  <div className="space-y-0">
                    <DisplayField label="Name" value={selectedAccount.name} />
                    <DisplayField label="Industry" value={selectedAccount.industry} />
                    <DisplayField label="Status" value={STATUS_CONFIG[selectedAccount.status]?.label || selectedAccount.status} />
                    <DisplayField label="Tier" value={selectedAccount.tier ? `${selectedAccount.tier.charAt(0).toUpperCase() + selectedAccount.tier.slice(1)}` : null} />
                    <DisplayField label="Website" value={selectedAccount.website} icon={Globe} href={selectedAccount.website || undefined} />
                    <DisplayField label="Phone" value={selectedAccount.phone} icon={Phone} href={selectedAccount.phone ? `tel:${selectedAccount.phone}` : undefined} />
                  </div>
                </div>
              </div>

              {/* Column 2 - Relationship Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                      <Link2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-charcoal-900">Relationship</h4>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider block mb-2">
                          Category
                        </label>
                        <Select
                          value={editForm.relationshipCategory}
                          onValueChange={(v) => setEditForm(f => ({ ...f, relationshipCategory: v }))}
                        >
                          <SelectTrigger className="h-9 text-sm border-charcoal-200">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RELATIONSHIP_CATEGORY_CONFIG).map(([value, config]) => (
                              <SelectItem key={value} value={value}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      <DisplayField
                        label="Category"
                        value={RELATIONSHIP_CATEGORY_CONFIG[selectedAccount.relationshipCategory]?.label || selectedAccount.relationshipCategory}
                      />
                      {selectedAccount.relationshipLabel && (
                        <DisplayField label="Label" value={selectedAccount.relationshipLabel} />
                      )}
                      <DisplayField label="Since" value={formatDate(selectedAccount.startedDate)} icon={Calendar} />
                      <DisplayField label="Active" value={selectedAccount.isActive ? 'Yes' : 'No'} />
                      <DisplayField label="Created" value={formatDate(selectedAccount.createdAt)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3 - Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Notes</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Add notes about this relationship..."
                    rows={8}
                    className="resize-y text-sm min-h-[200px] border-charcoal-200 focus:border-gold-400 focus:ring-gold-400/20"
                  />
                ) : (
                  <div className="text-sm text-charcoal-700 whitespace-pre-wrap bg-gradient-to-br from-charcoal-50 to-white rounded-lg border border-charcoal-100/60 p-4 min-h-[200px]">
                    {selectedAccount.notes || <span className="text-charcoal-400 italic">No notes yet</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
              <p className="text-xs text-charcoal-500">
                View the full account profile for more details
              </p>
              <Link
                href={`/employee/recruiting/accounts/${selectedAccount.id}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-gold-700 hover:text-gold-800 transition-colors"
              >
                Go to Account Profile
                <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountRelatedAccountsSection
