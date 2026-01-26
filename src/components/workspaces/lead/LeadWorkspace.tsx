'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import type { LeadSection } from '@/types/lead'
import { useLeadWorkspace } from './LeadWorkspaceProvider'
import { LeadHeader } from './LeadHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'
import { useToast } from '@/components/ui/use-toast'

// Unified section components (same for wizard and workspace)
import { IdentitySection } from '@/components/leads/sections/IdentitySection'
import { ClassificationSection } from '@/components/leads/sections/ClassificationSection'
import { RequirementsSection } from '@/components/leads/sections/RequirementsSection'
import { QualificationSection } from '@/components/leads/sections/QualificationSection'
import { ClientProfileSection } from '@/components/leads/sections/ClientProfileSection'
import { SourceSection } from '@/components/leads/sections/SourceSection'
import { TeamSection } from '@/components/leads/sections/TeamSection'

// Section hooks
import {
  useIdentitySection,
  useClassificationSection,
  useRequirementsSection,
  useQualificationSection,
  useClientProfileSection,
  useSourceSection,
  useTeamSection,
} from '@/components/leads/hooks'

// Data mappers
import {
  mapToIdentityData,
  mapToClassificationData,
  mapToRequirementsData,
  mapToQualificationData,
  mapToClientProfileData,
  mapToSourceData,
  mapToTeamData,
} from '@/lib/leads/mappers'

// View-only section components (for summary and tool sections)
import { LeadSummarySection } from './sections/LeadSummarySection'
import { LeadEngagementSection } from './sections/LeadEngagementSection'
import { LeadDealsSection } from './sections/LeadDealsSection'
import { LeadMeetingsSection } from './sections/LeadMeetingsSection'
import { LeadActivitiesSection } from './sections/LeadActivitiesSection'
import { LeadNotesSection } from './sections/LeadNotesSection'
import { LeadDocumentsSection } from './sections/LeadDocumentsSection'
import { LeadHistorySection } from './sections/LeadHistorySection'

export interface LeadWorkspaceProps {
  onAction?: (action: string) => void
  onQualify?: () => void
  onConvert?: () => void
  onCreateDeal?: () => void
  onScheduleMeeting?: () => void
}

/**
 * LeadWorkspace - Main workspace component for Lead detail view
 *
 * Follows the AccountWorkspace reference implementation pattern:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Unified sections support view/edit modes
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 *
 * 7 Main Sections (matching wizard):
 * - identity: Contact and company information
 * - classification: Lead type, opportunity, business model
 * - requirements: Staffing requirements and rates
 * - qualification: BANT scoring and criteria
 * - client-profile: VMS/MSP, payment terms, compliance
 * - source: Lead source and attribution
 * - team: Lead owner and preferences
 *
 * Additional Sections:
 * - summary: Dashboard overview
 * - engagement: Engagement tracking
 * - RELATED: deals, meetings
 * - TOOLS: activities, notes, documents, history
 */
export function LeadWorkspace({
  onAction,
  onQualify,
  onConvert,
  onCreateDeal,
  onScheduleMeeting,
}: LeadWorkspaceProps = {}) {
  const { data, refreshData } = useLeadWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as LeadSection

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
  }, [handleSectionChange])

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6">
      {/* Header */}
      <LeadHeader lead={data.lead} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}

      {/* SUMMARY SECTION */}
      {currentSection === 'summary' && (
        <LeadSummarySection
          lead={data.lead}
          contact={data.contact}
          activities={data.activities}
          campaigns={data.campaigns}
          onNavigate={handleSectionChange}
        />
      )}

      {/* MAIN SECTIONS - 7 sections matching wizard */}
      {currentSection === 'contact' && (
        <LeadIdentitySectionWrapper />
      )}

      {currentSection === 'classification' && (
        <LeadClassificationSectionWrapper />
      )}

      {currentSection === 'requirements' && (
        <LeadRequirementsSectionWrapper />
      )}

      {currentSection === 'qualification' && (
        <LeadQualificationSectionWrapper />
      )}

      {currentSection === 'client-profile' && (
        <LeadClientProfileSectionWrapper />
      )}

      {currentSection === 'source' && (
        <LeadSourceSectionWrapper />
      )}

      {currentSection === 'team' && (
        <LeadTeamSectionWrapper />
      )}

      {/* ADDITIONAL MAIN SECTIONS */}
      {currentSection === 'engagement' && (
        <LeadEngagementSection
          engagement={data.engagement}
          leadId={data.lead.id}
        />
      )}

      {/* RELATED DATA SECTIONS */}
      {currentSection === 'deals' && (
        <LeadDealsSection
          deals={data.deals}
          lead={data.lead}
          onCreateDeal={onCreateDeal}
        />
      )}

      {currentSection === 'meetings' && (
        <LeadMeetingsSection
          meetings={data.meetings}
          leadId={data.lead.id}
          onScheduleMeeting={onScheduleMeeting}
        />
      )}

      {/* TOOL SECTIONS */}
      {currentSection === 'activities' && (
        <LeadActivitiesSection
          activities={data.activities}
          leadId={data.lead.id}
        />
      )}

      {currentSection === 'notes' && (
        <LeadNotesSection
          notes={data.notes}
          leadId={data.lead.id}
        />
      )}

      {currentSection === 'documents' && (
        <LeadDocumentsSection
          documents={data.documents}
          leadId={data.lead.id}
        />
      )}

      {currentSection === 'history' && (
        <LeadHistorySection
          history={data.history}
        />
      )}
    </div>
  )
}

// ============================================================================
// SECTION WRAPPERS - Connect unified sections to workspace data
// ============================================================================

/**
 * Identity Section Wrapper - Contact info with edit capability
 */
function LeadIdentitySectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToIdentityData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Contact information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useIdentitySection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <IdentitySection
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

/**
 * Classification Section Wrapper - Lead type and opportunity classification
 */
function LeadClassificationSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToClassificationData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Classification updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useClassificationSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <ClassificationSection
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

/**
 * Requirements Section Wrapper - Staffing requirements and rates
 */
function LeadRequirementsSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToRequirementsData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Requirements updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useRequirementsSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <RequirementsSection
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

/**
 * Qualification Section Wrapper - BANT scoring with edit capability
 */
function LeadQualificationSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToQualificationData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Qualification data updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useQualificationSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <QualificationSection
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

/**
 * Client Profile Section Wrapper - VMS/MSP and payment terms
 */
function LeadClientProfileSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToClientProfileData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Client profile updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useClientProfileSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <ClientProfileSection
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

/**
 * Source Section Wrapper - Lead source with edit capability
 */
function LeadSourceSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToSourceData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Source information updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useSourceSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <SourceSection
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

/**
 * Team Section Wrapper - Owner assignment with edit capability
 */
function LeadTeamSectionWrapper() {
  const { data, refreshData } = useLeadWorkspace()
  const { toast } = useToast()

  // Map raw lead data to section format (raw contains snake_case DB columns)
  const initialData = React.useMemo(
    () => mapToTeamData(data.raw),
    [data.raw]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Team assignment updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useTeamSection({
    leadId: data.lead.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

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
    />
  )
}

export default LeadWorkspace
