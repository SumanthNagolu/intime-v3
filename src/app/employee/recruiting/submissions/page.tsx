'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { submissionsListConfig, Submission } from '@/configs/entities/submissions.config'

export default function SubmissionsPage() {
  return <EntityListView<Submission> config={submissionsListConfig} />
}
