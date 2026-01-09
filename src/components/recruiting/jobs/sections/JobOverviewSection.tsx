'use client'

import { CollapsibleSection } from '@/components/ui/collapsible-section'
import {
  MapPin,
  DollarSign,
  Users,
  Building2,
  FileText,
  Target,
} from 'lucide-react'
import { JobDetailsCard } from './cards/JobDetailsCard'
import { CompensationCard } from './cards/CompensationCard'
import { RequirementsCard } from './cards/RequirementsCard'
import { LocationsCard } from './cards/LocationsCard'
import { ClientCard } from './cards/ClientCard'
import { HiringTeamCard } from './cards/HiringTeamCard'
import type { FullJob } from '@/types/job'

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

export function JobOverviewSection({ job, jobId }: JobOverviewSectionProps) {
  return (
    <div className="space-y-5">
      {/* Hiring Team - Full Width at Top */}
      <CollapsibleSection title="Hiring Team" icon={Users} defaultOpen={true}>
        <HiringTeamCard job={job as unknown as FullJob} jobId={jobId} />
      </CollapsibleSection>

      {/* 2-Column Layout for Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Left Column - Job Info */}
        <div className="space-y-5">
          {/* Job Details */}
          <CollapsibleSection title="Job Details" icon={FileText} defaultOpen={true}>
            <JobDetailsCard job={job as unknown as FullJob} jobId={jobId} />
          </CollapsibleSection>

          {/* Compensation & Timeline */}
          <CollapsibleSection title="Compensation & Timeline" icon={DollarSign} defaultOpen={true}>
            <CompensationCard job={job as unknown as FullJob} jobId={jobId} />
          </CollapsibleSection>

          {/* Locations */}
          <CollapsibleSection title="Locations" icon={MapPin} defaultOpen={true}>
            <LocationsCard jobId={jobId} />
          </CollapsibleSection>
        </div>

        {/* Right Column - Requirements & Client */}
        <div className="space-y-5">
          {/* Requirements */}
          <CollapsibleSection title="Requirements" icon={Target} defaultOpen={true}>
            <RequirementsCard job={job as unknown as FullJob} jobId={jobId} />
          </CollapsibleSection>

          {/* Client & Fees */}
          <CollapsibleSection title="Client & Fees" icon={Building2} defaultOpen={true}>
            <ClientCard job={job as unknown as FullJob} jobId={jobId} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
