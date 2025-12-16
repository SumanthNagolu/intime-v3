'use client'

/**
 * PCF-Compatible Section Adapters for Accounts
 *
 * These wrapper components adapt the existing Account section components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useRouter } from 'next/navigation'
import { Account } from '../accounts.config'
import {
  AccountOverviewSection,
  AccountContactsSection,
  AccountJobsSection,
  AccountPlacementsSection,
  AccountDocumentsSection,
  AccountActivitiesSection,
  AccountMeetingsSection,
  AccountNotesSection,
  AccountEscalationsSection,
} from '@/components/recruiting/accounts/sections'

/**
 * Dispatch a dialog open event for the Account entity
 * The detail page listens for this and manages dialog state
 */
function dispatchAccountDialog(dialogId: string, accountId: string) {
  window.dispatchEvent(
    new CustomEvent('openAccountDialog', {
      detail: { dialogId, accountId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section Adapter
 */
export function AccountOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const router = useRouter()
  const account = entity as Account | undefined

  if (!account) return null

  return (
    <AccountOverviewSection
      account={account as Record<string, unknown>}
      accountId={entityId}
      onStartOnboarding={() => {
        router.push(`/employee/recruiting/accounts/${entityId}/onboarding`)
      }}
    />
  )
}

/**
 * Contacts Section Adapter
 */
export function AccountContactsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountContactsSection
      accountId={entityId}
      onAddContact={() => dispatchAccountDialog('addContact', entityId)}
    />
  )
}

/**
 * Jobs Section Adapter
 */
export function AccountJobsSectionPCF({ entityId }: PCFSectionProps) {
  const router = useRouter()

  return (
    <AccountJobsSection
      accountId={entityId}
      onNewJob={() => router.push(`/employee/recruiting/jobs/intake?accountId=${entityId}`)}
    />
  )
}

/**
 * Placements Section Adapter
 */
export function AccountPlacementsSectionPCF({ entityId }: PCFSectionProps) {
  return <AccountPlacementsSection accountId={entityId} />
}

/**
 * Documents Section Adapter
 */
export function AccountDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountDocumentsSection
      accountId={entityId}
      onAddDocument={() => dispatchAccountDialog('addDocument', entityId)}
    />
  )
}

/**
 * Activities Section Adapter
 */
export function AccountActivitiesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountActivitiesSection
      accountId={entityId}
      onLogActivity={() => dispatchAccountDialog('logActivity', entityId)}
    />
  )
}

/**
 * Meetings Section Adapter
 */
export function AccountMeetingsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountMeetingsSection
      accountId={entityId}
      onScheduleMeeting={() => dispatchAccountDialog('createMeeting', entityId)}
    />
  )
}

/**
 * Notes Section Adapter
 */
export function AccountNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountNotesSection
      accountId={entityId}
      onAddNote={() => dispatchAccountDialog('addNote', entityId)}
    />
  )
}

/**
 * Escalations Section Adapter
 */
export function AccountEscalationsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <AccountEscalationsSection
      accountId={entityId}
      onCreateEscalation={() => dispatchAccountDialog('createEscalation', entityId)}
    />
  )
}
