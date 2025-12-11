'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { interviewsListConfig, Interview } from '@/configs/entities/interviews.config'

export default function InterviewsPage() {
  return <EntityListView<Interview> config={interviewsListConfig} />
}




