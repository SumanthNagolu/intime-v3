'use client'

import { trpc } from '@/lib/trpc/client'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import { useToast } from '@/components/ui/use-toast'
import type { FullJob } from '@/types/job'

interface CompensationCardProps {
  job: FullJob
  jobId: string
}

const compensationFields: FieldDefinition[] = [
  { key: 'rate_min', label: 'Min Rate', type: 'currency', currencySymbol: '$' },
  { key: 'rate_max', label: 'Max Rate', type: 'currency', currencySymbol: '$' },
  {
    key: 'rate_type',
    label: 'Rate Type',
    type: 'select',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'annual', label: 'Annual' },
    ],
  },
  {
    key: 'currency',
    label: 'Currency',
    type: 'select',
    options: [
      { value: 'USD', label: 'USD ($)' },
      { value: 'EUR', label: 'EUR (€)' },
      { value: 'GBP', label: 'GBP (£)' },
      { value: 'CAD', label: 'CAD ($)' },
      { value: 'AUD', label: 'AUD ($)' },
      { value: 'INR', label: 'INR (₹)' },
    ],
  },
  { key: 'target_fill_date', label: 'Target Fill Date', type: 'date' },
  { key: 'target_start_date', label: 'Target Start Date', type: 'date' },
  { key: 'target_end_date', label: 'Target End Date', type: 'date' },
  { key: 'posted_date', label: 'Posted Date', type: 'date' },
]

export function CompensationCard({ job, jobId }: CompensationCardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Compensation updated successfully' })
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'error' })
    },
  })

  const handleSave = async (data: Record<string, unknown>) => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      rateMin: data.rate_min as number,
      rateMax: data.rate_max as number,
      rateType: data.rate_type as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual' | undefined,
      currency: data.currency as string | undefined,
      targetFillDate: data.target_fill_date as string,
      targetStartDate: data.target_start_date as string,
      targetEndDate: data.target_end_date as string,
    })
  }

  return (
    <EditableInfoCard
      title="Compensation & Timeline"
      fields={compensationFields}
      data={job as unknown as Record<string, unknown>}
      onSave={handleSave}
      columns={2}
    />
  )
}
