'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Building2, Link2, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useAccountWorkspace } from '@/components/workspaces/account/AccountWorkspaceProvider'

interface LinkAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

// Matches company_relationship_category enum
const RELATIONSHIP_CATEGORIES = [
  { value: 'parent_child', label: 'Parent/Child' },
  { value: 'msp_client', label: 'MSP/Client' },
  { value: 'prime_sub', label: 'Prime/Subcontractor' },
  { value: 'referral_partner', label: 'Referral Partner' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'merger_acquisition', label: 'Merger & Acquisition' },
]

export function LinkAccountDialog({
  open,
  onOpenChange,
  accountId,
}: LinkAccountDialogProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)
  const [relationshipCategory, setRelationshipCategory] = React.useState<string>('')
  const [notes, setNotes] = React.useState('')

  // Search accounts query
  const { data: searchResults, isLoading: isSearching } = trpc.crm.accounts.list.useQuery(
    { search: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  // Filter out the current account from search results
  const filteredResults = React.useMemo(() => {
    if (!searchResults?.items) return []
    return searchResults.items.filter(a => a.id !== accountId)
  }, [searchResults, accountId])

  // Link account mutation
  const linkMutation = trpc.crm.accounts.linkAccount.useMutation({
    onSuccess: () => {
      toast({ title: 'Account linked successfully' })
      refreshData()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const resetForm = () => {
    setSearchQuery('')
    setSelectedAccountId(null)
    setRelationshipCategory('')
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAccountId) {
      toast({ title: 'Please select an account', variant: 'error' })
      return
    }

    if (!relationshipCategory) {
      toast({ title: 'Please select a relationship category', variant: 'error' })
      return
    }

    linkMutation.mutate({
      accountId,
      relatedAccountId: selectedAccountId,
      relationshipCategory: relationshipCategory as 'parent_child' | 'msp_client' | 'prime_sub' | 'referral_partner' | 'competitor' | 'affiliate' | 'merger_acquisition',
      notes: notes.trim() || undefined,
      startedDate: new Date().toISOString().split('T')[0], // Today's date as default
    })
  }

  const selectedAccount = filteredResults.find(a => a.id === selectedAccountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-600" />
              Link Account
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Create a relationship between this account and another account.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Account Search */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Search Account <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search by account name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedAccountId(null)
                  }}
                  className="pl-9 h-10"
                />
              </div>

              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <div className="border border-charcoal-200 rounded-lg max-h-[200px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-charcoal-500">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Searching...
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="divide-y divide-charcoal-100">
                      {filteredResults.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => setSelectedAccountId(account.id)}
                          className={cn(
                            'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                            selectedAccountId === account.id
                              ? 'bg-gold-50'
                              : 'hover:bg-charcoal-50'
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-charcoal-400 to-charcoal-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-charcoal-900 truncate">
                              {account.name}
                            </p>
                            <p className="text-xs text-charcoal-500 truncate">
                              {account.industry || 'No industry'} • {account.status || 'Unknown'}
                            </p>
                          </div>
                          {selectedAccountId === account.id && (
                            <Check className="h-4 w-4 text-gold-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-charcoal-500">
                      No accounts found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected Account Display */}
              {selectedAccount && (
                <div className="p-3 bg-gold-50 border border-gold-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal-900">
                      {selectedAccount.name}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {selectedAccount.industry || 'No industry'} • {selectedAccount.status || 'Unknown'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAccountId(null)}
                    className="text-charcoal-500 hover:text-charcoal-700"
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>

            {/* Relationship Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Relationship Type <span className="text-red-500">*</span>
              </Label>
              <Select value={relationshipCategory} onValueChange={setRelationshipCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this relationship..."
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-25">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
              className="min-w-[100px] h-9 uppercase text-xs font-semibold tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={linkMutation.isPending || !selectedAccountId || !relationshipCategory}
              className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {linkMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              )}
              Link Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
