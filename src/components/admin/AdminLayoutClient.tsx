'use client'

import { Suspense } from 'react'
import { TopNavigation } from '@/components/navigation/TopNavigation'
import { AdminSidebar } from './AdminSidebar'
import { cn } from '@/lib/utils'

interface AdminLayoutClientProps {
  children: React.ReactNode
  organization: { id: string; name: string }
  groups: Array<{
    id: string
    name: string
    code: string | null
    groupType: string
    parentGroupId: string | null
    hierarchyLevel: number
    hierarchyPath: string | null
    isActive: boolean
    _count?: { members: number }
  }>
}

function AdminLayoutLoading() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="h-16 bg-white border-b border-charcoal-100" />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-white border-r border-charcoal-100 animate-pulse hidden lg:block" />
        <main className="flex-1 min-w-0 overflow-y-auto bg-cream p-6">
          <div className="h-8 w-64 bg-charcoal-100 animate-pulse rounded mb-4" />
          <div className="h-64 w-full bg-charcoal-100 animate-pulse rounded" />
        </main>
      </div>
    </div>
  )
}

function AdminLayoutInner({ children, organization, groups }: AdminLayoutClientProps) {
  return (
    <div className={cn("h-screen flex flex-col overflow-hidden")}>
      <TopNavigation />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-charcoal-100 bg-white overflow-y-auto hidden lg:block">
          <AdminSidebar organization={organization} groups={groups} />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto bg-cream">
          {children}
        </main>
      </div>
    </div>
  )
}

export function AdminLayoutClient(props: AdminLayoutClientProps) {
  return (
    <Suspense fallback={<AdminLayoutLoading />}>
      <AdminLayoutInner {...props} />
    </Suspense>
  )
}
