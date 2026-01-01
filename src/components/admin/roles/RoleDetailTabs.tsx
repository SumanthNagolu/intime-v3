'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RoleBasicsTab } from './tabs/RoleBasicsTab'
import { RoleUsersTab } from './tabs/RoleUsersTab'
import type { FullRoleData } from '@/types/admin'

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'users', label: 'Users' },
] as const

type TabId = (typeof TABS)[number]['id']

interface RoleDetailTabsProps {
  role: FullRoleData
}

export function RoleDetailTabs({ role }: RoleDetailTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabId) || 'basics'

  const handleTabChange = (tabId: TabId) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs */}
      <div className="border-b border-charcoal-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'py-3 px-1 border-b-2 text-sm font-medium transition-colors duration-200',
                currentTab === tab.id
                  ? 'border-gold-500 text-gold-600'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
              )}
            >
              {tab.label}
              {tab.id === 'users' && role.users.length > 0 && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs',
                    currentTab === tab.id
                      ? 'bg-gold-100 text-gold-700'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {role.users.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {currentTab === 'basics' && <RoleBasicsTab role={role} />}
        {currentTab === 'users' && <RoleUsersTab users={role.users} />}
      </div>
    </div>
  )
}
