'use client'

import { useState, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Mail, Phone, Linkedin, Edit, X, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ContactDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string | null
  accountId: string
}

const decisionAuthorityOptions = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'gatekeeper', label: 'Gatekeeper' },
  { value: 'end_user', label: 'End User' },
  { value: 'champion', label: 'Champion' },
]

export function ContactDetailDialog({
  open,
  onOpenChange,
  contactId,
  accountId,
}: ContactDetailDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [decisionAuthority, setDecisionAuthority] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [notes, setNotes] = useState('')

  // Fetch contact data
  const contactQuery = trpc.crm.contacts.getById.useQuery(
    { id: contactId! },
    { enabled: !!contactId && open }
  )

  // Update mutation
  const updateMutation = trpc.crm.contacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated' })
      utils.crm.contacts.listByAccount.invalidate({ accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.crm.contacts.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact deleted' })
      utils.crm.contacts.listByAccount.invalidate({ accountId })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when contact data loads
  useEffect(() => {
    if (contactQuery.data) {
      const c = contactQuery.data
      setFirstName(c.first_name || '')
      setLastName(c.last_name || '')
      setEmail(c.email || '')
      setPhone(c.phone || '')
      setTitle(c.title || '')
      setDecisionAuthority(c.decision_authority || '')
      setIsPrimary(c.is_primary || false)
      setNotes(c.notes || '')
    }
  }, [contactQuery.data])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  const handleSave = () => {
    if (!contactId) return
    updateMutation.mutate({
      id: contactId,
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

  const handleDelete = () => {
    if (!contactId) return
    deleteMutation.mutate({ id: contactId })
  }

  const contact = contactQuery.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Contact' : 'Contact Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update contact information' : 'View contact details for this account'}
              </DialogDescription>
            </div>
            {!isEditing && contact && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {contactQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : contact ? (
          isEditing ? (
            // Edit Mode
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisionAuthority">Decision Authority</Label>
                <Select value={decisionAuthority} onValueChange={setDecisionAuthority}>
                  <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked === true)}
                />
                <Label htmlFor="isPrimary" className="text-sm font-normal">
                  Set as primary contact
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="py-4 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-medium text-hublot-700">
                    {contact.first_name?.[0]}{contact.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {contact.first_name} {contact.last_name}
                    {contact.is_primary && (
                      <span className="ml-2 text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </h3>
                  {contact.title && (
                    <p className="text-charcoal-600">{contact.title}</p>
                  )}
                  {contact.decision_authority && (
                    <p className="text-sm text-charcoal-500 capitalize">
                      {contact.decision_authority.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600"
                  >
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600"
                  >
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </a>
                )}
                {contact.linkedin_url && (
                  <a
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-charcoal-600 hover:text-hublot-600"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>

              {contact.notes && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal-700 mb-1">Notes</h4>
                  <p className="text-sm text-charcoal-600 whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-8 text-charcoal-500">
            Contact not found
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 mr-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contact?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove {contact?.first_name} {contact?.last_name} from this account.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
