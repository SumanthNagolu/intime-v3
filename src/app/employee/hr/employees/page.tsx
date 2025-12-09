'use client'

import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { employeesListConfig, Employee } from '@/configs/entities/employees.config'

export default function EmployeesPage() {
  return <EntityListView<Employee> config={employeesListConfig} />
}
