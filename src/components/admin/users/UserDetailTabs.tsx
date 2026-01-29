'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { FullUserData } from '@/types/admin'
import { UserBasicsTab } from './tabs/UserBasicsTab'
import { UserAttributesTab } from './tabs/UserAttributesTab'
import { UserAccessTab } from './tabs/UserAccessTab'
import { UserRolesTab } from './tabs/UserRolesTab'
import { UserProfileTab } from './tabs/UserProfileTab'
import { UserRegionTab } from './tabs/UserRegionTab'
import { UserAuthorityTab } from './tabs/UserAuthorityTab'
import { UserSecurityTab } from './tabs/UserSecurityTab'

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'access', label: 'Access' },
  { id: 'roles', label: 'Roles' },
  { id: 'profile', label: 'Profile' },
  { id: 'region', label: 'Region' },
  { id: 'authority', label: 'Authority' },
  { id: 'security', label: 'Security' },
] as const

type TabId = typeof TABS[number]['id']

interface UserDetailTabsProps {
  user: FullUserData
}

/**
 * User Detail Tabs (Guidewire-style)
 *
 * 8 horizontal tabs:
 * 1. Basics - Name, Account, Status, Contact sections
 * 2. Attributes - Custom attributes table
 * 3. Access - Security zones, access levels
 * 4. Roles - Assigned roles with Add/Remove
 * 5. Profile - Avatar, bio, preferences
 * 6. Region - Geographic assignments
 * 7. Authority - Authority limits, approvals
 * 8. Security - 2FA, password, sessions, login history
 */
export function UserDetailTabs({ user }: UserDetailTabsProps) {
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
        return <UserBasicsTab user={user} />
      case 'attributes':
        return <UserAttributesTab user={user} />
      case 'access':
        return <UserAccessTab user={user} />
      case 'roles':
        return <UserRolesTab user={user} />
      case 'profile':
        return <UserProfileTab user={user} />
      case 'region':
        return <UserRegionTab user={user} />
      case 'authority':
        return <UserAuthorityTab user={user} />
      case 'security':
        return <UserSecurityTab user={user} />
      default:
        return <UserBasicsTab user={user} />
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
