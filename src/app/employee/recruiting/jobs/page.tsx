'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { jobsListConfig, Job } from '@/configs/entities/jobs.config'

export default function JobsPage() {
  return <EntityListView<Job> config={jobsListConfig} />
}
