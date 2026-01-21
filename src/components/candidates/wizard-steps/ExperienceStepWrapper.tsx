'use client'

import * as React from 'react'
import { ExperienceSection } from '../sections/ExperienceSection'
import type { ExperienceSectionData, WorkHistoryEntry, EducationEntry } from '@/lib/candidates/types'
import { useCreateCandidateStore, CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

/**
 * ExperienceStepWrapper - Bridges wizard props to ExperienceSection
 *
 * Uses the Zustand store directly for list operations (add/update/remove)
 * since the wizard's setFormData doesn't support array operations well.
 */
export function ExperienceStepWrapper({
  formData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Get store actions for work history and education management
  const {
    addWorkHistory,
    updateWorkHistory,
    removeWorkHistory,
    addEducation,
    updateEducation,
    removeEducation,
  } = useCreateCandidateStore()

  // Map formData to section data format
  const sectionData: ExperienceSectionData = React.useMemo(() => {
    // Map store's WorkHistoryEntry to section's format
    const workHistory: WorkHistoryEntry[] = (formData?.workHistory || []).map(w => ({
      id: w.id,
      companyName: w.companyName,
      jobTitle: w.jobTitle,
      employmentType: w.employmentType || null,
      startDate: w.startDate || null,
      endDate: w.endDate || null,
      isCurrent: w.isCurrent,
      location: w.locationCity && w.locationState
        ? `${w.locationCity}, ${w.locationState}`
        : w.locationCity || w.locationState || null,
      isRemote: w.isRemote || false,
      description: w.description || null,
      achievements: w.achievements || [],
    }))

    // Map store's EducationEntry to section's format
    const education: EducationEntry[] = (formData?.education || []).map(e => ({
      id: e.id,
      institutionName: e.institutionName,
      degreeType: e.degreeType || null,
      degreeName: e.degreeName || null,
      fieldOfStudy: e.fieldOfStudy || null,
      startDate: e.startDate || null,
      endDate: e.endDate || null,
      isCurrent: e.isCurrent || false,
      gpa: e.gpa ?? null,
      honors: e.honors || null,
    }))

    return { workHistory, education }
  }, [formData?.workHistory, formData?.education])

  // Handlers that use store actions
  const handleAddWorkHistory = React.useCallback((entry: Omit<WorkHistoryEntry, 'id'>) => {
    addWorkHistory({
      companyName: entry.companyName,
      jobTitle: entry.jobTitle,
      employmentType: entry.employmentType as any,
      startDate: entry.startDate || '',
      endDate: entry.endDate || undefined,
      isCurrent: entry.isCurrent,
      locationCity: '',
      locationState: '',
      isRemote: entry.isRemote,
      description: entry.description || undefined,
      achievements: entry.achievements || [],
    })
  }, [addWorkHistory])

  const handleUpdateWorkHistory = React.useCallback((id: string, entry: Partial<WorkHistoryEntry>) => {
    updateWorkHistory(id, entry as any)
  }, [updateWorkHistory])

  const handleRemoveWorkHistory = React.useCallback((id: string) => {
    removeWorkHistory(id)
  }, [removeWorkHistory])

  const handleAddEducation = React.useCallback((entry: Omit<EducationEntry, 'id'>) => {
    addEducation({
      institutionName: entry.institutionName,
      degreeType: entry.degreeType as any,
      degreeName: entry.degreeName || undefined,
      fieldOfStudy: entry.fieldOfStudy || undefined,
      startDate: entry.startDate || undefined,
      endDate: entry.endDate || undefined,
      isCurrent: entry.isCurrent,
      gpa: entry.gpa ?? undefined,
      honors: entry.honors || undefined,
    })
  }, [addEducation])

  const handleUpdateEducation = React.useCallback((id: string, entry: Partial<EducationEntry>) => {
    updateEducation(id, entry as any)
  }, [updateEducation])

  const handleRemoveEducation = React.useCallback((id: string) => {
    removeEducation(id)
  }, [removeEducation])

  return (
    <ExperienceSection
      mode="create"
      data={sectionData}
      onAddWorkHistory={handleAddWorkHistory}
      onUpdateWorkHistory={handleUpdateWorkHistory}
      onRemoveWorkHistory={handleRemoveWorkHistory}
      onAddEducation={handleAddEducation}
      onUpdateEducation={handleUpdateEducation}
      onRemoveEducation={handleRemoveEducation}
      errors={errors}
    />
  )
}
