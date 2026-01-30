'use client'

import { Suspense } from 'react'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { EntityListViewSkeleton } from '@/components/pcf/shared'
import { payrollListConfig, type PayRun } from '@/configs/entities/payroll.config'

function PayrollListContent() {
  return <EntityListView<PayRun> config={payrollListConfig} />
}

export default function PayrollPage() {
  return (
    <Suspense fallback={<EntityListViewSkeleton />}>
      <PayrollListContent />
    </Suspense>
  )
}
