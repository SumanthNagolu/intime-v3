import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { InterviewProcessSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_INTERVIEW_PROCESS_DATA } from '@/lib/jobs/types'

interface UseInterviewProcessSectionOptions {
  jobId: string
  initialData?: Partial<InterviewProcessSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseInterviewProcessSectionReturn {
  data: InterviewProcessSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useInterviewProcessSection - Hook for managing Interview Process section state and operations
 */
export function useInterviewProcessSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseInterviewProcessSectionOptions): UseInterviewProcessSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<InterviewProcessSectionData>(() => ({
    ...DEFAULT_INTERVIEW_PROCESS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<InterviewProcessSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_INTERVIEW_PROCESS_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle save - use jobs.update
  const handleSave = useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        id: jobId,
        // DB columns
        clientInterviewProcess: localData.clientInterviewProcess || undefined,
        clientSubmissionInstructions: localData.clientSubmissionInstructions || undefined,
        // Store all interview process details in intakeData
        intakeData: {
          interviewRounds: localData.interviewRounds,
          decisionDays: localData.decisionDays,
          submissionRequirements: localData.submissionRequirements,
          submissionFormat: localData.submissionFormat,
          submissionNotes: localData.submissionNotes,
          candidatesPerWeek: localData.candidatesPerWeek,
          feedbackTurnaround: localData.feedbackTurnaround,
          screeningQuestions: localData.screeningQuestions,
        },
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save interview process:', error)
      throw error
    }
  }, [jobId, localData, updateMutation, onSaveComplete])

  // Handle cancel - revert to original data
  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  // Handle edit
  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

  // Extract errors from mutation
  const errors = updateMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: updateMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useInterviewProcessSection
