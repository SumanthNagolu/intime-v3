import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { QualificationSectionData, SectionMode } from '@/lib/leads/types'
import { DEFAULT_QUALIFICATION_DATA } from '@/lib/leads/types'

interface UseQualificationSectionOptions {
  leadId: string
  initialData?: Partial<QualificationSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseQualificationSectionReturn {
  data: QualificationSectionData
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
 * useQualificationSection - Hook for managing Lead Qualification section state
 */
export function useQualificationSection({
  leadId,
  initialData,
  mode,
  onSaveComplete,
}: UseQualificationSectionOptions): UseQualificationSectionReturn {
  const [localData, setLocalData] = useState<QualificationSectionData>(() => ({
    ...DEFAULT_QUALIFICATION_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<QualificationSectionData | null>(null)

  const saveMutation = trpc.unifiedContacts.leads.saveQualification.useMutation()

  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_QUALIFICATION_DATA, ...initialData }
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
      console.error('Failed to save qualification:', error)
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

export default useQualificationSection
