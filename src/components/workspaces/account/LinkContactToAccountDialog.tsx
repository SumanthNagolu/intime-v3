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
import { Loader2, Search, User, Link2, Check, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface LinkContactToAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
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
  accountId,
  onSuccess,
}: LinkContactToAccountDialogProps) {
  const { toast } = useToast()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedContactId, setSelectedContactId] = React.useState<string | null>(null)
  const [jobTitle, setJobTitle] = React.useState('')
  const [department, setDepartment] = React.useState('')
  const [decisionAuthority, setDecisionAuthority] = React.useState<string>('')
  const [isPrimary, setIsPrimary] = React.useState(false)

  // Search contacts query
  const { data: searchResults, isLoading: isSearching } = trpc.crm.contacts.list.useQuery(
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
    setSelectedContactId(null)
    setJobTitle('')
    setDepartment('')
    setDecisionAuthority('')
    setIsPrimary(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContactId) {
      toast({ title: 'Please select a contact', variant: 'error' })
      return
    }

    linkMutation.mutate({
      companyId: accountId,
      contactId: selectedContactId,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      decisionAuthority: decisionAuthority as 'decision_maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end_user' | 'budget_holder' | 'technical_evaluator' | 'procurement' | undefined,
      isPrimary,
    })
  }

  const selectedContact = filteredResults.find(c => c.id === selectedContactId)

  // Get contact display name
  const getContactName = (contact: { firstName?: string | null; lastName?: string | null; first_name?: string | null; last_name?: string | null; email?: string | null }) => {
    const firstName = contact.firstName || contact.first_name || ''
    const lastName = contact.lastName || contact.last_name || ''
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    return contact.email || 'Unknown'
  }

  // Get initials for avatar
  const getInitials = (contact: { firstName?: string | null; lastName?: string | null; first_name?: string | null; last_name?: string | null }) => {
    const firstName = contact.firstName || contact.first_name || ''
    const lastName = contact.lastName || contact.last_name || ''
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-forest-600" />
              Link Existing Contact
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Search for an existing contact and link them to this account.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
            {/* Contact Search */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Search Contact <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedContactId(null)
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
                      {filteredResults.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => setSelectedContactId(contact.id)}
                          className={cn(
                            'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                            selectedContactId === contact.id
                              ? 'bg-gold-50'
                              : 'hover:bg-charcoal-50'
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-white">
                              {getInitials(contact)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-charcoal-900 truncate">
                              {getContactName(contact)}
                            </p>
                            <p className="text-xs text-charcoal-500 truncate">
                              {contact.email || 'No email'} {contact.title ? `• ${contact.title}` : ''}
                            </p>
                          </div>
                          {selectedContactId === contact.id && (
                            <Check className="h-4 w-4 text-gold-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-charcoal-500">
                      No contacts found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected Contact Display */}
              {selectedContact && (
                <div className="p-3 bg-forest-50 border border-forest-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(selectedContact)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal-900">
                      {getContactName(selectedContact)}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {selectedContact.email || 'No email'} {selectedContact.title ? `• ${selectedContact.title}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContactId(null)}
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
                <Label className="text-sm font-medium">Job Title at this Account</Label>
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
              disabled={linkMutation.isPending || !selectedContactId}
              className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800"
            >
              {linkMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              )}
              Link Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
