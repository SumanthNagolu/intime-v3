'use client'

import { useState } from 'react'
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
  Building2,
  Globe,
  MapPin,
  Users,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'

const convertToAccountSchema = z.object({
  // Company Details
  accountName: z.string().min(1, 'Account name is required').max(200),
  accountType: z.enum(['client', 'prospect', 'partner', 'vendor']),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  employeeCount: z.string().optional(),
  annualRevenue: z.string().optional(),
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  // Relationship
  relationshipType: z.enum(['direct_client', 'prime_vendor', 'subcontractor', 'msp_supplier', 'implementation_partner']),
  accountTier: z.enum(['standard', 'preferred', 'strategic', 'enterprise']),
  // Payment Terms
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'net_90']),
  // Options
  createContact: z.boolean(),
  notes: z.string().optional(),
})

type ConvertToAccountFormValues = z.infer<typeof convertToAccountSchema>

interface ConvertLeadToAccountDialogProps {
  lead: {
    id: string
    company_name?: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    title?: string
    industry?: string
    company_size?: string
    company_city?: string
    company_state?: string
    company_country?: string
    company_website?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (account: { id: string }) => void
}

export function ConvertLeadToAccountDialog({ lead, open, onOpenChange, onSuccess }: ConvertLeadToAccountDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const accountName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
  const contactName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()

  const form = useForm<ConvertToAccountFormValues>({
    resolver: zodResolver(convertToAccountSchema),
    defaultValues: {
      accountName: accountName,
      accountType: 'prospect',
      industry: lead.industry || '',
      website: lead.company_website || '',
      employeeCount: lead.company_size || '',
      city: lead.company_city || '',
      state: lead.company_state || '',
      country: lead.company_country || 'US',
      relationshipType: 'direct_client',
      accountTier: 'standard',
      paymentTerms: 'net_30',
      createContact: true,
      notes: '',
    },
  })

  const convertToAccount = trpc.unifiedContacts.leads.convertToAccount.useMutation({
    onSuccess: (result) => {
      toast.success('Lead converted to account successfully')
      utils.unifiedContacts.leads.list.invalidate()
      utils.unifiedContacts.leads.stats.invalidate()
      utils.companies.list.invalidate()
      onOpenChange(false)
      onSuccess?.(result)
      // Navigate to the new account
      router.push(`/employee/recruiting/accounts/${result.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert lead to account')
    },
  })

  const onSubmit = (data: ConvertToAccountFormValues) => {
    convertToAccount.mutate({
      leadId: lead.id,
      ...data,
    })
  }

  const INDUSTRY_OPTIONS = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Manufacturing',
    'Retail',
    'Professional Services',
    'Government',
    'Education',
    'Energy',
    'Telecommunications',
    'Other',
  ]

  const EMPLOYEE_COUNT_OPTIONS = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1001-5000',
    '5001-10000',
    '10000+',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading flex items-center gap-2">
            <Building2 className="w-5 h-5 text-charcoal-600" />
            <span>Convert Lead to Account</span>
            <ArrowRight className="w-4 h-4 text-charcoal-400" />
            <Badge variant="outline">{accountName}</Badge>
          </DialogTitle>
          <DialogDescription>
            Create a new account from this lead. {contactName && `A contact for ${contactName} will also be created.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRY_OPTIONS.map((industry) => (
                            <SelectItem key={industry} value={industry.toLowerCase().replace(/ /g, '_')}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                          <Input className="pl-9" placeholder="https://example.com" {...field} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Count</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYEE_COUNT_OPTIONS.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $10M - $50M" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
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
            </div>

            {/* Relationship & Terms */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Relationship & Terms
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="relationshipType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct_client">Direct Client</SelectItem>
                          <SelectItem value="prime_vendor">Prime Vendor</SelectItem>
                          <SelectItem value="subcontractor">Subcontractor</SelectItem>
                          <SelectItem value="msp_supplier">MSP Supplier</SelectItem>
                          <SelectItem value="implementation_partner">Implementation Partner</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Tier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="preferred">Preferred</SelectItem>
                          <SelectItem value="strategic">Strategic</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="net_15">Net 15</SelectItem>
                          <SelectItem value="net_30">Net 30</SelectItem>
                          <SelectItem value="net_45">Net 45</SelectItem>
                          <SelectItem value="net_60">Net 60</SelectItem>
                          <SelectItem value="net_90">Net 90</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Options */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Options
              </h4>

              {contactName && (
                <FormField
                  control={form.control}
                  name="createContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Also create contact for {contactName}
                        </FormLabel>
                        <FormDescription>
                          Creates a contact record linked to this account with the lead&apos;s contact information.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this account..."
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
              <Button type="submit" disabled={convertToAccount.isPending}>
                {convertToAccount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Convert to Account
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
