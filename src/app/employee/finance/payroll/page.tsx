'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { payrollListConfig, PayRun } from '@/configs/entities/payroll.config'

export default function PayrollPage() {
  return <EntityListView<PayRun> config={payrollListConfig} />
}
