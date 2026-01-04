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
import { Loader2, Search, Link2, Check, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface LinkRelatedContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  contactName: string
  onSuccess?: () => void
}

// Relationship type options for contact-to-contact relationships
const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'knows', label: 'Knows', description: 'General acquaintance' },
  { value: 'referred_by', label: 'Referred By', description: 'Was referred by this contact' },
  { value: 'mentors', label: 'Mentors', description: 'Mentoring relationship' },
  { value: 'reports_to', label: 'Reports To', description: 'Direct reporting relationship' },
  { value: 'manages', label: 'Manages', description: 'Management relationship' },
  { value: 'spouse_of', label: 'Spouse Of', description: 'Married to this contact' },
]

export function LinkRelatedContactDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  onSuccess,
}: LinkRelatedContactDialogProps) {
  const { toast } = useToast()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedContactId, setSelectedContactId] = React.useState<string | null>(null)
  const [relationshipType, setRelationshipType] = React.useState<string>('knows')
  const [notes, setNotes] = React.useState('')

  // Search contacts query
  const { data: searchResults, isLoading: isSearching } = trpc.crm.contacts.list.useQuery(
    { search: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  const filteredResults = React.useMemo(() => {
    if (!searchResults?.items) return []
    // Exclude the current contact from results
    return searchResults.items.filter(c => c.id !== contactId)
  }, [searchResults, contactId])

  // Get trpc utils for cache invalidation
  const utils = trpc.useUtils()

  // Link contact mutation - using contact relationships API
  const linkMutation = trpc.contactRelationships.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact relationship created successfully' })
      utils.contactRelationships.getByContact.invalidate({ contactId })
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
    setRelationshipType('knows')
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContactId) {
      toast({ title: 'Please select a contact', variant: 'error' })
      return
    }

    linkMutation.mutate({
      sourceContactId: contactId,
      targetContactId: selectedContactId,
      relationshipType: relationshipType as 'knows' | 'referred_by' | 'mentors' | 'reports_to' | 'manages' | 'spouse_of' | 'works_at' | 'worked_at' | 'owns' | 'founded' | 'board_member',
      notes: notes.trim() || undefined,
      isCurrent: true,
    })
  }

  const selectedContact = filteredResults.find(c => c.id === selectedContactId)

  // Get contact display name (API returns snake_case fields)
  const getContactName = (contact: { first_name?: string | null; last_name?: string | null }) => {
    const firstName = contact.first_name || ''
    const lastName = contact.last_name || ''
    return `${firstName} ${lastName}`.trim() || 'Unknown'
  }

  // Get initials for avatar
  const getInitials = (contact: { first_name?: string | null; last_name?: string | null }) => {
    const first = contact.first_name?.[0] || ''
    const last = contact.last_name?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-purple-600" />
              Link Related Contact
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Create a relationship between contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
            {/* Current Contact Display */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Linking from contact</p>
                <p className="font-semibold text-sm text-charcoal-900 truncate">
                  {contactName}
                </p>
              </div>
            </div>

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
                              ? 'bg-purple-50'
                              : 'hover:bg-charcoal-50'
                          )}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-white">
                              {getInitials(contact)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-charcoal-900 truncate">
                              {getContactName(contact)}
                            </p>
                            <p className="text-xs text-charcoal-500 truncate">
                              {contact.email || 'No email'}{contact.title ? ` • ${contact.title}` : ''}
                            </p>
                          </div>
                          {selectedContactId === contact.id && (
                            <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-charcoal-500">
                      No contacts found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Selected Contact Display */}
              {selectedContact && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(selectedContact)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal-900">
                      {getContactName(selectedContact)}
                    </p>
                    <p className="text-xs text-charcoal-500">
                      {selectedContact.email || 'No email'}{selectedContact.title ? ` • ${selectedContact.title}` : ''}
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

            {/* Relationship Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Relationship Type <span className="text-red-500">*</span>
              </Label>
              <Select value={relationshipType} onValueChange={setRelationshipType}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-charcoal-500">
                {RELATIONSHIP_TYPE_OPTIONS.find(o => o.value === relationshipType)?.description}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional context about this relationship..."
                className="h-10"
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
              disabled={linkMutation.isPending || !selectedContactId}
              className="min-w-[120px] h-9 uppercase text-xs font-semibold tracking-wider bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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
