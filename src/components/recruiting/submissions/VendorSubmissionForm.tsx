'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Loader2,
  DollarSign,
  Building2,
  User,
  FileCheck,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Form validation schema
const vendorSubmissionSchema = z.object({
  // Vendor info
  vendorCompanyId: z.string().uuid('Please select a vendor company'),
  vendorContactId: z.string().uuid().optional(),

  // Candidate info
  candidateContactId: z.string().uuid('Please select a candidate').optional(),
  candidateFirstName: z.string().min(1, 'First name is required').optional(),
  candidateLastName: z.string().min(1, 'Last name is required').optional(),
  candidateEmail: z.string().email('Valid email required').optional(),
  candidatePhone: z.string().optional(),

  // Rates
  payRate: z.number().positive('Pay rate must be positive'),
  billRate: z.number().positive('Bill rate must be positive'),
  rateNotes: z.string().max(500).optional(),

  // RTR
  hasRtr: z.boolean(),
  rtrType: z.enum(['standard', 'exclusive', 'non_exclusive', 'verbal', 'written']).optional(),
  rtrValidityHours: z.number().min(1).max(720).optional(),

  // Additional info
  submissionNotes: z.string().max(2000).optional(),
})

type VendorSubmissionFormData = z.infer<typeof vendorSubmissionSchema>

interface VendorSubmissionFormProps {
  jobId: string
  jobTitle?: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

const RTR_TYPES = [
  { value: 'standard', label: 'Standard', description: '72 hours validity' },
  { value: 'exclusive', label: 'Exclusive', description: 'Sole representation' },
  { value: 'non_exclusive', label: 'Non-Exclusive', description: 'Multiple vendors allowed' },
  { value: 'verbal', label: 'Verbal', description: 'Phone confirmation' },
  { value: 'written', label: 'Written', description: 'Signed document' },
] as const

export function VendorSubmissionForm({
  jobId,
  jobTitle,
  onSuccess,
  onCancel,
  className,
}: VendorSubmissionFormProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'vendor' | 'candidate' | 'rates' | 'review'>('vendor')
  const [isNewCandidate, setIsNewCandidate] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<VendorSubmissionFormData>({
    resolver: zodResolver(vendorSubmissionSchema),
    defaultValues: {
      hasRtr: false,
      rtrType: 'standard',
      rtrValidityHours: 72,
      payRate: 0,
      billRate: 0,
    },
    mode: 'onChange',
  })

  const payRate = watch('payRate')
  const billRate = watch('billRate')
  const hasRtr = watch('hasRtr')
  const vendorCompanyId = watch('vendorCompanyId')
  const candidateContactId = watch('candidateContactId')
  const rtrType = watch('rtrType')

  // Calculate margin
  const marginAmount = billRate - payRate
  const marginPercent = billRate > 0 ? ((marginAmount / billRate) * 100).toFixed(1) : '0.0'

  // Fetch vendor companies
  const { data: vendorCompanies, isLoading: vendorsLoading } = trpc.bench.vendors.list.useQuery({
    status: 'active',
    limit: 100,
  })

  // Fetch contacts (candidates)
  const { data: contacts, isLoading: contactsLoading } = trpc.crm.contacts.list.useQuery({
    type: 'candidate',
    limit: 100,
  })

  // Create submission mutation
  const createSubmissionMutation = trpc.ats.submissions.create.useMutation({
    onSuccess: async (data) => {
      // If RTR was marked, obtain it
      if (hasRtr && rtrType) {
        try {
          const contactId = candidateContactId || data.candidate?.id
          if (contactId) {
            await obtainRtrMutation.mutateAsync({
              submissionId: data.id,
              contactId,
              rtrType,
              validityHours: watch('rtrValidityHours') || 72,
            })
          }
        } catch {
          // RTR obtaining failed but submission succeeded
          toast({
            title: 'Submission created',
            description: 'Note: RTR tracking could not be created automatically.',
            variant: 'default',
          })
        }
      }

      toast({
        title: 'Vendor submission created',
        description: `Candidate has been added to the pipeline for ${jobTitle || 'the job'}`,
      })
      reset()
      setStep('vendor')
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // RTR mutation
  const obtainRtrMutation = trpc.ats.submissions.obtainRtr.useMutation()

  const onSubmit = (data: VendorSubmissionFormData) => {
    createSubmissionMutation.mutate({
      jobId,
      candidateId: data.candidateContactId || '',
      status: 'screening',
    })
  }

  const handleClose = () => {
    reset()
    setStep('vendor')
    onCancel?.()
  }

  const canProceedFromVendor = !!vendorCompanyId
  const canProceedFromCandidate = isNewCandidate
    ? watch('candidateFirstName') && watch('candidateLastName') && watch('candidateEmail')
    : !!candidateContactId
  const canProceedFromRates = payRate > 0 && billRate > 0 && billRate >= payRate

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gold-500" />
          Vendor Submission
        </CardTitle>
        {jobTitle && <p className="text-sm text-charcoal-500">Adding candidate to: {jobTitle}</p>}
      </CardHeader>

      <CardContent>
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-4 mb-6">
          {['vendor', 'candidate', 'rates', 'review'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s
                    ? 'bg-hublot-900 text-white'
                    : ['vendor', 'candidate', 'rates', 'review'].indexOf(step) > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {['vendor', 'candidate', 'rates', 'review'].indexOf(step) > i ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    ['vendor', 'candidate', 'rates', 'review'].indexOf(step) > i
                      ? 'bg-green-400'
                      : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Vendor Selection */}
          {step === 'vendor' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Select Vendor Company
              </h3>

              <div className="space-y-2">
                <Label htmlFor="vendorCompanyId">Vendor Company *</Label>
                <Select
                  value={vendorCompanyId}
                  onValueChange={(value) => setValue('vendorCompanyId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={vendorsLoading ? 'Loading...' : 'Select vendor company'} />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorCompanies?.items?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vendorCompanyId && (
                  <p className="text-sm text-red-500">{errors.vendorCompanyId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendorContactId">Vendor Contact (Optional)</Label>
                <Input
                  id="vendorContactId"
                  {...register('vendorContactId')}
                  placeholder="Contact person at vendor company"
                />
              </div>
            </div>
          )}

          {/* Step 2: Candidate Info */}
          {step === 'candidate' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidate Information
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <Button
                  type="button"
                  variant={!isNewCandidate ? 'default' : 'outline'}
                  onClick={() => setIsNewCandidate(false)}
                  size="sm"
                >
                  Select Existing
                </Button>
                <Button
                  type="button"
                  variant={isNewCandidate ? 'default' : 'outline'}
                  onClick={() => setIsNewCandidate(true)}
                  size="sm"
                >
                  Enter New
                </Button>
              </div>

              {!isNewCandidate ? (
                <div className="space-y-2">
                  <Label htmlFor="candidateContactId">Select Candidate *</Label>
                  <Select
                    value={candidateContactId}
                    onValueChange={(value) => setValue('candidateContactId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={contactsLoading ? 'Loading...' : 'Select candidate'} />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts?.items?.map((contact: { id: string; first_name?: string; last_name?: string; email?: string }) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {`${contact.first_name || ''} ${contact.last_name || ''}`.trim()} - {contact.email || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateFirstName">First Name *</Label>
                      <Input
                        id="candidateFirstName"
                        {...register('candidateFirstName')}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidateLastName">Last Name *</Label>
                      <Input
                        id="candidateLastName"
                        {...register('candidateLastName')}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateEmail">Email *</Label>
                      <Input
                        id="candidateEmail"
                        type="email"
                        {...register('candidateEmail')}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="candidatePhone">Phone</Label>
                      <Input
                        id="candidatePhone"
                        {...register('candidatePhone')}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Rates & RTR */}
          {step === 'rates' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rates & RTR
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate ($/hr) *</Label>
                  <Input
                    id="payRate"
                    type="number"
                    step="0.01"
                    {...register('payRate', { valueAsNumber: true })}
                    placeholder="75.00"
                  />
                  {errors.payRate && (
                    <p className="text-sm text-red-500">{errors.payRate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate ($/hr) *</Label>
                  <Input
                    id="billRate"
                    type="number"
                    step="0.01"
                    {...register('billRate', { valueAsNumber: true })}
                    placeholder="95.00"
                  />
                  {errors.billRate && (
                    <p className="text-sm text-red-500">{errors.billRate.message}</p>
                  )}
                </div>
              </div>

              {/* Margin Preview */}
              <Card className="bg-cream">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-charcoal-500">Margin</span>
                      <div className="text-lg font-bold text-charcoal-900">
                        ${marginAmount.toFixed(2)}/hr ({marginPercent}%)
                      </div>
                    </div>
                    <Badge
                      variant={
                        parseFloat(marginPercent) >= 20
                          ? 'default'
                          : parseFloat(marginPercent) >= 15
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {parseFloat(marginPercent) >= 20
                        ? 'Good'
                        : parseFloat(marginPercent) >= 15
                        ? 'OK'
                        : 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* RTR Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="hasRtr"
                    checked={hasRtr}
                    onCheckedChange={(checked) => setValue('hasRtr', checked === true)}
                  />
                  <Label htmlFor="hasRtr" className="flex items-center gap-2 cursor-pointer">
                    <FileCheck className="w-4 h-4" />
                    RTR (Right to Represent) Obtained
                  </Label>
                </div>

                {hasRtr && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label>RTR Type</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {RTR_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setValue('rtrType', type.value)}
                            className={cn(
                              'p-2 rounded-lg border text-left text-sm transition-colors',
                              rtrType === type.value
                                ? 'border-hublot-900 bg-hublot-50'
                                : 'border-charcoal-200 hover:border-charcoal-300'
                            )}
                          >
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-charcoal-500">{type.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rtrValidityHours" className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Validity (hours)
                      </Label>
                      <Input
                        id="rtrValidityHours"
                        type="number"
                        {...register('rtrValidityHours', { valueAsNumber: true })}
                        placeholder="72"
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rateNotes">Rate Negotiation Notes</Label>
                <Textarea
                  id="rateNotes"
                  {...register('rateNotes')}
                  placeholder="Any notes about rate negotiations..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Review Submission</h3>

              <div className="bg-cream rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Vendor</span>
                  <span className="font-medium text-charcoal-900">
                    {vendorCompanies?.items?.find((c) => c.id === vendorCompanyId)?.name || 'Selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Candidate</span>
                  <span className="font-medium text-charcoal-900">
                    {isNewCandidate
                      ? `${watch('candidateFirstName')} ${watch('candidateLastName')}`
                      : (() => {
                          const c = contacts?.items?.find((c: { id: string }) => c.id === candidateContactId) as { id: string; first_name?: string; last_name?: string } | undefined
                          return c ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : 'Selected'
                        })()}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3" />
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Pay Rate</span>
                  <span className="font-medium text-charcoal-900">${payRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Bill Rate</span>
                  <span className="font-medium text-charcoal-900">${billRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Margin</span>
                  <span className="font-medium text-green-600">
                    ${marginAmount.toFixed(2)}/hr ({marginPercent}%)
                  </span>
                </div>
                {hasRtr && (
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-600">RTR</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      {RTR_TYPES.find((t) => t.value === rtrType)?.label}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionNotes">Additional Notes</Label>
                <Textarea
                  id="submissionNotes"
                  {...register('submissionNotes')}
                  placeholder="Any additional information about this vendor submission..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {step !== 'vendor' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const steps = ['vendor', 'candidate', 'rates', 'review'] as const
                  const currentIndex = steps.indexOf(step)
                  if (currentIndex > 0) setStep(steps[currentIndex - 1])
                }}
              >
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step !== 'review' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const steps = ['vendor', 'candidate', 'rates', 'review'] as const
                    const currentIndex = steps.indexOf(step)
                    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1])
                  }}
                  disabled={
                    (step === 'vendor' && !canProceedFromVendor) ||
                    (step === 'candidate' && !canProceedFromCandidate) ||
                    (step === 'rates' && !canProceedFromRates)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createSubmissionMutation.isPending}
                >
                  {createSubmissionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Submission'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
