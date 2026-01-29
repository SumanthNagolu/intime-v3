'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'
import { USER_TABS, type UserTabId, type UserWorkspaceMode, getNextTab, getPrevTab, isFirstTab, isLastTab, getTabIndex } from '@/lib/users/tabs'
import { useUserWorkspace } from './UserWorkspaceProvider'
import { UserBasicsTab, UserAttributesTab, UserAccessTab, UserRolesTab, UserProfileTab, UserRegionTab, UserAuthorityTab, UserSecurityTab } from './tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Edit, Save, X, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface UserWorkspacePageProps {
  /** Override mode if not using provider */
  modeOverride?: UserWorkspaceMode
}

/**
 * UserWorkspacePage - Unified component for user create/view/edit
 *
 * Features:
 * - Horizontal tab navigation with gold underline
 * - Wizard mode for create with step progression
 * - View/edit mode for existing users
 * - URL-synced tab state
 */
export function UserWorkspacePage({ modeOverride }: UserWorkspacePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: user, mode: contextMode, isEditing, isSaving, setIsEditing, refreshData, triggerSave } = useUserWorkspace()

  const mode = modeOverride || contextMode
  const isCreateMode = mode === 'create'

  // Completed steps tracking for wizard mode
  const [completedSteps, setCompletedSteps] = React.useState<Set<UserTabId>>(new Set())

  // URL parameter name depends on mode
  const urlParam = isCreateMode ? 'step' : 'tab'

  // Get current tab from URL or default to 'basics'
  const currentTab = (searchParams.get(urlParam) as UserTabId) || 'basics'

  // Handle tab change - update URL for deep linking
  const handleTabChange = React.useCallback((tabId: UserTabId) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === 'basics') {
      params.delete(urlParam)
    } else {
      params.set(urlParam, tabId)
    }
    // Preserve edit mode in URL
    if (isEditing && !isCreateMode) {
      params.set('edit', 'true')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams, urlParam, isEditing, isCreateMode])

  // Handle next/back for wizard mode
  const handleNext = React.useCallback(() => {
    const nextTab = getNextTab(currentTab)
    if (nextTab) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentTab]))
      handleTabChange(nextTab.id as UserTabId)
    }
  }, [currentTab, handleTabChange])

  const handleBack = React.useCallback(() => {
    const prevTab = getPrevTab(currentTab)
    if (prevTab) {
      handleTabChange(prevTab.id as UserTabId)
    }
  }, [currentTab, handleTabChange])

  // Handle save - triggers all registered save handlers
  const handleSaveComplete = React.useCallback(async () => {
    try {
      await triggerSave()
      setIsEditing(false)
      refreshData()
      // Remove edit param from URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete('edit')
      router.push(`?${params.toString()}`, { scroll: false })
    } catch (error) {
      // Errors are handled by individual tab save handlers
      console.error('Save error:', error)
    }
  }, [triggerSave, setIsEditing, refreshData, router, searchParams])

  // Handle enter edit mode
  const handleEnterEdit = React.useCallback(() => {
    setIsEditing(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit', 'true')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [setIsEditing, router, searchParams])

  // Handle cancel edit
  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('edit')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [setIsEditing, router, searchParams])

  // Render tab content
  const renderTabContent = () => {
    const tabProps = {
      user,
      mode: isEditing || isCreateMode ? 'edit' as const : 'view' as const,
    }

    switch (currentTab) {
      case 'basics':
        return <UserBasicsTab {...tabProps} />
      case 'attributes':
        return <UserAttributesTab {...tabProps} />
      case 'access':
        return <UserAccessTab {...tabProps} />
      case 'roles':
        return <UserRolesTab {...tabProps} />
      case 'profile':
        return <UserProfileTab {...tabProps} />
      case 'region':
        return <UserRegionTab {...tabProps} />
      case 'authority':
        return <UserAuthorityTab {...tabProps} />
      case 'security':
        return <UserSecurityTab {...tabProps} />
      default:
        return <UserBasicsTab {...tabProps} />
    }
  }

  const currentTabConfig = USER_TABS.find(t => t.id === currentTab)
  const currentTabIndex = getTabIndex(currentTab)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Banner for non-active users (view mode only) */}
      {!isCreateMode && user.status !== 'active' && (
        <div className={cn(
          'rounded-lg p-4 flex items-center gap-3',
          user.status === 'suspended' && 'bg-orange-50 border border-orange-200',
          user.status === 'pending' && 'bg-amber-50 border border-amber-200',
          user.status === 'deactivated' && 'bg-charcoal-50 border border-charcoal-200'
        )}>
          <AlertTriangle className={cn(
            'w-5 h-5',
            user.status === 'suspended' && 'text-orange-600',
            user.status === 'pending' && 'text-amber-600',
            user.status === 'deactivated' && 'text-charcoal-600'
          )} />
          <p className={cn(
            'font-medium',
            user.status === 'suspended' && 'text-orange-800',
            user.status === 'pending' && 'text-amber-800',
            user.status === 'deactivated' && 'text-charcoal-800'
          )}>
            {user.status === 'suspended' && 'This user is currently suspended.'}
            {user.status === 'pending' && 'This user has not yet accepted their invitation.'}
            {user.status === 'deactivated' && 'This user account has been deactivated.'}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-charcoal-200">
        <nav className="flex gap-1">
          {USER_TABS.map((tab, index) => {
            const isActive = tab.id === currentTab
            const isCompleted = completedSteps.has(tab.id as UserTabId)
            const TabIcon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as UserTabId)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all duration-200',
                  isActive
                    ? 'border-gold-500 text-gold-700 bg-gold-50/50'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
                )}
              >
                {/* Step indicator for wizard mode */}
                {isCreateMode && (
                  <span className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full text-xs',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-gold-500 text-white'
                        : 'bg-charcoal-200 text-charcoal-600'
                  )}>
                    {isCompleted ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                )}
                {/* Tab icon for view/edit mode */}
                {!isCreateMode && (
                  <TabIcon className={cn(
                    'w-4 h-4',
                    isActive ? 'text-gold-600' : 'text-charcoal-400'
                  )} />
                )}
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content Header (for view/edit mode) */}
      {!isCreateMode && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900">
              {currentTabConfig?.label}
            </h2>
            <p className="text-sm text-charcoal-500">
              {currentTabConfig?.description}
            </p>
          </div>
          {/* Edit/Save/Cancel buttons */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-hublot-900 hover:bg-hublot-800 text-white"
                  onClick={handleSaveComplete}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnterEdit}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Wizard Header (for create mode) */}
      {isCreateMode && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-charcoal-900">
              Step {currentTabIndex + 1}: {currentTabConfig?.label}
            </h2>
            <p className="text-sm text-charcoal-500">
              {currentTabConfig?.description}
            </p>
          </div>
          <div className="text-sm text-charcoal-500">
            {currentTabIndex + 1} of {USER_TABS.length}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Wizard Navigation (for create mode) */}
      {isCreateMode && (
        <div className="flex items-center justify-between pt-6 border-t border-charcoal-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstTab(currentTab)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            {/* Save Draft button */}
            <Button variant="outline">
              Save Draft
            </Button>

            {/* Next / Create button */}
            {isLastTab(currentTab) ? (
              <Button className="bg-gold-500 hover:bg-gold-600 text-white">
                Create User
              </Button>
            ) : (
              <Button
                className="bg-hublot-900 hover:bg-hublot-800 text-white"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserWorkspacePage
