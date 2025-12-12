'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

const contractSchema = z.object({
  contractName: z.string().min(1, 'Contract name is required').max(300),
  contractNumber: z.string().max(100).optional(),
  contractType: z.enum([
    'msa',
    'nda',
    'sow',
    'amendment',
    'addendum',
    'rate_card_agreement',
    'sla',
    'vendor_agreement',
    'employment',
    'contractor',
    'subcontractor',
    'other',
  ]),
  status: z.enum([
    'draft',
    'pending_review',
    'pending_signature',
    'partially_signed',
    'active',
    'expired',
    'terminated',
    'renewed',
    'superseded',
  ]),
  effectiveDate: z.date().optional(),
  expiryDate: z.date().optional(),
  contractValue: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  autoRenew: z.boolean().default(false),
  renewalNoticeDays: z.number().int().min(0).optional(),
})

type ContractFormData = z.input<typeof contractSchema>

interface ContractFormProps {
  entityType: string
  entityId: string
  contract?: {
    id: string
    contractName: string
    contractNumber: string | null
    contractType: string
    status: string
    effectiveDate: string | null
    expiryDate: string | null
    contractValue: number | null
    currency: string
    autoRenew: boolean
    renewalNoticeDays: number | null
  }
  onSuccess: () => void
  onCancel: () => void
}

const CONTRACT_TYPES = [
  { value: 'msa', label: 'Master Service Agreement (MSA)' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
  { value: 'amendment', label: 'Contract Amendment' },
  { value: 'addendum', label: 'Contract Addendum' },
  { value: 'rate_card_agreement', label: 'Rate Card Agreement' },
  { value: 'sla', label: 'Service Level Agreement (SLA)' },
  { value: 'vendor_agreement', label: 'Vendor Agreement' },
  { value: 'employment', label: 'Employment Agreement' },
  { value: 'contractor', label: 'Contractor Agreement' },
  { value: 'subcontractor', label: 'Subcontractor Agreement' },
  { value: 'other', label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'pending_signature', label: 'Pending Signature' },
  { value: 'partially_signed', label: 'Partially Signed' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'renewed', label: 'Renewed' },
  { value: 'superseded', label: 'Superseded' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
]

/**
 * ContractForm - Form for creating/editing contracts
 *
 * Features:
 * - All contract metadata fields
 * - Date pickers for effective/expiration
 * - Auto-renewal configuration
 * - Notice period settings
 */
export function ContractForm({
  entityType,
  entityId,
  contract,
  onSuccess,
  onCancel,
}: ContractFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractName: contract?.contractName ?? '',
      contractNumber: contract?.contractNumber ?? '',
      contractType: (contract?.contractType as ContractFormData['contractType']) ?? 'msa',
      status: (contract?.status as ContractFormData['status']) ?? 'draft',
      effectiveDate: contract?.effectiveDate ? new Date(contract.effectiveDate) : undefined,
      expiryDate: contract?.expiryDate ? new Date(contract.expiryDate) : undefined,
      contractValue: contract?.contractValue ?? undefined,
      currency: contract?.currency ?? 'USD',
      autoRenew: contract?.autoRenew ?? false,
      renewalNoticeDays: contract?.renewalNoticeDays ?? undefined,
    },
  })

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been successfully created.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create contract.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Contract updated',
        description: 'The contract has been successfully updated.',
      })
      onSuccess()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update contract.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  const onSubmit = (data: ContractFormData) => {
    setIsSubmitting(true)

    if (contract) {
      updateMutation.mutate({
        id: contract.id,
        contractName: data.contractName,
        status: data.status,
        effectiveDate: data.effectiveDate?.toISOString(),
        expiryDate: data.expiryDate?.toISOString(),
        contractValue: data.contractValue,
        currency: data.currency,
        autoRenew: data.autoRenew,
        renewalNoticeDays: data.renewalNoticeDays,
      })
    } else {
      createMutation.mutate({
        entityType,
        entityId,
        contractName: data.contractName,
        contractNumber: data.contractNumber || undefined,
        contractType: data.contractType,
        status: data.status,
        effectiveDate: data.effectiveDate?.toISOString(),
        expiryDate: data.expiryDate?.toISOString(),
        contractValue: data.contractValue,
        currency: data.currency,
        autoRenew: data.autoRenew,
        renewalNoticeDays: data.renewalNoticeDays,
      })
    }
  }

  const effectiveDate = watch('effectiveDate')
  const expiryDate = watch('expiryDate')
  const autoRenew = watch('autoRenew')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-charcoal-900">
          {contract ? 'Edit Contract' : 'Add Contract'}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Contract Name */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="contractName">Contract Name *</Label>
          <Input
            {...register('contractName')}
            placeholder="e.g., Master Service Agreement - Acme Corp"
          />
          {errors.contractName && (
            <p className="text-sm text-red-600">{errors.contractName.message}</p>
          )}
        </div>

        {/* Contract Number */}
        <div className="space-y-2">
          <Label htmlFor="contractNumber">Contract Number</Label>
          <Input
            {...register('contractNumber')}
            placeholder="e.g., MSA-2025-001"
          />
          {errors.contractNumber && (
            <p className="text-sm text-red-600">{errors.contractNumber.message}</p>
          )}
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contractType">Contract Type *</Label>
          <Select
            value={watch('contractType')}
            onValueChange={(value) => setValue('contractType', value as ContractFormData['contractType'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.contractType && (
            <p className="text-sm text-red-600">{errors.contractType.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as ContractFormData['status'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={watch('currency')}
            onValueChange={(value) => setValue('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency..." />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Effective Date */}
        <div className="space-y-2">
          <Label>Effective Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !effectiveDate && 'text-charcoal-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {effectiveDate ? format(effectiveDate, 'MMM d, yyyy') : 'Select date...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={effectiveDate}
                onSelect={(date) => setValue('effectiveDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expiry Date */}
        <div className="space-y-2">
          <Label>Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !expiryDate && 'text-charcoal-400'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'Select date...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={(date) => setValue('expiryDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Contract Value */}
        <div className="space-y-2">
          <Label htmlFor="contractValue">Contract Value</Label>
          <Input
            type="number"
            {...register('contractValue', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.contractValue && (
            <p className="text-sm text-red-600">{errors.contractValue.message}</p>
          )}
        </div>

        {/* Auto Renew */}
        <div className="space-y-2">
          <Label>Auto-Renewal</Label>
          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={autoRenew}
              onCheckedChange={(checked) => setValue('autoRenew', checked)}
            />
            <span className="text-sm text-charcoal-600">
              {autoRenew ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Renewal Notice Days */}
        <div className="space-y-2">
          <Label htmlFor="renewalNoticeDays">Renewal Notice (Days)</Label>
          <Input
            type="number"
            {...register('renewalNoticeDays', { valueAsNumber: true })}
            placeholder="30"
          />
          <p className="text-xs text-charcoal-500">
            Days before expiry to notify about renewal
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-charcoal-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {contract ? 'Update' : 'Create'} Contract
        </Button>
      </div>
    </form>
  )
}
