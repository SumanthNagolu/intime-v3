'use client'

import { EntityNavigationProvider } from '@/lib/navigation/EntityNavigationContext'
import { ReactNode } from 'react'

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <EntityNavigationProvider>
      {children}
    </EntityNavigationProvider>
  )
}
