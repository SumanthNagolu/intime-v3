'use client'

import * as React from 'react'
import { useEffect, useCallback } from 'react'
import { X, Pencil, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GWTabs, GWTabContent, GWTabPanel, type GWTab } from '@/components/ui/gw-tabs'

export interface DetailTab {
  id: string
  label: string
  content: React.ReactNode
  badge?: number | string
}

export interface ListDetailPanelProps<T = unknown> {
  /** Whether the panel is currently open */
  isOpen: boolean
  /** The currently selected item */
  selectedItem: T | null
  /** Callback when panel is closed */
  onClose: () => void
  /** Array of tab configurations */
  tabs: DetailTab[]
  /** Currently active tab ID */
  activeTab: string
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void
  /** Callback when Edit button is clicked */
  onEdit?: () => void
  /** Whether currently in edit mode */
  isEditing?: boolean
  /** Whether saving is in progress */
  isSaving?: boolean
  /** Callback when save is requested */
  onSave?: () => void
  /** Callback when cancel is requested */
  onCancel?: () => void
  /** Panel title */
  title: string
  /** Panel subtitle */
  subtitle?: string
  /** Additional header actions */
  headerActions?: React.ReactNode
  /** Custom class name */
  className?: string
}

/**
 * ListDetailPanel - Guidewire-style bottom detail panel
 * 
 * Displays a tabbed detail view below a list when a row is selected.
 * 
 * Features:
 * - Appears below the list (not slide-in from right)
 * - Tabs for different detail sections
 * - Edit button at panel header level
 * - Collapse/expand animation
 * - Escape key to close
 * 
 * Based on Guidewire patterns:
 * - account-contacts-1.png (list + bottom detail)
 * - account-contacts-2.png (tabs in detail)
 * - policy-vehicles.png (vehicle details below list)
 */
export function ListDetailPanel<T>({
  isOpen,
  selectedItem: _selectedItem,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  onEdit,
  isEditing = false,
  isSaving = false,
  onSave,
  onCancel,
  title,
  subtitle,
  headerActions,
  className,
}: ListDetailPanelProps<T>) {
  // Handle escape key to close panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isEditing) {
        onClose()
      }
    },
    [isOpen, isEditing, onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen) return null

  // Convert DetailTab[] to GWTab[]
  const gwTabs: GWTab[] = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    badge: tab.badge,
  }))

  return (
    <div
      className={cn(
        'border-t border-charcoal-200 bg-white',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-100 bg-charcoal-50">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-charcoal-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-charcoal-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {/* Edit/Save/Cancel buttons */}
          {onEdit && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-charcoal-600 hover:text-charcoal-900"
            >
              <Pencil className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </>
          )}
          {/* Custom header actions */}
          {headerActions}
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-charcoal-400 hover:text-charcoal-600"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close panel</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <GWTabs
          tabs={gwTabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>

      {/* Tab Content - no max-height, flows with main page scroll */}
      <GWTabContent className="px-4 pb-4">
        {tabs.map((tab) => (
          <GWTabPanel key={tab.id} id={tab.id} activeTab={activeTab}>
            {tab.content}
          </GWTabPanel>
        ))}
      </GWTabContent>
    </div>
  )
}

export default ListDetailPanel








