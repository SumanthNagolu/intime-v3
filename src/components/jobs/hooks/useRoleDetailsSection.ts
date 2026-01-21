import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { RoleDetailsSectionData, SectionMode } from '@/lib/jobs/types'
import { DEFAULT_ROLE_DETAILS_DATA } from '@/lib/jobs/types'

interface UseRoleDetailsSectionOptions {
  jobId: string
  initialData?: Partial<RoleDetailsSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseRoleDetailsSectionReturn {
  data: RoleDetailsSectionData
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
 * useRoleDetailsSection - Hook for managing Role Details section state and operations
 */
export function useRoleDetailsSection({
  jobId,
  initialData,
  mode,
  onSaveComplete,
}: UseRoleDetailsSectionOptions): UseRoleDetailsSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<RoleDetailsSectionData>(() => ({
    ...DEFAULT_ROLE_DETAILS_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<RoleDetailsSectionData | null>(null)

  // Use the existing jobs.update mutation for partial updates
  const updateMutation = trpc.ats.jobs.update.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_ROLE_DETAILS_DATA, ...initialData }
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
        // Store role details in intakeData (no direct DB columns for these fields)
        intakeData: {
          roleSummary: localData.roleSummary,
          responsibilities: localData.responsibilities,
          roleOpenReason: localData.roleOpenReason,
          teamName: localData.teamName,
          teamSize: localData.teamSize,
          reportsTo: localData.reportsTo,
          directReports: localData.directReports,
          keyProjects: localData.keyProjects,
          successMetrics: localData.successMetrics,
        },
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save role details:', error)
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

export default useRoleDetailsSection
