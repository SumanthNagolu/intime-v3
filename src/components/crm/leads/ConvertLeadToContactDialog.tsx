'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  ArrowRight,
  UserCircle,
  Mail,
  Phone,
  Building2,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'

const convertToContactSchema = z.object({
  // Contact Details
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  // Professional
  title: z.string().optional(),
  department: z.string().optional(),
  companyName: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  // Contact Type
  contactType: z.enum([
    'person_client_contact',
    'person_hiring_manager',
    'person_hr_contact',
    'person_vendor_contact',
    'person_referral_source',
  ]),
  // Link to existing account
  accountId: z.string().uuid().optional(),
  // Notes
  notes: z.string().optional(),
})

type ConvertToContactFormValues = z.infer<typeof convertToContactSchema>

interface ConvertLeadToContactDialogProps {
  lead: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    mobile?: string
    title?: string
    department?: string
    company_name?: string
    linkedin_url?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (contact: { id: string }) => void
}

export function ConvertLeadToContactDialog({ lead, open, onOpenChange, onSuccess }: ConvertLeadToContactDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'

  const form = useForm<ConvertToContactFormValues>({
    resolver: zodResolver(convertToContactSchema),
    defaultValues: {
      firstName: lead.first_name || '',
      lastName: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      mobile: lead.mobile || '',
      title: lead.title || '',
      department: lead.department || '',
      companyName: lead.company_name || '',
      linkedinUrl: lead.linkedin_url || '',
      contactType: 'person_client_contact',
      notes: '',
    },
  })

  // Fetch accounts for linking
  const { data: accountsData } = trpc.companies.list.useQuery({
    limit: 100,
    search: lead.company_name || '',
  })

  const convertToContact = trpc.unifiedContacts.leads.convertToContact.useMutation({
    onSuccess: (result) => {
      toast.success('Lead converted to contact successfully')
      utils.unifiedContacts.leads.list.invalidate()
      utils.unifiedContacts.leads.stats.invalidate()
      utils.unifiedContacts.list.invalidate()
      onOpenChange(false)
      onSuccess?.(result)
      // Navigate to the new contact
      router.push(`/employee/contacts/${result.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert lead to contact')
    },
  })

  const onSubmit = (data: ConvertToContactFormValues) => {
    convertToContact.mutate({
      leadId: lead.id,
      ...data,
    })
  }

  const CONTACT_TYPE_OPTIONS = [
    { value: 'person_client_contact', label: 'Client Contact', description: 'General client contact' },
    { value: 'person_hiring_manager', label: 'Hiring Manager', description: 'Makes hiring decisions' },
    { value: 'person_hr_contact', label: 'HR Contact', description: 'HR/Recruiting contact' },
    { value: 'person_vendor_contact', label: 'Vendor Contact', description: 'Vendor representative' },
    { value: 'person_referral_source', label: 'Referral Source', description: 'Source of referrals' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-charcoal-600" />
            <span>Convert Lead to Contact</span>
            <ArrowRight className="w-4 h-4 text-charcoal-400" />
            <Badge variant="outline">{contactName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Create a contact record from this lead for ongoing relationship management.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                          <Input className="pl-9" placeholder="email@company.com" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                          <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Professional Info */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., VP of Engineering" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Engineering" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                          <Input className="pl-9" placeholder="Company name" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Type & Account */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Classification
              </h4>

              <FormField
                control={form.control}
                name="contactType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTACT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              <span className="text-xs text-charcoal-500">{option.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type of contact determines how they appear in searches and reports.
                    </FormDescription>
                  </FormItem>
                )}
              />

              {accountsData?.items && accountsData.items.length > 0 && (
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Account</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No account</SelectItem>
                          {accountsData.items.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optionally link this contact to an existing account.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Notes */}
            <div className="border-t pt-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this contact..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={convertToContact.isPending}>
                {convertToContact.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Convert to Contact
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
