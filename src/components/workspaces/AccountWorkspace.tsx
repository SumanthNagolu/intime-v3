'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useAccountWorkspace } from './account/AccountWorkspaceProvider'
import { AccountHeader } from './account/AccountHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'
import { useToast } from '@/components/ui/use-toast'
import { trpc } from '@/lib/trpc/client'

// Section components (implemented in Phase 3)
import { AccountOverviewSection } from './account/sections/AccountOverviewSection'
import { AccountContactsSection } from './account/sections/AccountContactsSection'
import { AccountJobsSection } from './account/sections/AccountJobsSection'
import { AccountPlacementsSection } from './account/sections/AccountPlacementsSection'
// Note: AccountAddressesSection removed - now handled by AccountLocationsSectionWrapper
import { AccountMeetingsSection } from './account/sections/AccountMeetingsSection'
import { AccountEscalationsSection } from './account/sections/AccountEscalationsSection'
import { AccountRelatedAccountsSection } from './account/sections/AccountRelatedAccountsSection'
import { AccountActivitiesSection } from './account/sections/AccountActivitiesSection'
import { AccountNotesSection } from './account/sections/AccountNotesSection'
import { AccountDocumentsSection } from './account/sections/AccountDocumentsSection'
import { AccountHistorySection } from './account/sections/AccountHistorySection'

// Unified section components
import {
  IdentitySection,
  LocationsSection,
  BillingSection,
  ContractsSection,
  ComplianceSection,
  TeamSection,
} from '@/components/accounts/sections'

// Section hooks
import {
  useIdentitySection,
  useLocationsSection,
  useBillingSection,
  useContractsSection,
  useComplianceSection,
  useTeamSection,
} from '@/components/accounts/hooks'

// Data mappers
import {
  mapToIdentityData,
  mapToLocationsData,
  mapToBillingData,
  mapToContractsData,
  mapToComplianceData,
  mapToTeamData,
} from '@/lib/accounts/mappers'

// Dialogs
import { LinkAccountDialog } from '@/components/recruiting/accounts/LinkAccountDialog'

export interface AccountWorkspaceProps {
  onAction?: (action: string) => void
}

type AccountSection =
  | 'summary'
  // New wizard-matching sections
  | 'identity'
  | 'locations'
  | 'billing'
  | 'contracts'
  | 'compliance'
  | 'team'
  // Existing sections
  | 'contacts'
  | 'jobs'
  | 'placements'
  | 'addresses'  // Deprecated - use 'locations'
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
export function AccountWorkspace({ onAction: _onAction }: AccountWorkspaceProps = {}) {
  const { data, refreshData } = useAccountWorkspace()
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
    <div className="w-full max-w-none px-8 py-6 space-y-6 animate-fade-in">
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
      {/* Unified sections (same components used in wizard) */}
      {currentSection === 'identity' && (
        <AccountIdentitySectionWrapper />
      )}
      {(currentSection === 'locations' || currentSection === 'addresses') && (
        <AccountLocationsSectionWrapper />
      )}
      {currentSection === 'billing' && (
        <AccountBillingSectionWrapper />
      )}
      {currentSection === 'contracts' && (
        <AccountContractsSectionWrapper />
      )}
      {currentSection === 'compliance' && (
        <AccountComplianceSectionWrapper />
      )}
      {currentSection === 'team' && (
        <AccountTeamSectionWrapper />
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
          accountName={data.account.name}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'placements' && (
        <AccountPlacementsSection
          placements={data.placements}
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

// ============ UNIFIED SECTION WRAPPERS ============
// These wrappers bridge workspace context data to the unified section components
// Mappers expect account object with nested relations, so we construct it from workspace data

function AccountIdentitySectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToIdentityData(data.account as unknown as Record<string, unknown>),
    [data.account]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Account identity updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useIdentitySection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <IdentitySection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onToggleIndustry={section.handleToggleIndustry}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function AccountLocationsSectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(() => {
    const accountWithAddresses = {
      ...data.account,
      addresses: data.addresses,
    }
    return mapToLocationsData(accountWithAddresses as unknown as Record<string, unknown>)
  }, [data.account, data.addresses])

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Locations updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useLocationsSection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <LocationsSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onAddAddress={section.handleAddAddress}
      onUpdateAddress={section.handleUpdateAddress}
      onRemoveAddress={section.handleRemoveAddress}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function AccountBillingSectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToBillingData(data.account as unknown as Record<string, unknown>),
    [data.account]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Billing settings updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useBillingSection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <BillingSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

// Note: AccountContactsUnifiedWrapper removed - contacts section uses existing AccountContactsSection

function AccountContractsSectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  // Note: contracts are not yet in FullAccountData, so we use an empty array
  const initialData = React.useMemo(() => {
    const accountWithContracts = {
      ...data.account,
      contracts: [],
    }
    return mapToContractsData(accountWithContracts as unknown as Record<string, unknown>)
  }, [data.account])

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Contracts updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useContractsSection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <ContractsSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onAddContract={section.handleAddContract}
      onUpdateContract={section.handleUpdateContract}
      onRemoveContract={section.handleRemoveContract}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function AccountComplianceSectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToComplianceData(data.account as unknown as Record<string, unknown>),
    [data.account]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Compliance settings updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useComplianceSection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <ComplianceSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function AccountTeamSectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const { toast } = useToast()

  // Fetch team members for selection
  const usersQuery = trpc.users.list.useQuery({})

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToTeamData(data.account as unknown as Record<string, unknown>),
    [data.account]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Team settings updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useTeamSection({
    accountId: data.account.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  // Map users to team members format
  const teamMembers =
    usersQuery.data?.items?.map((user) => ({
      id: user.id,
      full_name: user.full_name || user.email,
      email: user.email,
      avatar_url: user.avatar_url,
    })) || []

  return (
    <TeamSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
      teamMembers={teamMembers}
    />
  )
}
