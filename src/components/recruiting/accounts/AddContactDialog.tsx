'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AddContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const decisionAuthorityOptions = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
  { value: 'champion', label: 'Champion' },
]

export function AddContactDialog({
  open,
  onOpenChange,
  accountId,
}: AddContactDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [decisionAuthority, setDecisionAuthority] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')

  const createContactMutation = trpc.crm.contacts.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Contact added',
        description: 'The contact has been added to this account.',
      })
      utils.crm.contacts.listByAccount.invalidate({ accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add contact.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setTitle('')
    setDecisionAuthority('')
    setIsPrimary(false)
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First and last name are required.',
        variant: 'error',
      })
      return
    }

    createContactMutation.mutate({
      accountId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      title: title.trim() || undefined,
      decisionAuthority: decisionAuthority as 'decision_maker' | 'influencer' | 'gatekeeper' | 'end_user' | 'champion' | undefined,
      isPrimary,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact person for this account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VP of Engineering"
              />
            </div>

            {/* Decision Authority */}
            <div className="space-y-2">
              <Label htmlFor="decisionAuthority">Decision Authority</Label>
              <Select value={decisionAuthority} onValueChange={setDecisionAuthority}>
                <SelectTrigger id="decisionAuthority">
                  <SelectValue placeholder="Select decision authority" />
                </SelectTrigger>
                <SelectContent>
                  {decisionAuthorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Primary Contact Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked === true)}
              />
              <Label htmlFor="isPrimary" className="text-sm font-normal">
                Set as primary contact for this account
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Relationship Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this contact's preferences, communication style, etc."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createContactMutation.isPending}>
              {createContactMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
