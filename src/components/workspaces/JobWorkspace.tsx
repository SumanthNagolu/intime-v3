'use client'

import * as React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useJobWorkspace } from './job/JobWorkspaceProvider'
import { JobHeader } from './job/JobHeader'
import { useToast } from '@/components/ui/use-toast'

// Existing section components (display-only)
import { JobOverviewSection } from './job/sections/JobOverviewSection'
import { JobPipelineSection } from './job/sections/JobPipelineSection'
import { JobSubmissionsSection } from './job/sections/JobSubmissionsSection'
import { JobInterviewsSection } from './job/sections/JobInterviewsSection'
import { JobOffersSection } from './job/sections/JobOffersSection'
import { JobActivitiesSection } from './job/sections/JobActivitiesSection'
import { JobNotesSection } from './job/sections/JobNotesSection'
import { JobDocumentsSection } from './job/sections/JobDocumentsSection'
import { JobHistorySection } from './job/sections/JobHistorySection'

// Unified section components (shared with wizard)
import {
  BasicInfoSection,
  RequirementsSection,
  RoleDetailsSection,
  LocationSection,
  CompensationSection,
  InterviewProcessSection,
  TeamSection,
} from '@/components/jobs/sections'

// Section hooks
import {
  useBasicInfoSection,
  useRequirementsSection,
  useRoleDetailsSection,
  useLocationSection,
  useCompensationSection,
  useInterviewProcessSection,
  useTeamSection,
} from '@/components/jobs/hooks'

// Data mappers
import {
  mapToBasicInfoData,
  mapToRequirementsData,
  mapToRoleDetailsData,
  mapToLocationData,
  mapToCompensationData,
  mapToInterviewProcessData,
  mapToTeamData,
} from '@/lib/jobs/mappers'

export interface JobWorkspaceProps {
  onAction?: (action: string) => void
}

type JobSection =
  // Summary/Overview
  | 'summary'
  // Main sections (match wizard IDs: basic, requirements, role, location, compensation, interview, team)
  | 'basic'
  | 'requirements'
  | 'role'
  | 'location'
  | 'compensation'
  | 'interview'
  | 'team'
  // Related sections
  | 'pipeline'
  | 'submissions'
  | 'interviews'
  | 'offers'
  // Tool sections
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'

/**
 * JobWorkspace - Main workspace component for Job detail view
 *
 * Following the Account workspace pattern:
 * - Gets ALL data from context (provided by layout via ONE database call)
 * - Section switching is pure client-side state
 * - URL sync via searchParams for deep linking
 * - Unified sections (basicInfo, requirements, etc.) share components with wizard
 * - NOTE: Sidebar is provided by SidebarLayout via EntityJourneySidebar
 */
export function JobWorkspace({ onAction: _onAction }: JobWorkspaceProps = {}) {
  const { data, refreshData } = useJobWorkspace()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get section from URL, default to 'summary'
  const currentSection = (searchParams.get('section') || 'summary') as JobSection

  // Handle section change - update URL for deep linking
  const handleSectionChange = React.useCallback((section: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', section)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return (
    <div className="w-full max-w-none px-8 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <JobHeader job={data} />

      {/* Section Content - instant switching, no loading */}
      {/* Summary section (overview dashboard) */}
      {currentSection === 'summary' && (
        <JobOverviewSection
          job={data}
          onNavigate={handleSectionChange}
        />
      )}

      {/* Main sections (1-7, match wizard steps) */}
      {currentSection === 'basic' && (
        <JobBasicInfoSectionWrapper />
      )}
      {currentSection === 'requirements' && (
        <JobRequirementsSectionWrapper />
      )}
      {currentSection === 'role' && (
        <JobRoleDetailsSectionWrapper />
      )}
      {currentSection === 'location' && (
        <JobLocationSectionWrapper />
      )}
      {currentSection === 'compensation' && (
        <JobCompensationSectionWrapper />
      )}
      {currentSection === 'interview' && (
        <JobInterviewProcessSectionWrapper />
      )}
      {currentSection === 'team' && (
        <JobTeamSectionWrapper />
      )}

      {/* Related sections */}
      {currentSection === 'pipeline' && (
        <JobPipelineSection
          job={data}
          onNavigate={handleSectionChange}
        />
      )}
      {currentSection === 'submissions' && (
        <JobSubmissionsSection
          job={data}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'interviews' && (
        <JobInterviewsSection
          job={data}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'offers' && (
        <JobOffersSection
          job={data}
          onRefresh={refreshData}
        />
      )}

      {/* Tool sections */}
      {currentSection === 'activities' && (
        <JobActivitiesSection
          job={data}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'notes' && (
        <JobNotesSection
          job={data}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'documents' && (
        <JobDocumentsSection
          job={data}
          onRefresh={refreshData}
        />
      )}
      {currentSection === 'history' && (
        <JobHistorySection
          job={data}
        />
      )}
    </div>
  )
}

export default JobWorkspace

// ============ UNIFIED SECTION WRAPPERS ============
// These wrappers bridge workspace context data to the unified section components
// Following the Account workspace pattern exactly

function JobBasicInfoSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToBasicInfoData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Basic info updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useBasicInfoSection({
    jobId: data.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <BasicInfoSection
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

function JobRequirementsSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToRequirementsData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Requirements updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useRequirementsSection({
    jobId: data.id,
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

function JobRoleDetailsSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToRoleDetailsData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Role details updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useRoleDetailsSection({
    jobId: data.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <RoleDetailsSection
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

function JobLocationSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToLocationData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Location settings updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useLocationSection({
    jobId: data.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <LocationSection
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

function JobCompensationSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToCompensationData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Compensation settings updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useCompensationSection({
    jobId: data.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <CompensationSection
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

function JobInterviewProcessSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToInterviewProcessData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Interview process updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useInterviewProcessSection({
    jobId: data.id,
    initialData,
    mode: 'view',
    onSaveComplete,
  })

  return (
    <InterviewProcessSection
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

function JobTeamSectionWrapper() {
  const { data, refreshData } = useJobWorkspace()
  const { toast } = useToast()

  // Memoize initialData to prevent infinite loop from useEffect dependency
  const initialData = React.useMemo(
    () => mapToTeamData(data as unknown as Record<string, unknown>),
    [data]
  )

  // Memoize callback to prevent unnecessary re-renders
  const onSaveComplete = React.useCallback(() => {
    toast({ title: 'Team assignment updated successfully' })
    refreshData()
  }, [toast, refreshData])

  const section = useTeamSection({
    jobId: data.id,
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
