'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { timesheetsListConfig, type Timesheet } from '@/configs/entities/timesheets.config'

function TimesheetsListContent() {
  return <EntityListView<Timesheet> config={timesheetsListConfig} />
}

export default function TimesheetsPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <TimesheetsListContent />
    </Suspense>
  )
}
