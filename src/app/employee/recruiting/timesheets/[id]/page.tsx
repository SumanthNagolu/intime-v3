'use client'

import { useParams } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { timesheetsDetailConfig, Timesheet } from '@/configs/entities/timesheets.config'

export default function TimesheetDetailPage() {
  const params = useParams()
  const timesheetId = params.id as string

  return (
    <EntityDetailView<Timesheet>
      config={timesheetsDetailConfig}
      entityId={timesheetId}
    />
  )
}
