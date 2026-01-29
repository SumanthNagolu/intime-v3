'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { submissionsListConfig, Submission } from '@/configs/entities/submissions.config'
import type { ListViewVariant } from '@/configs/entities/types'

// Team variant - shows all team submissions with Assigned To column
const teamVariant: ListViewVariant = {
  title: 'Team Submissions',
  description: 'All submissions from team members',
  // In future: presetFilters: { scope: 'team' }
}

export default function TeamSubmissionsPage() {
  return <EntityListView<Submission> config={submissionsListConfig} variant={teamVariant} />
}
