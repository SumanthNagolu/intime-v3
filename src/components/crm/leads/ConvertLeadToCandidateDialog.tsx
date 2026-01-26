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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Loader2,
  ArrowRight,
  UserPlus,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  MapPin,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

const convertToCandidateSchema = z.object({
  // Basic Info
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  // Professional
  title: z.string().optional(),
  currentEmployer: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  // Candidate specific
  candidateStatus: z.enum(['new', 'active', 'passive', 'screening', 'bench']),
  availability: z.enum(['immediate', 'two_weeks', 'one_month', 'flexible', 'not_looking']),
  // Compensation
  desiredHourlyRate: z.number().min(0).optional(),
  desiredSalary: z.number().min(0).optional(),
  currentCompensation: z.string().optional(),
  // Skills & Experience
  primarySkills: z.string().optional(), // Comma-separated
  yearsOfExperience: z.number().min(0).max(50).optional(),
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  willingToRelocate: z.boolean(),
  remotePreference: z.enum(['onsite', 'hybrid', 'remote', 'flexible']),
  // Work Authorization
  workAuthorization: z.enum(['us_citizen', 'green_card', 'h1b', 'opt', 'ead', 'other']).optional(),
  requiresSponsorship: z.boolean(),
  // Notes
  notes: z.string().optional(),
})

type ConvertToCandidateFormValues = z.infer<typeof convertToCandidateSchema>

interface ConvertLeadToCandidateDialogProps {
  lead: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    title?: string
    company_name?: string
    linkedin_url?: string
    company_city?: string
    company_state?: string
    company_country?: string
    primary_skills?: string[]
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (candidate: { id: string }) => void
}

export function ConvertLeadToCandidateDialog({ lead, open, onOpenChange, onSuccess }: ConvertLeadToCandidateDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const candidateName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'

  const form = useForm<ConvertToCandidateFormValues>({
    resolver: zodResolver(convertToCandidateSchema),
    defaultValues: {
      firstName: lead.first_name || '',
      lastName: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      title: lead.title || '',
      currentEmployer: lead.company_name || '',
      linkedinUrl: lead.linkedin_url || '',
      candidateStatus: 'new',
      availability: 'flexible',
      primarySkills: lead.primary_skills?.join(', ') || '',
      city: lead.company_city || '',
      state: lead.company_state || '',
      country: lead.company_country || 'US',
      willingToRelocate: false,
      remotePreference: 'flexible',
      requiresSponsorship: false,
      notes: '',
    },
  })

  const convertToCandidate = trpc.unifiedContacts.leads.convertToCandidate.useMutation({
    onSuccess: (result) => {
      toast.success('Lead converted to candidate successfully')
      utils.unifiedContacts.leads.list.invalidate()
      utils.unifiedContacts.leads.stats.invalidate()
      utils.unifiedContacts.candidates.list.invalidate()
      onOpenChange(false)
      onSuccess?.(result)
      // Navigate to the new candidate
      router.push(`/employee/recruiting/candidates/${result.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert lead to candidate')
    },
  })

  const onSubmit = (data: ConvertToCandidateFormValues) => {
    convertToCandidate.mutate({
      leadId: lead.id,
      ...data,
      primarySkills: data.primarySkills?.split(',').map(s => s.trim()).filter(Boolean) || [],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-charcoal-600" />
            <span>Convert Lead to Candidate</span>
            <ArrowRight className="w-4 h-4 text-charcoal-400" />
            <Badge variant="outline">{candidateName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Create a candidate record from this lead for the recruiting pipeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Basic Information
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
                          <Input className="pl-9" placeholder="email@example.com" {...field} />
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Software Engineer" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentEmployer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Employer</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Candidate Status */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Status & Availability
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="candidateStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Candidate Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="passive">Passive</SelectItem>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="bench">On Bench</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="two_weeks">2 Weeks Notice</SelectItem>
                          <SelectItem value="one_month">1 Month Notice</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                          <SelectItem value="not_looking">Not Looking</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Compensation */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Compensation
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="desiredHourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Rate ($/hr)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 75"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="desiredSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Salary ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 150000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentCompensation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Compensation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $140K base + bonus" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Skills & Experience
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primarySkills"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Primary Skills</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React, TypeScript, Node.js" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of skills
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          placeholder="e.g., 8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
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

            {/* Location & Work Preferences */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location & Work Preferences
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Country" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="remotePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remote Preference</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="onsite">Onsite Only</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="remote">Remote Only</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="willingToRelocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Willing to Relocate</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Work Authorization */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">Work Authorization</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workAuthorization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Authorization</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="us_citizen">US Citizen</SelectItem>
                          <SelectItem value="green_card">Green Card</SelectItem>
                          <SelectItem value="h1b">H-1B</SelectItem>
                          <SelectItem value="opt">OPT/CPT</SelectItem>
                          <SelectItem value="ead">EAD</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiresSponsorship"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Sponsorship</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
                        placeholder="Any additional notes about this candidate..."
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
              <Button type="submit" disabled={convertToCandidate.isPending}>
                {convertToCandidate.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Convert to Candidate
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
