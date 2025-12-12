'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { timesheetsListConfig, Timesheet } from '@/configs/entities/timesheets.config'

export default function TimesheetsPage() {
  return <EntityListView<Timesheet> config={timesheetsListConfig} />
}
