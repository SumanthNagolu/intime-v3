'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { jobsListConfig, Job } from '@/configs/entities/jobs.config'
import type { ListViewVariant } from '@/configs/entities/types'

// My Space variant - shows only my jobs
const mySpaceVariant: ListViewVariant = {
  title: 'My Jobs',
  description: 'Jobs assigned to you',
  // In future: presetFilters: { owner: 'me' }
}

export default function MyJobsPage() {
  return <EntityListView<Job> config={jobsListConfig} variant={mySpaceVariant} />
}
