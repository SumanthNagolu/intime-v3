'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useAccountWorkspace } from './account/AccountWorkspaceProvider'
import { AccountHeader } from './account/AccountHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Section components (implemented in Phase 3)
import { AccountOverviewSection } from './account/sections/AccountOverviewSection'
import { AccountContactsSection } from './account/sections/AccountContactsSection'
import { AccountJobsSection } from './account/sections/AccountJobsSection'
import { AccountPlacementsSection } from './account/sections/AccountPlacementsSection'
import { AccountAddressesSection } from './account/sections/AccountAddressesSection'
import { AccountMeetingsSection } from './account/sections/AccountMeetingsSection'
import { AccountEscalationsSection } from './account/sections/AccountEscalationsSection'
import { AccountRelatedAccountsSection } from './account/sections/AccountRelatedAccountsSection'
import { AccountActivitiesSection } from './account/sections/AccountActivitiesSection'
import { AccountNotesSection } from './account/sections/AccountNotesSection'
import { AccountDocumentsSection } from './account/sections/AccountDocumentsSection'
import { AccountHistorySection } from './account/sections/AccountHistorySection'

// Dialogs
import { LinkAccountDialog } from '@/components/recruiting/accounts/LinkAccountDialog'

export interface AccountWorkspaceProps {
  onAction?: (action: string) => void
}

type AccountSection =
  | 'summary'
  | 'contacts'
  | 'jobs'
  | 'placements'
  | 'addresses'
  | 'meetings'
  | 'escalations'
  | 'related_accounts'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * AccountWorkspace - Main workspace component for Account detail view
 *
 * This is the REFERENCE implementation for all entity workspaces.
 *
 * Key patterns:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Simple, readable code (no config objects)
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function AccountWorkspace({ onAction }: AccountWorkspaceProps = {}) {
  const { data } = useAccountWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dialog state
  const [linkAccountDialogOpen, setLinkAccountDialogOpen] = React.useState(false)

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as AccountSection

  // Handle section change - update URL for deep linking
  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle warning click - navigate to relevant section/field
  const handleWarningClick = React.useCallback((warning: WorkspaceWarning) => {
    if (warning.section) {
      handleSectionChange(warning.section)
    }
    // TODO: Focus on specific field if warning.field is set
  }, [handleSectionChange])

  // Listen for openAccountDialog custom events
  React.useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string; accountId: string }>) => {
      if (event.detail.dialogId === 'linkAccount' && event.detail.accountId === data.account.id) {
        setLinkAccountDialogOpen(true)
      }
    }

    window.addEventListener('openAccountDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openAccountDialog', handleOpenDialog as EventListener)
    }
  }, [data.account.id])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <AccountHeader account={data.account} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'summary' && (
        <AccountOverviewSection
          account={data.account}
          activities={data.activities}
          jobs={data.jobs}
          contacts={data.contacts}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'contacts' && (
        <AccountContactsSection
          contacts={data.contacts}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'jobs' && (
        <AccountJobsSection
          jobs={data.jobs}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'placements' && (
        <AccountPlacementsSection
          placements={data.placements}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'addresses' && (
        <AccountAddressesSection
          addresses={data.addresses}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'meetings' && (
        <AccountMeetingsSection
          meetings={data.meetings}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'escalations' && (
        <AccountEscalationsSection
          escalations={data.escalations}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'related_accounts' && (
        <AccountRelatedAccountsSection
          relatedAccounts={data.relatedAccounts}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'activities' && (
        <AccountActivitiesSection
          activities={data.activities}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'notes' && (
        <AccountNotesSection
          notes={data.notes}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'documents' && (
        <AccountDocumentsSection
          documents={data.documents}
          accountId={data.account.id}
        />
      )}
      {currentSection === 'history' && (
        <AccountHistorySection
          history={data.history}
        />
      )}

      {/* Dialogs */}
      <LinkAccountDialog
        open={linkAccountDialogOpen}
        onOpenChange={setLinkAccountDialogOpen}
        accountId={data.account.id}
      />
    </div>
  )
}

export default AccountWorkspace
