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
import { Loader2, UserPlus, Building2, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface CreateRelatedContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  companyName: string
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

export function CreateRelatedContactDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  onSuccess,
}: CreateRelatedContactDialogProps) {
  const { toast } = useToast()

  // Form state
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [jobTitle, setJobTitle] = React.useState('')
  const [department, setDepartment] = React.useState('')
  const [decisionAuthority, setDecisionAuthority] = React.useState<string>('')
  const [isPrimary, setIsPrimary] = React.useState(false)

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Create contact mutation
  const createContactMutation = trpc.unifiedContacts.create.useMutation()

  // Link contact mutation
  const linkContactMutation = trpc.companies.linkContact.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact created and linked to company successfully' })
      onSuccess?.()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error linking contact', description: error.message, variant: 'error' })
    },
  })

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setJobTitle('')
    setDepartment('')
    setDecisionAuthority('')
    setIsPrimary(false)
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

    try {
      // Step 1: Create the contact (don't set currentCompanyId - that FK references contacts.id not companies.id)
      // The company relationship is established via company_contacts in Step 2
      const newContact = await createContactMutation.mutateAsync({
        subtype: 'person_client_contact',
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        title: jobTitle.trim() || undefined,
      })

      // Step 2: Link to the company
      await linkContactMutation.mutateAsync({
        companyId,
        contactId: newContact.id,
        jobTitle: jobTitle.trim() || undefined,
        department: department.trim() || undefined,
        decisionAuthority: decisionAuthority as 'decision_maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end_user' | 'budget_holder' | 'technical_evaluator' | 'procurement' | undefined,
        isPrimary,
      })
    } catch (error) {
      if (error instanceof Error && !error.message.includes('linking')) {
        toast({ title: 'Error creating contact', description: error.message, variant: 'error' })
      }
    }
  }

  const isSubmitting = createContactMutation.isPending || linkContactMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-purple-600" />
              Create Related Contact
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Create a new contact and link them to the same company.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
            {/* Company Display */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Adding to company</p>
                <p className="font-semibold text-sm text-charcoal-900 truncate">
                  {companyName}
                </p>
              </div>
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
                Set as primary contact for this company
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
              disabled={isSubmitting}
              className="min-w-[140px] h-9 uppercase text-xs font-semibold tracking-wider bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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
