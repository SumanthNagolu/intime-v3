import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SourceSectionData, SectionMode } from '@/lib/leads/types'
import { DEFAULT_SOURCE_DATA } from '@/lib/leads/types'

interface UseSourceSectionOptions {
  leadId: string
  initialData?: Partial<SourceSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseSourceSectionReturn {
  data: SourceSectionData
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
 * useSourceSection - Hook for managing Lead Source section state
 */
export function useSourceSection({
  leadId,
  initialData,
  mode,
  onSaveComplete,
}: UseSourceSectionOptions): UseSourceSectionReturn {
  const [localData, setLocalData] = useState<SourceSectionData>(() => ({
    ...DEFAULT_SOURCE_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<SourceSectionData | null>(null)

  const saveMutation = trpc.unifiedContacts.leads.saveSource.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_SOURCE_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

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
      console.error('Failed to save source:', error)
      throw error
    }
  }, [leadId, localData, saveMutation, onSaveComplete])

  const handleCancel = useCallback(() => {
    if (originalData) {
      setLocalData(originalData)
    }
    setIsEditing(false)
  }, [originalData])

  const handleEdit = useCallback(() => {
    setOriginalData(localData)
    setIsEditing(true)
  }, [localData])

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

export default useSourceSection
