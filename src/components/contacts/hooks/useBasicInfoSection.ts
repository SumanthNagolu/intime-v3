import { useState, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import type { SectionMode, BasicInfoSectionData } from '@/lib/contacts/types'
import { DEFAULT_BASIC_INFO_DATA } from '@/lib/contacts/types'

interface UseBasicInfoSectionOptions {
  contactId: string
  initialData?: Partial<BasicInfoSectionData>
  mode: SectionMode
  onSaveComplete?: () => void
}

interface UseBasicInfoSectionReturn {
  data: BasicInfoSectionData
  isLoading: boolean
  isSaving: boolean
  isEditing: boolean
  errors: Record<string, string> | undefined
  handleChange: (field: string, value: unknown) => void
  handleToggleType: (type: string) => void
  handleSave: () => Promise<void>
  handleCancel: () => void
  handleEdit: () => void
}

/**
 * useBasicInfoSection - Hook for managing Basic Info section state and operations
 *
 * Handles:
 * - Local state management for form data
 * - Syncing from initial/server data
 * - Save operations via tRPC
 * - Edit mode toggling
 */
export function useBasicInfoSection({
  contactId,
  initialData,
  mode,
  onSaveComplete,
}: UseBasicInfoSectionOptions): UseBasicInfoSectionReturn {
  // Merge initial data with defaults
  const [localData, setLocalData] = useState<BasicInfoSectionData>(() => ({
    ...DEFAULT_BASIC_INFO_DATA,
    ...initialData,
  }))

  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create')
  const [originalData, setOriginalData] = useState<BasicInfoSectionData | null>(null)

  // Save mutation
  const saveMutation = trpc.contacts.saveBasicInfo.useMutation()

  // Sync from initial data when it changes
  useEffect(() => {
    if (initialData) {
      const merged = { ...DEFAULT_BASIC_INFO_DATA, ...initialData }
      setLocalData(merged)
      setOriginalData(merged)
    }
  }, [initialData])

  // Handle single field change
  const handleChange = useCallback((field: string, value: unknown) => {
    setLocalData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle type toggle (for multi-select)
  const handleToggleType = useCallback((type: string) => {
    setLocalData(prev => {
      const isSelected = prev.types.includes(type)
      return {
        ...prev,
        types: isSelected
          ? prev.types.filter(t => t !== type)
          : [...prev.types, type],
      }
    })
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveMutation.mutateAsync({
        contactId,
        data: localData as any,
      })

      setOriginalData(localData)
      setIsEditing(false)
      onSaveComplete?.()
    } catch (error) {
      console.error('Failed to save basic info:', error)
      throw error
    }
  }, [contactId, localData, saveMutation, onSaveComplete])

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
    handleToggleType,
    handleSave,
    handleCancel,
    handleEdit,
  }
}

export default useBasicInfoSection
