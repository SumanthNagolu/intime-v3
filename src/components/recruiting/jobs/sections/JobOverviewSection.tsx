'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import {
  MapPin,
  DollarSign,
  Users,
  Clock,
  Building2,
  Briefcase,
  Calendar,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface JobData {
  id: string
  title: string
  status: string
  location: string | null
  is_remote: boolean | null
  hybrid_days: number | null
  job_type: string | null
  positions_count: number | null
  positions_filled: number | null
  rate_min: number | null
  rate_max: number | null
  rate_type: string | null
  priority: string | null
  target_fill_date: string | null
  target_start_date: string | null
  created_at: string
  published_at: string | null
  description: string | null
  account?: { id: string; name: string } | null
}

interface JobOverviewSectionProps {
  job: JobData
  jobId: string
}

// Field definitions for editable cards
const jobDetailsFields: FieldDefinition[] = [
  { key: 'title', label: 'Job Title', type: 'text', required: true },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'job_type', label: 'Job Type', type: 'select', options: [
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'contract_to_hire', label: 'Contract to Hire' },
  ]},
  { key: 'positions_count', label: 'Positions', type: 'number', min: 1 },
  { key: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]},
  { key: 'description', label: 'Description', type: 'textarea' },
]

const rateFields: FieldDefinition[] = [
  { key: 'rate_min', label: 'Min Rate', type: 'currency', currencySymbol: '$' },
  { key: 'rate_max', label: 'Max Rate', type: 'currency', currencySymbol: '$' },
  { key: 'rate_type', label: 'Rate Type', type: 'select', options: [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ]},
]

const dateFields: FieldDefinition[] = [
  { key: 'target_fill_date', label: 'Target Fill Date', type: 'date' },
  { key: 'target_start_date', label: 'Target Start Date', type: 'date' },
]

export function JobOverviewSection({ job, jobId }: JobOverviewSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Mutation for updating job
  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Job updated successfully' })
      utils.ats.jobs.getById.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update job', description: error.message, variant: 'error' })
    },
  })

  // Handler for saving job details
  const handleSaveJobDetails = async (data: Record<string, unknown>) => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      title: data.title as string,
      location: data.location as string,
      jobType: data.job_type as 'full_time' | 'part_time' | 'contract' | 'contract_to_hire',
      positionsCount: data.positions_count as number,
      priority: data.priority as 'low' | 'normal' | 'high' | 'urgent',
      description: data.description as string,
    })
  }

  // Handler for saving rate info
  const handleSaveRates = async (data: Record<string, unknown>) => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      rateMin: data.rate_min as number,
      rateMax: data.rate_max as number,
      rateType: data.rate_type as string,
    })
  }

  // Handler for saving dates
  const handleSaveDates = async (data: Record<string, unknown>) => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      targetFillDate: data.target_fill_date as string,
      targetStartDate: data.target_start_date as string,
    })
  }

  // Calculate days open
  const createdDate = new Date(job.created_at)
  const daysOpen = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Job Info */}
      <div className="col-span-2 space-y-6">
        {/* Job Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500 bg-white p-4 rounded-lg">
          {job.account && (
            <Link
              href={`/employee/recruiting/accounts/${job.account.id}`}
              className="flex items-center gap-1 hover:text-hublot-600"
            >
              <Building2 className="w-4 h-4" />
              {job.account.name}
            </Link>
          )}
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
              {job.is_remote && ' (Remote)'}
              {job.hybrid_days && ` (Hybrid ${job.hybrid_days}d/wk)`}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            {job.job_type?.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Positions</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {job.positions_filled || 0}/{job.positions_count || 1}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Rate Range</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {job.rate_min && job.rate_max
                  ? `$${job.rate_min}-${job.rate_max}`
                  : job.rate_min
                  ? `$${job.rate_min}+`
                  : 'TBD'}
                <span className="text-sm font-normal">/{job.rate_type || 'hr'}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Days Open</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">{daysOpen}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Priority</span>
              </div>
              <div className="mt-1">
                <Badge
                  variant={job.priority === 'urgent' || job.priority === 'high' ? 'destructive' : 'outline'}
                  className="text-base capitalize"
                >
                  {job.priority || 'Normal'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Details - Editable */}
        <EditableInfoCard
          title="Job Details"
          fields={jobDetailsFields}
          data={job as unknown as Record<string, unknown>}
          onSave={handleSaveJobDetails}
          columns={2}
        />
      </div>

      {/* Right Column - Rates & Dates */}
      <div className="space-y-6">
        {/* Rate Information - Editable */}
        <EditableInfoCard
          title="Rate Information"
          fields={rateFields}
          data={job as unknown as Record<string, unknown>}
          onSave={handleSaveRates}
          columns={1}
        />

        {/* Important Dates - Editable */}
        <EditableInfoCard
          title="Important Dates"
          fields={dateFields}
          data={job as unknown as Record<string, unknown>}
          onSave={handleSaveDates}
          columns={1}
        />

        {/* Timeline Info */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </span>
            </div>
            {job.published_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Published</span>
                <span className="font-medium">
                  {format(new Date(job.published_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {job.target_fill_date && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Target Fill</span>
                <span className="font-medium">
                  {format(new Date(job.target_fill_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
