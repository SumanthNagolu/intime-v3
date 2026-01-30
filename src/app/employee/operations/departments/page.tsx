'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { departmentsListConfig, Department } from '@/configs/entities/departments.config'

export default function DepartmentsPage() {
  return <EntityListView<Department> config={departmentsListConfig} />
}
