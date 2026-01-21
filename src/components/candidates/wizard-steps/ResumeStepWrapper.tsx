'use client'

import * as React from 'react'
import { ResumeSection } from '../sections/ResumeSection'
import type { ResumeSectionData } from '@/lib/candidates/types'
import { useCreateCandidateStore, CreateCandidateFormData } from '@/stores/create-candidate-store'
import type { WizardStepComponentProps } from '@/configs/entities/types'

/**
 * ResumeStepWrapper - Bridges wizard props to ResumeSection
 *
 * Maps CreateCandidateFormData to ResumeSectionData format
 * Uses store for file handling and tag management
 */
export function ResumeStepWrapper({
  formData,
  setFormData,
  errors = {},
}: WizardStepComponentProps<CreateCandidateFormData>) {
  // Get store actions for file handling and tags
  const {
    setResumeFile,
    resumeFile,
    addTag,
    removeTag,
  } = useCreateCandidateStore()

  // Map formData to section data format
  const sectionData: ResumeSectionData = React.useMemo(() => ({
    // In create mode, we don't have saved resumes yet
    // Show uploaded file info if available
    resumes: resumeFile ? [{
      id: 'pending-upload',
      version: 1,
      isLatest: true,
      filePath: '',
      fileName: resumeFile.name,
      fileSize: resumeFile.size,
      mimeType: resumeFile.type,
      fileUrl: URL.createObjectURL(resumeFile),
      label: null,
      targetRole: null,
      source: 'uploaded' as const,
      notes: null,
      isPrimary: true,
      resumeType: 'master',
      uploadedAt: new Date().toISOString(),
    }] : [],
    source: formData?.leadSource || null,
    sourceDetails: formData?.sourceDetails || null,
    referredBy: formData?.referredBy || null,
    campaignId: formData?.campaignId || null,
    status: 'draft',
    candidateStatus: 'new',
    isOnHotlist: formData?.isOnHotlist ?? false,
    hotlistAddedAt: null,
    hotlistNotes: formData?.hotlistNotes || null,
    tags: formData?.tags || [],
    internalNotes: formData?.internalNotes || null,
  }), [formData, resumeFile])

  // Map section onChange to setFormData
  const handleChange = React.useCallback((field: string, value: unknown) => {
    if (!setFormData) return

    // Field mapping
    const fieldMapping: Record<string, keyof CreateCandidateFormData> = {
      source: 'leadSource',
      sourceDetails: 'sourceDetails',
      referredBy: 'referredBy',
      campaignId: 'campaignId',
      isOnHotlist: 'isOnHotlist',
      hotlistNotes: 'hotlistNotes',
      tags: 'tags',
      internalNotes: 'internalNotes',
    }

    const formField = fieldMapping[field]
    if (formField) {
      setFormData({ [formField]: value } as Partial<CreateCandidateFormData>)
    }
  }, [setFormData])

  // Handle resume upload
  const handleUploadResume = React.useCallback(async (file: File) => {
    // Store the file in Zustand for later upload on submit
    setResumeFile(file, null)
  }, [setResumeFile])

  // Handle resume delete
  const handleDeleteResume = React.useCallback((id: string) => {
    if (id === 'pending-upload') {
      setResumeFile(null, null)
    }
  }, [setResumeFile])

  // Map section error field names
  const sectionErrors = React.useMemo(() => {
    const mapped: Record<string, string> = {}
    if (errors.leadSource) mapped.source = errors.leadSource
    if (errors.sourceDetails) mapped.sourceDetails = errors.sourceDetails
    if (errors.referredBy) mapped.referredBy = errors.referredBy
    return mapped
  }, [errors])

  return (
    <ResumeSection
      mode="create"
      data={sectionData}
      onChange={handleChange}
      onUploadResume={handleUploadResume}
      onDeleteResume={handleDeleteResume}
      errors={sectionErrors}
    />
  )
}
