'use client'

import { trpc } from '@/lib/trpc/client'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import { useToast } from '@/components/ui/use-toast'
import type { FullJob } from '@/types/job'

interface JobDetailsCardProps {
  job: FullJob
  jobId: string
}

const jobDetailsFields: FieldDefinition[] = [
  { key: 'title', label: 'Job Title', type: 'text', required: true },
  { key: 'location', label: 'Location', type: 'text' },
  {
    key: 'job_type',
    label: 'Job Type',
    type: 'select',
    options: [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'contract', label: 'Contract' },
      { value: 'contract_to_hire', label: 'Contract to Hire' },
    ],
  },
  { key: 'positions_count', label: 'Positions', type: 'number', min: 1 },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    key: 'urgency',
    label: 'Urgency',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  { key: 'sla_days', label: 'SLA (Days)', type: 'number', min: 1, max: 365 },
  { key: 'description', label: 'Description', type: 'textarea' },
]

export function JobDetailsCard({ job, jobId }: JobDetailsCardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Job details updated successfully' })
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update job', description: error.message, variant: 'error' })
    },
  })

  const handleSave = async (data: Record<string, unknown>) => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      title: data.title as string,
      location: data.location as string,
      positionsCount: data.positions_count as number,
      priority: data.priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
      urgency: data.urgency as 'low' | 'medium' | 'high' | 'critical' | undefined,
      slaDays: data.sla_days as number | undefined,
      description: data.description as string,
    })
  }

  return (
    <EditableInfoCard
      title="Job Details"
      fields={jobDetailsFields}
      data={job as unknown as Record<string, unknown>}
      onSave={handleSave}
      columns={2}
    />
  )
}
