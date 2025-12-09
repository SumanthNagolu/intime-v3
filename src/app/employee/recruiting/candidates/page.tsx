'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { candidatesListConfig, Candidate } from '@/configs/entities/candidates.config'

export default function CandidatesPage() {
  return <EntityListView<Candidate> config={candidatesListConfig} />
}
