'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { submissionsListConfig, Submission } from '@/configs/entities/submissions.config'
import type { ListViewVariant } from '@/configs/entities/types'

// My Space variant - shows only my submissions
const mySpaceVariant: ListViewVariant = {
  title: 'My Submissions',
  description: 'Submissions assigned to you',
  // In future: presetFilters: { owner: 'me' }
}

export default function MySubmissionsPage() {
  return <EntityListView<Submission> config={submissionsListConfig} variant={mySpaceVariant} />
}
