'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
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
import { Loader2, UserPlus } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CreateContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Contact subtype options
const CONTACT_SUBTYPE_OPTIONS = [
  { value: 'person_client_contact', label: 'Client Contact' },
  { value: 'person_candidate', label: 'Candidate' },
  { value: 'person_lead', label: 'Lead' },
  { value: 'person_vendor_contact', label: 'Vendor Contact' },
  { value: 'person_employee', label: 'Employee' },
]

export function CreateContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateContactDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [subtype, setSubtype] = React.useState<string>('person_client_contact')

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Create contact mutation
  const createContactMutation = trpc.unifiedContacts.create.useMutation({
    onSuccess: (data) => {
      utils.unifiedContacts.list.invalidate()
      toast({ title: 'Contact created successfully' })
      onSuccess?.()
      resetForm()
      onOpenChange(false)
      // Navigate to the new contact
      router.push(`/employee/contacts/${data.id}`)
    },
    onError: (error) => {
      toast({ title: 'Error creating contact', description: error.message, variant: 'error' })
    },
  })

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setTitle('')
    setSubtype('person_client_contact')
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Invalid email format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors', variant: 'error' })
      return
    }

    await createContactMutation.mutateAsync({
      subtype: subtype as 'person_client_contact' | 'person_candidate' | 'person_lead' | 'person_vendor_contact' | 'person_employee',
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      title: title.trim() || undefined,
    })
  }

  const isSubmitting = createContactMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold-600" />
              New Contact
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Create a new contact to add to your professional network.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
            {/* Contact Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Contact Type</Label>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select contact type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_SUBTYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className={`h-10 ${errors.firstName ? 'border-red-400' : ''}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="h-10"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className={`h-10 ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-10"
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., VP of Engineering"
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
              disabled={isSubmitting}
              className="min-w-[140px] h-9 uppercase text-xs font-semibold tracking-wider"
            >
              {isSubmitting && (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              )}
              Create Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
