import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { ClassificationSectionData, SectionMode } from '@/lib/leads/types'
import { DEFAULT_CLASSIFICATION_DATA } from '@/lib/leads/types'

interface UseClassificationSectionOptions {
  leadId: string
  initialData?: Partial<ClassificationSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseClassificationSectionReturn {
  data: ClassificationSectionData
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
 * useClassificationSection - Hook for managing Lead Classification section state
 */
export function useClassificationSection({
  leadId,
  initialData,
  mode,
  onSaveComplete,
}: UseClassificationSectionOptions): UseClassificationSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<ClassificationSectionData>(() => ({
    ...DEFAULT_CLASSIFICATION_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<ClassificationSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.unifiedContacts.leads.saveClassification.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_CLASSIFICATION_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await saveMutation.mutateAsync({
        leadId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save classification:', error)
      throw error
    }
  }, [leadId, localData, saveMutation, onSaveComplete])

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
  const errors = saveMutation.error?.data?.zodError?.fieldErrors as Record<string, string> | undefined

  return {
    data: localData,
    isLoading: false,
    isSaving: saveMutation.isPending,
    isEditing,
    errors,
    handleChange,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useClassificationSection
