'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { FullGroupData } from '@/types/admin'
import { GroupBasicsTab } from './tabs/GroupBasicsTab'
import { GroupUsersTab } from './tabs/GroupUsersTab'
import { GroupCodesTab } from './tabs/GroupCodesTab'
import { GroupQueuesTab } from './tabs/GroupQueuesTab'
import { GroupRegionsTab } from './tabs/GroupRegionsTab'

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'users', label: 'Users' },
  { id: 'codes', label: 'Producer Codes' },
  { id: 'queues', label: 'Queues' },
  { id: 'regions', label: 'Regions' },
] as const

type TabId = typeof TABS[number]['id']

interface GroupDetailTabsProps {
  group: FullGroupData
  onMembersChange?: () => void
}

/**
 * Group Detail Tabs (Guidewire-style)
 *
 * 5 horizontal tabs:
 * 1. Basics - Group Info, Contact, Address, Management sections
 * 2. Users - Members with Add/Remove
 * 3. Producer Codes - Producer codes list (placeholder)
 * 4. Queues - Work queues (placeholder)
 * 5. Regions - Geographic coverage
 */
export function GroupDetailTabs({ group, onMembersChange }: GroupDetailTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const renderTabContent = () => {
    switch (currentTab) {
      case 'basics':
        return <GroupBasicsTab group={group} />
      case 'users':
        return <GroupUsersTab group={group} onMembersChange={onMembersChange} />
      case 'codes':
        return <GroupCodesTab group={group} />
      case 'queues':
        return <GroupQueuesTab group={group} />
      case 'regions':
        return <GroupRegionsTab group={group} />
      default:
        return <GroupBasicsTab group={group} />
    }
  }

  return (
    <div>
      {/* Horizontal Tab Navigation */}
      <div className="border-b border-charcoal-100 mb-6">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200',
                currentTab === tab.id
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
              )}
            >
              {tab.label}
              {/* Show counts for relevant tabs */}
              {tab.id === 'users' && group.members && (
                <span className="ml-1.5 text-xs text-charcoal-400">
                  ({group.members.filter(m => m.is_active).length})
                </span>
              )}
              {tab.id === 'regions' && group.regions && (
                <span className="ml-1.5 text-xs text-charcoal-400">
                  ({group.regions.length})
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
    </div>
  )
}
