'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import type { WorkspaceWarning } from '@/types/workspace'
import { useDealWorkspace } from './DealWorkspaceProvider'
import { DealHeader } from './DealHeader'
import { WarningsBanner } from '@/components/ui/warnings-banner'

// Unified PCF section components (same components used in wizard)
import {
  DetailsSection,
  StakeholdersSection,
  TimelineSection,
  CompetitorsSection,
  ProposalSection,
} from '@/components/deals/sections'

// Data mappers
import {
  mapToDetailsData,
  mapToStakeholdersData,
  mapToTimelineData,
  mapToCompetitorsData,
  mapToProposalData,
  mapDetailsToApi,
  mapStakeholdersToApi,
  mapTimelineToApi,
  mapCompetitorsToApi,
  mapProposalToApi,
} from '@/lib/deals/mappers'

// Types
import type {
  DetailsSectionData,
  StakeholdersSectionData,
  TimelineSectionData,
  CompetitorsSectionData,
  ProposalSectionData,
} from '@/lib/deals/types'

// Overview section (workspace-specific dashboard)
import { DealOverviewSection } from './sections/DealOverviewSection'

// Related data sections
import { DealAccountSection } from './sections/DealAccountSection'

// Tool sections
import { DealActivitiesSection } from './sections/DealActivitiesSection'
import { DealNotesSection } from './sections/DealNotesSection'
import { DealDocumentsSection } from './sections/DealDocumentsSection'
import { DealHistorySection } from './sections/DealHistorySection'

export interface DealWorkspaceProps {
  onAction?: (action: string) => void
  onMoveStage?: () => void
  onCloseWon?: () => void
  onCloseLost?: () => void
}

type DealSection =
  | 'overview'
  | 'details'
  | 'stakeholders'
  | 'timeline'
  | 'competitors'
  | 'proposal'
  | 'jobs'
  | 'meetings'
  | 'account'
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * DealWorkspace - Main workspace component for Deal detail view
 *
 * Uses unified PCF section components shared with the creation wizard.
 * Sections render identically in both wizard and workspace - only the mode differs.
 *
 * Architecture:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Unified sections use mode="view" with edit capability
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function DealWorkspace({
  onAction,
  onMoveStage,
  onCloseWon,
  onCloseLost,
}: DealWorkspaceProps = {}) {
  const { data, refreshData } = useDealWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get section from URL, default to 'overview'
  const currentSection = (searchParams.get('section') || 'overview') as DealSection

  // ============ SECTION DATA STATE ============
  // Initialize from context data, update on edit
  // Cast through unknown to satisfy TypeScript when mapping from DealData

  const [detailsData, setDetailsData] = React.useState<DetailsSectionData>(() =>
    mapToDetailsData(data.deal as unknown as Record<string, unknown>)
  )
  const [stakeholdersData, setStakeholdersData] = React.useState<StakeholdersSectionData>(() =>
    mapToStakeholdersData(data.stakeholders || [])
  )
  const [timelineData, setTimelineData] = React.useState<TimelineSectionData>(() =>
    mapToTimelineData(data.deal as unknown as Record<string, unknown>)
  )
  const [competitorsData, setCompetitorsData] = React.useState<CompetitorsSectionData>(() =>
    mapToCompetitorsData(data.deal as unknown as Record<string, unknown>)
  )
  const [proposalData, setProposalData] = React.useState<ProposalSectionData>(() =>
    mapToProposalData(data.deal as unknown as Record<string, unknown>)
  )

  // Sync state when context data changes (e.g., after refresh)
  React.useEffect(() => {
    setDetailsData(mapToDetailsData(data.deal as unknown as Record<string, unknown>))
    setStakeholdersData(mapToStakeholdersData(data.stakeholders || []))
    setTimelineData(mapToTimelineData(data.deal as unknown as Record<string, unknown>))
    setCompetitorsData(mapToCompetitorsData(data.deal as unknown as Record<string, unknown>))
    setProposalData(mapToProposalData(data.deal as unknown as Record<string, unknown>))
  }, [data.deal, data.stakeholders])

  // ============ MUTATIONS ============

  const updateDealMutation = trpc.crm.deals.update.useMutation()

  // ============ SAVE HANDLERS ============

  const handleSaveDetails = React.useCallback(async () => {
    const apiData = mapDetailsToApi(detailsData)
    await updateDealMutation.mutateAsync({
      id: data.deal.id,
      name: detailsData.title,
      value: detailsData.value,
      probability: detailsData.probability,
      valueBasis: detailsData.valueBasis as 'one_time' | 'annual' | 'monthly',
      expectedCloseDate: detailsData.expectedCloseDate || undefined,
      estimatedPlacements: detailsData.estimatedPlacements || undefined,
      avgBillRate: detailsData.avgBillRate || undefined,
      contractLengthMonths: detailsData.contractLengthMonths || undefined,
      hiringNeeds: detailsData.hiringNeeds || undefined,
      servicesRequired: detailsData.servicesRequired,
      healthStatus: detailsData.healthStatus as 'on_track' | 'slow' | 'stale' | 'urgent' | 'at_risk',
    })
    toast({ title: 'Saved', description: 'Deal details updated successfully.' })
    refreshData()
  }, [data.deal.id, detailsData, updateDealMutation, toast, refreshData])

  const handleSaveTimeline = React.useCallback(async () => {
    await updateDealMutation.mutateAsync({
      id: data.deal.id,
      nextAction: timelineData.nextStep || undefined,
      nextActionDate: timelineData.nextStepDate || undefined,
      expectedCloseDate: timelineData.expectedCloseDate || undefined,
    })
    toast({ title: 'Saved', description: 'Timeline updated successfully.' })
    refreshData()
  }, [data.deal.id, timelineData, updateDealMutation, toast, refreshData])

  const handleSaveCompetitors = React.useCallback(async () => {
    await updateDealMutation.mutateAsync({
      id: data.deal.id,
      competitors: competitorsData.competitors,
      competitiveAdvantage: competitorsData.competitiveAdvantage || undefined,
    })
    toast({ title: 'Saved', description: 'Competitors updated successfully.' })
    refreshData()
  }, [data.deal.id, competitorsData, updateDealMutation, toast, refreshData])

  const handleSaveProposal = React.useCallback(async () => {
    const rolesBreakdown = proposalData.rolesBreakdown.map((r) => ({
      title: r.title,
      quantity: r.count,
      minRate: r.billRate || undefined,
      maxRate: r.billRate || undefined,
    }))
    await updateDealMutation.mutateAsync({
      id: data.deal.id,
      rolesBreakdown: rolesBreakdown.length > 0 ? rolesBreakdown : undefined,
    })
    toast({ title: 'Saved', description: 'Proposal updated successfully.' })
    refreshData()
  }, [data.deal.id, proposalData, updateDealMutation, toast, refreshData])

  // Stakeholders use separate mutation
  const handleSaveStakeholders = React.useCallback(async () => {
    // TODO: Implement stakeholder batch update
    // For now, stakeholders are managed via addStakeholder/removeStakeholder actions
    toast({ title: 'Info', description: 'Use the Add/Remove actions to manage stakeholders.' })
    refreshData()
  }, [toast, refreshData])

  // ============ NAVIGATION ============

  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleWarningClick = React.useCallback((warning: WorkspaceWarning) => {
    if (warning.section) {
      handleSectionChange(warning.section)
    }
  }, [handleSectionChange])

  // ============ CHANGE HANDLERS ============

  const handleDetailsChange = React.useCallback((field: string, value: unknown) => {
    setDetailsData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleStakeholdersChange = React.useCallback((field: string, value: unknown) => {
    setStakeholdersData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTimelineChange = React.useCallback((field: string, value: unknown) => {
    setTimelineData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCompetitorsChange = React.useCallback((field: string, value: unknown) => {
    setCompetitorsData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleProposalChange = React.useCallback((field: string, value: unknown) => {
    setProposalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Current stage for conditional section rendering
  const currentStage = data.deal.stage || 'discovery'

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6">
      {/* Header */}
      <DealHeader deal={data.deal} accountName={data.account?.name} />

      {/* Warnings Banner */}
      {data.warnings.length > 0 && (
        <WarningsBanner
          warnings={data.warnings}
          onWarningClick={handleWarningClick}
        />
      )}

      {/* Section Content - instant switching, no loading */}

      {/* Overview - workspace-specific dashboard */}
      {currentSection === 'overview' && (
        <DealOverviewSection
          deal={data.deal}
          account={data.account}
          stakeholders={data.stakeholders}
          activities={data.activities}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Unified PCF Sections - same components as wizard, mode="view" */}
      {currentSection === 'details' && (
        <DetailsSection
          mode="view"
          data={detailsData}
          onChange={handleDetailsChange}
          onSave={handleSaveDetails}
          isSaving={updateDealMutation.isPending}
        />
      )}
      {currentSection === 'stakeholders' && (
        <StakeholdersSection
          mode="view"
          data={stakeholdersData}
          onChange={handleStakeholdersChange}
          onSave={handleSaveStakeholders}
          isSaving={false}
        />
      )}
      {currentSection === 'timeline' && (
        <TimelineSection
          mode="view"
          data={timelineData}
          onChange={handleTimelineChange}
          onSave={handleSaveTimeline}
          isSaving={updateDealMutation.isPending}
          currentStage={currentStage}
        />
      )}
      {currentSection === 'competitors' && (
        <CompetitorsSection
          mode="view"
          data={competitorsData}
          onChange={handleCompetitorsChange}
          onSave={handleSaveCompetitors}
          isSaving={updateDealMutation.isPending}
          currentStage={currentStage}
        />
      )}
      {currentSection === 'proposal' && (
        <ProposalSection
          mode="view"
          data={proposalData}
          onChange={handleProposalChange}
          onSave={handleSaveProposal}
          isSaving={updateDealMutation.isPending}
          currentStage={currentStage}
        />
      )}

      {/* Related Data Sections */}
      {currentSection === 'account' && (
        <DealAccountSection
          account={data.account}
          lead={data.lead}
        />
      )}
      {currentSection === 'jobs' && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-12 text-center">
          <p className="text-charcoal-500">Jobs section coming soon...</p>
        </div>
      )}
      {currentSection === 'meetings' && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-12 text-center">
          <p className="text-charcoal-500">Meetings section coming soon...</p>
        </div>
      )}

      {/* Tool Sections */}
      {currentSection === 'activities' && (
        <DealActivitiesSection
          activities={data.activities}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'notes' && (
        <DealNotesSection
          notes={data.notes}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'documents' && (
        <DealDocumentsSection
          documents={data.documents}
          dealId={data.deal.id}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'history' && (
        <DealHistorySection
          history={data.history}
          stageHistory={data.stageHistory}
        />
      )}
    </div>
  )
}

export default DealWorkspace
