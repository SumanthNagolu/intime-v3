'use client'

import { use } from 'react'
import { TalentDetailPage } from '@/components/recruiting/talent/TalentDetailPage'

export default function TalentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return <TalentDetailPage talentId={resolvedParams.id} />
}
