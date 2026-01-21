'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceWarning } from '@/types/workspace'
import { useCampaignWorkspace } from './campaign/CampaignWorkspaceProvider'
import { CampaignHeader } from './campaign/CampaignHeader'
import { CampaignOverviewSection } from './campaign/sections/CampaignOverviewSection'
import { WarningsBanner } from '@/components/ui/warnings-banner'
import { useToast } from '@/components/ui/use-toast'

// Unified section components (same as wizard)
import {
  CampaignSetupSection,
  CampaignTargetingSection,
  CampaignChannelsSection,
  CampaignScheduleSection,
  CampaignComplianceSection,
} from '@/components/campaigns/sections'

// Section hooks for edit mode
import {
  useCampaignSetupSection,
  useCampaignTargetingSection,
  useCampaignChannelsSection,
  useCampaignScheduleSection,
  useCampaignComplianceSection,
} from '@/components/campaigns/hooks'

// Data mappers
import {
  mapToSetupData,
  mapToTargetingData,
  mapToChannelsData,
  mapToScheduleData,
  mapToComplianceData,
} from '@/lib/campaigns/mappers'

// PCF Section components (for data-heavy sections)
import {
  CampaignProspectsSectionPCF,
  CampaignLeadsSectionPCF,
  CampaignFunnelSectionPCF,
  CampaignSequenceSectionPCF,
  CampaignAnalyticsSectionPCF,
  CampaignActivitiesSectionPCF,
  CampaignNotesSectionPCF,
  CampaignDocumentsSectionPCF,
  CampaignHistorySectionPCF,
} from '@/configs/entities/sections/campaigns.sections'

import type { CampaignSection } from '@/types/campaign'

export interface CampaignWorkspaceProps {
  onAction?: (action: string) => void
}

/**
 * CampaignWorkspace - Main workspace component for Campaign detail view
 *
 * Following the Account workspace reference implementation:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Unified sections (same components as wizard) for editable sections
 * - PCF sections for data-heavy read-only sections
 */
export function CampaignWorkspace({ onAction: _onAction }: CampaignWorkspaceProps = {}) {
  const { data, refreshData } = useCampaignWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'overview'
  const currentSection = (searchParams.get('section') || 'overview') as CampaignSection | 'setup' | 'targeting' | 'channels' | 'schedule' | 'compliance'

  // Handle section change - update URL for deep linking
  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    // Remove mode param if present (we use sections mode)
    params.delete('mode')
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle warning click - navigate to relevant section/field
  const handleWarningClick = React.useCallback((warning: WorkspaceWarning) => {
    if (warning.section) {
      handleSectionChange(warning.section)
    }
  }, [handleSectionChange])

  // Extract campaign entity for PCF sections
  const campaignEntity = React.useMemo(() => ({
    ...data.campaign,
    sections: {
      prospects: { items: data.prospects },
      leads: { items: data.leads },
      funnel: data.funnel,
      sequence: { items: data.sequence },
      activities: { items: data.activities },
      notes: { items: data.notes },
      documents: { items: data.documents },
      history: { items: data.history },
    },
  }), [data])

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <CampaignHeader campaign={data.campaign} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}
      {currentSection === 'overview' && (
        <CampaignOverviewSection
          campaign={data.campaign}
          prospects={data.prospects}
          leads={data.leads}
          funnel={data.funnel}
          sequence={data.sequence}
          activities={data.activities}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Unified Sections (same components as wizard) */}
      {currentSection === 'setup' && (
        <CampaignSetupSectionWrapper />
      )}

      {currentSection === 'targeting' && (
        <CampaignTargetingSectionWrapper />
      )}

      {currentSection === 'channels' && (
        <CampaignChannelsSectionWrapper />
      )}

      {currentSection === 'schedule' && (
        <CampaignScheduleSectionWrapper />
      )}

      {currentSection === 'compliance' && (
        <CampaignComplianceSectionWrapper />
      )}

      {/* PCF Sections (data-heavy) */}
      {currentSection === 'prospects' && (
        <CampaignProspectsSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
          sectionData={{ items: data.prospects, total: data.counts.prospects }}
        />
      )}

      {currentSection === 'leads' && (
        <CampaignLeadsSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
          sectionData={{ items: data.leads, total: data.counts.leads }}
        />
      )}

      {currentSection === 'funnel' && (
        <CampaignFunnelSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
        />
      )}

      {currentSection === 'sequence' && (
        <CampaignSequenceSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
          sectionData={{ items: data.sequence, total: data.counts.sequence }}
        />
      )}

      {currentSection === 'analytics' && (
        <CampaignAnalyticsSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
        />
      )}

      {currentSection === 'activities' && (
        <CampaignActivitiesSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
        />
      )}

      {currentSection === 'notes' && (
        <CampaignNotesSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
          sectionData={{ items: data.notes, total: data.counts.notes }}
        />
      )}

      {currentSection === 'documents' && (
        <CampaignDocumentsSectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
        />
      )}

      {currentSection === 'history' && (
        <CampaignHistorySectionPCF
          entityId={data.campaign.id}
          entity={campaignEntity}
        />
      )}
    </div>
  )
}

// =============================================================================
// SECTION WRAPPERS - Use unified sections with hooks for edit mode
// =============================================================================

function CampaignSetupSectionWrapper() {
  const { data, refreshData } = useCampaignWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToSetupData(data.campaign as unknown as Record<string, unknown>),
    [data.campaign]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Campaign setup updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCampaignSetupSection({
    campaignId: data.campaign.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CampaignSetupSection
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

function CampaignTargetingSectionWrapper() {
  const { data, refreshData } = useCampaignWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToTargetingData(data.campaign as unknown as Record<string, unknown>),
    [data.campaign]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Campaign targeting updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCampaignTargetingSection({
    campaignId: data.campaign.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CampaignTargetingSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onToggle={section.handleToggle}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function CampaignChannelsSectionWrapper() {
  const { data, refreshData } = useCampaignWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToChannelsData(data.campaign as unknown as Record<string, unknown>),
    [data.campaign]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Campaign channels updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCampaignChannelsSection({
    campaignId: data.campaign.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CampaignChannelsSection
      mode={section.isEditing ? 'edit' : 'view'}
      data={section.data}
      onChange={section.handleChange}
      onToggleChannel={section.handleToggleChannel}
      onEdit={section.handleEdit}
      onSave={section.handleSave}
      onCancel={section.handleCancel}
      isSaving={section.isSaving}
      errors={section.errors}
    />
  )
}

function CampaignScheduleSectionWrapper() {
  const { data, refreshData } = useCampaignWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToScheduleData(data.campaign as unknown as Record<string, unknown>),
    [data.campaign]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Campaign schedule updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCampaignScheduleSection({
    campaignId: data.campaign.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CampaignScheduleSection
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

function CampaignComplianceSectionWrapper() {
  const { data, refreshData } = useCampaignWorkspace()
  const { toast } = useToast()

  const initialData = React.useMemo(
    () => mapToComplianceData(data.campaign as unknown as Record<string, unknown>),
    [data.campaign]
  )

  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Campaign compliance updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCampaignComplianceSection({
    campaignId: data.campaign.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CampaignComplianceSection
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

export default CampaignWorkspace
