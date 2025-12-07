'use client'

import { use } from 'react'
import { HotlistDetailPage } from '@/components/recruiting/hotlists'

export default function TalentHotlistDetailRoute({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <HotlistDetailPage hotlistId={id} />
}
