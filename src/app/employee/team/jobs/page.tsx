'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { jobsListConfig, Job } from '@/configs/entities/jobs.config'
import type { ListViewVariant } from '@/configs/entities/types'

// Team variant - shows all team jobs with Owner column visible
const teamVariant: ListViewVariant = {
  title: 'Team Jobs',
  description: 'All jobs assigned to team members',
  // In future: presetFilters: { scope: 'team' }
}

export default function TeamJobsPage() {
  return <EntityListView<Job> config={jobsListConfig} variant={teamVariant} />
}
