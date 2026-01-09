'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Edit, Trash2, Building2, Users, MapPin, Shield, ChevronRight } from 'lucide-react'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FullOrgGroupData } from '@/types/admin'
import { GroupBasicsSection } from './sections/GroupBasicsSection'
import { GroupUsersSection } from './sections/GroupUsersSection'
import { GroupRegionsSection } from './sections/GroupRegionsSection'
import { GroupQueuesSection } from './sections/GroupQueuesSection'
import { GroupCodesSection } from './sections/GroupCodesSection'

const GROUP_TYPE_LABELS: Record<string, string> = {
  root: 'Organization',
  division: 'Division',
  branch: 'Branch Office',
  team: 'Team',
  satellite_office: 'Satellite Office',
  producer: 'Producer',
}

const TABS = [
  { id: 'basics', label: 'Basics', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'codes', label: 'Producer Codes', icon: Shield },
  { id: 'queues', label: 'Queues', icon: ChevronRight },
  { id: 'regions', label: 'Regions', icon: MapPin },
] as const

type TabId = typeof TABS[number]['id']

interface GroupDetailClientProps {
  group: FullOrgGroupData
}

export function GroupDetailClient({ group }: GroupDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, setRefreshKey] = useState(0)

  // Get current tab from URL or default to 'basics'
  const currentTab = (searchParams.get('tab') as TabId) || 'basics'

  const handleTabChange = useCallback((tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === 'basics') {
      params.delete('tab')
    } else {
      params.set('tab', tabId)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleMembersChange = useCallback(() => {
    setRefreshKey(k => k + 1)
    router.refresh()
  }, [router])

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Groups', href: '/employee/admin/groups' },
    { label: group.name },
  ]

  const renderTabContent = () => {
    switch (currentTab) {
      case 'basics':
        return <GroupBasicsSection group={group} />
      case 'users':
        return <GroupUsersSection group={group} onMembersChange={handleMembersChange} />
      case 'codes':
        return <GroupCodesSection group={group} />
      case 'queues':
        return <GroupQueuesSection group={group} />
      case 'regions':
        return <GroupRegionsSection group={group} onRegionsChange={handleMembersChange} />
      default:
        return <GroupBasicsSection group={group} />
    }
  }

  return (
    <DashboardShell
      title={`Group: ${group.name}`}
      description={`${GROUP_TYPE_LABELS[group.groupType] ?? group.groupType} group`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Link href={`/employee/admin/groups/${group.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          {group.groupType !== 'root' && (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      }
    >
      <DashboardSection>
        {/* Horizontal Tab Navigation (Guidewire-style) */}
        <div className="border-b border-charcoal-100 mb-6">
          <nav className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-2',
                  currentTab === tab.id
                    ? 'border-gold-600 text-gold-600'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
                )}
              >
                {tab.label}
                {/* Show counts for relevant tabs */}
                {tab.id === 'users' && group.members && (
                  <span className="ml-1 text-xs bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded-full">
                    {group.members.filter(m => m.is_active).length}
                  </span>
                )}
                {tab.id === 'regions' && group.regions && (
                  <span className="ml-1 text-xs bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded-full">
                    {group.regions.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </DashboardSection>
    </DashboardShell>
  )
}







