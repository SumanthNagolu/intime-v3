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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Building2, Link2, Check, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface LinkContactToAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  onSuccess?: () => void
}

// Decision Authority options matching the database enum
const DECISION_AUTHORITY_OPTIONS = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'champion', label: 'Champion' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
  { value: 'budget_holder', label: 'Budget Holder' },
  { value: 'technical_evaluator', label: 'Technical Evaluator' },
  { value: 'procurement', label: 'Procurement' },
]

export function LinkContactToAccountDialog({
  open,
  onOpenChange,
  contactId,
  onSuccess,
}: LinkContactToAccountDialogProps) {
  const { toast } = useToast()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)
  const [jobTitle, setJobTitle] = React.useState('')
  const [department, setDepartment] = React.useState('')
  const [decisionAuthority, setDecisionAuthority] = React.useState<string>('')
  const [isPrimary, setIsPrimary] = React.useState(false)

  // Search accounts query
  const { data: searchResults, isLoading: isSearching } = trpc.crm.accounts.list.useQuery(
    { search: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  const filteredResults = React.useMemo(() => {
    if (!searchResults?.items) return []
    return searchResults.items
  }, [searchResults])

  // Link contact mutation
  const linkMutation = trpc.companies.linkContact.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact linked to account successfully' })
      onSuccess?.()
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
    setJobTitle('')
    setDepartment('')
    setDecisionAuthority('')
    setIsPrimary(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAccountId) {
      toast({ title: 'Please select an account', variant: 'error' })
      return
    }

    linkMutation.mutate({
      companyId: selectedAccountId,
      contactId,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      decisionAuthority: decisionAuthority as 'decision_maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end_user' | 'budget_holder' | 'technical_evaluator' | 'procurement' | undefined,
      isPrimary,
    })
  }

  const selectedAccount = filteredResults.find(a => a.id === selectedAccountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-600" />
              Link to Account
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Associate this contact with an account and define their role.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
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
                <div className="border border-charcoal-200 rounded-lg max-h-[180px] overflow-y-auto">
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
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
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
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
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

            {/* Job Title & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Title</Label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., VP of Engineering"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Department</Label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering"
                  className="h-10"
                />
              </div>
            </div>

            {/* Decision Authority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role / Decision Authority</Label>
              <Select value={decisionAuthority} onValueChange={setDecisionAuthority}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select role (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_AUTHORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Primary Contact Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked === true)}
              />
              <label
                htmlFor="isPrimary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
              >
                <Star className="h-3.5 w-3.5 text-gold-500" />
                Set as primary contact for this account
              </label>
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
              disabled={linkMutation.isPending || !selectedAccountId}
              className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
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
